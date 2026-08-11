# Data and privacy

Treat agent logs as potentially sensitive even when optional payload capture is disabled. Tool arguments, error messages, trace metadata, user identifiers, and session identifiers can still contain application data.

## Default capture

By default, `createLoggerObserver()` omits:

- Final agent output.
- Full model requests and responses.
- Tool results and structured results.

It still records operational fields such as usage, model identity, timing, tool arguments, and errors.

## Application controls

- Avoid placing secrets in trace metadata or tool arguments.
- Prefer stable internal identifiers over email addresses or names.
- Redact at the application boundary before values reach the observer.
- Configure destination retention and access controls independently.
- Review error serialization: `name`, `message`, `stack`, and `cause` are logged for `Error` instances.

The four capture flags are coarse switches, not a redaction engine. If selected fields need transformation, wrap the `Logger` contract or sanitize data before the agent run.
