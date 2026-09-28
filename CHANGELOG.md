# Changelog â€” SUD.TJ Supreme Court Platform

Format: `vX.Y.Z: description`. Tags `vX.Y.Z`. Full backups under `C:\SUD_TJ_Backups\<version> - <desc>\` (off-disk copy required).

## v2.9.7 - Release automation - version bump, QA gate, backup, tag, GitHub sync, safe rollback
- Released: 2026-09-28 15:59
- Previous: v2.9.6
- QA: `tsc 0`, `build:client`, smoke 200 on `/` `/admin` `/api/health`
  `/api/design-settings` `/api/news` `/api/search` `/api/site-sections`
  `/api/marquee-config` `/api/useful-sites` `/sitemap.xml` `/robots.txt`.
## v2.9.6 â€” Sync admin with public Liquid Glass Premium Ultra (one global system)
- Admin dark `bg #030712` `glass-admin` `bg #070d1a/90` `black/80` â†’ `AdminShell bg-theme-bg`, `AdminSidebar glass` `border var(--glass-border)` `text-theme-textSec`, `AdminTopbar glass` sticky 32px, `AdminCard glass glass-card`, `AdminModal glass glass-premium`, `AdminTable glass`, `CommandPalette bg-theme-bg/70` â€” same `Global Liquid Glass Premium Ultra` ÐºÐ°Ðº public (`--glass-surface 0.14` `--glass-border 0.22` `--glass-blur 24` `--court-gold`).
- Ð£Ð´Ð°Ð»ÐµÐ½Ñ‹ `black full-screen`/`separate dark theme`/`opaque dark cards`/`independent admin system`/`huge empty spaces` â€” Ð¾Ð´Ð½Ð° ÑÐ¸ÑÑ‚ÐµÐ¼Ð° Public+Admin+Login.
- QA: `tsc 0` `build 7.00s` `health 200` `admin 200` `background/cards/buttons/inputs/borders/radius/transparency/typography/gold` ÐµÐ´Ð¸Ð½Ñ‹, `mobile/desktop` `cross-browser @supports` PASS.

## v2.9.5 â€” Final global Liquid Glass fix Public+Admin+Login (one background + one glass)
- ÐÑ€Ñ…Ð¸Ñ‚ÐµÐºÑ‚ÑƒÑ€Ð°: `ONE_GLOBAL_BACKGROUND` (`GlobalBackground` `image` â†’ `Atmospheric White Overlay` `var(--bg-overlay-opacity 0.12) var(--bg-blur 0)` â†’ `Page Content` â†’ `Glass Components`) + `ONE_GLOBAL_GLASS_SYSTEM` (`--glass-opacity/blur/saturation/border/shadow/highlight/radius`) â€” `backdrop-filter` Ñ‚Ð¾Ð»ÑŒÐºÐ¾ Ð½Ð° `GlassCard/Button/Input/Modal/Navigation/Panel`, ÑƒÐ´Ð°Ð»ÐµÐ½ Ñ `body/main/layout/half-page` Ð¸ `left/right split` login (ÐºÑ€Ð¸Ñ‚Ð¸Ñ‡Ð½Ñ‹Ð¹ Ñ„Ð¸ÐºÑ Ð²ÐµÑ€Ñ‚Ð¸ÐºÐ°Ð»ÑŒÐ½Ð¾Ð³Ð¾ Ñ€Ð°Ð·Ñ€Ñ‹Ð²Ð°).
- Public: Ð±ÐµÐ»Ñ‹Ðµ Ð»Ð¸Ð½Ð¸Ð¸ `border-t theme-border/30` 13 ÑÐµÐºÑ†Ð¸Ð¹ ÑƒÐ´Ð°Ð»ÐµÐ½Ñ‹, Ð²ÑÐµ `hero/information/document/news/action/court/regional/service/footer/tabs/filters/search/dropdowns/modals/login/admin/mobile` Ð½Ð° ÐµÐ´Ð¸Ð½Ð¾Ð¼ `GlassSurface` `0.14/24/0.22/24/0.12`, Ð½Ð¸Ð¶Ð½Ð¸Ðµ ÐºÐ°Ñ€Ñ‚Ð¾Ñ‡ÐºÐ¸ `glass-strong 0.18` + `inner highlight` `soft shadow` `deep navy text` Ð±ÐµÐ· opaque, Ñ„Ð¾Ð½ `supreme-court-day.jpg` Ð½Ð°ÑÑ‹Ñ‰ÐµÐ½Ð½Ñ‹Ð¹ Ð³Ð¾Ð»ÑƒÐ±Ð¾Ð¹, Ð·Ð´Ð°Ð½Ð¸Ðµ Ð²Ð¸Ð´Ð½Ð¾.
- Admin: `AdminShell bg-theme-bg`, `Sidebar GlassNavigation`, `Topbar GlassSurface`, `Dashboard GlassCard` Ñ `same transparency 0.18` Ñ‡ÑƒÑ‚ÑŒ Ð¿Ð»Ð¾Ñ‚Ð½ÐµÐµ Ð´Ð»Ñ Ñ‡Ð¸Ñ‚Ð°ÐµÐ¼Ð¾ÑÑ‚Ð¸, `high contrast text`, `GlassNavigation` sidebar, `same tokens` â€” Ð½Ðµ Ð¾Ñ‚Ð´ÐµÐ»ÑŒÐ½Ñ‹Ð¹ Ñ‡ÐµÑ€Ð½Ñ‹Ð¹ ÑÐ°Ð¹Ñ‚, Ð½Ðµ Ð±ÐµÐ»Ñ‹Ð¹.
- Login: `left/right layout` Ð±ÐµÐ· `backdrop-filter`, ÐµÐ´Ð¸Ð½Ñ‹Ð¹ Ñ„Ð¾Ð½ `GlobalBackground` Ð½ÐµÐ¿Ñ€ÐµÑ€Ñ‹Ð²Ð½Ð¾ Ð±ÐµÐ· Ð²ÐµÑ€Ñ‚Ð¸ÐºÐ°Ð»ÑŒÐ½Ð¾Ð³Ð¾ split, `login card` `glass-premium 0.18 blur 32` medium Ñ‡Ð¸Ñ‚Ð°ÐµÐ¼Ñ‹Ð¹, `glass inputs` + `gold button`, `flex-col-reverse` mobile priority login.
- Sync: `Background Image/Overlay/Blur/Saturation/Brightness/Contrast` + `Glass Opacity/Blur/Saturation/Border/Shadow/Highlight/Radius` â€” ÑƒÐ¿Ñ€Ð°Ð²Ð»ÑÐµÑ‚ÑÑ `Admin â†’ System Settings â†’ Design â†’ Liquid Glass` Ñ Live Preview (Ð¸Ð·Ð¼ÐµÐ½ÐµÐ½Ð¸Ðµ Ð¼Ð³Ð½Ð¾Ð²ÐµÐ½Ð½Ð¾) Desktop/Tablet/Mobile, global sync Public+Admin+Login+Mobile+Footer.
- QA: Ð¾Ð´Ð¸Ð½ Ñ„Ð¾Ð½/Ñ†Ð²ÐµÑ‚Ð°/ÑÑ‚ÐµÐºÐ»Ð¾, Ð½ÐµÑ‚ Ð³Ð»Ð¾Ð±Ð°Ð»ÑŒÐ½Ð¾Ð³Ð¾ blur, Ð½ÐµÑ‚ Ð²ÐµÑ€Ñ‚Ð¸ÐºÐ°Ð»ÑŒÐ½Ð¾Ð³Ð¾ split, Ð½ÐµÑ‚ Ð¿ÐµÐ»ÐµÐ½Ñ‹/opaque, Ð²ÑÐµ glass, Ð½Ð¸Ð¶Ð½Ð¸Ðµ ÐºÐ°Ñ€Ñ‚Ð¾Ñ‡ÐºÐ¸ Ð²Ð¸Ð´Ð½Ñ‹, login/sidebar Ñ‡Ð¸Ñ‚Ð°ÐµÐ¼Ñ‹, Chrome/Edge/Firefox/Safari/iOS/Android `@supports` fallback, mobile `44px`, `tsc 0` `build 7.04s`, `health 200` `vite 200`.

## v2.9.4 â€” Finalize Global Liquid Glass + managed atmosphere
- Ð‘ÐµÐ»Ñ‹Ðµ Ð»Ð¸Ð½Ð¸Ð¸-Ñ€Ð°Ð·Ñ€Ñ‹Ð²Ñ‹ ÑƒÐ´Ð°Ð»ÐµÐ½Ñ‹: `border-t border-theme-border/30` Ð¸Ð· 13 ÑÐµÐºÑ†Ð¸Ð¹ (`Section*`) â€” ÑÐ»ÑƒÑ‡Ð°Ð¹Ð½Ñ‹Ðµ Ñ€Ð°Ð·Ñ€Ñ‹Ð²Ñ‹ Ð¸Ð½Ñ‚ÐµÑ€Ñ„ÐµÐ¹ÑÐ° ÑƒÐ±Ñ€Ð°Ð½Ñ‹, Ñ„ÑƒÐ½ÐºÑ†Ð¸Ð¾Ð½Ð°Ð»ÑŒÐ½Ñ‹Ðµ Ñ€Ð°Ð·Ð´ÐµÐ»Ð¸Ñ‚ÐµÐ»Ð¸ ÑÐ¾Ñ…Ñ€Ð°Ð½ÐµÐ½Ñ‹.
- Global Liquid Glass Ð´Ð»Ñ Ð’Ð¡Ð•Ð¥ ÐºÐ½Ð¾Ð¿Ð¾Ðº/ÐºÐ°Ñ€Ñ‚Ð¾Ñ‡ÐµÐº: `btn-primary/gold/secondary/ghost/btn-outline` â†’ `glass` `0.14-0.23` `blur 24` `border 0.22` `radius 24` `shadow 0.12` `highlight 0.42` Ñ `backdrop-filter`/`-webkit-` + `@supports` fallback; `AdminButton` â†’ `glass` Ñ gold/cyan Ð°ÐºÑ†ÐµÐ½Ñ‚Ð°Ð¼Ð¸; `content-card` ÑƒÐ¶Ðµ glass.
- ÐÐ¸Ð¶Ð½Ð¸Ðµ ÐºÐ°Ñ€Ñ‚Ð¾Ñ‡ÐºÐ¸ Ð²Ð¸Ð´Ð¸Ð¼Ñ‹: `Section07Contacts` Ð¸ `Footer` Ð¸ÑÐ¿Ð¾Ð»ÑŒÐ·ÑƒÑŽÑ‚ `glass-strong 0.18` + `inner highlight` + `soft shadow`, Ñ‚ÐµÐºÑÑ‚ `deep navy` ÐºÐ¾Ð½Ñ‚Ñ€Ð°ÑÑ‚, border Ð·Ð°Ð¼ÐµÑ‚ÐµÐ½ `0.22` Ð±ÐµÐ· opaque white, Ð·Ð´Ð°Ð½Ð¸Ðµ Ð½Ðµ ÐºÐ¾Ð½Ñ„Ð»Ð¸ÐºÑ‚ÑƒÐµÑ‚.
- Background atmosphere Ð²Ð¾Ð·Ð²Ñ€Ð°Ñ‰ÐµÐ½ ÑƒÐ¿Ñ€Ð°Ð²Ð»ÑÐµÐ¼Ñ‹Ð¼: `GlobalBackground` + `ScrollVideo` â€” `Background Image` â†’ `Atmospheric White Overlay` (`--bg-overlay-opacity 0.12`, `--bg-blur 0`, `--bg-saturation 100%`, `--bg-brightness 100%`, `--bg-contrast 100%`) â†’ `Liquid Glass UI`; overlay ÑÐ»Ð°Ð±Ñ‹Ð¹, Ð·Ð´Ð°Ð½Ð¸Ðµ/Ð½ÐµÐ±Ð¾ Ð²Ð¸Ð´Ð¸Ð¼Ñ‹, Ð½Ðµ Ð¼Ð¾Ð»Ð¾Ñ‡Ð½Ð°Ñ Ð¿ÐµÐ»ÐµÐ½Ð°, `background blur` Ð¾Ñ‚Ð´ÐµÐ»ÑŒÐ½Ð¾ Ð¾Ñ‚ `glass blur`.
- Admin `ÐÐ°ÑÑ‚Ñ€Ð¾Ð¹ÐºÐ¸ â†’ Ð”Ð¸Ð·Ð°Ð¹Ð½ â†’ Background & Glass` â€” Background (Image/Position/Size), Atmosphere (White Overlay Opacity/Blur/Saturation/Brightness/Contrast), Glass (Opacity/Blur/Saturation/Border/Shadow/Highlight/Radius) â€” Ð²ÑÐµ Ñ‡ÐµÑ€ÐµÐ· `site_design_settings` draft/published, Live Preview ÑÑ€Ð°Ð·Ñƒ (Blur +10 â†’ Ñ„Ð¾Ð½ Ñ€Ð°Ð·Ð¼Ñ‹Ñ‚, Glass Opacity +10 â†’ ÐºÐ°Ñ€Ñ‚Ð¾Ñ‡ÐºÐ¸ Ð¿Ð»Ð¾Ñ‚Ð½ÐµÐµ) Ð½Ð° Desktop/Tablet/Mobile.
- Presets: Premium/Ultra/Clear/Soft â€” Apply/Preview/Save/Reset, Ð¼ÐµÐ½ÑÑŽÑ‚ Global Tokens, Ð½Ðµ ÑÐ¾Ð·Ð´Ð°ÑŽÑ‚ Ñ…Ð°Ð¾Ñ‚Ð¸Ñ‡Ð½Ñ‹Ð¹ CSS.
- Global sync: Public + Admin + Login + Mobile + Footer Ð¿Ð¾Ð»ÑƒÑ‡Ð°ÑŽÑ‚ Ð¾Ð¿ÑƒÐ±Ð»Ð¸ÐºÐ¾Ð²Ð°Ð½Ð½Ñ‹Ðµ `--glass-*`/`--bg-*`/`--court-gold`, Ð¸Ð·Ð¼ÐµÐ½ÐµÐ½Ð¸Ðµ Ð² Ð°Ð´Ð¼Ð¸Ð½ÐºÐµ ÑÐ¸Ð½Ñ…Ñ€Ð¾Ð½Ð½Ð¾ Ð²ÐµÐ·Ð´Ðµ.
- QA: Ð½ÐµÑ‚ Ð±ÐµÐ»Ñ‹Ñ… Ð»Ð¸Ð½Ð¸Ð¹, Ð²ÑÐµ ÐºÐ°Ñ€Ñ‚Ð¾Ñ‡ÐºÐ¸/ÐºÐ½Ð¾Ð¿ÐºÐ¸ glass, Ð½Ð¸Ð¶Ð½Ð¸Ðµ ÐºÐ°Ñ€Ñ‚Ð¾Ñ‡ÐºÐ¸ Ð²Ð¸Ð´Ð½Ñ‹, Ñ‚ÐµÐºÑÑ‚ Ñ‡Ð¸Ñ‚Ð°ÐµÐ¼Ñ‹Ð¹, Ñ„Ð¾Ð½ Ð½Ðµ Ð¼Ð¾Ð»Ð¾Ñ‡Ð½Ñ‹Ð¹, Ð·Ð´Ð°Ð½Ð¸Ðµ Ð²Ð¸Ð´Ð¸Ð¼Ð¾, glass Ð³Ð»ÑƒÐ±Ð¸Ð½Ð°, desktop/mobile PASS, cross-browser Chrome/Edge/Firefox/Safari + iOS/Android `backdrop-filter -webkit @supports` PASS.

## v2.9.3 â€” Redesign admin login to match public portal (cinematic glass)
- Ð¤Ð¾Ð½ ÑÐ¸Ð½Ñ…Ñ€Ð¾Ð½Ð¸Ð·Ð¸Ñ€Ð¾Ð²Ð°Ð½: `src/hooks/useSiteBackground.ts` + `src/components/GlobalBackground.tsx` (shared) â€” `AdminLogin` Ñ‚ÐµÐ¿ÐµÑ€ÑŒ Ñ€ÐµÐ½Ð´ÐµÑ€Ð¸Ñ‚ Ñ‚Ð¾Ñ‚ Ð¶Ðµ `GlobalBackground` Ñ‡Ñ‚Ð¾ `ScrollVideo` (`imageDay/Night` Ð¸Ð· `site_design_settings background_image_day/night` published, fallback `/supreme-court-day.jpg`, poll 30s) â€” `background image/position/atmosphere/color grading/overlay/brightness/responsive` ÐµÐ´Ð¸Ð½Ñ‹, Ð±ÐµÐ· Ð±ÐµÐ»Ð¾Ð¹ Ð¿ÐµÐ»ÐµÐ½Ñ‹, Ð¶Ð¸Ð²Ð¾Ð¹ Ð½Ð°ÑÑ‹Ñ‰ÐµÐ½Ð½Ñ‹Ð¹; Ð¿Ñ€Ð¸ ÑÐ¼ÐµÐ½Ðµ Ñ„Ð¾Ð½Ð° Ð² CMS login Ð¼ÐµÐ½ÑÐµÑ‚ÑÑ Ð°Ð²Ñ‚Ð¾Ð¼Ð°Ñ‚Ð¸Ñ‡ÐµÑÐºÐ¸. `server/index.ts` seed `background_image_day/night`.
- Layout cinematic split: `AdminLogin` `flex-col-reverse md:flex-row` â€” desktop split left branding `55%` right login `45%` glass-premium `440px` `30px` blur 32, tablet adaptive, mobile single column priority login form (order reverse), same global background, no overflow.
- Login card premium: `glass glass-premium` `backdrop blur 32` `border white/20` `shadow floating` `24-32 radius` Ð½Ðµ Ð±ÐµÐ»Ð°Ñ/Ñ‡ÐµÑ€Ð½Ð°Ñ opaque, HUD `circuit 0.10` gold accent `p-3 glass` + `NationalEmblem`, large premium typography `2xl-4xl gold`, soft glow, parallax via GlobalBackground.
- Global Design System ÐµÐ´Ð¸Ð½Ñ‹Ð¹: `AdminLogin` + Public + Admin Ð¸ÑÐ¿Ð¾Ð»ÑŒÐ·ÑƒÑŽÑ‚ Ñ‚Ðµ Ð¶Ðµ `colors/typography/glass/buttons/inputs/radius/borders/shadows/background/animations/responsive` â€” `GlobalBackground`, `GlassInput`, `AdminButton primary gold`, `glass-premium`.
- QA: tsc 0, build 7.71s, main vs login Ð¾Ð´Ð¸Ð½Ð°ÐºÐ¾Ð²Ñ‹Ð¹ background/Ñ†Ð²ÐµÑ‚Ð°/glass/inputs/borders/animations, responsive/mobile, cross-browser backdrop-filter -webkit + @supports, auth Ð½Ðµ Ñ‚Ñ€Ð¾Ð½ÑƒÑ‚.

## v2.9.2 â€” Restore natural background Liquid Glass (remove white overlay)
- Ð£Ð´Ð°Ð»ÐµÐ½ Ð³Ð»Ð¾Ð±Ð°Ð»ÑŒÐ½Ñ‹Ð¹ Ð±ÐµÐ»Ñ‹Ð¹ overlay: `src/components/ScrollVideo.tsx:36-104` `rgba 246,248,251 0.75â†’0` + `to-white/70` + vignette `rgba 15,23,42,0.18` â†’ subtle `rgba 0,0,0,0` + `0.02` radial, `p 0.12` dark only; `src/components/Footer.tsx:40` `bg rgba 255,255,255,0.08 backdrop-blur-sm` + `linear 0.6 white` + circuit `0.03` â†’ `bg transparent border white/10` + `radial 0.04` Ð±ÐµÐ· white, svg ÑƒÐ´Ð°Ð»ÐµÐ½ â€” Ñ„Ð¾Ð½ Ð·Ð´Ð°Ð½Ð¸Ñ Ð½Ð°ÑÑ‹Ñ‰ÐµÐ½Ð½Ñ‹Ð¹, Ð³Ð¾Ð»ÑƒÐ±Ð¾Ðµ Ð½ÐµÐ±Ð¾ ÐµÑÑ‚ÐµÑÑ‚Ð²ÐµÐ½Ð½Ð¾Ðµ, Ð³Ð»ÑƒÐ±Ð¸Ð½Ð° Ð±ÐµÐ· Ð¼Ð¾Ð»Ð¾Ñ‡Ð½Ð¾Ð¹ Ð¿ÐµÐ»ÐµÐ½Ñ‹, glass Ñ‚Ð¾Ð»ÑŒÐºÐ¾ Ð½Ð° UI-ÐºÐ°Ñ€Ñ‚Ð¾Ñ‡ÐºÐ°Ñ….
- QA: tsc 0, build 6.48s, background Ð±ÐµÐ· UI Ð½Ð°ÑÑ‹Ñ‰ÐµÐ½Ð½Ñ‹Ð¹, Ð¿Ð¾Ð´ ÐºÐ°Ñ€Ñ‚Ð¾Ñ‡ÐºÐ°Ð¼Ð¸ Ð·Ð´Ð°Ð½Ð¸Ðµ Ñ‡ÐµÑ‚ÐºÐ¾, hero/Ð½Ð¸Ð¶Ð½Ð¸Ðµ ÑÐµÐºÑ†Ð¸Ð¸, Chrome/Firefox/Edge/Safari/Mobile Ð¿Ñ€Ð¾Ð²ÐµÑ€ÐµÐ½Ñ‹.

## v2.9.1 â€” Admin synced to public Liquid Glass Premium Ultra
- ÐÐ´Ð¼Ð¸Ð½ÐºÐ° Ñ‚ÐµÐ¼Ð½Ð°Ñ `bg #030712` `glass-admin dark` â†’ ÑÐ²ÐµÑ‚Ð»Ð°Ñ ÐµÐ´Ð¸Ð½Ð°Ñ ÑÐ¸ÑÑ‚ÐµÐ¼Ð°: `AdminShell bg-theme-bg`, `AdminSidebar glass` `border var(--glass-border)` `text-theme-textSec`, `AdminTopbar glass sticky 32px`, `AdminCard glass glass-card` `border var(--glass-border)`, `AdminModal glass glass-premium`, `AdminTable glass`, `CommandPalette bg-theme-bg/70` â€” Ñ‚Ð¾Ñ‚ Ð¶Ðµ `Global Liquid Glass Premium Ultra` Ñ‡Ñ‚Ð¾ Ð¿ÑƒÐ±Ð»Ð¸Ñ‡Ð½Ñ‹Ð¹ ÑÐ°Ð¹Ñ‚ (`--glass-surface 0.14` etc., `--court-gold`, `--text-primary`).
- Ð£Ð´Ð°Ð»ÐµÐ½Ñ‹ `black full-screen`, `separate dark theme`, `opaque dark cards`, `independent admin system`, `huge empty spaces` â€” Ð°Ð´Ð¼Ð¸Ð½ Ñ‚ÐµÐ¿ÐµÑ€ÑŒ Ð½Ðµ Ð¾Ñ‚Ð´ÐµÐ»ÑŒÐ½Ñ‹Ð¹ Ñ‡ÐµÑ€Ð½Ñ‹Ð¹ ÑÐ°Ð¹Ñ‚, Ð²Ð¸Ð·ÑƒÐ°Ð»ÑŒÐ½Ð¾ Ð¾Ð´Ð½Ð° ÑÐ¸ÑÑ‚ÐµÐ¼Ð° Ñ public + login.
- Ð¡Ð¾Ñ…Ñ€Ð°Ð½ÐµÐ½Ñ‹ backend/API/database/auth/permissions/routes/CMS â€” Ñ‚Ð¾Ð»ÑŒÐºÐ¾ Ð²Ð¸Ð·ÑƒÐ°Ð».

## v2.9.0 â€” Site CMS and Live Visual Editor + Useful sites marquee
- Marquee Ð²Ð¾ÑÑÑ‚Ð°Ð½Ð¾Ð²Ð»ÐµÐ½: `src/components/Footer.tsx` ticker `36s left` Ð´ÑƒÐ±Ð»Ð¸Ñ€Ð¾Ð²Ð°Ð½Ð½Ñ‹Ð¹ track Ð±ÐµÑÑˆÐ¾Ð²Ð½Ñ‹Ð¹, Ð±ÐµÐ· ÑÐºÐ°Ñ‡ÐºÐ°, `speed/direction/autoplay/pauseOnHover/pauseOnFocus/logo_size/gap/order` Ð¸Ð· Ð°Ð´Ð¼Ð¸Ð½ÐºÐ¸ `site_marquee_config` + `useful_sites` single source; carousel/grid ÑƒÐ±Ñ€Ð°Ð½. ÐÐ´Ð¼Ð¸Ð½ÐºÐ° `src/admin/pages/useful/UsefulSitesManager.tsx` â€” CRUD + drag reorder + duplicate + publish.
- Global CMS: Ñ‚Ð°Ð±Ð»Ð¸Ñ†Ñ‹ `useful_sites`, `site_sections` (8 ÑÐµÐºÑ†Ð¸Ð¹), `site_design_settings` (glass intensity etc.), `site_versions` (Ð¸ÑÑ‚Ð¾Ñ€Ð¸Ñ), `site_marquee_config` seeded; API `/api/useful-sites`, `/api/marquee-config`, `/api/admin/useful-sites*`, `/api/admin/site-sections*`, `/api/admin/design-settings`, `/api/admin/site/*` draft/publish/version/rollback; frontend Ð¿Ð¾Ð»ÑƒÑ‡Ð°ÐµÑ‚ published, draft Ð½Ðµ Ñ‚Ñ€Ð¾Ð³Ð°ÐµÑ‚ production.
- Visual Builder: `src/admin/pages/siteBuilder/SiteBuilder.tsx` three-panel Components (12) | Live Preview (Ñ€ÐµÐ°Ð»ÑŒÐ½Ñ‹Ð¹ preview, device switcher 1920/1440/1024/768/390) | Properties (content/layout/visibility/spacing/typography/background/glass/animation/links/responsive) + `@dnd-kit` drag & drop ÑÐµÐºÑ†Ð¸Ð¹, Ð½Ðµ Ð»Ð¾Ð¼Ð°ÐµÑ‚ layout, design tokens live Ð¼ÐµÐ½ÑÑŽÑ‚ `--glass-*` + `--court-gold`.
- Draft/Publish/Version: save-draft â†’ `site_versions` type draft, publish â†’ copy draftâ†’published + snapshot type publish, history + rollback, preview Ñ€ÐµÐ¶Ð¸Ð¼Ð¾Ð², publish Ñ‚Ð¾Ð»ÑŒÐºÐ¾ Ð¿Ð¾ ÐºÐ¾Ð¼Ð°Ð½Ð´Ðµ, rollback, Ð»Ð¾Ð³Ð¸Ñ€Ð¾Ð²Ð°Ð½Ð¸Ðµ, Ð·Ð°Ñ‰Ð¸Ñ‚Ð° ÐºÑ€Ð¸Ñ‚Ð¸Ñ‡ÐµÑÐºÐ¸Ñ… hero/footer.
- QA: tsc 0, build 9.64s, marquee 7 items 36s left autoplay pauseOnHover, admin useful 200, site-sections 8.

## v2.8.1 â€” Footer visual integration â€” light glass
- Footer Ñ‚ÐµÐ¼Ð½Ñ‹Ð¹ `bg #050f1e` ÑÐ¿Ð»Ð¾ÑˆÐ½Ð¾Ð¹ â†’ ÑÐ²ÐµÑ‚Ð»Ñ‹Ð¹ translucent glass `rgba 255,255,255,0.08` `border white/20` `backdrop-blur` â€” ÐµÐ´Ð¸Ð½Ð°Ñ ÑÐ¸ÑÑ‚ÐµÐ¼Ð° Ñ Ð²ÐµÑ€Ñ…Ð½ÐµÐ¹ Ñ‡Ð°ÑÑ‚ÑŒÑŽ, Ñ„Ð¾Ð½ Ð¼ÑÐ³ÐºÐ¾ Ð¿Ñ€Ð¾ÑÐ²ÐµÑ‡Ð¸Ð²Ð°ÐµÑ‚, Ð½Ðµ Ð¿Ñ€Ð¾ÑÑ‚Ð¾ Ð±ÐµÐ»Ñ‹Ð¹.
- Ð’ÑÐµ ÐºÐ°Ñ€Ñ‚Ð¾Ñ‡ÐºÐ¸ Ñ„ÑƒÑ‚ÐµÑ€Ð° ÑƒÐ½Ð¸Ñ„Ð¸Ñ†Ð¸Ñ€Ð¾Ð²Ð°Ð½Ñ‹ Ð½Ð° `GlobalGlassSurface` `0.14` `blur 24` `border 0.30` `radius 24-30`: president/nav/network/map/contacts/useful â€” opacity 0.12-0.18, Ð±ÐµÐ· `bg-black`/`bg-slate-950`/`opaque dark`.
- ÐšÐ¾Ð½Ñ‚Ð°ÐºÑ‚Ñ‹/ÐºÐ°Ñ€Ñ‚Ð°/bottom bar Ð¿ÐµÑ€ÐµÐ²ÐµÐ´ÐµÐ½Ñ‹: ÐºÐ°Ñ€Ñ‚Ð° `bg rgba 5,15,30,0.35â†’255,255,255,0.14`, ÐºÐ¾Ð½Ñ‚Ð°ÐºÑ‚Ñ‹ `text-whiteâ†’slate-900`, `text-slate-300â†’slate-700`, bottom bar `rgba 5,15,30,0.65â†’255,255,255,0.14` `border 0.28` Ñ‚ÐµÐºÑÑ‚ deep navy.
- Background continuity: Ð°Ñ€Ñ…Ð¸Ñ‚ÐµÐºÑ‚ÑƒÑ€Ð½Ñ‹Ð¹ Ð³Ñ€Ð°Ð´Ð¸ÐµÐ½Ñ‚ ÑÐ¾Ñ…Ñ€Ð°Ð½ÐµÐ½ Ð½Ð¾ ÑÐ²ÐµÑ‚Ð»Ñ‹Ð¹ `0.04` + `white/20` Ð»Ð¸Ð½Ð¸Ð¸, footer Ð¿Ñ€Ð¾Ð´Ð¾Ð»Ð¶Ð°ÐµÑ‚ Ð¾ÑÐ½Ð¾Ð²Ð½Ð¾Ð¹ `bg-theme-bg`, Ð½Ðµ Ð¾Ñ‚Ð´ÐµÐ»ÑŒÐ½Ñ‹Ð¹ dark background.
- QA: tsc 0, build 6.62s, no dark footer, Ð²ÑÐµ ÐºÐ°Ñ€Ñ‚Ð¾Ñ‡ÐºÐ¸ Global Glass, Ñ„Ð¾Ð½ Ð¿Ñ€Ð¾ÑÐ²ÐµÑ‡Ð¸Ð²Ð°ÐµÑ‚, gold accent ÐµÐ´Ð¸Ð½Ñ‹Ð¹, responsive/cross-browser PASS.

## v2.8.0 â€” Court network page â€” Liquid Glass Premium Ultra redesign
- Glass: Ð²ÑÐµ ÐºÐ°Ñ€Ñ‚Ð¾Ñ‡ÐºÐ¸ Ð½Ð° Global GlassSurface `0.14/24px/24px/0.10` â€” ÑƒÑÑ‚Ñ€Ð°Ð½ÐµÐ½Ñ‹ Ð±ÐµÐ»Ñ‹Ðµ opaque, Ð²ÐµÑ€Ñ…/Ð½Ð¸Ð· Ð¾Ð´Ð¸Ð½Ð°ÐºÐ¾Ð²Ñ‹Ðµ, Ð¸ÐºÐ¾Ð½ÐºÐ¸/border/radius/shadow/blur ÑƒÐ½Ð¸Ñ„Ð¸Ñ†Ð¸Ñ€Ð¾Ð²Ð°Ð½Ñ‹.
- Ð ÐµÐ³Ð¸Ð¾Ð½Ñ‹: 4 ÐºÐ°Ñ€Ñ‚Ð¾Ñ‡ÐºÐ¸ Ð¾Ð´Ð¸Ð½Ð°ÐºÐ¾Ð²Ð¾Ð¹ ÑÑ‚Ñ€ÑƒÐºÑ‚ÑƒÑ€Ñ‹/Ð¿Ñ€Ð¾Ð·Ñ€Ð°Ñ‡Ð½Ð¾ÑÑ‚Ð¸, Ñ†Ð²ÐµÑ‚ Ñ‚Ð¾Ð»ÑŒÐºÐ¾ ÐºÐ°Ðº Ñ‚Ð¾Ñ‡ÐºÐ°/Ð°ÐºÑ†ÐµÐ½Ñ‚ Ð»Ð¸Ð½Ð¸Ñ 2px `colorHex` â€” ÑƒÐ±Ñ€Ð°Ð½Ð° Ð·Ð°Ð»Ð¸Ð²ÐºÐ° Ð²ÑÐµÐ¹ ÐºÐ°Ñ€Ñ‚Ð¾Ñ‡ÐºÐ¸, ÑÑ€ÐºÐ¸Ðµ Ð³Ñ€Ð°Ð´Ð¸ÐµÐ½Ñ‚Ñ‹/neon ÑƒÐ±Ñ€Ð°Ð½Ñ‹.
- ÐŸÑƒÑÑ‚Ð¾Ñ‚Ð° ÑƒÐ¼ÐµÐ½ÑŒÑˆÐµÐ½Ð°: header `mb-6â†’4`, search `mb-6â†’4`, canvas `my-4â†’2` `min-h 560â†’520`, trunk `152pxâ†’36px` subtle line Ð±ÐµÐ· glow/rainbow, gap `4â†’3`.
- Ð”ÐµÐºÐ¾Ñ€Ð°Ñ‚Ð¸Ð²Ð½Ð°Ñ Ð»Ð¸Ð½Ð¸Ñ Ñ Ñ†Ð²ÐµÑ‚Ð½Ñ‹Ð¼Ð¸ Ñ‚Ð¾Ñ‡ÐºÐ°Ð¼Ð¸ Ð·Ð°Ð¼ÐµÐ½ÐµÐ½Ð° Ð½Ð° Ñ‚Ð¾Ð½ÐºÑƒÑŽ `h-px bg-white/10` Ñ 4 Ñ‚Ð¾Ñ‡ÐºÐ°Ð¼Ð¸ `1.5px` + Ñ†ÐµÐ½Ñ‚ gold `2px`, active gold.
- Ð’Ð½ÑƒÑ‚Ñ€ÐµÐ½Ð½Ð¸Ðµ Ñ€Ð°Ð¼ÐºÐ¸ ÑƒÐ±Ñ€Ð°Ð½Ñ‹: region box `border colorHex â†’ white/10 glass-card`, connector svg ÑƒÐ´Ð°Ð»ÐµÐ½, military pill ÑƒÐ¿Ñ€Ð¾Ñ‰ÐµÐ½ Ð´Ð¾ `glass glass-card` Ñ `MapPin+Shield`.
- Ð˜ÐµÑ€Ð°Ñ€Ñ…Ð¸Ñ ÑƒÐ»ÑƒÑ‡ÑˆÐµÐ½Ð°: header Ñ‡Ð°ÑÑ‚ÑŒ glass, ÐºÐ¾Ð¼Ð¿Ð°ÐºÑ‚Ð½Ñ‹Ð¹, Ð¿Ð¾Ð¸ÑÐº Ð·Ð°Ð¼ÐµÑ‚Ð½Ñ‹Ð¹ `h-11 glass white/20` placeholder i18n `Ð½Ð°Ð·Ð²Ð°Ð½Ð¸Ðµ/Ñ€ÐµÐ³Ð¸Ð¾Ð½/Ð³Ð¾Ñ€Ð¾Ð´` + gold icon, Ñ„Ð¸Ð»ÑŒÑ‚Ñ€Ñ‹ compact Glass controls, Ñ€ÐµÐ·ÑƒÐ»ÑŒÑ‚Ð°Ñ‚Ñ‹ live Ð±ÐµÐ· Ð¿ÐµÑ€ÐµÐ·Ð°Ð³Ñ€ÑƒÐ·ÐºÐ¸.
- Ð¡Ð¿Ð¸ÑÐºÐ¸: default 5 ÑÑƒÐ´Ð¾Ð², ÐºÐ½Ð¾Ð¿ÐºÐ° `ÐŸÐ¾ÐºÐ°Ð·Ð°Ñ‚ÑŒ Ð²ÑÐµ (n)` expands, mobile 1 col â€” Ð½ÐµÑ‚ Ð±ÐµÑÐºÐ¾Ð½ÐµÑ‡Ð½Ñ‹Ñ… ÐºÐ°Ñ€Ñ‚Ð¾Ñ‡ÐµÐº; item `minimal_glass_list_item` `MapPin 11 + name + type 9px + ChevronRight 12` `min-h 44` touch target.
- Ð¡Ñ‚Ð°Ñ‚Ð¸ÑÑ‚Ð¸ÐºÐ° ÐºÐ¾Ð¼Ð¿Ð°ÐºÑ‚Ð½Ð°Ñ: `glass border white/10 10px mono` `1 Ð²Ð¸Ð»Ð¾ÑÑ‚Ó£ â€¢ 2 ÑˆÐ°Ò³Ñ€Ó£ â€¢ 7 Ð½Ð¾Ò³Ð¸Ñ` Ñ Ñ‚Ð¾Ñ‡ÐºÐ¾Ð¹ accent, Ð±ÐµÐ· Ð»Ð¸ÑˆÐ½Ð¸Ñ… inner Ñ€Ð°Ð¼Ð¾Ðº.
- QA: tsc 0, build 6.43s, no logic/API/route changes, data integrity ÑÐ¾Ñ…Ñ€Ð°Ð½ÐµÐ½Ð° (77 ÑÑƒÐ´Ð¾Ð² single source).

## v2.7.0 â€” Real site footer Liquid Glass Premium Ultra
- ÐÑ€Ñ…Ð¸Ñ‚ÐµÐºÑ‚ÑƒÑ€Ð°: Ð½Ð¾Ð²Ñ‹Ð¹ `src/components/Footer.tsx` multi-layer (deep navy `050f1e` + subtle architectural gradient/circuit 0.04 + premium glass 30px). Ð¡Ñ‚Ð°Ñ€Ñ‹Ð¹ ÑÐ¿Ð»Ð¾ÑˆÐ½Ð¾Ð¹ Ð³Ð¾Ð»ÑƒÐ±Ð¾Ð¹ footer Ð¸ ticker Ð¿Ð¾Ð»Ð½Ð¾ÑÑ‚ÑŒÑŽ Ð·Ð°Ð¼ÐµÐ½ÐµÐ½Ñ‹ â€” ÐºÐ¾Ð½Ñ‚ÐµÐ½Ñ‚ ÑÐ¾Ñ…Ñ€Ð°Ð½ÐµÐ½, Ð²Ð¸Ð·ÑƒÐ°Ð» Ð½Ð°Ñ‚ÑƒÑ€Ð°Ð»ÑŒÐ½Ð¾Ðµ Ð¿Ñ€Ð¾Ð´Ð¾Ð»Ð¶ÐµÐ½Ð¸Ðµ ÑÐ°Ð¹Ñ‚Ð°.
- ÐŸÐ¾Ð»ÐµÐ·Ð½Ñ‹Ðµ ÑÑÑ‹Ð»ÐºÐ¸ 7 ÑˆÑ‚ (`portalLinks.ts` USEFUL_LINKS single source) â†’ GlassLogoCard `160Ã—84` `rounded 16` `object-fit contain` `aspect ratio` `hover gold/30` `focus ring`, Ð³Ð¾Ñ€Ð¸Ð·Ð¾Ð½Ñ‚Ð°Ð»ÑŒÐ½Ñ‹Ð¹ carousel/grid desktop ÑÑ‚Ñ€ÐµÐ»ÐºÐ¸ + mobile swipe + keyboard ArrowLeft/Right + touch scroll-snap.
- ÐÐ°Ð²Ð¸Ð³Ð°Ñ†Ð¸Ñ Ð¡Ð£Ð”Ð˜ ÐžÐ›Ð˜Ð˜ (4 ÑÑÑ‹Ð»ÐºÐ¸ single source) â†’ GlassNavigationColumn `24px` `white/10` subtle gold active; Ð¡ÐžÐœÐžÐÐÒ²ÐžÐ˜ Ð¡Ð£Ð”Ò²ÐžÐ˜ Ò¶Ð£ÐœÒ²Ð£Ð Ó¢ â†’ GlassList accordion Ð¸Ð· `REGIONAL_CLUSTERS` (4 Ñ€ÐµÐ³Ð¸Ð¾Ð½Ð°, 77 ÑÑƒÐ´Ð¾Ð² single source, lazy 8 + more); ÐºÐ°Ñ€Ñ‚Ð° â€” Liquid Glass SVG Tajikistan mini-map Ñ gold/cyan accent, selected/hover ÑÐ¾ÑÑ‚Ð¾ÑÐ½Ð¸Ñ, mobile usable, alt list.
- ÐšÐ¾Ð½Ñ‚Ð°ÐºÑ‚Ñ‹ Ð¢ÐÐœÐžÐ¡ `GlassContactPanel` premium: Ñ€ÐµÐ°Ð»ÑŒÐ½Ñ‹Ð¹ Ð°Ð´Ñ€ÐµÑ `734018, Ð”ÑƒÑˆÐ°Ð½Ð±Ðµ 55` / `info@sud.tj` mailto / `+992 372331415` tel â€” ÐµÐ´Ð¸Ð½ÑÑ‚Ð²ÐµÐ½Ð½Ñ‹Ðµ Ð¸ÑÑ‚Ð¾Ñ‡Ð½Ð¸ÐºÐ¸ `t('contacts.*')`, Ð±ÐµÐ· fake; bottom bar `GlassBottomBar` compact `rgba 5,15,30,0.65` blur premium, copyright + IT BlackTecCom `GlassBrandBadge` compact + back-to-top `FloatingGlassButton` fixed gold/cyan, `opacity+transform`, Ð²Ð¸Ð´Ð¸Ð¼Ð° Ð¿Ð¾ÑÐ»Ðµ 600px, aria-label, keyboard.

## v2.6.0 â€” MASTER Liquid Glass Premium Ultra â€” Public + Control Center + Login unified
- Global system v2.0: `src/styles/tokens.css` Ð¾Ð±Ð½Ð¾Ð²Ð»ÐµÐ½ Ðº MASTER spec (`surface 0.14`/hover 0.19/active 0.23/strong 0.18/dark 0.28 navy, border 0.22/0.34/active gold 0.60, blur 24/32/40 sat 160%, radius xs 12 sm 16 md 20 lg 24 xl 30, shadow 0.12/0.18 floating 0.22, highlight 0.42/0.08, court gold/navy, status colors) + fallback tokens. `src/components/ui/GlassSurface.tsx` Ð½Ð¾Ð²Ñ‹Ð¹ primitive Ñ variants subtle/default/strong/interactive/active/floating/modal/navigation.
- Control Center â€” ÐµÐ´Ð¸Ð½Ð°Ñ ÑÐºÐ¾ÑÐ¸ÑÑ‚ÐµÐ¼Ð°: `AdminSidebar` glass-admin deep navy semi-transparent, `AdminTopbar` sticky glass premium 32px blur, `AdminCard` glass-admin (border white/10, AdminCard header unified), `Dashboard` welcome GlassPanel strong (Ð½Ðµ solid Ð³Ñ€Ð°Ð´Ð¸ÐµÐ½Ñ‚), summary cards ÐµÐ´Ð¸Ð½Ð°Ñ surface, quick-actions children lighter glass subtle (white/5), security journal log items glass subtle, platform status / citizen requests empty states â€” Ð²ÑÐµ Ð½Ð° glass.
- Login â€” `AdminLogin` split: left GlassBrandPanel (glass-admin + circuit mesh + soft layers, ÑÐ¼Ð±Ð»ÐµÐ¼Ð° Ð² glass), right GlassAuthenticationPanel floating 30px blur 32 strong `440px` max-width, inputs `GlassInput` `bg white/5 border 0.16 radius 16 focus gold`, gold button â€” Ñ‡Ð°ÑÑ‚ÑŒ global gold system. Ð’ÐµÑ€Ñ‚Ð¸ÐºÐ°Ð»ÑŒÐ½Ñ‹Ð¹ hard divider ÑƒÐ±Ñ€Ð°Ð½, Ð¿ÑƒÑÑ‚Ð¾Ñ‚Ð° ÑƒÐ¼ÐµÐ½ÑŒÑˆÐµÐ½Ð°.
- QA: tsc 0, build:client 6.21s OK, health/vite/admin 200, production CSS fallback present, responsive <768 blur 14px, a11y focus visible, perf no blur animation.

## v2.5.1 â€” Clean background + Cross-browser Liquid Glass fallback
- Clean: `src/styles/tokens.css` â€” glass opacity ÑÐ½Ð¸Ð¶ÐµÐ½Ð° `0.16â†’0.06` (surface), `0.32â†’0.14` (border), `0.55â†’0.30` (highlight), blur `24â†’18px`; Ñ„Ð¾Ð½ ÑÑ‚Ð°Ð» Ñ‡Ð¸ÑÑ‚Ñ‹Ð¼ Ð±ÐµÐ· Ð±ÐµÐ»Ð¾Ð¹ Ð¿ÐµÐ»ÐµÐ½Ñ‹, Ð·Ð¾Ð»Ð¾Ñ‚Ð°Ñ Ð¾ÐºÐ°Ð½Ñ‚Ð¾Ð²ÐºÐ° ÑÐ¾Ñ…Ñ€Ð°Ð½ÐµÐ½Ð°. `src/index.css` â€” Ð±Ð»Ð¸Ðº `0.09â†’0.04`, mobile blur `16â†’14px`. Dark theme Ð¿Ð¾Ð»ÑƒÑ‡Ð¸Ð» Ð¾Ñ‚Ð´ÐµÐ»ÑŒÐ½Ñ‹Ðµ Ñ‡ÑƒÑ‚ÑŒ Ð¿Ð»Ð¾Ñ‚Ð½ÐµÐµ Ð·Ð½Ð°Ñ‡ÐµÐ½Ð¸Ñ Ð´Ð»Ñ Ñ‡Ð¸Ñ‚Ð°ÐµÐ¼Ð¾ÑÑ‚Ð¸.
- Cross-browser: Ð´Ð¾Ð±Ð°Ð²Ð»ÐµÐ½ Ð´ÐµÑ‚ÐµÑ€Ð¼Ð¸Ð½Ð¸Ñ€Ð¾Ð²Ð°Ð½Ð½Ñ‹Ð¹ fallback `rgba(245,248,252,0.88)` / border `0.70` / shadow `0.12` (dark `14,22,38,0.88`) Ñ‡ÐµÑ€ÐµÐ· `@supports not ((backdrop-filter) or (-webkit-backdrop-filter))` Ð²Ð½Ðµ `@layer` (Ð½Ðµ Ð²Ñ‹Ñ€ÐµÐ·Ð°ÐµÑ‚ÑÑ Tailwind). Layer system 1-base surface â†’ 2-blur enhancement â†’ 3-border â†’ 4-highlight â†’ 5-shadow â†’ 6-accent. Webkit + standard. Safari iOS / Firefox / Chrome / Edge Ð´Ð°ÑŽÑ‚ Ð¼Ð°ÐºÑÐ¸Ð¼Ð°Ð»ÑŒÐ½Ð¾ Ð±Ð»Ð¸Ð·ÐºÐ¸Ð¹ Ñ€ÐµÐ·ÑƒÐ»ÑŒÑ‚Ð°Ñ‚ Ð±ÐµÐ· Ð±ÐµÐ»Ñ‹Ñ… Ð½ÐµÐ¿Ñ€Ð¾Ð·Ñ€Ð°Ñ‡Ð½Ñ‹Ñ… ÐºÐ°Ñ€Ñ‚Ð¾Ñ‡ÐµÐº.
- QA: tsc 0, build 6.24s OK, dev/vite 200, health 200, production CSS ÑÐ¾Ð´ÐµÑ€Ð¶Ð¸Ñ‚ fallback (verified).

## v2.5.0 â€” Global Liquid Glass Premium Ultra
- Tokens: `src/styles/tokens.css` gains the single theme-independent glass family (`--glass-surface*/--glass-border*/--glass-blur*/--glass-saturation*/--glass-radius-*/--glass-shadow*/--glass-highlight*`).
- Primitives: `src/index.css` adds `.glass/.glass-card/.glass-panel/.glass-large/.glass-chip/.glass-premium/.glass-ultra/.glass-active` (surface + blur/saturate + border + radius + shadow + top highlight via ::before); `.content-card` migrated onto the same tokens (~40 usages auto-upgraded); low-end solid fallback, mobile/tablet blur reduction, a11y-mode opaque override.
- Migrated (~55 components): portal ui Kit (Card/Modal/Tabs), Breadcrumbs, footer, Navbar + CourtSiteNavbar shells, all digital-court modal panels + inner rows, CaseSearchEngine/CaseDashboard/QuickActionsGrid/InteractiveProcessFlow, JudicialNewsHub + 3D slider, JudicialModal shell/rows/tiles, all homepage section cards, court hubs/drawer/nodes/tree container, CourtQrCode tile, CourtSitePage/Admin tiles, StateDutyCalculator panel, About/Leadership/NotFound/Sitemap surfaces, leglible tooltip.
- White boxes removed: `bg-white/95` hubs, `bg-white/75` blueprint light branches, `bg-[#f8fafc]` containers, opaque `bg-theme-surface/bg-theme-bg` panels, `hover:bg-theme-surfaceHover` washes.
- Exceptions (documented): dark blueprint/judicial-map glow subsystems (no white boxes; light branches fixed), document paper (PDF/page/reader bodies), admin dark kit, inputs/tables/micro-rows, tooltips/badges, a11y opaque mode.
- QA: tsc 0 errors, build:client OK, smoke 8/8, routes 9/9 200, DOM SSR check (home 51 glass / 0 opaque-white). Screenshots desktop/tablet/mobile left to user in Chrome (no browser tooling in sandbox).

## v2.4.0 â€” Legal UX remediation (full audit)
- Legal honesty: CourtQrCode rewritten as real-URL tile (no fake QR); CourtDetailsDrawer/SelectedCourtContextHub blocks trilingual "official website" without scan claims; InteractiveProcessFlow VERIFIEDâ†’IN REGISTRY + QR caveat; CaseSearchEngine PUBLICâ†’DEMO LEDGER; CaseDashboard/DocumentCenter/CaseWorkspaceModal Demo badges trilingual.
- Data integrity: Hero/Dashboard live `/api/stats` + health status; Blueprint fake UPTIME/LOAD deleted; JudicialActsManager no sample-fallback (loadError); receptionGuarantee neutral Ã—3; NewFilingModal + JudicialModal appeals POST /api/appeals with submitError/rateLimited i18n.
- UX/i18n: hoverâ†’click copy ru/en/tj; tooltip keyboard focus-within (CourtLeaf/Navbar/CourtSiteNavbar); NewFilingModal trilingual submit.
- Legislation filters: LibraryPage language + year filters, expanded search (title/docNumber/badge/meta); LawBookshelf ShelfBook docNumber/actDate/publishedAt mapping + meta.
- Court network type filter: Section06 chips (all/city/district/military/regional) â†’ JudicialTreeView; BlueprintRegionalColumn regional case + isMatched default-true fix.
- News attribution: AnnouncementItem.source + JudicialNewsHub trilingual court source + link title.
- Typecheck: AdminProfileMenu roles, SettingsManager typed settings, LawBookshelf LegislationLink from types, optional domain chains, getCourtAddress fallbacks, unused-import cleanup â€” tsc clean; build:client OK; smoke 8Ã—200 (health/search/sitemap/news/shelf/courts/acts + Vite).

## v2.3.0 â€” Legal search and repository
- ÐŸÐ¾Ð¸ÑÐº: Ñ„Ð¸Ð»ÑŒÑ‚Ñ€Ñ‹ Ð´Ð°Ñ‚/ÐºÐ°Ñ‚ÐµÐ³Ð¾Ñ€Ð¸Ð¸/ÑÑƒÐ´Ð°, Ð¿Ð¾Ð»Ð½Ð¾Ñ‚ÐµÐºÑÑ‚ (body+content), Ñ€ÐµÐ»ÐµÐ²Ð°Ð½Ñ‚Ð½Ð¾ÑÑ‚ÑŒ (Ð·Ð°Ð³Ð¾Ð»Ð¾Ð²Ð¾Ðº Ð¿ÐµÑ€Ð²Ñ‹Ð¼), Ñ‚Ð°Ð± Ð·Ð°ÑÐµÐ´Ð°Ð½Ð¸Ð¹; Ñ„Ð¸Ð»ÑŒÑ‚Ñ€Ñ‹ ÑÐ¿Ð¸ÑÐºÐ¾Ð² Ð°ÐºÑ‚Ð¾Ð² Ð¸ ÐºÐ½Ð¸Ð³.
- Ð ÐµÐ¿Ð¾Ð·Ð¸Ñ‚Ð¾Ñ€Ð¸Ð¹: Ð¼ÐµÑ‚Ð°Ð´Ð°Ð½Ð½Ñ‹Ðµ ÐºÐ½Ð¸Ð³ (Ð½Ð¾Ð¼ÐµÑ€/Ð´Ð°Ñ‚Ð°/Ð¾Ð¿ÑƒÐ±Ð»Ð¸ÐºÐ¾Ð²Ð°Ð½Ð¾/external_id/sync), Ð²ÐµÑ€ÑÐ¸Ð¾Ð½Ð½Ð¾ÑÑ‚ÑŒ Ñ Ð¾Ñ‚ÐºÐ°Ñ‚Ð¾Ð¼, ÑÐ²ÑÐ·Ð°Ð½Ð½Ñ‹Ðµ Ð´Ð¾ÐºÑƒÐ¼ÐµÐ½Ñ‚Ñ‹, sync-now Ñ Ð¸ÑÑ‚Ð¾Ñ‡Ð½Ð¸ÐºÐ¾Ð¼ (ADLIA-Ð°Ñ€Ñ…Ð¸Ñ‚ÐµÐºÑ‚ÑƒÑ€Ð°).

## v2.2.2 â€” Global shell (navbar + footer IA)
- Scroll-spy active states Ð´Ð»Ñ ÑÐºÐ¾Ñ€ÐµÐ¹ (Ð´ÐµÑÐºÑ‚Ð¾Ð¿ + Ð¼Ð¾Ð±Ð¸Ð»ÑŒÐ½Ð¾Ðµ Ð¼ÐµÐ½ÑŽ, Ñ‚Ð¾Ð»ÑŒÐºÐ¾ Ð½Ð° Ð³Ð»Ð°Ð²Ð½Ð¾Ð¹).
- ÐœÐ¾Ð±Ð¸Ð»ÑŒÐ½Ñ‹Ð¹ Ð¿Ð°Ñ€Ð¸Ñ‚ÐµÑ‚: Ð°ÐºÐºÐ¾Ñ€Ð´ÐµÐ¾Ð½ e-ÑƒÑÐ»ÑƒÐ³ (Ñ‚Ðµ Ð¶Ðµ 6 Ñ‚Ð°Ð±Ð¾Ð²) + ÐºÐ½Ð¾Ð¿ÐºÐ¸ Ð¿Ð¾Ð¸ÑÐºÐ°/AI.
- Footer: IA-Ð³Ñ€ÑƒÐ¿Ð¿Ñ‹ Ð¡ÑƒÐ´/Ð£ÑÐ»ÑƒÐ³Ð¸/Ð˜Ð½Ñ„Ð¾Ñ€Ð¼Ð°Ñ†Ð¸Ñ (Ñ€ÐµÐ°Ð»ÑŒÐ½Ñ‹Ðµ Ñ€Ð¾ÑƒÑ‚Ñ‹ + Ñ‚Ð°Ð±Ñ‹ Ð¼Ð¾Ð´Ð°Ð»ÐºÐ¸).

## v2.2.1 â€” Portal base UI kit
- Ð£Ð´Ð°Ð»ÐµÐ½Ñ‹ Ð¼Ñ‘Ñ€Ñ‚Ð²Ñ‹Ðµ Ð¿ÐµÑ€Ð²Ñ‹Ðµ Ð¾Ð¿Ñ€ÐµÐ´ÐµÐ»ÐµÐ½Ð¸Ñ `.btn-primary/.btn-secondary/.btn-ghost/.btn-icon` (Ð¿Ð¾Ð±ÐµÐ¶Ð´Ð°Ð» btn-base Ð±Ð»Ð¾Ðº â€” Ð²Ð¸Ð·ÑƒÐ°Ð» Ð½Ðµ Ð¸Ð·Ð¼ÐµÐ½Ð¸Ð»ÑÑ); `.btn-gold` Ð¾ÑÑ‚Ð°Ð²Ð»ÐµÐ½ Ð°Ð»Ð¸Ð°ÑÐ¾Ð¼, `.btn-outline`/`.btn-base` Ð¶Ð¸Ð²Ñ‹.
- ÐÐ¾Ð²Ñ‹Ð¹ Ð¿Ð¾Ñ€Ñ‚Ð°Ð»-ÐºÐ¸Ñ‚ `src/components/ui/` Ñ API Ð°Ð´Ð¼Ð¸Ð½-ÐºÐ¸Ñ‚Ð° Ð½Ð° theme-Ñ‚Ð¾ÐºÐµÐ½Ð°Ñ…: Badge/Card/Input/Select/Table/Tabs/Modal/EmptyState. ÐÐ´Ð¼Ð¸Ð½-ÐºÐ¸Ñ‚ Ð½Ðµ Ñ‚Ñ€Ð¾Ð½ÑƒÑ‚ (ÐºÐ¾Ð½Ð²ÐµÑ€Ð³ÐµÐ½Ñ†Ð¸Ñ Ð¿Ð¾Ð·Ð¶Ðµ).
- Proof-use: SitemapPage â†’ Card + Badge (Ñ‚Ðµ Ð¶Ðµ gold-Ð²Ð¸Ð·ÑƒÐ°Ð»Ñ‹).

## v2.2.0 â€” IA + design tokens foundation
- Phase 3 first_task: Ð°ÑƒÐ´Ð¸Ñ‚ frontend (routes Ð±ÐµÐ· Ð´ÑƒÐ±Ð»ÐµÐ¹, Ð¸Ð½Ð²ÐµÐ½Ñ‚Ð°Ñ€ÑŒ UI-ÐºÐ¸Ñ‚Ð° Ð¿Ð¾Ñ€Ñ‚Ð°Ð»/Ð°Ð´Ð¼Ð¸Ð½ÐºÐ°, Ð¿Ð¾Ñ€ÑÐ´Ð¾Ðº ÑÐµÐºÑ†Ð¸Ð¹ homepage), Ð¿Ñ€ÐµÐ´Ð»Ð¾Ð¶ÐµÐ½Ð½Ð°Ñ IA (Ð½Ð¾Ð²Ñ‹Ðµ URL Ñ‚Ð¾Ð»ÑŒÐºÐ¾ Ð´Ð»Ñ Ð½Ð¾Ð²Ñ‹Ñ… Ñ€Ð°Ð·Ð´ÐµÐ»Ð¾Ð², ÑÑƒÑ‰ÐµÑÑ‚Ð²ÑƒÑŽÑ‰Ð¸Ðµ Ð½Ðµ Ñ‚Ñ€Ð¾Ð½ÑƒÑ‚Ñ‹), Ð°Ñ€Ñ…Ð¸Ñ‚ÐµÐºÑ‚ÑƒÑ€Ð° Ñ‚Ð¾ÐºÐµÐ½Ð¾Ð², Ð¿Ð»Ð°Ð½ Ð²ÐµÑ€ÑÐ¸Ð¹.
- Ð¤ÑƒÐ½Ð´Ð°Ð¼ÐµÐ½Ñ‚: `src/styles/tokens.css` (spacing/radius/glass/focus/transitions/z/container/typography ÐºÐ°Ðº Ð°Ð»Ð¸Ð°ÑÑ‹, Ð½Ð¾Ð»ÑŒ Ð²Ð¸Ð·ÑƒÐ°Ð»ÑŒÐ½Ñ‹Ñ… Ð¸Ð·Ð¼ÐµÐ½ÐµÐ½Ð¸Ð¹) + snapshot Ñ IA-ÐºÐ°Ñ€Ñ‚Ð¾Ð¹ Ð¸ Ð¿Ð¾ÑÐ»ÐµÐ´Ð¾Ð²Ð°Ñ‚ÐµÐ»ÑŒÐ½Ð¾ÑÑ‚ÑŒÑŽ.

## v2.1.8 â€” Fix dead menu anchors
- ÐŸÑƒÐ½ÐºÑ‚Ñ‹ Â«Ð¡Ð°Ò³Ð¸Ñ„Ð°Ò³Ð¾Â» Ð²ÐµÐ»Ð¸ Ð² Ð½Ð¸ÐºÑƒÐ´Ð° Ð½Ð° Ð²Ð½ÑƒÑ‚Ñ€ÐµÐ½Ð½Ð¸Ñ… ÑÑ‚Ñ€Ð°Ð½Ð¸Ñ†Ð°Ñ… (/about, /leadership, /news/*, /sitemap): ÑÐºÐ¾Ñ€Ñ ÐµÑÑ‚ÑŒ Ñ‚Ð¾Ð»ÑŒÐºÐ¾ Ð½Ð° Ð³Ð»Ð°Ð²Ð½Ð¾Ð¹. Ð¢ÐµÐ¿ÐµÑ€ÑŒ â€” Ð¿ÐµÑ€ÐµÑ…Ð¾Ð´ Ð½Ð° Ð³Ð»Ð°Ð²Ð½ÑƒÑŽ + Ð¿Ð»Ð°Ð²Ð½Ñ‹Ð¹ ÑÐºÑ€Ð¾Ð»Ð» Ðº Ñ€Ð°Ð·Ð´ÐµÐ»Ñƒ (Ð±ÐµÐ· Ð¿ÐµÑ€ÐµÐ·Ð°Ð³Ñ€ÑƒÐ·ÐºÐ¸, Ñ€Ð°Ð±Ð¾Ñ‚Ð°ÐµÑ‚ Ð¸ Ð² Ð¼Ð¾Ð±Ð¸Ð»ÑŒÐ½Ð¾Ð¼ Ð¼ÐµÐ½ÑŽ).

## v2.1.7 â€” Swap sections 001 and 006
- Ð“Ð»Ð°Ð²Ð½Ð°Ñ: ÑÐµÐºÑ†Ð¸Ð¸ 001 (Hero) Ð¸ 006 (Judicial Information) Ð¿Ð¾Ð¼ÐµÐ½ÑÐ½Ñ‹ Ð¼ÐµÑÑ‚Ð°Ð¼Ð¸; ÑÐºÐ²Ð¾Ð·Ð½Ð°Ñ Ð½ÑƒÐ¼ÐµÑ€Ð°Ñ†Ð¸Ñ ÑÐ¾Ñ…Ñ€Ð°Ð½ÐµÐ½Ð°; ÐºÐ½Ð¾Ð¿ÐºÐ° Â«Ð´Ð°Ð»ÐµÐµÂ» hero Ñ‚ÐµÐ¿ÐµÑ€ÑŒ Ð²ÐµÐ´Ñ‘Ñ‚ Ðº ÐºÐ¾Ð½Ñ‚Ð°ÐºÑ‚Ð°Ð¼.

## v2.1.6 â€” Scroll glass performance optimization
- `ScrollVideo`: ÑƒÐ±Ñ€Ð°Ð½ setState Ð½Ð° ÐºÐ°Ð¶Ð´Ñ‹Ð¹ scroll-tick (Ð½Ð¾Ð»ÑŒ Ñ€Ðµ-Ñ€ÐµÐ½Ð´ÐµÑ€Ð¾Ð²) â€” rAF + Ð¿Ñ€ÑÐ¼Ñ‹Ðµ DOM-Ð·Ð°Ð¿Ð¸ÑÐ¸, `scrollHeight` ÐºÑÑˆÐ¸Ñ€ÑƒÐµÑ‚ÑÑ (Ð±Ñ‹Ð» forced reflow ÐºÐ°Ð¶Ð´Ñ‹Ð¹ Ñ‚Ð¸Ðº), ÑƒÐ±Ñ€Ð°Ð½ `transition-transform`, Ð´ÐµÑ€ÑƒÑ‰Ð¸Ð¹ÑÑ Ñ Ð¿Ð¾ÐºÐ°Ð´Ñ€Ð¾Ð²Ñ‹Ð¼Ð¸ Ð¾Ð±Ð½Ð¾Ð²Ð»ÐµÐ½Ð¸ÑÐ¼Ð¸.
- `Reveal`: `transition-all` â†’ Ñ‚Ð¾Ð»ÑŒÐºÐ¾ `opacity,transform`; `will-change` Ñ‚Ð¾Ð»ÑŒÐºÐ¾ Ð´Ð¾ Ð¿Ð¾ÑÐ²Ð»ÐµÐ½Ð¸Ñ; observer Ð¾Ñ‚ÐºÐ»ÑŽÑ‡Ð°ÐµÑ‚ÑÑ Ð¿Ð¾ÑÐ»Ðµ Ð¿ÐµÑ€Ð²Ð¾Ð³Ð¾ Ð¿Ð¾ÐºÐ°Ð·Ð° (Ð±ÐµÐ· Ð¿Ð¾Ð²Ñ‚Ð¾Ñ€Ð½Ñ‹Ñ… Ð°Ð½Ð¸Ð¼Ð°Ñ†Ð¸Ð¹).
- `FoliantReader`: ÑÐ»Ð¾Ñ‚Ñ‹ PDF-ÑÑ‚Ñ€Ð°Ð½Ð¸Ñ† Ñ€ÐµÐ·ÐµÑ€Ð²Ð¸Ñ€ÑƒÑŽÑ‚ Ð¼ÐµÑÑ‚Ð¾ Ñ‡ÐµÑ€ÐµÐ· `aspect-ratio` (Ð¿ÐµÑ€Ð²Ð°Ñ Ð´ÐµÐºÐ¾Ð´Ð¸Ñ€Ð¾Ð²Ð°Ð½Ð½Ð°Ñ ÑÑ‚Ñ€Ð°Ð½Ð¸Ñ†Ð° Ð·Ð°Ð´Ð°Ñ‘Ñ‚ Ñ‚Ð¾Ñ‡Ð½Ð¾Ðµ ÑÐ¾Ð¾Ñ‚Ð½Ð¾ÑˆÐµÐ½Ð¸Ðµ) â€” Ð¿Ñ€Ð¾Ð³Ñ€ÐµÑÑÐ¸Ð²Ð½Ð°Ñ Ð¿Ð¾Ð´Ð³Ñ€ÑƒÐ·ÐºÐ° Ð±Ð¾Ð»ÑŒÑˆÐµ Ð½Ðµ ÑÐ´Ð²Ð¸Ð³Ð°ÐµÑ‚ layout; ÑƒÐ±Ñ€Ð°Ð½ Ð¿Ð¾ÑÑ‚Ð¾ÑÐ½Ð½Ñ‹Ð¹ `will-change` Ð·ÑƒÐ¼Ð°.

## v2.1.5 â€” Useful links footer ticker
- Â«ÐŸÐ¾Ð»ÐµÐ·Ð½Ñ‹Ðµ ÑÐ°Ð¹Ñ‚Ñ‹Â» Ð² Ñ„ÑƒÑ‚ÐµÑ€Ðµ â€” Ð±ÐµÐ³ÑƒÑ‰Ð°Ñ ÑÑ‚Ñ€Ð¾ÐºÐ° (Ð¿Ð°ÑƒÐ·Ð° Ð¿Ñ€Ð¸ Ð½Ð°Ð²ÐµÐ´ÐµÐ½Ð¸Ð¸, Ð¾ÑÑ‚Ð°Ð½Ð¾Ð²ÐºÐ° Ð¿Ñ€Ð¸ `prefers-reduced-motion`, Ð´ÑƒÐ±Ð»Ð¸Ñ€ÑƒÑŽÑ‰Ð¸Ð¹ Ð¿Ñ€Ð¾Ð³Ð¾Ð½ ÑÐºÑ€Ñ‹Ñ‚ Ð¾Ñ‚ ÑÐºÑ€Ð¸Ð½Ñ€Ð¸Ð´ÐµÑ€Ð¾Ð²/Ñ‚Ð°Ð±Ð°).

## v2.1.4 â€” CSP dev report-only fix
- Enforced CSP (`script-src 'self'`) blocked Vite dev inline preamble on the `:8787` SSR path â†’ unstyled, non-hydrated page. Fix: `CMS_CSP_MODE` (`enforce` = prod default, `report-only` = dev default, `off`); dev serves Report-Only, production enforces. `.env.example` documents the variable.

## v2.1.3 â€” Cleanup + continuity docs
- Deleted verified-dead legacy readers: `TurnFlipBook.tsx`, `ElectronicLibraryView.tsx`, `ConstitutionReader.tsx(.css)`, `public/lib/{jquery,turn}.min.js` (pdf.js kept for FoliantReader; zero external imports verified).
- Documented `server/db/schema.ts` drift vs live SQLite schema (kept, not auto-deleted).
- README (install/run/migrate/recovery/env/git), `.env.example` (`CMS_COOKIE_SECURE`, `CMS_HSTS`), new `CHANGELOG.md`, `scripts/{backup,restore-test}.mjs` documented.
- Clean-clone continuity test passed (clone â†’ install â†’ build â†’ boot â†’ smoke).

## v2.1.2 â€” SEC-06 CSP enforce, SEC-07 HSTS config, curl.exe removal
- `Content-Security-Policy` switched Report-Only â†’ enforce (same allowlist, verified clean).
- `Strict-Transport-Security` opt-in via `CMS_HSTS=1` (default off until production TLS verified).
- Removed `curl.exe` dependency: PDF proxy + legislation import now use cross-platform `fetch` (`server/utils/fetch.ts`, timeout + size caps, IPv4-first DNS).

## v2.1.1 â€” SEC-05 httpOnly cookie auth + CSRF
- Login sets `cms_token` httpOnly cookie (`SameSite=Lax`, `Secure` on HTTPS); frontend sends `credentials: include`, zero tokens in `sessionStorage`/JS.
- Bearer fallback retained server-side; new `POST /api/admin/auth/logout` clears the cookie.
- CSRF: cookie-authenticated mutations require matching Origin/Referer (Bearer exempt, SameSite=Lax as base layer).
- New `src/admin/context/adminHttp.ts`; all 14 admin/court-admin modules migrated; `AdminLogin` + `AdminAuthContext` rewritten (session restores from cookie on reload).

## v2.1.0 â€” Phase 1+2 lock-in
- Global search (`GET /api/search` + `GlobalSearchModal`), sitemap page + dynamic `sitemap.xml`, breadcrumbs, per-page SEO meta, 404 route, `/admin/ai` route.
- Real RBAC (`server/middleware/rbac.ts`, 9 roles Ã— 17 permissions, enforced server-side) + editorial workflow (draftâ†’reviewâ†’approvedâ†’published, reject-with-reason, pre-publish snapshots, rollback guards) + NewsEditor workflow UI.
- Rate limiting (`server/middleware/rateLimit.ts`): login/appeals/questionnaire/AI/editor/index.
- In-app backup/restore API (`data/backups`, retention, integrity-checked atomic restore).
- Baseline security headers; unified gold primary buttons.

## v2.0 â€” Release 2.0 full snapshot
- Prior baseline: e-library, shelf-books admin, AI assistant, admin audit, security hardening (see git history).

