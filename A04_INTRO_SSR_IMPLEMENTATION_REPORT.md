# A04_INTRO_SSR_IMPLEMENTATION_REPORT.md

**Дата:** 2026-11-19 · **Версия:** v2.53.0 · **Вариант:** B (SSR video poster → client activation)
**Источник плана:** `A04_INTRO_SSR_ARCHITECTURE_PLAN.md` · **База:** v2.52.0, коммит `3ad3b17`

---

## 1. Summary

Вариант B реализован. `<video poster="/video/sud-intro-251-poster.jpg">` теперь присутствует в **исходном SSR HTML** и становится LCP-элементом уже на первом кадре. Сервер и первый клиентский рендер возвращают идентичную разметку; после гидратации тот же DOM-узел получает `<source>` и запускает видео. Все client-only проверки (reduced-motion, Save-Data/2g, автоплей) перенесены в эффекты.

**Результат (mobile cold, Fast 4G, CPU×2, медиана 5 прогонов): LCP 1438 мс → 362 мс** (−75%), CLS 0.00. Целевой ориентир <1000 мс достигнут. Ошибок гидратации 0, дублей постера 0, видео начинает загружаться только после гидратации. Визуально интро не отличается от v2.52.0.

---

## 2. Backup Verification

| Параметр | Значение |
|---|---|
| Версия / описание | **2.53.0** / `IntroSplash SSR poster implementation` |
| Создан | **до первой правки**, после preflight |
| Путь 1 | `C:\SUD_TJ_Backups\2.53.0 - IntroSplash SSR poster implementation` |
| Путь 2 | `H:\SUD_TJ_Backups\2.53.0 - IntroSplash SSR poster implementation` |
| Файлов кода | 355 |
| База данных | snapshot `sudtj.sqlite`, 42 таблицы, `integrity_check=ok` |
| Прочие данные | `data/uploads` (121), `public/images` (6), `public/lib` (2) |
| Целостность | `verify OK: 485 files`, checksum дерева **`fd655c11c6d801a8…`** |
| Manifest | `manifest.json` с датой, описанием, git-коммитом, checksum |
| Offsite | `offsite copy OK`, обе копии проверены по чексуммам |

---

## 3. Files Changed

| Файл | Изменение |
|---|---|
| `src/components/IntroSplash.tsx` | Стартовое состояние детерминировано: `'opening'` на сервере и при первом клиентском рендере. Диалог и `<video poster preload="none">` рендерятся всегда (кроме финального `'hidden'`). Удалены `autoPlay` и `<source>` из JSX; активация (`document.createElement('source')` ×2, `preload='auto'`, `load()`, `play()`) перенесена в `activate()` внутри эффекта. Все client-only гейты (pathname, `matchMedia`, `navigator.connection`) — только в `useEffect`. Сохранены `close()`, `introStarted`, `HARD_TIMEOUT_MS=22000`, `CLOSE_MS=320`, `onEnded/onError/onCanPlay`, Escape, фокус, scroll-lock, cleanup, вся разметка и стили |
| `index.html` | Добавлены два минимальных блока в `<head>`: `<noscript>` (скрыть SSR-интро без JS) и `@media (prefers-reduced-motion: reduce)` (скрыть с первого кадра). Существующий preload A-03 и его `media` **не изменены**. Второго постера нет |

**Не изменялись:** `server/index.ts`, `entry-server.tsx`, `entry-client.tsx`, Service Worker, CSS-файлы, API, БД, GlobalBackground, LiquidGlassSurface, слайдеры, зависимости. Разрешённый scope соблюдён.

---

## 4. SSR HTML Before and After

| | До (v2.52.0) | После (v2.53.0) |
|---|---|---|
| Размер HTML | ~391 КБ | ~393 КБ (+~2 КБ) |
| `data-intro-splash` | отсутствует | **присутствует** |
| `<video poster>` в HTML | нет | **есть** |
| Poster URL | только в `<link rel=preload>` | в preload **и** в `poster` (один URL) |
| noscript / media-fallback | нет | есть |

Фактический SSR-узел (из ответа сервера):
```html
<video class="h-full w-full object-contain" poster="/video/sud-intro-251-poster.jpg"
       muted="" playsinline="" preload="none" disablepictureinpicture=""
       controlsList="nodownload noplaybackrate"></video>
```
Без `autoplay`, без `<source>` → видеопоток не загружается до гидратации.

---

## 5. Hydration Verification

Методика: `initScript` перехватывал `console.error`, событие `sud:hydrated` и создавал MutationObserver, который сохранял ссылку на SSR-узел **до** выполнения модульного скрипта.

| Проверка | Результат |
|---|---|
| Ошибок гидратации (#418/#419/#421, console.error, window.onerror) | **0** |
| `__SUD_HYDRATED__` | true |
| Время появления SSR-узла | **60 мс** |
| Время гидратации | **904 мс** |
| Повторного создания DOM-элементов | нет |
| Мерцания / скачка контента | не зафиксировано (CLS 0.00) |
| Состояние после активации | `phase='playing'`, того же вида className/style/атрибуты |

---

## 6. DOM Identity Verification

Самый строгий тест: до гидратации на SSR-узел был выставлен **JS-свойство-метка** `v.__ssrProbe = 'ssr'` (не DOM-атрибут — на разметку не влияет). После гидратации:

```
capturedBefore:      true
nodeIdentity:        true       // window.__v === document.querySelector('[data-intro-splash] video')
probeOnCurrentNode:  'ssr'      // метка осталась на том же объекте
sourcesAfterActivation: 2      // webm + mp4 добавлены в тот же <video>
preloadAfter:        'auto'
paused:              false
currentTime:         2.07
```

**Вывод:** React сохранил тот же `<video>` DOM-узел; подмены элемента не произошло.

---

## 7. Poster Network Verification

| Метрика | До (v2.52.0) | После (v2.53.0) |
|---|---|---|
| Запрос постера | 29–62 мс (A-03 preload) | **46 мс** (preload), узел в HTML на 60 мс |
| Приоритет | High | High |
| Количество запросов постера | 1 | **1** |
| Запрос видео | после гидратации | **985 мс** (гидратация 904 мс) — позже, как и требуется |
| Дубли/posters | 0 | **0** |
| `Transfer-Encoding` видео | 206 Partial Content | 206 Partial Content |

Дополнительно: при `prefers-reduced-motion` и Save-Data/2g видео **не запрашивается вовсе** (только постер).

---

## 8. Performance Before and After

Условия: production-equivalent `http://127.0.0.1:8787`, 5 прогонов на сценарий, Chrome DevTools Performance, Fast 4G, mobile CPU×2 / desktop CPU×1; `ignoreCache` для cold.

| Сценарий | v2.52.0 (медиана) | v2.53.0 (значения 5 прогонов) | Медиана | CLS |
|---|---:|---|---:|---:|
| Mobile cold | 1438 мс | 374, 369, 360, 361, 362 | **362 мс** (−75%) | 0.00 |
| Mobile warm | 1195 мс | 168, 158, 159, 165, 154 | **159 мс** (−87%) | 0.00 |
| Desktop cold | 801 мс | 410, 284, 280, 282, 285 | **284 мс** (−65%) | 0.00 |
| Desktop warm | 562 мс | 94, 96, 104, 97, 97 | **97 мс** (−83%) | 0.00 |

LCP-элемент подтверждён в `LCPBreakdown`: `VIDEO class='h-full w-full object-contain'`, раньше запрошен на 66–68 мс, main-thread processing 1 мс. TTFB/FCP изменились незначительно (HTML +2 КБ); точные значения доступны в RAW-трассе `H:\TEMP\opencode\a04-after-mobile-cold.json.gz`.

---

## 9. Visual Regression Results

- Скриншот после: `H:\TEMP\opencode\a04-intro-after.jpeg`.
- Скриншот до (v2.52.0): `H:\TEMP\opencode\a03-intro-after.jpeg`.
- Сравнение: то же окно, тот же ролик и кадр, та же Liquid Glass, подпись, кнопка «ПРОПУСТИТЬ», композиция и размеры. **Визуальных отличий нет.**
- Переходы открытия/закрытия и анимации не изменены (JSX оболочки сохранён).

---

## 10. Test Matrix

| Сценарий | Результат |
|---|---|
| First page load | ✅ интро в SSR и после гидратации, тот же узел |
| Mobile cold/warm, 5× | ✅ LCP 362 / 159 мс, CLS 0.00 |
| Desktop cold/warm, 5× | ✅ LCP 284 / 97 мс, CLS 0.00 |
| LCP element / Discovery / Breakdown | ✅ `video poster`, 46–68 мс, High, без render delay |
| Duplicate poster requests | ✅ 1 |
| Video activation | ✅ источники добавлены после гидратации, `play()` работает |
| prefers-reduced-motion | ✅ диалог скрыт с первого кадра (CSS), эффект закрывает, видео не грузится |
| Save-Data / 2g | ✅ интро закрывается, видео не грузится |
| Autoplay blocked (эмуляция NotAllowedError) | ✅ плавно закрывается, сайт доступен, scroll разблокирован |
| JavaScript disabled | ✅ структурная проверка: `<noscript>` в HTML скрывает `[data-intro-splash]` |
| Intro completion (ended/22s) | ✅ интро исчезает, сайт виден, overflow restored |
| Navigation between routes (SPA) | ✅ интро не перезапускается (`introStarted`) |
| Repeated mounting | ✅ проектная защита `introStarted` + `activatedRef`, 0 ошибок в консоли |
| TypeScript / build | ✅ 0 ошибок, `build:client`, `build:server` успешны |
| Console / hydration errors | ✅ 0 |

---

## 11. Known Limitations

1. При `prefers-reduced-motion` браузер всё равно скачивает **постер (116 КБ)** — Chrome загружает `poster` даже у скрытого `display:none` видео. Видео (2 МБ) не загружается; визуально интро не показывается. Полная экономия постера потребовала бы не рендерить `<video>` в SSR для этой группы, что невозможно без client-only данных в render (запрещено).
2. No-JS сценарий проверен **структурно** (наличие `<noscript><style>…`), а не реальным отключением JavaScript в браузере — в доступном наборе инструментов нет переключателя JS.
3. StrictMode двойное монтирование проверено на уровне кода (`introStarted`, `activatedRef`, cleanup листенеров); отдельный dev-замер не проводился.
4. FCP и TTFB извлечены из RAW-трассы, а не в сводке DevTools; они не были целью задачи.
5. Измерения сделаны на **production-equivalent локальном origin** (http/1.1). Сравнение с v2.52.0 корректно (тот же origin/условия), но цифры на CDN могут отличаться — деплой не выполнялся по 요구ованию задачи.
6. Quick-tunnel origin остаётся хрупким (в прошлых аудитах требовал перезапуска); на метрики LCP Static asset не влияет.

---

## 12. Rollback Instructions

- До правок существует полный backup **2.53.0** (C: + H:, checksum `fd655c11c6d801a8…`, 485 файлов).
- Откат = `git revert` коммита v2.53.0 или новый коммит, восстанавливающий дерево тега `v2.52.0`, **без переписывания существующих тегов**.
- Перед откатом — новый backup с-version и описанием `rollback v2.53.0`.
- Проверка после отката: `tsc --noEmit`, `build:client`, smoke 12 адресов, LCP-замер 3×.
- Возврат к v2.52.0 означает возврат LCP ~1438 мс (mobile cold) — это ожидаемое следствие отката.

---

## 13. Релиз и остановка

- Коммит, аннотированный тег **v2.53.0**, GitHub Release и синхронизация веток — выполнены.
- **Деплой на продакшен НЕ выполнялся** — требуется отдельное разрешение, согласно `git_policy`.
- Дальнейшие оптимизации не выполнялись. Жду разрешения на публикацию.
