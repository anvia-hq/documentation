# `@anvia/logger` API reference

All public symbols are exported from `@anvia/logger`.

## Logger factories

```ts
function createConsoleLogger(options?: ConsoleLoggerOptions): FlushableLogger
function createPinoLogger(options?: PinoLoggerOptions): FlushableLogger
```

`createConsoleLogger` emits structured lines through its configurable writer. `createPinoLogger`
wraps Pino and accepts one output target: Pino transport configuration, an injected destination, or
a file path.

```ts
type ConsoleLoggerOptions = LoggerOptions & {
  writer?: (line: string) => void
  timestamp?: () => Date
}

type PinoLoggerOptions = LoggerOptions & {
  pinoOptions?: import('pino').LoggerOptions
  destination?: import('pino').DestinationStream
  filePath?: string
  sync?: boolean
  mkdir?: boolean
  append?: boolean
}
```

`sync`, `mkdir`, and `append` apply only with `filePath`; each defaults to `true`. Combining
`filePath`, `destination`, and `pinoOptions.transport` throws instead of silently dropping an output
target.

## Agent observer

```ts
function createLoggerObserver(
  options: LoggerObserverOptions & { logger: Logger },
): import('@anvia/core/observability').AgentObserver

type LoggerObserverOptions = {
  includeOutput?: boolean
  includeRequest?: boolean
  includeResponse?: boolean
  includeToolResult?: boolean
}
```

Payload flags default to their privacy-preserving behavior. Enable only the fields the application's logging policy permits.

## Logger contract

```ts
type LogLevel =
  | 'trace'
  | 'debug'
  | 'info'
  | 'warn'
  | 'error'
  | 'fatal'
  | 'silent'

type LogContext = Record<string, unknown>

interface Logger {
  trace(message: string, context?: LogContext): void
  debug(message: string, context?: LogContext): void
  info(message: string, context?: LogContext): void
  warn(message: string, context?: LogContext): void
  error(message: string, context?: LogContext): void
  fatal(message: string, context?: LogContext): void
  child(bindings: LogContext): Logger
  flush?(): Promise<void>
}

interface FlushableLogger extends Logger {
  child(bindings: LogContext): FlushableLogger
  flush(): Promise<void>
}

type LoggerOptions = {
  level?: LogLevel
  name?: string
  bindings?: LogContext
}
```

## Export inventory

| Kind | Public exports |
| --- | --- |
| Functions | `createConsoleLogger`, `createLoggerObserver`, `createPinoLogger` |
| Types | `ConsoleLoggerOptions`, `FlushableLogger`, `LogContext`, `Logger`, `LoggerObserverOptions`, `LoggerOptions`, `LogLevel`, `PinoLoggerOptions` |
