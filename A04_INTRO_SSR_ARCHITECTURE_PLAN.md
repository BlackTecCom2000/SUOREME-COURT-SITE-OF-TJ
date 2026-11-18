# A04_INTRO_SSR_ARCHITECTURE_PLAN.md

**Дата:** 2026-11-19 · **Режим:** READ_ONLY_ARCHITECTURE_AUDIT · **Целевой релиз:** v2.53.0 (только план, реализация не выполнялась)
**Исходное состояние:** v2.52.0, коммит `3ad3b17`, A-03 preload/postpriority уже внедрён.

---

## 1. Executive Summary

A-03 устранил позднее обнаружение постера (запрос 1373 мс → 29–62 мс, приоритет Low → High), но **LCP остался ~1438 мс (mobile cold)**: LCP-элемент — `<video poster>` внутри React-компонента `IntroSplash`, который отсутствует в SSR HTML и появляется только после загрузки lazy-чанка `App` и гидратации (~1,3 с при CPU×2).

Проведённое в рамках этого аудита исследование показывает, что убрать этот `render delay` можно **без смены дизайна**: сервер уже отрисовывает весь `App` в HTML (`server/index.ts:2274-2280`), поэтому достаточно, чтобы `IntroSplash` выдавал свою финальную разметку уже при серверном рендере, а клиентская логика (проверки prefers-reduced-motion / Save-Data / 2g, запуск видео, таймеры, обработчики) подключалась эффектами после гидратации.

**Рекомендуется Вариант B** — SSR-контейнер постера с клиентской активацией видео. Он сохраняет один и тот же DOM-узел `<video poster>` на сервере и при первой клиентской отрисовке (нет hydration mismatch, нет двойной загрузки постера), а управление видео включается эффектом. Вариант A (SSR static `<img>` с последующей заменой на `<video>`) несёт риск замены DOM-узла и мерцания; Вариант C оставляет LCP ≈1,4 с.

**Ни один файл приложения в ходе этого аудита не изменён.** План требует отдельного одобрения; перед реализацией — обязательный полный backup v2.53.0 на C: и H:.

---

## 2. Current SSR Architecture

### 2.1 Поток запроса (доказательства)

```
GET /  (браузер / SW networkFirstShell, public/sw.js:154-157)
   │
   ▼
server/index.ts:2268-2290
   ├─ 2274  fs.readFileSync('dist/client/index.html')      // шаблон с <!--ssr-outlet-->
   ├─ 2276-2277  await import('dist/server/entry-server.js')
   ├─ 2279  render(url) → renderToString(...)
   └─ 2280  template.replace('<!--ssr-outlet-->', appHtml)
        → 2282-2286  res 200, Cache-Control: no-store
   │
   ▼
src/entry-server.tsx:21-33
   StrictMode > ThemeProvider > StaticRouter > Suspense(BootFallback)
              > DeviceCapabilityProvider > App (статический import!)
   │
   ▼
src/App.tsx:30-33
   <A11yProvider>
     <IntroSplash />        ← рендерится, но возвращает null (см. 2.2)
     <Routes>…</Routes>
   </A11yProvider>
   │
   ▼
src/entry-client.tsx:26,90-94
   App = React.lazy(...) → после загрузки чанка hydrateRoot(rootEl, app)
   MountSignal (:44-50) фиксирует __SUD_HYDRATED__ только после монтирования App
```

### 2.2 Почему интро отсутствует в исходном HTML

`src/components/IntroSplash.tsx:45`: `const [phase, setPhase] = useState<Phase>('hidden')`
`src/components/IntroSplash.tsx:133`: `if (phase === 'hidden') return null;`
`src/components/IntroSplash.tsx:54-81`: переход в `'opening'` происходит **только в `useEffect`** (client-only).

Прямое подтверждение на живом SSR-ответе:
- HTML ≈ **391 КБ**, содержит контент приложения;
- `data-intro-splash` — **отсутствует**;
- `sud-intro-251-poster.jpg` — присутствует **только** как `<link rel=preload>` (A-03);
- `BootFallback` в HTML отсутствует (SSR до рендера дошёл).

### 2.3 Клиентские гейты, которые нельзя выполнить на сервере

| Гейт | Где | Доступен на сервере? |
|---|---|---|
| `pathname.startsWith('/admin')` | `IntroSplash.tsx:60` | **да** (`url` передан в `render()`) |
| `matchMedia('(prefers-reduced-motion: reduce)')` | `:62-63` | нет |
| `navigator.connection.saveData / effectiveType` | `:67-70` | нет |
| `video.play()` / autoplay policy | `:93-107` | нет |

Именно эти три client-only гейта являются главным источником риска hydration mismatch: **первый рендер не должен от них зависеть**.

---

## 3. Root Cause Analysis

| Причина | Доказательство | Следствие |
|---|---|---|
| LCP-элемент создаётся эффектом, а не сервером | `IntroSplash.tsx:45,55-81,133` | браузер не может отрисовать постер до гидратации |
| `App` на клиенте — `React.lazy` | `entry-client.tsx:26` | дополнительная загрузка 482 КБ (118 КБ gzip) чанка перед гидратацией |
| Большой SSR DOM (~391 КБ) гидратируется целиком | `server/index.ts:2279-2280`, замер HTML | ~1,3 с CPU×2 до появления элемента |
| Preload (A-03) ускорил только сеть | LCPDiscovery: запрос 29–62 мс, High; LCPBreakdown: render delay ~1,3 с | дальнейшая оптимизация сети бесполезна без SSR-разметки |

**Корень:** не «медленная картинка», а «позднее существование элемента в DOM».

---

## 4. Three Architecture Options

| Критерий | **A. SSR `<img>` → замена на `<video>`** | **B. SSR `<video poster>` → активация** | **C. Оставить как есть** |
|---|---|---|---|
| LCP-элемент в HTML | да | да | нет |
| Ожидаемый LCP (mobile cold) | ~300–600 мс* | ~300–600 мс* | ~1438 мс (измерено) |
| DOM при гидратации | **заменяется** (`img` → `video`) | **тот же узел** | нет узла до гидратации |
| Риск мерцания / двойного постера | средний–высокий | низкий | нет |
| Hydration mismatch | высокий (разные теги) | низкий (нужен идентичный первый рендер) | нет |
| Client-only гейты | надо скрывать SSR-картинку | только в effect, не в render | как сейчас |
| No-JS поведение | картинка видна вечно | картинка видна вечно (нужен `<noscript>`) | сайт работает |
| Изменения в `entry-server.tsx` | opcional | **не нужны** | нет |
| Сложность | средняя | **низкая** | нулевая |
| Сохранение дизайна/анимаций | да | да | да |

\*расчётная оценка, **не измерение**; проверить трассировкой после реализации.

### Вариант A — детали
Сервер отдаёт `<img src="/video/sud-intro-251-poster.jpg">` внутри тех же контейнеров. После гидратации React заменяет его на `<video poster>`. Даже при использовании того же URL браузер создаёт **новый DOM-элемент**; другой тип элемента гарантирует, что React не переиспользует узел. Риск: 1–2 кадра двойной отрисовки и новый LCP-кандидат после замены (LCP может обновиться).

### Вариант B — детали (рекомендуемый)
Сервер и **первый клиентский рендер** выводят один и тот же `<video poster="/video/sud-intro-251-poster.jpg" muted playsInline preload="none">` внутри тех же контейнеров, с тем же `className`/`style`. Никаких `<source>` до активации (иначе начнётся загрузка 2 МБ видео). В `useEffect` после гидратации:
1. проверить гейты (admin по pathname, reduced-motion, saveData/2g);
2. при skip → `close()` (плавный fade) и не трогать видео;
3. при show → вставить `<source>`/вызвать `load()`, `preload='auto'`, `play()`, поставить таймеры и обработчики.

DOM-узел `<video>` не заменяется → постер не перезагружается (тот же URL + preload + HTTP-кэш), LCP-элемент совпадает с SSR.

### Вариант C — детали
Никаких изменений; LCP остаётся ~1,4 с на mobile, цель <1000 мс недостижима. Допустимо, если риски гидратации признаны неприемлемыми.

---

## 5. Recommended Architecture

**Вариант B** как минимальный по изменениям и рискам.

Предполагаемый поток:

```
SSR (entry-server, без изменений)
  App → IntroSplash: phase = 'opening' (детерминированное начальное значение)
  → HTML: backdrop + dialog + <video poster=... preload="none" muted playsInline>
         + подпись + кнопка «Пропустить» (inert до гидратации)
  → <link rel=preload> из index.html грузит постер параллельно (A-03)

Hydration (entry-client, без изменений)
  hydrateRoot находит тот же DOM (те же теги/атрибуты) → без mismatch
  → эффект IntroSplash: гейты → либо close(), либо load()/play() + handlers
  → видео начинается с того же постера, без повторной загрузки

Завершение
  onEnded / error / 22s timeout / Skip / Escape → phase 'closing' → 320 ms → unmount
  (точными как сейчас: IntroSplash.tsx:50-52,91,127-131,171-172)
```

**Важно:** сервер НЕ может знать `prefers-reduced-motion`, но CSS-медиа-правило может скрыть диалог мгновенно (до гидратации), а эффект — закрыть его логически. Это сохраняет гейт `:62-63` без изменения render-дерева.

---

## 6. Hydration Safety Analysis

| Риск | Механизм | Митигация |
|---|---|---|
| Разный initial render SSR/client | `useState('hidden')` сейчас возвращает `null` на сервере; клиент тоже вернул бы `null` → без mismatch, но и без постера | сделать детерминированное начальное `'opening'` и **одинаковую** разметку в SSR и client-first-render; все client-only проверки — в `useEffect` |
| Разница атрибутов | `style`, `className`, `aria-hidden`, `data-intro-splash` должны совпадать байт-в-байт | вынести разметку в один компонент/функцию, используемую обоими рендерами; не использовать `window`/`Date`/`random` в render |
| StrictMode двойной вызов эффектов | module-level `introStarted` (`IntroSplash.tsx:40,57,72`) сейчас предотвращает повтор, но в dev снимает listener | сохранить идемпотентность; хранить id таймеров/листенеров в ref; при повторном монтировании пере-аттачить только при need |
| Двойной постер | preload + `<video poster>` | URL один и тот же; браузер переиспользует ответ; проверить `list_network_requests` (ожидаемо 1 запрос) |
| Мерцание при активации | вставка `<source>`/`load()` меняет кадр | постер остаётся до первого解码 кадра; `video` не меняет размеры (aspect-video) |
| No-JS | диалог останется навсегда, кнопка не работает | добавить `<noscript><style>[data-intro-splash]{display:none!important}</style></noscript>` в `index.html` (одна строка) |
| Reduced-motion | SSR показывает диалог, хотя пользователь его skipping | CSS `@media (prefers-reduced-motion: reduce)` скрывает `[data-intro-splash]`; preload уже media-gated; эффект закрывает без анимации |
| Ошибка гидратации #418/#419 | как в истории проекта (`entry-client.tsx:39-61`) | не обновлять контекст/стейт до завершения гидратации; все проверки — в эффекте после монтирования |

---

## 7. Performance Impact Estimate

**Оценки, не измерения** (проверить после реализации по протоколу тестирования):

| Метрика | Сейчас (измерено) | Ожидаемо при Variant B | Обоснование |
|---|---|---|---|
| LCP mobile cold | 1438 мс (медиана, 5 прогонов, локальный прод) | ~300–600 мс* | LCP-элемент присутствует в HTML; render delay устраняется |
| LCP desktop cold | 801 мс | ~200–400 мс* | тот же механизм |
| FCP | из RAW-трасс | без ухудшения / +несколько мс | HTML станет на ~1–2 КБ больше |
| TTFB | 142–224 мс | без изм. | тот же SSR `renderToString`, `no-store` |
| CLS | 0.00 | 0.00* | диалог `position: fixed`, не участвует в потоке |
| Дубли POSTER-запросов | 0 | 0* | один URL в preload и poster + HTTP-кэш |
| Размер видео на reduced-motion | 0 | 0* | `<source>` вставляется только эффектом, гейт срабатывает раньше |
| Warm cache | 1195 мс mobile | ~250–500 мс* | постер из кэша, элемент в HTML |

\* — расчётная гипотеза. **Не выдавать за измеренное.** Приоритет цели <1000 мс реалистичен при Variant B, но подтверждается только трассировкой после внедрения.

---

## 8. Required File Changes (минимальный набор для будущей реализации)

| Файл | Изменение | Обязательно? |
|---|---|---|
| `src/components/IntroSplash.tsx` | детерминированный initial phase `'opening'`; SSR-совместимая разметка; `<video poster preload="none">` без `<source>`; активация/гейты в эффекте; сохранить все текущие обработчики и переходы (`:50-131`) | **да** |
| `index.html` | одна строка `<noscript>` (скрыть интро без JS); preload из A-03 уже есть, **не трогать** | желательно |
| `src/index.css` | CSS `@media (prefers-reduced-motion: reduce)` для `[data-intro-splash]` (если текущий глобальный kill-switch не достаточно явно скрывает) | по результату проверки |
| `src/entry-server.tsx` | **изменений не требуется** — IntroSplash уже внутри SSR-дерева через `App` | нет |
| `src/entry-client.tsx` | изменений не требуется (hydrateRoot уже проверен на SSR-разметку `:90-94`) | нет |
| `src/App.tsx` | не требуется — `<IntroSplash />` уже расположен над `Routes` (`:32`) | нет |
| `public/sw.js`, `server/index.ts`, API/БД | **не трогать** | нет |

---

## 9. Implementation Sequence (после одобрения)

1. **Backup v2.53.0** на `C:\SUD_TJ_Backups` и `H:\SUD_TJ_Backups`, `verify OK` + checksum — *до первой правки*.
2. В `IntroSplash.tsx`: вынести JSX-оболочку в детерминированную функцию, используемую и SSR, и client-first-render; убрать зависимости render от `window`/matchMedia.
3. В `IntroSplash.tsx`: перенести client-only проверки и активацию видео в `useEffect`; сохранить `introStarted`, `close()`, `HARD_TIMEOUT_MS`, `CLOSE_MS`, `onEnded/onError/onCanPlay`, Escape, фокус, scroll-lock, cleanup.
4. В `index.html`: добавить `<noscript>`-скрытие интро.
5. По результату проверки — минимальное CSS-правило для reduced-motion.
6. `tsc --noEmit`, `build:client`, `build:server`, smoke 12 адресов.
7. Измерения 5×cold + 5×warm (mobile/desktop), LCP/LCPDiscovery/LCPBreakdown, hydration errors, duplicate requests, CLS, скриншоты.
8. Отдельный релиз v2.53.0 (commit/tag/GitHub Release); **deploy — только по отдельному разрешению** (как в A-03).

---

## 10. Testing Strategy

| Сценарий | Что проверяем | Критерий |
|---|---|---|
| Initial load, mobile cold/warm, Fast 4G, CPU×2, 5 прогонов | LCP, LCP element, LCPDiscovery, LCPBreakdown, FCP, TTFB, CLS | цель <1000 мс, CLS 0.00, постер — LCP |
| Desktop 1440×900 cold/warm, 5 прогонов | те же метрики | LCP <500 мс (ориентир), CLS 0.00 |
| Network Initiator | 1 запрос постера + 1 запрос видео, приоритет High | 0 дублей |
| Hydration | Console: 0 ошибок/#418/#419/#421, `__SUD_HYDRATED__` true | 0 ошибок |
| Reduced-motion | диалог не показывает видео, запрос видео = 0 | гейт работает |
| Save-Data / 2g (эмуляция CDP) | интро пропускается | гейт работает |
| Admin route `/admin` | интро не показывается | как сейчас |
| Навигация по SPA | интро не перезапускается | `introStarted` |
| Skip / Escape / ended / error / timeout | плавное закрытие, сайт доступен | как сейчас |
| 5 минут открыто | heap, rAF, WebGL-циклы | без утечек |
| No-JS (отключить JS в браузере) | интро скрыто, сайт читаем | `<noscript>` |
| Скриншоты до/после |dialog, постер, подпись, кнопка | 0 визуальных отличий |

Инструменты: Chrome DevTools Performance/Network/Rendering, `performance_start_trace` + `performance_analyze_insight`, React DevTools Profiler (если доступен), RAW-трассы в `H:\TEMP\opencode\`.

---

## 11. Rollback Strategy

- До правок — полный backup v2.53.0 (C: + H:, checksum, manifest).
- Откат = `git revert` коммита v2.53.0 (или новый коммит, восстанавливающий tree предыдущего тега v2.52.0), **без переписывания тегов** (политика history immutable).
- Отдельный релиз v2.53.1 с rollback-коммитом, если v2.53.0 уже опубликован.
- Проверка после отката: tsc, сборка, smoke 12 адресов, LCP-замер 3×.

---

## 12. Risks and Limitations

| Риск | Вероятность | Влияние | Митигация |
|---|---|---|---|
| Hydration mismatch из-за client-only гейтов | средняя | React отбросит SSR-разметку, LCP не улучшится | детерминированный render, гейты только в effect |
| Кнопка «Пропустить» неактивна до гидратации | высокая (по дизайну) | ~1,3 с пользователь видит инертную кнопку | это окно и сейчас показывается только после гидратации; при SSR станет видимым раньше, но сайт под ним тоже уже отрисован — допустимо; можно добавить `aria-busy` |
| Браузер не покачает `<video poster>` при `preload="none"` | низкая | постер не отобразится | poster загружается браузером независимо от `preload`; проверить в трассировке |
| Увеличение HTML на 1–2 КБ | высокая | +несколько мс TTFB | пренебрежимо; измерить |
| LCP обновится повторно при замене элемента | средняя (только Variant A) | ухудшение метрики | в Variant B элемент не заменяется |
| Ручные эмуляции CDP не отражают реальные устройства | средняя | оценка LCP может не сбыться | проверить на реальном среднем телефоне, не только CPU-throttling |
| `--bg-blur` / CSS-фильтры на фоне | низкая |可能影响 видимость постера | не трогать GlobalBackground (запрет задачи) |

**Ограничение аудита:** все данные о будущем LCP — расчётные; реальные цифры появятся только после одобренной реализации и замеров на проде. CrUX/полевые данные для страницы недоступны.

---

## 13. Final Recommendation

**Выбрать Вариант B (SSR poster container with client-side video activation).** Он единственный из трёх, кто одновременно:
- перемещает LCP-элемент в исходный HTML (устраняет `render delay` ~1,3 с),
- сохраняет тот же DOM-узел и тот же URL постера (0 дублей, 0 мерцания),
- не требует изменений `entry-server.tsx`, API, БД, SSR-инфраструктуры и зависимостей,
- сохраняет сценарий интро, Liquid Glass, анимации и все гейты.

Вариант A отклонён из-за риска подмены DOM-узла и двойной отрисовки постера; Вариант C — из-за недостижимости цели <1000 мс.

**Реализацию не начинать.** Требуется отдельное разрешение; перед первой правкой — полный backup v2.53.0 с проверкой целостности на `C:\SUD_TJ_Backups` и `H:\SUD_TJ_Backups`. Деплой на продакшен — только после явного одобрения (по образцу A-03).
