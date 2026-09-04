# Capabilities

| Surface | v1 behavior |
| --- | --- |
| Lifecycle | Explicit pull, create, connect, stop, resume, and destroy operations with bounded cancellation; destroy is an irreversible terminal transition |
| Readiness | Per-capability readiness for `runtime`, `browser`, `automation`, and `desktop`; `readiness()` reports a synchronous snapshot and `waitForCapabilities()` waits only for required capabilities |
| Tabs | List, open, select, and close tabs with package-owned UUIDs, plus explicit `tabId` targeting on navigate, snapshot, click, type, press-key, and screenshot |
| Scheduling | One automation connection per browser handle with serial FIFO scheduling by default; opt-in per-tab mode overlaps independent tabs up to `maxConcurrentTabs` inside a bounded action queue |
| Isolation | A supervised Playwright automation worker per connection contains Playwright and CDP failures away from the host application |
| Navigation | HTTP(S) allow-all or exact-origin policy installed across the default browser context |
| Inspection | Bounded ARIA snapshot and visible-viewport PNG screenshot |
| Actions | Strict role, text, label, placeholder, test-ID, or CSS locators |
| Desktop | Loopback-published noVNC endpoint with an eight-character password |
| Human control | Renewable lease that pauses new agent browser actions; the race-safe `BrowserControlSnapshot` reports `state`, `availability`, `activeAgentActions`, and `humanPending` |
| Studio | Registered desktop view and automatic Playground workspace |

The semantic tool set is intentionally smaller than Playwright. It does not expose arbitrary scripts, raw CDP, coordinate input, downloads as a general filesystem API, or automatic action retries.

The desktop and semantic tools share one Chromium instance. Human takeover coordinates trusted viewers with agent actions; it does not authenticate users or authorize product operations.
