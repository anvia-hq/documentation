# Releases

The reviewed source release is `@anvia/browser` **1.1.11**.

## Changes through 1.1.10

Reviewed `1.1.9` → `1.1.10` against SDK source on 2026-10-15. Aligned the sandbox dependency with Bash-aware command selection. See [Sandbox commands](/sdk/advanced/sandbox/commands#natural-command-lines).

See the [source changelog](https://github.com/anvia-hq/anvia/blob/10977b75a1518a553b7d5deb0193b788258ba093/packages/tool-browser/CHANGELOG.md) for individual release entries. The reviewed version is a source baseline; consult npm for the currently published tag.

| Version | Summary |
| --- | --- |
| `1.1.9` | Refreshed the package README and updated to Sandbox `1.1.8`. |
| `1.1.8` | Updated to the Sandbox `1.1.7` contract. |
| `1.1.7` | Updated to the Sandbox `1.1.6` contract. |
| `1.1.6` | Updated to the Sandbox `1.1.5` contract. |
| `1.1.5` | Blocked private and reserved IP literals in `browser_navigate` under every navigation policy, including `origins` policies that list them, and on each redirect the automation worker follows. |
| `1.1.4` | Updated upstream runtime dependencies, aligned the browser image and Playwright host pins, and updated to Sandbox `1.1.4`. |
| `1.1.3` | Declared compatible workspace peer ranges so additive internal dependency releases do not force major releases of dependents, and updated to the Sandbox `1.1.3` contract. |
| `1.1.2` | Updated to the Core `1.1.2` and Sandbox `1.1.2` contracts. |
| `1.1.1` | Bumped upstream runtime dependencies and aligned zod to 4.5.4 across packages. |
| `1.0.12` | Updated to the Core and Sandbox 1.0.10 contracts. |
| `1.0.11` | Isolated automation-worker IPC from Node watch dependency messages and preserved bounded protocol and readiness failure diagnostics. |
| `1.0.10` | Added supervised Playwright process isolation, capability readiness, bounded lifecycle cancellation, per-tab concurrent tool scheduling, explicit tab targeting, race-safe human control, and structured recovery errors while preserving serial selected-tab compatibility. |
| `1.0.9` | Updated to the Core and Sandbox 1.0.9 contracts. |
| `1.0.8` | Updated to the Core and Sandbox 1.0.8 contracts. |
| `1.0.7` | Updated to the Core and Sandbox 1.0.7 contracts. |
| `1.0.6` | Updated to the Core and Sandbox 1.0.6 contracts. |
| `1.0.5` | Updated to the Core and Sandbox 1.0.5 contracts. |
| `1.0.4` | Updated to the Core and Sandbox 1.0.4 contracts. |
| `1.0.3` | Updated to the Core and Sandbox 1.0.3 contracts. |
| `1.0.2` | Updated to explicit cancelled-run finalization in Core and Sandbox. |
| `1.0.1` | Refreshed supported upstream SDK and runtime dependencies. |
| `1.0.0` | Introduced the explicit Docker-backed Chromium runtime, semantic tools, noVNC desktop, Studio integration, and coordinated human takeover. |

Review the package [source](https://github.com/anvia-hq/anvia/tree/main/packages/tool-browser) and [changelog](https://github.com/anvia-hq/anvia/blob/main/packages/tool-browser/CHANGELOG.md).
