# UI and server options

Studio separates browser-console options from HTTP server options. Pass `ui` to the constructor and networking options to `start()` or `serve()`.

## Configure the browser console

```ts
import { Studio } from '@anvia/studio'
import { supportAgent } from './support-agent'

const studio = new Studio([supportAgent], {
  ui: {
    title: 'Support Agent Studio',
    path: '/ui',
    rootRoutes: true,
    redirectRoot: true,
  },
})

studio.start({
  hostname: '127.0.0.1',
  port: 4021,
})
```

`ui` accepts `false` or an options object:

| Option | Default | Current behavior |
| --- | --- | --- |
| `title` | `'Anvia Studio'` | Sets the browser document title. |
| `path` | `'/ui'` | Sets the compatibility redirect and asset prefix. A missing leading slash is added and trailing slashes are removed. |
| `rootRoutes` | `true` | Serves console pages such as `/playground`, `/sessions`, and `/tracing`. |
| `redirectRoot` | `true` | Redirects `/` to `/playground`. |
| `clientScript` | Bundled client | Supplies a custom JavaScript client through the compatibility asset route and uses the legacy shell. |
| `protectShell` | `false` | Reserved shell-registration flag. It currently does not add authentication or authorization. |

The configured `path` is not a new base path for the application router. Paths such as `/ui/playground` redirect to `/playground`; the bundled page itself is served by the root route. Consequently, setting `rootRoutes: false` disables the built-in console pages even though compatibility redirects remain registered.

To run only the HTTP API, disable the UI:

```ts
const studio = new Studio([supportAgent], {
  ui: false,
})
```

This removes the browser shell, not the agent, tool, session, trace, or pipeline API routes.

## Configure the HTTP server

Both `start()` and `serve()` accept these server options:

| Option | Default | Behavior |
| --- | --- | --- |
| `port` | `RUNNER_PORT`, then `4021` | TCP port used by the Studio server. An explicit value has highest priority. |
| `hostname` | Node server default | Interface or hostname passed to the server. Set it explicitly when network exposure matters. |
| `log` | `true` | Prints the Studio UI or API address after startup. |

`start()` additionally accepts `handleSignals`, which defaults to `true`. With it enabled, Studio installs a one-time `SIGINT` handler that closes the server and exits the process.

```ts
studio.start({
  hostname: '127.0.0.1',
  port: Number(process.env.STUDIO_PORT ?? 4021),
  log: true,
  handleSignals: true,
})
```

Do not rely on the address printed as `localhost` to establish a network boundary. Pass `hostname: '127.0.0.1'` when Studio must be reachable only from the local machine.

For application-owned shutdown and cleanup, use [Lifecycle and cleanup](/studio/configure/lifecycle-and-cleanup). Before changing the bind address, read [Security boundaries](/studio/configure/security-boundaries).

