# PERFORMANCE AUDIT REPORT — SUD.TJ Supreme Court Portal

**Дата:** 2026-11-17 · **Режим:** DIAGNOSTICS_ONLY · **Версия приложения:** v2.50.1
**Репозиторий:** `H:\downloads\SUOREME-COURT-SITE-OF-TJ-main\SUOREME-COURT-SITE-OF-TJ-main`
**Изменений в коде НЕ вносилось. Ни один файл приложения не модифицирован.**

---

## 1. Executive Summary

Портал **не имеет критической проблемы со скоростью загрузки в лабораторных условиях**: медианный LCP на мобильном (Fast 4G, CPU ×2, холодный кэш) — **1159 мс**, на десктопе (тёплый кэш) — **768 мс**, CLS **0.00** во всех замерах, TTFB **142–224 мс**. CrUX-данных для страницы нет, поэтому полевые CWV **неизвестны**, а не «пройдены».

Главная проблема — **не загрузка, а постоянная стоимость анимаций после загрузки**:

- на главной странице одновременно активны **192 элемента с `backdrop-filter`**, **40 анимаций**, из них **26 бесконечных**;
- в тёмной теме монтируются **два независимых WebGL `requestAnimationFrame`-цикла** (`CloudSky`), каждый со своим контекстом;
- интро-заставка (которую пользователь попросил показывать при каждой загрузке) **забирает LCP-элемент себе**: постер загружается только на 1295 мс с приоритетом *Low*, добавляя **≈250 мс к LCP** по медиане трёх замеров;
- серверный SSR и Pages Function делают синхронную/сетевую работу на **каждую** навигацию; при падении origin-туннеля это превращается в лавину повторов API (в ходе аудита зафиксировано 53 API-запроса за сессию, из них ~40 — повторы `/api/design-settings`).

Память **не течёт**: 8,9 → 8,7 МБ за 60 с простоя. Глобальный `prefers-reduced-motion` работает: анимации 40→3, бесконечные 26→0, blur-слои 192→0.

**Вердикт:** узкое место — GPU-композит (blur-материал + WebGL + бесконечные циклы) и взаимодействие интро с LCP, а не размер JS или база данных. Любая оптимизация должна сохранить визуальную идентичность — поэтому ниже предложения, а не изменения.

---

## 2. Project Architecture

| Слой | Технология / версия | Обоснование |
|---|---|---|
| Frontend | React 18.3.1 + Vite + TypeScript | `package.json`, `src/entry-client.tsx`, `src/entry-server.tsx` |
| Маршрутизация | react-router-dom 7.18.4 | `src/App.tsx`, `src/AdminApp.tsx` |
| Стили | Tailwind CSS + CSS-токены (`src/styles/tokens.css`), 1939 строк `src/index.css` | `tailwind.config.js`, `src/index.css` |
| Анимации | `motion` 13.5.0 (framer-motion), GSAP 3.15 + ScrollTrigger, CSS keyframes/WAAPI, WebGL (three 0.185.1 + @react-three/fiber 8.18 + drei 9.122), canvas, SVG/SMIL | `package.json`, animated components |
| Backend | Express + better-sqlite3 (синхронно), SSR `renderToString` | `server/index.ts`, `src/entry-server.tsx` |
| Deploy | Cloudflare Pages (статический dist + Functions-прокси `/api/*`, `/uploads/*`), origin за quick-tunnel, KV хранит адрес origin | `%USERPROFILE%\.sudtj\pagesproj\functions\*` |
| Кэш | Service Worker `sudtj-v3`: cache-first ассеты и `/video/*`, network-first документы и `/api/design-settings`, stale-while-revalidate публичные API | `public/sw.js`, `public/_headers` |

Entry points: `src/entry-client.tsx` (гидратация, lazy `App`/`AdminApp`, SW), `src/entry-server.tsx` (SSR на каждый запрос), `server/index.ts` (Express, API, статика).

---

## 3. Performance Measurements

**Условия зафиксированы.** Lab-значения — одна сессия Chrome, не полевые данные. CrUX: `n/a – no data for this page` (во всех трассировках).

| Сценарий | Условия | LCP (мс) | CLS | TTFB | Источник |
|---|---|---|---|---|---|
| Главная, интро включено | 390×844@2, Fast 4G, CPU ×2, cold cache, 3 прогона | **1159 / 1210 / 1144** → медиана **1159**, разброс 1144–1210 | 0.00 | 224 мс (первый замер) | DevTools performance trace |
| Главная, интро выключено через `prefers-reduced-motion` (без правки кода) | те же условия, 3 прогона | **912 / 890 / 924** → медиана **912**, разброс 890–924 | 0.00 | 142 мс | DevTools performance trace |
| Главная, десктоп, тёплый кэш | 1440×900, Fast 4G, CPU ×1, 3 прогона | **768 / 768 / 716** → медиана **768** | 0.00 | — | DevTools performance trace |
| LCP-элемент с интро | mobile cold | постер `sud-intro-251-poster.jpg` в `<video>`, запрос на **1295 мс**, initial priority **Low**, с SW, загрузка 62 мс + main-thread 37 мс | — | — | Insight `LCPBreakdown` / `LCPDiscovery` |
| LCP-элемент без интро | mobile cold | текстовый узел, без ресурса, render delay 801 мс | — | — | Insight `LCPBreakdown` |
| JS-куча | десктоп, 60 с простоя | 8,9 → 8,7 МБ (**−0,2 МБ**, утечки нет) | — | — | `performance.memory` |
| DOM / слой / анимации | главная, обычный режим | **3350** DOM-узлов, **192** узла с активным `backdrop-filter`, **40** анимаций, **26** бесконечных | — | — | `getComputedStyle` + `document.getAnimations()` |
| То же при reduced-motion | эмуляция | — | — | — | анимации **3**, бесконечные **0**, blur-слои **0** |
| Сетевой водопад (чистый замер, API поднят) | десктоп, 1 загрузка | **74 запроса**, из них **14 API**, 0 ошибок; `/api/design-settings` — **2 запроса** | — | — | `list_network_requests` |
| Сетевой водопад при падении origin | та же сессия, numerous reloads | **155 запросов**, **53 API**, из них ~40 повторов `/api/design-settings` (530) | — | — | `list_network_requests` |
| Trace events, 5,5 с, полный motion + интро | mobile cold trace | 2131 `FireAnimationFrame`, 1182 `Paint` (278 мс), 23 `Layout` (338 мс), 65 206 `RunTask` (все процессы) | — | — | разбор RAW-трассы |
| INP | lab | не измерен надёжно: наблюдатель `event` не зафиксировал-entry при синтетических кликах; **полевой INP неизвестен** | — | — | PerformanceObserver |
| Аудит MVC/слоёв | статический | 4 WL-аудита (CSS, React/JS, Animation, Network), ~100 находок с file:line | — | — | read-only subagents |

**Вывод по метрикам:** LCP, CLS и TTFB в lab-пределах. INP и полевые CWV требуют RUM. Основной риск — не «большая загрузка», а持续ная стоимость кадра.

---

## 4. Animation Bottlenecks

| ID | Severity | File:line | Компонент / функция | Проблема → доказательство → воздействие | Рекомендация → риск |
|---|---|---|---|---|---|
| A-01 | **CRITICAL** | `src/index.css:777-797,880-892,491,519`; `src/styles/tokens.css:285-287` | `.glass`, `.lg-material`, `.liquid-glass-title-pod` | **192 активных `backdrop-filter` на одной странице**, радиусы 24–28px (`--lg-blur`, `--glass-blur-ultra`). Измерено в рантайме. Каждый слой — отдельный backdrop-sample при композитинге; на среднем телефоне это главный претендент на dropout кадров. | Не удалять стекло, а ввести **уровни**: оставить blur на навигации/модалках, снизить до 8–12px на мелких чипах/кнопках и отключить на `data-device-tier="low-end"` (механизм уже есть, `index.css:185-187`). Риск: изменение внешнего вида стекла — требует визуального согласования. |
| A-02 | **CRITICAL** | `src/components/GlobalBackground.tsx:107,177`; `src/components/CloudSky.tsx:422-448,474-517` | `CloudSky`, 2 инстанса | Два независимых WebGL-контекста и два rAF-цикла по 60 fps в тёмной теме; `interactive={false}` выключает только pointer-слушатель, не цикл. В трассе с полным motion — 2131 `FireAnimationFrame` за 5,5 с. | Один инстанс на страницу с переключением темы через props, либо пауза цикла при `IntersectionObserver` вне вьюпорта. Риск: теряется параллакс/живое небо — визуально заметно. |
| A-03 | **HIGH** | `src/components/IntroSplash.tsx:161-185`; LCP insight | Интро-заставка | Постер — LCP-элемент с **Low** priority и Discovery=script-injected; +≈250 мс LCP по медиане (1159 против 912). Пользователь явно просил интро при каждой загрузке — это осознанный tradeoff. | Добавить `<link rel="preload" as="image" fetchpriority="high">` для постера в `index.html` ИЛИ рисовать постер как обычный `<img fetchpriority="high">` под видео. Риск: минимальный, визуально одинаково. |
| A-04 | **HIGH** | `src/index.css:1863-1872` | `.bg-field::after` | Full-viewport `feTurbulence` SVG + `mix-blend-mode: overlay`, плитка 160×160 — растеризация шума на весь экран. | Заменить на статичный заранее сгенерированный PNG/WebP-шум (прозрачный тайл). Риск: почти нулевой визуально, нужно сравнить в light/dark. |
| A-05 | **HIGH** | `src/index.css:1885-1916` | `.ticker-track`, `@keyframes ticker-scroll` | `animation: ticker-scroll 36s linear infinite` на всю ширину футера; не останавливается вне вьюпорта/в скрытой вкладке — только `:hover`. Один из 26 бесконечных анимаций. | `IntersectionObserver` + `document.hidden` → `animation-play-state: paused`. Риск: бегущая строка «замирает» при возврате — нужно корректно возобновлять. |
| A-06 | **HIGH** | `src/components/ui/LiquidGlassSurface.tsx:77-81,159-166`; `src/index.css:914,1542,1576` | `LiquidGlassSurface` | На каждом `pointermove` пишутся **наследуемые** CSS-переменные `--lg-px/--lg-py`, от которых зависит `backdrop-filter` и masked-gradient `::after`. Инвалидация стилей всего поддерева + повторный backdrop-sample. В коде уже задокументировано, что такой паттерн вреден (`useJellyScroll.ts:76-79`). | писать `transform` конкретного элемента вместо наследуемых переменных; Riск: эффект «следования блика за курсором» может измениться. |
| A-07 | **MED-HIGH** | `src/components/symbols/DigitalThemis.tsx:76,153`; `DigitalJudicialHammer.tsx:200-202`; `InteractiveThemis.tsx:87,123`; `src/components/judicial-map/judicial-map.css:35-48` | SVG-символы, judmap | Бесконечные `filter`-анимации SVG + `feGaussianBlur`/`drop-shadow` на анимируемых `<g>`; `stroke-dashoffset` не композитный. Нет IO-гейтинга. | Ограничить фильтры статикой, анимировать `transform/opacity`; gating через IO. Риск: потеря «живости» символов. |
| A-08 | **MEDIUM** | `src/index.css:367-401` | View Transitions / `langMorphFadeOut` | Анимация `filter: blur(0→2px)` на root-snapshot (и blur(body) в fallback) — main-thread repaint целой страницы. | Заменить на `opacity` + `transform`. Риск: смена языка станет менее «мягкой». |
| A-09 | **MEDIUM** | `src/components/news/Judicial3DNewsSlider.tsx:179-187`; `src/components/digital-court/InteractiveProcessFlow.tsx:107-120`; `src/components/judicial-ecosystem/blueprint/BlueprintCentralAuthority.tsx:23-30` | 3 автоинтервала | State update + полный ре-рендер каждые 6 / 4.2 / 6 с без `document.hidden` и reduced-motion для JS-части; в blueprint ещё и неочищаемый вложенный `setTimeout`. | Один общий `useVisibilityInterval()` с паузой при hidden/offscreen и clear timeout. Риск: низкий. |
| A-10 | **MEDIUM** | `src/pages/LeadershipPage.tsx:108-124`; `src/index.css:225-232` | Motion `filter: blur` | JS-анимация blur не покрывается глобальным CSS `prefers-reduced-motion` kill switch. Подтверждено: при reduce анимаций 3, но Motion-анимации всё ещё могут работать. | `<MotionConfig reducedMotion="user">` на верхнем уровне. Риск: нет. |
| A-11 | **LOW** | `src/index.css:745-755`; `Judicial3DNewsSlider.tsx:480` | `.btn-outline`, slider card | Постоянный `will-change: transform` на всех кнопках и `transition-all` на карточке слайдера. | Убрать постоянный will-change; `transition: border-color, transform`. Риск: возможен 1px shift в начале hover — проверить. |

**Проверка reduce-motion (实测):** 40→3 анимации, 26→0 бесконечных, 192→0 blur-слоёв. Глобальный kill switch (`index.css:225-232,1154-1165`) работает для CSS; нужен coverage для JS/WAAPI (A-10).

---

## 5. React and JavaScript Problems

| ID | Severity | File:line | Компонент | Проблема / доказательство | Воздействие / решение / риск |
|---|---|---|---|---|---|
| R-01 | **HIGH** | `src/context/ThemeContext.tsx:118-126`; `LanguageContext.tsx:108-126`; `A11yContext.tsx:35`; `src/components/Layout.tsx:98-104` | Провайдеры, Layout | Inline-объекты в `value=` и `t()` пересоздаются каждый рендер, без `useMemo`; `Outlet context={{...}}` тоже. | Весь подграф `useTheme()/useLanguage()` ре-рендерится на любое изменение провайдера. Решение: `useMemo`, как уже сделано в `src/theme/store.tsx:326-343`. Риск: низкий. |
| R-02 | **HIGH** | весь `src/` — `grep React.memo` → **0 совпадений** | `CourtList`/`CourtListItem`, LibraryPage, JudicialModal, админ-таблицы | Ни одного мемоизированного элемента списка. ~77 судов в `data/sudTjData.ts`. | Любой рендер родителя перерисовывает все строки. Решение: точечно `memo()` для тяжёлых row-компонентов, не везде. Риск: low. |
| R-03 | **MEDIUM** | `src/components/JudicialModal.tsx:243-279` (файл ~1770 строк) | `JudicialModal` | При открытом модале 3 `.filter()` по act/courts/hearings на каждую клавишу поиска; огромный JSX. | Jank при вводе. Решение: `useMemo` на отфильтрованные массивы + виртуализация. Риск: low. |
| R-04 | **MEDIUM** | `src/pages/ContentDetailPage.tsx:111-116` | `ContentDetailPage` | `JSON.parse(item.gallery)` + `.filter()` прямо в JSX render. | Повторный parse при каждом ре-рендере. Решение: `useMemo`. Риск: нет. |
| R-05 | **MEDIUM** | `src/hooks/useSmoothScroll.ts:43-50,162-178` | `useSmoothScroll` | `getComputedStyle()` в обходе ancestors на каждом `wheel` — forced style read в input-хендлере. | Potential frame drop при колесе. Решение: кэшировать «scrollable ancestor» или проверять по `event.target.closest`. Риск: low. |
| R-06 | **MEDIUM** | `package.json:24-36`, `vite.config.ts:46` | Tiptap | 14 `@tiptap/*` зависимостей, **0 использований в src**; manualChunks emits 0.9 KB stub. | Install/lockfile bloat, none runtime. Решение: удалить при отдельном релизе. Риск: возможна неявная зависимость административного редактора — проверить. |
| R-07 | **LOW** | `package.json:37` vs `:53` | `@types/react-router-dom@5` | v5 типы рядом с router v7. | Конфликт типов, 0 runtime. Решение: убрать. Риск: none. |
| R-08 | **LOW** | `src/components/judicial-ecosystem/blueprint/BlueprintCentralAuthority.tsx:27`; `src/context/LanguageContext.tsx:93,97`; symbols (C-33) | Таймеры | Вложенные `setTimeout` без clear → setState после unmount. | Утечки closures, minor. Решение: хранить id и чистить. Риск: none. |
| R-09 | **INFO (хорошо)** | `src/components/JusticeScene3D.tsx:10,41-76`; `src/theme/store.tsx:217-223`; `useCinematicScroll.ts:66-201` | 3D / store / scroll | 953 KB three.js-чанк **уже** lazy + IO; скролл-эффекты паркуются при простое, cleanup есть. | Оставлять как есть. |

**Bundle (measured, dist/client/assets):** всего 4,71 МБ / 143 файла; крупнейший JS `Adaptive3DLoader` 953 КБ raw / **258 КБ gzip** (below 300 KB budget); `App` 482→118 КБ gzip; `vendor` 177→58 КБ gzip; CSS 215→32 КБ gzip. Ни один чанк не превышает 300 КБ gzip. `chunkSizeWarningLimit: 1000` (`vite.config.ts:41`) скрывает предупреждения.

---

## 6. CSS and Rendering Problems

| ID | Severity | File:line | Селектор / файл | Проблема → доказательство | Решение / риск |
|---|---|---|---|---|---|
| C-01 | **HIGH** | `src/components/digital-court/LegislativeLibrary.css:733-748` | `.leglib-reader-backdrop` | Full-screen `position:fixed; inset:0` + `backdrop-filter: blur(6px)` + `rgba(0,0,0,0.82)` и без `-webkit-` префикса. Полноэкранный blur при открытом reader. | Видно только при открытой библиотеке; заменить на полупрозрачный фон без blur. Риск: визуальный. |
| C-02 | **HIGH** | `src/components/GlobalBackground.tsx:131-149` | IMG day + night | Оба JPEG (2,47 + 2,53 МБ) загружаются **eager** на каждой странице, нет `width/height` и `fetchPriority`. | ~5 МБ на first-paint path. Решение: загружать только активную тему + `fetchpriority="high"` для активного; перевести в AVIF/WebP. Риск: flash при смене темы — предзагружать по событию. |
| C-03 | **HIGH** | `src/entry-client.tsx:11-20` | Fontsource imports | 10 weight-импортов → ~70 `@font-face`, 120 файлов (1,92 МБ) в dist; реально на одной загрузке запрошено ~20 woff2; неиспользуемые греческий и вьетнамский подмножества тоже попадают в сборку. | Сузить импорты до `latin+cyrillic` и нужных weight; сгенерировать variable font. Риск: шрифты должны остаться теми же (Cormorant + Inter — требование дизайна). |
| C-04 | **MEDIUM** | `public/index.html:1-27` | `<head>` | Нет `<link rel="preload">` для LCP-изображения/шрифтов; 3 render-blocking ресурса в трассе: `theme-bootstrap.js`, документ, `index-*.css` (238 мс bootstrap). | Добавить точечный preload по данным трассы. Риск: неверный preload крадёт bandwidth. |
| C-05 | **MEDIUM** | `src/index.css:561-595,615-672` | 16 правил с `:not()` | Множественные seлекторы перекраски utility-классов внутри `.glass`: дорогой matching на больших поддеревьях. | Консолидировать в 1–2 правила с CSS-переменными. Риск: медиа-запросы light/dark. |
| C-06 | **MEDIUM** | весь `src/` — `content-visibility` 0 совпадений | `.section-rhythm`, длинные списки | Ни один ниже-fold блок не изолирован от layout/paint. 3350 DOM-узлов на главной. | `content-visibility:auto` + `contain-intrinsic-size` на длинных секциях. Риск: CLS при неправильном intrinsic size — измерить. |
| C-07 | **MEDIUM** | `src/components/judicial-map/JudiciaryHeader.tsx:51-80` | `updatePosition` on scroll | `getBoundingClientRect + offsetWidth/offsetHeight` на каждом scroll (capture=true) → forced layout. | Throttle до rAF + кэш размеров. Риск: позиция поповера. |
| C-08 | **LOW** | `index.html` / CSP | `<script src="/theme-bootstrap.js">` | 1,47 КБ синхронно в head, render-blocking 238 мс (mobile). | Инлайнить. Риск: нет. |
| C-09 | **INFO** | `index.html:9-16`, `src/index.css` | third-party | Нет аналитики/CDN-скриптов; шрифты self-hosted; `font-display: swap` везде; `loading="lazy"` на большинстве below-fold img. | Сохранить как есть. |

---

## 7. Network and Backend Problems

| ID | Severity | File:line | Endpoint / функция | Проблема → доказательство | Решение / риск |
|---|---|---|---|---|---|
| N-01 | **CRITICAL** | `C:\Users\BlackTecCom\.sudtj\pagesproj\functions\api\[[path]].ts:36-48,58` | Pages Function proxy | На **каждый** API-запрос: KV-чтение origin + двухпроходной цикл с 30-секундным `AbortController`. При устаревшем KV — до **60 с** ожидания перед 502. Прямо отвечает за наблюдаемые 530 во время аудита. | Кэшировать origin в module scope (с TTL), один проход, fallback сразу. Риск: софт; требует деплоя functions. |
| N-02 | **HIGH** | `public/sw.js:71-81,126-136` | `staleWhileRevalidate` | Публичные API (`/api/news`, `/api/search`, …) отдаются из кэша **без срока годности и лимита записей**; query-варианты search множатся в Cache Storage. Измерено: при падении origin за сессию 53 API-запроса (≈40 повторов design-settings). | Age-based expiry + LRU + не кэшировать `/api/search?q=`. Риск: чуть меньше «мгновенности» повторных открытий. |
| N-03 | **HIGH** | `src/theme/store.tsx:121-122` **и** `src/hooks/useDesignSettings.ts:40` | два независимых fetch `/api/design-settings` | Измерено в чистом загрузочном водопаде: **2 запроса** к одному URL за одну загрузку. | Один владелец запроса, второй читает из общего модуля. Риск: low. |
| N-04 | **HIGH** | `server/index.ts:722` | `bcrypt.compareSync` / `hashSync` cost 12 | Синхронный CPU-bound на event loop при каждом логине. | Перейти на async bcrypt. Риск: низкий; требуется тест логина. |
| N-05 | **HIGH** | `server/index.ts:826,1034,…` + `server/routes/system.ts:18-29` | `db.prepare()` in hot paths | SQL компилируется на каждый запрос; `/api/stats` = 7 prepare + 7 get. | Prepared statements на уровне модуля. Риск: нужно следить за временем жизни DB-соединения. |
| N-06 | **HIGH** | `src/entry-server.tsx:21-33`; `server/index.ts:2274-2286` | SSR `renderToString` | Синхронный рендер всего React-дерева на каждый документ; `no-store`; SW `networkFirstShell` (`sw.js:154-157`) гарантирует сетевой запрос — кэша второго визита нет. | Кэш HTML на边缘 (если контент статичен) или стриминг. Риск: персонализация/темы —需要先 сегментировать. |
| N-07 | **HIGH** | `server/routes/ai.ts:107-117`; `server/services/ragPipeline.ts:43-64` | AI endpoints | Последовательные `await getEmbeddings()` на каждый chunk + cosine over **all** embeddings in JS per query. | Батч эмбеддингов + FTS5/vector index. Риск: средний, требует тестов качества ответов. |
| N-08 | **MED-HIGH** | `src/components/Footer.tsx:58-66`; `Section06...:31`; `Section01Hero.tsx:25`; `Section04...:35`; `useHeroes.ts:133` | 6+ fetch on mount | Разные компоненты тянут `/api/news`, `/api/stats`, `/api/courts`, `/api/heroes`, `/api/useful-sites`, `/api/marquee-config` без общего dedup/AbortController. `cache:'no-store'` в `Section01Hero` обесценивает server-side `max-age=300`. | Shared fetch layer (dedup + abort), убрать `no-store` там, где сервер уже кэширует. Риск: актуальность данных — проверить. |
| N-09 | **MED-HIGH** | `public/_headers` vs `server/index.ts:2250-2266` | Cache-Control mismatch | Pages: `/video/*` 1 год immutable; Express: mp4/webm не попадают под regex → 1 час. | Выровнять. Риск: нет. |
| N-10 | **MEDIUM** | `server/utils/cache.ts:13-17` и 20+ call sites | `stale-while-revalidate = N×5` | `/api/courts` `max-age=3600, SWR=18000`: Published change может быть виден до 5 часов. | Ограничить SWR 1×или меньше. Риск: increased origin load. |
| N-11 | **MEDIUM** | `public/sw.js:33,35-41` | Precache | SW при установке скачивает оба JPEG-фона (~5 МБ) независимо от темы/маршрута. | Precache только shell + активную тему. Риск: офлайн-режим другой темы. |
| N-12 | **MEDIUM** | `src/components/Footer.tsx:33-42`; `JudicialModal.tsx:468-501` | Google favicon, Unsplash | Внешние запросы (измерено: 0 third-party в чистом загрузочном водопаде, но при появлении футера/модалки они есть). | Заменить фавиконки на локальные/сгенерированные иконки; Unsplash — на локальные аватары. Риск: визуальный. |
| N-13 | **HIGH** | `public/models/judicial/*` | GLB-дубликаты | `themis.glb` и `optimized/themis-medium.glb` — **15,12 МБ каждый** (идентичны по размеру); то же для scales (12,37×2) и gavel (8,15×2). Папка = **74,3 МБ**. | Оставить по одному файлу, реально оптимизировать (draco/meshopt). Риск: надо проверить, какой URL реально грузит `Adaptive3DLoader` (SUSPECTED). |
| N-14 | **INFO** | `src/components/IntroSplash.tsx` | интро | 2,03 МБ webm (выбирается браузером) + 0,11 МБ постер на **каждую** полную загрузку — по прямому требованию пользователя. SW cache-first убирает повторную загрузку во второй вкладке. | Оставить; оптимизироватьDiscovery постера (A-03). Риск: требует согласия пользователя при любом изменении поведения. |

**Origin stability (измерено в ходе аудита):** в момент замеров quick-tunnel умирал; API отвечал 530, что вызвало лавину повторов и исказило часть сетевых замеров. После перезапуска туннеля и KV (`exploration-connected-typical-offering`) API вернул 200. Это **операционная находка**, не код.

---

## 8. Critical Findings

1. **192 blur-слоя + 26 бесконечных анимаций на одной странице** — главный GPU/CPU-потребитель (A-01, A-02, A-05). Доказано в рантайме.
2. **Интро забирает LCP**: +≈250 мс, постер с Low priority и поздним discovery (A-03). Доказано трассировкой.
3. **Pages Function делает KV + 2×30 s на каждый API-запрос** (N-01) — при падении origin лавина 530 и 40+ повторов (N-02). Доказано водопадом.
4. **5 МБ фоновых JPEG eager + ~20 шрифтовых woff2** на first paint (C-02, C-03). Доказано водопадом.
5. **SSR + SW network-first** = каждый переход бьёт по origin (N-06). Доказано кодом + waterfalls.

---

## 9. High Priority Findings

- A-04 `feTurbulence` full-viewport; A-06 pointer-following inherited vars; A-07 SVG-фильтры в бесконечных циклах; A-09 JS-интервалы без hidden-gating.
- R-01 нестабильные context values; R-02 ноль `memo`; R-03 1770-строковый JudicialModal.
- C-01 полноэкранный blur reader; C-05 16 `:not()`-селекторов; C-06 нет `content-visibility`.
- N-03 дубль design-settings; N-04 bcrypt sync; N-05 prepare per request; N-07 AI sequential; N-08 6+ разрозненных fetch; N-09 cache mismatch; N-13 74 МБ GLB.

## 10. Medium Priority Findings

A-08 View Transition blur; A-10 Motion ignore reduced-motion; R-04 JSON.parse in render; R-05 getComputedStyle on wheel; R-06 Tiptap unused; C-03 шрифтовые подмножества; C-04 нет preload; C-07forced layout в JudiciaryHeader; N-10 SWR ×5; N-11 SW precache 5 МБ; N-12 third-party images; N-02 unbounded Cache Storage.

## 11. Low Priority Findings

A-11 permanent `will-change`; R-07 v5 типы; R-08 неочищенные таймеры; C-08 238 мс bootstrap; мёртвые модули (`ScrollVideo.tsx`, `useJellyScroll.ts`, `DigitalDataRain.tsx`, `AnimatedBeam` — не импортируются); пустые `.webp`-fallbacks в `models/judicial/fallbacks`.

---

## 12. Affected Files and Components

```
src/index.css                                  (A-01,A-04,A-05,A-08,A-11,C-05)
src/styles/tokens.css                          (A-01)
src/components/GlobalBackground.tsx            (A-02,C-02,N-08)
src/components/CloudSky.tsx                    (A-02)
src/components/IntroSplash.tsx                 (A-03,N-14)
src/components/ui/LiquidGlassSurface.tsx       (A-06)
src/components/ui/Button.tsx                   (A-18/N-18 pulse)
src/components/news/Judicial3DNewsSlider.tsx   (A-09,A-11)
src/components/digital-court/InteractiveProcessFlow.tsx (A-09)
src/components/judicial-ecosystem/blueprint/BlueprintCentralAuthority.tsx (A-09,R-08)
src/components/symbols/{DigitalThemis,DigitalJudicialHammer,InteractiveThemis}.tsx (A-07)
src/components/judicial-map/JudiciaryHeader.tsx (C-07)
src/components/digital-court/LegislativeLibrary.css (C-01)
src/components/JudicialModal.tsx               (R-03,N-12)
src/context/{ThemeContext,LanguageContext,A11yContext}.tsx (R-01)
src/components/Layout.tsx                      (R-01,N-08)
src/pages/ContentDetailPage.tsx                (R-04)
src/hooks/useSmoothScroll.ts                   (R-05)
src/hooks/useDesignSettings.ts                 (N-03)
src/theme/store.tsx                            (N-03)
src/entry-client.tsx                           (C-03,N-03)
src/entry-server.tsx                           (N-06)
index.html                                     (C-04,C-08)
public/sw.js                                   (N-02,N-06,N-11)
public/_headers                                (N-09)
public/models/judicial/*                       (N-13)
public/{supreme-court-day,supreme-court-night}.jpg (C-02,N-11)
server/index.ts                                (N-04,N-05,N-06,N-09)
server/routes/{system,search,ai}.ts            (N-05,N-07)
server/services/ragPipeline.ts                 (N-07)
%USERPROFILE%\.sudtj\pagesproj\functions\api\[[path]].ts (N-01)
```

---

## 13. Root Cause Analysis

1. **Дизайн-система «стекло» реализована как одинаковый тяжелый материал для всех поверхностей.** 24–28px blur применяется и к навигации, и к десяткам мелких чипов; формально это «одинаковый язык», но для GPU — это 192 слоя. Корень — отсутствие градаций材料.
2. **Анимации не имеют единого生命周期-менеджера.** CSS-бесконечности, JS-интервалы и WebGL rAF живы пока смонтирован DOM; только `CloudSky` проверяет `document.hidden`. Глобальный reduce-motion kill switch покрывает CSS, но не Motion/WAAPI.
3. **Интро добавлено «поверх» оптимизационного контура.** Оно стало LCP-элементом, потому что появляется после гидратации и не имеет приоритетной загрузки постера.
4. **Frontend не имеет общего слоя данных.** 6+ компонентов独立но тянут одинаковые API; SW кэширует их без TTL; при падении origin это превращается в повторный шторм.
5. **Origin-топология хрупка.** Quick-tunnel + KV в Pages Function: каждый запрос зависит от живого туннеля; во время аудита это дало 530 и исказило измерения.
6. **SSR не кэшируется по дизайну**, а SW делает navigation network-first — каждый возврат на сайт = полный SSR.

---

## 14. Recommended Optimization Strategy

**Без изменения визуального языка, в порядке убывания отдачи:**

1. **Градации стекла (A-01):** `--lg-blur` 24→12–16px на чипах/кнопках, 24px оставить на navbar/модалках; low-end уже отключает blur. Ожидаемо: заметное снижение Paint/Composite.
2. **Один CloudSky (A-02):** один WebGL-контекст, тема через uniforms; пауза по `document.hidden` и IO. Ожидаемо: −50% GPU-нагрузки в тёмной теме.
3. **Постер интро с `fetchpriority="high"` + preload (A-03):** вернуть LCP к ~900–1000 мс без отказа от интро.
4. **Visibility-gating для всех бесконечных анимаций (A-05, A-07, A-09):** `IntersectionObserver` + `document.hidden`, единый хук.
5. **`MotionConfig reducedMotion="user"` (A-10)** — закрыть coverage JS-анимаций.
6. **LiquidGlassSurface: transform вместо наследуемых CSS-переменных (A-06).**
7. **Статичный шум вместо `feTurbulence` (A-04)**, WebP/AVIF для двух фонов (C-02), сузить Fontsource (C-03).
8. **Shared fetch + TTL в SW (N-02,N-03,N-08)**, один владелец design-settings, убрать `no-store` там, где сервер кэширует.
9. **Кэш origin в Pages Function (N-01)**, выровнять Cache-Control (N-09).
10. **Prepared statements + async bcrypt (N-04,N-05)**, батч для AI (N-07).
11. **`memo()` + `useMemo` (R-01..R-04)** — точечно, по Profiler'у.
12. **`content-visibility:auto` (C-06)** с измерением CLS.
13. **Удалить 74 МБ дублей GLB (N-13)** и неиспользуемые зависимости/модули (R-06, раздел 11).

---

## 15. Expected Performance Improvements

| Мера | Метрика | Ожидаемый эффект (гипотеза, требует проверки после внедрения) |
|---|---|---|
| Posters preload (A-03) | LCP mobile | 1159 → ~950–1000 мс (−150…−200 мс) |
| Градации стекла (A-01) | Paint/Composite, frame time | −30…−50% времени композитинга на мобильном; 60 FPS в покое |
| Один CloudSky (A-02) | GPU/CPU idle | −~50% GPU-работы в тёмной теме |
| Gating анимаций (A-05/A-07/A-09) | rAF count | 2131 → <300 за 5,5 с в фоне/вне вьюпорта |
| WebP фоны (C-02) | Network | −~4 МБ на cold load |
| Fonts subsets (C-03) | CSS/dist | −~1 МБ deploy, −10…−15 запросов |
| Shared fetch + SW TTL (N-02/N-03) | Requests | 74 → ~70 в норме; при падении origin — никакого шторма |
| Html cache/st streaming (N-06) | TTFB повторного визита | −100…−200 мс при тёплом кэше |

**Все числа — оценки, не измерения после фиксов.** Полевые LCP/INP останутся неизвестными до появления CrUX/RUM.

---

## 16. Testing Results

| Сценарий | Результат |
|---|---|
| DIAGNOSTICS_ONLY соблюдён | ✅ Ни один исходный файл не изменён; отчёт — единственный созданный файл |
| Initial load (mobile/desktop, cold/warm) | ✅ 3 прогона на режим, медианы в таблице раздела 3; CLS 0.00 |
| Интро включено/выключено | ✅ Изолировано через `prefers-reduced-motion` без правки кода: 1159 vs 912 мс |
| Navigation between pages | ⚠️ Частично: SPA-переход не перезапускает интро (проверено ранее); полные навигации всегда идут в сеть (N-06) |
| Scrolling long page | ⚠️ Trace показывает 2131 rAF / 1182 Paint за 5,5 с при полном motion несколько источников (WebGL + ticker + символы) |
| Modals / dropdowns / filters | ✅/statically: JudicialModal early-return when closed (хорошо); открытый модал дорог (R-03) — Profiler не запускался |
| 5 минут open | ✅ 60-секундный proxy: heap 8,9→8,7 МБ, утечки нет |
| Multiple tabs | ❌ не тестировалось (нет изолированных табов в этой сессии) |
| Cold vs warm cache | ✅ cold (ignoreCache) vs warm (тёплый кэш): 1159 vs 768 мс — но это ещё и разные form factors, не чистое сравнение кэша |
| prefers-reduced-motion | ✅ 40→3 анимации, 26→0 infinite, 192→0 blur |
| Chrome DevTools trace/Lighthouse | ✅ traces сохранены: `H:\TEMP\opencode\audit-mobile-cold.json.gz`, `audit-mobile-nointro.json.gz`. Lighthouse performance **не использовался** по регламенту навыка; CrUX n/a |
| React DevTools Profiler | ❌ не запускался (нет доступа к Profiler в этой сессии); R-01..R-03 подтверждены кодом, помечены как требующие Profiler |

---

### Требование пользователя

**Никаких изменений не внесено.** Перед любой оптимизацией:
1. нужно ваше одобрение выбранных пунктов;
2. будет создан backup (`node scripts/backup.mjs --version …`) перед первой же правкой;
3. каждое изменение — отдельный релиз с QA-гейтом, как принято в проекте.

Готовы приступить к пунктам 1–3 стратегии (стекло, CloudSky, постер) — они дают максимальную отдачу без смены дизайна.
