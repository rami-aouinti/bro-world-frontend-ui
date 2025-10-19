# Manual CLS Verification

A Playwright script loaded the home page at http://localhost:3000/ while tracking `layout-shift` entries via `PerformanceObserver`. The script reported:

```
CLS=0
CLSError=None
AppendWidth=None
```

The zero CLS confirms that the top bar stays in place during hydration under the test conditions.
