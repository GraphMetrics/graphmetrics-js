# GraphMetrics

[![npm](https://img.shields.io/npm/v/@graphmetrics/core)](https://www.npmjs.com/package/@graphmetrics/core)
[![Continuous Integration](https://github.com/GraphMetrics/graphmetrics-js/workflows/Continuous%20Integration/badge.svg)](https://github.com/GraphMetrics/graphmetrics-js/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

This is the Javascript/TypeScript SDK for GraphMetrics.

## Installation

- Apollo: `yarn add @graphmetrics/apollo` / `npm install @graphmetrics/apollo --save`

## Usage

We provide middlewares that are easily to plug in your server. If your server is not currently supported, please open an issue so we can fix that.

### Apollo

**[See full example](https://github.com/GraphMetrics/graphmetrics-js/tree/main/example)**

```typescript
import { GraphMetrics, logging } from '@graphmetrics/apollo';
import { createContext, Context } from './context';

const metrics = GraphMetrics<Context>({
  // SEE CONFIGURATION SECTION FOR DETAILS
  apiKey: 'some_key',
  serverVersion: '0.1.0',
  logger: logging.fromWinston(logger),
  // clientExtractor: (ctx) => { ... }
});

const apollo = new ApolloServer({
  ...
  context: createContext,
  plugins: [metrics],
});
```

#### ⚠️ Stopping of server

By default Apollo Server handles signals to properly shutdown, but we found that [it is not well implemented](https://github.com/apollographql/apollo-server/issues/4931) for versions before `2.21.2`. To **avoid losing the last datapoint** when doing a server rollout, we highly suggest to do the following:

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

- `apiKey`: Environment api key
- `serverVersion`: *(Optional)* Version of the server (catch regressions between releases)
- `clientExtractor`: *(Optional)* Function that retrieves the client details from the context (differentiate queries coming from different clients)
- `logger`: *(Optional)* Structured logger, `console.log` is used if not provided. Adapters are provided for popular loggers in `logging`.

### Client extractor

- Client extractor fetches the client details from the context
- Override the function to set a custom name and version
- Default behaviour differs per integration:
    - `Apollo`: Uses the [Apollo client](https://www.apollographql.com/docs/studio/client-awareness/#using-apollo-server-and-apollo-client) default headers
    - `Others`: No details are fetched 
    
Please let us know if you would like to see other clients supported by default
