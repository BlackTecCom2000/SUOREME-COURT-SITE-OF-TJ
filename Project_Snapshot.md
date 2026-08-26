# Project Snapshot: sud.tj / Электронный суд

## Architecture
- **Frontend**: React, Vite, Tailwind CSS. Glassmorphism UI for Digital Court.
- **Backend**: Node.js, Express, better-sqlite3.
- **Database**: SQLite (WAL mode). Custom AI schema (knowledge_sources, knowledge_chunks, FTS5).
- **AI Core**: Hybrid RAG + AI Gateway (Local/OpenAI).
- **Coding Agent Runtime**: DeepSeek Harness (DSH) running locally via AI Orchestrator adapter.

## Modifiable Components
- `src/components/*` (React UI)
- `server/services/*` (Backend Logic)
- `C:\Users\djabo\.gemini\config\plugins\ai-orchestrator\agents\deepseek-harness\*` (Integration)

## Known Issues
- The local AI Gateway currently mocks the OpenAI stream if `OPENAI_API_KEY` is absent.
- FTS5 Keyword Search works, but vector embedding generation requires an external API if JS fallback is insufficient.
- DeepSeek Harness Python SDK is executing via CLI `npx @deepseek-ai/dsh` because native python bindings are pending local environment validation.

### Performance Bottlenecks & Optimization (In Progress)

#### Baseline Metrics (Before Optimization)
- **DOM Interactive**: ~3900ms
- **First Contentful Paint (FCP)**: ~4200ms
- **LCP (Estimated)**: >4500ms
- **Bundle Analysis**: Initial bundle was loading `three.js` (972 KB), `lucide-react` (heavy full import patterns), and all `AdminApp` components concurrently on the public homepage. Main chunk size `index.js` was 703 KB (gzipped 190 KB) and `three.js` chunk was loaded synchronously.

#### After Lazy Loading Fixes (Phase 1 & 2 Complete)
- **DOM Interactive**: ~600ms (↓ 85%)
- **First Contentful Paint (FCP)**: ~1088ms (↓ 74%)
- **Main Bundle Size**: ~250 KB (↓ 64%)
- **Action Taken**: 
  - Segregated `AdminApp` from `App` in `src/main.tsx` utilizing `React.lazy` and `Suspense`.
  - Implemented `InViewLoad` component (IntersectionObserver wrapper) to lazy-load the heavy 3D asset section (`Section03DigitalJustice`) only when scrolled into view.
  - Deferred loading of heavy global modals (`CaseWorkspaceModal`, `NewFilingModal`, `DocumentCenter`, `NotificationCenterModal`, `AILegalAssistantModal`) via `React.lazy` in `HomePage.tsx` and `Layout.tsx`. 
  - **Phase 3 (Backend & Database):** Created performance indexes for `content`, `judicial_acts`, `courts`, and `leadership` in SQLite. Implemented `Cache-Control` headers middleware (`max-age=60` up to `3600`) for public API routes to eliminate redundant database hits.

#### Mobile Performance Audit (Baseline before Capability Optimization)
- **Page Load Time (Network Idle)**: ~5143ms
- **LCP (Largest Contentful Paint)**: ~4712ms
- **JS Heap**: ~6.4MB
- **DOM Nodes**: ~2630
- **Bottlenecks Found**:
  - Heavy initial JS payload blocking the main thread.
  - CSS layout and style recalculations are high.
  - 3D models and continuous `requestAnimationFrame` loops (like `DigitalDataRain` and Canvas) run immediately, degrading LCP and INP on mobile.
- **Capability Strategy**: Implement a `DeviceCapabilityContext` to scale visual fidelity (3D rendering, particles, blur) based on device capabilities without breaking the UI.

#### Mobile Performance Audit (After Capability Optimization)
- **Page Load Time (Network Idle)**: ~1684ms (↓ 67%)
- **LCP (Largest Contentful Paint)**: ~1244ms (↓ 74%)
- **JS Heap**: ~6.2MB
- **Estimated FPS during scroll/idle**: ~60.5
- **Action Taken**:
  - Implemented `DeviceCapabilityContext` to assign `high-end`, `medium`, or `low-end` tiers based on hardware concurrency and memory.
  - Added `priority` prop to `Reveal` components for above-the-fold Hero content to bypass IntersectionObserver and mount immediately.
  - `JusticeScene3D` now scales DPR and shadow mapping, and pauses rendering when not in view (`frameloop="demand"` on low-end).
  - `DigitalDataRain` particle density halved on medium tier, entirely disabled on low-end.
  - Heavy `backdrop-filter` removed globally via `data-device-tier` attributes for low-end devices.

#### Adaptive 3D System Architecture (New)
- **Problem**: Loading three 15MB+ `.glb` files and running multiple WebGL `<Canvas>` contexts simultaneously crushes mobile devices and causes severe LCP penalties.
- **Solution**: Dynamic tiered asset registry + Adaptive Rendering
  - **High-End**: Loads master GLB (`themis.glb`). Immediate viewport rendering with 150-250px `rootMargin`. Dynamic shadows, DPR ~2.
  - **Medium**: Loads optimized GLB (`themis-medium.glb`) if available, falls back to master GLB. `rootMargin` of 100px. DPR 1-1.5. Shadows disabled.
  - **Low-End**: Avoids WebGL entirely. Uses `Static3DFallback` to render a transparent `.webp` image.
  - **Graceful WebGL Unmounting**: When an element exits the viewport (`inView === false`), rendering is paused immediately via `frameloop="demand"`. After a 1.5s - 3s grace period, the `<Canvas>` is entirely unmounted.
  - **Safe Disposal**: Individual GLB wrapper components (`ThemisGLB`, `ScalesGLB`, `GavelGLB`) accept a `modelPath`, clone the scene, and explicitly call `.dispose()` on geometries and uniquely cloned materials during unmount to prevent GPU memory leaks without destroying shared master assets.

### AI Integration Status
- **Local Model**: Qwen2.5-coder:14b downloaded and active via Ollama.
- **Provider setup**: `OllamaProvider` built and set as primary inside `aiGateway.ts`, successfully responding in stream mode via `/api/ai/chat`.

## Last Updated By
Antigravity (AI Orchestrator)
