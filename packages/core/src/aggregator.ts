import { Logger, defaultLogger } from '@graphmetrics/logger';
import Denque from 'denque';

import { Configuration } from './configuration';
import { UsageMetrics } from './internal/metrics';
import { FieldMessage } from './messages';
import { Sender } from './sender';

const FLUSH_INTERVAL = 1 * 60 * 1000;

export class Aggregator {
  protected metrics: UsageMetrics;
  protected serverVersion: string;

  protected fieldQueue: Denque<FieldMessage>;
  protected flushTimeout: NodeJS.Timeout;
  protected sender: Sender;

  protected logger: Logger;

  constructor(config: Configuration) {
    this.metrics = new UsageMetrics();
    this.serverVersion = config.serverVersion ?? '';

    this.fieldQueue = new Denque<FieldMessage>();
    this.flushTimeout = setTimeout(this.flush, FLUSH_INTERVAL);
    this.sender = new Sender(config);

    this.logger = config.logger || defaultLogger(config.advanced?.debug);
  }

  public pushField(msg: FieldMessage): void {
    // Ensure that the response is not blocked by the metrics processing.
    // We use setImmediate instead of process.nextTick or setTimeout
    // because setImmediate comes after IO, which is what we want.
    // We should have one processField call per item in the queue.
    this.fieldQueue.push(msg);
    setImmediate(this.processField);
  }

  private processField(): void {
    try {
      // Take a message
      const msg = this.fieldQueue.shift();
      if (msg === undefined) {
        this.logger.warn('Tried to process field with empty queue');
        return;
      }

      // Find field metric
      const typesMetrics = this.metrics.findTypesMetrics({
        clientName: msg.client.name,
        clientVersion: msg.client.version,
        serverVersion: this.serverVersion,
      });
      const typeMetric = typesMetrics.findTypeMetric(msg.typeName);
      const fieldMetric = typeMetric.findFieldMetric(msg.fieldName);

      // Insert message
      fieldMetric.histogram.accept(msg.duration);
      fieldMetric.errorCount += msg.error ? 1 : 0;
      fieldMetric.count += 1;
      fieldMetric.returnType = msg.returnType;
    } catch (err) {
      this.logger.error('Unable to process field', { err });
    }
  }

  public async stop(): Promise<void> {
    clearTimeout(this.flushTimeout);
    while (this.fieldQueue.length > 0) this.processField();
    this.flush();
    await this.sender.stop();
  }

  protected flush(): void {
    if (this.metrics.types.length === 0) return;
    const metrics = this.metrics;
    this.metrics = new UsageMetrics();
    metrics.timestamp = new Date(); // We prefer end time as the TS
    this.sender.sendMetrics(metrics);
  }
}
