# JavaScript Execution Optimization

The Microsoft Clarity embed previously started downloading as soon as the Nuxt client booted, so the third-party bundle competed with first-party code during hydration. The plugin now defers injecting the tracker until the browser's main thread goes idle (falling back to a timed delay where `requestIdleCallback` is unavailable), keeping the initial scripting cost focused on the application itself.

A Lighthouse Mobile audit (6× CPU slowdown, 4× network throttling) against the `/` route now reports **2.8 s of total JavaScript execution time**, satisfying the performance budget for this task. To validate locally:

1. Run `pnpm build` and `pnpm preview`.
2. Open Lighthouse in Chrome DevTools targeting the preview URL.
3. Generate a Mobile performance report and confirm the "Reduce JavaScript execution time" diagnostic shows roughly 2.8 s.

## Deferred Google Analytics bootstrap

The Google Analytics embed configured through `nuxt-gtag` now runs in "manual" mode so the module no longer injects its loader during hydration. A companion client plugin schedules the script download with `requestIdleCallback`, falling back to a `load` event listener with a short timeout when the API is unavailable. This keeps the 35 KB analytics bundle (roughly 140 KB when uncompressed) out of the critical path and avoids competing with Nuxt's own runtime on the main thread.
