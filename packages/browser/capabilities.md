# Capabilities

| Surface | RC3 behavior |
| --- | --- |
| Lifecycle | Explicit pull, create, wait, connect, stop, resume, and destroy operations |
| Tabs | List, open, select, and close tabs with package-owned UUIDs |
| Navigation | HTTP(S) allow-all or exact-origin policy installed across the connection |
| Inspection | Bounded ARIA snapshot and visible-viewport PNG screenshot |
| Actions | Strict role, text, label, placeholder, test-ID, or CSS locators |
| Desktop | Loopback-published noVNC endpoint with an eight-character password |
| Human control | Renewable lease that pauses new agent browser actions |
| Studio | Registered desktop view and automatic Playground workspace |

The semantic tool set is intentionally smaller than Playwright. It does not expose arbitrary scripts, raw CDP, coordinate input, downloads as a general filesystem API, or automatic action retries.

The desktop and semantic tools share one Chromium instance. Human takeover coordinates trusted viewers with agent actions; it does not authenticate users or authorize product operations.
