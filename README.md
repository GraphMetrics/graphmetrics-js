# GraphMetrics

![npm](https://img.shields.io/npm/v/@graphmetrics/core)
![Continuous Integration](https://github.com/GraphMetrics/sketches-js/workflows/Continuous%20Integration/badge.svg)
![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

This is the Javascript/TypeScript SDK for GraphMetrics.

## Usage

We provide middlewares that are easily to plug in your server. If your server is not currently supported, please open an issue so we can fix that.

### Apollo

```typescript
import { GraphMetrics } from '@graphmetrics/apollo';

const metrics = GraphMetrics<Context>({
  // SEE CONFIGURATION SECTION
});

const apollo = new ApolloServer({
  ...
  plugins: [metrics],
});
```

#### ⚠️ Stopping of server

By default Apollo Server handles signals to properly shutdown, but we found that [it is not well implemented](https://github.com/apollographql/apollo-server/issues/4931). To avoid losing the last datapoint when doing a server rollout, we highly suggest to do the following:

```typescript
const apollo = new ApolloServer({
  ...
  stopOnTerminationSignals: false,
});

const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
signals.forEach((signal) => {
  const handler: NodeJS.SignalsListener = async () => {
    await apollo.stop();
    process.exit(0);
  };
  process.on(signal, handler);
});
```

## Configuration

The SDK needs a few elements to be properly configured.

- apiKey: Your environment api key
- serverVersion: (Optional) The version of the server, necessary to catch regressions between releases
- clientExtractor: (Optional) Function that retrieves the client details from the context, necessary to differentiate queries coming from different clients
- logger: (Optional) A structure logger that respects the interface, otherwise `console.log` is used. Adapters are provided for popular loggers (import `logger` from the middleware package).

### Client extractor

The client extractor fetches the client details from the context. By default, no details are fetched. We provide helper functions for the Apollo client, please let us know if you would like to see other clients supported. Note that by default the Apollo middleware will check for apollo client headers.
