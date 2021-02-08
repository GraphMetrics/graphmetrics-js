import zlib from 'zlib';
import util from 'util';

import { defaultLogger, Logger } from '@graphmetrics/logger';
import got, { Got } from 'got';

import { Configuration } from './configuration';
import { UsageMetrics } from './internal/metrics';
// @ts-ignore
import { version } from '../package.json';

const DEFAULT_ENDPOINT = 'api.graphmetrics.io';
const DEFAULT_STOP_TIMEOUT = 10_000;

const gzip = util.promisify(zlib.gzip);

const rejectAfter = (ms: number) =>
  new Promise((_, reject) => {
    setTimeout(reject, ms, new Error('timeout'));
  });

export class Sender {
  protected url: string;
  protected apiKey: string;
  protected client: Got;

  protected sendPromises: Promise<void>[];

  protected stopTimeout: number;
  protected logger: Logger;

  constructor(config: Configuration) {
    this.url = `${config.advanced?.http ? 'http' : 'https'}://${
      config.advanced?.endpoint ?? DEFAULT_ENDPOINT
    }/reporting/metrics`;
    this.apiKey = config.apiKey;
    if (!this.apiKey) {
      throw new Error('Must provide an Api Key for GraphMetrics');
    }
    this.client = got.extend({
      retry: {
        limit: 8,
      },
      headers: {
        'x-api-key': this.apiKey,
        'user-agent': `sdk/js/${version}`,
      },
    });

    this.sendPromises = [];

    this.stopTimeout = config.advanced?.stopTimeout ?? DEFAULT_STOP_TIMEOUT;
    this.logger = config.logger || defaultLogger(config.advanced?.debug);
  }

  public sendMetrics(metrics: UsageMetrics): void {
    const promise = this.send(metrics, this.url);
    const index = this.sendPromises.push(promise) - 1;
    promise.finally(() => {
      this.sendPromises.splice(index, 1);
    });
  }

  private async send(data: UsageMetrics, url: string) {
    try {
      // We are aware this not super efficient in terms of
      // memory and blocking the main thread. We will move the
      // whole aggregation and sending to a worker thread at some point.
      const output = JSON.stringify(data);
      const compressed = await gzip(Buffer.from(output));

      await this.client.post(url, {
        body: compressed,
        headers: {
          'Conten-Encoding': 'gzip',
          'Content-Type': 'application/json; charset=utf-8',
        },
      });
    } catch (err) {
      this.logger.error('Unable to send data to GraphMetrics', { err });
      throw err;
    }
  }

  public async stop(): Promise<void> {
    try {
      await Promise.race([
        Promise.allSettled(this.sendPromises),
        rejectAfter(this.stopTimeout),
      ]);
    } catch (err) {
      this.logger.error('Sending of remaining metrics timed out');
    }
  }
}