# `@anvia/logger` API reference

All public symbols are exported from `@anvia/logger`.

## Logger factories

```ts
function createConsoleLogger(options?: ConsoleLoggerOptions): Logger
function createPinoLogger(options?: PinoLoggerOptions): Logger
```

`createConsoleLogger` emits structured lines through its configurable writer. `createPinoLogger` wraps Pino and accepts Pino options or a destination stream.

```ts
type ConsoleLoggerOptions = LoggerOptions & {
  writer?: (line: string) => void
  timestamp?: () => Date
}

type PinoLoggerOptions = LoggerOptions & {
  pinoOptions?: import('pino').LoggerOptions
  destination?: import('pino').DestinationStream
}
```

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
| Types | `ConsoleLoggerOptions`, `LogContext`, `Logger`, `LoggerObserverOptions`, `LoggerOptions`, `LogLevel`, `PinoLoggerOptions` |
