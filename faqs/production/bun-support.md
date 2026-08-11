# Does Anvia work with Bun?

Anvia currently targets and tests against Node.js. Bun is not an officially supported runtime yet.

Some packages may already work in Bun because it implements many Node.js and Web APIs, but the Anvia project does not currently run a Bun compatibility test suite. That means compatibility can vary across providers, storage adapters, observability integrations, Studio, sandboxes, and other dependencies.

## Can I try it today?

Yes, for experimentation. Treat the result as application-specific rather than guaranteed compatibility:

- Run your own unit and integration tests under Bun.
- Verify streaming, cancellation, process shutdown, and environment-variable behavior.
- Test every provider and storage adapter your application uses.
- Check native and third-party dependencies independently.
- Keep Node.js as the production fallback.

Anvia's current priority is making the Node.js runtime and package surface stable. Official Bun support can follow once that foundation is stable and Bun is covered by dedicated compatibility testing.

There is no committed release date for official Bun support yet.

See [compatibility and versioning](/packages/compatibility-and-versioning) for the currently documented package boundaries.
