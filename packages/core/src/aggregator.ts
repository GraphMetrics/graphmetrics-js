import { Logger, defaultLogger } from '@graphmetrics/logger';
import Denque from 'denque';

import { Configuration } from './configuration';
import { UsageDefinitions, UsageMetrics } from './internal/models';
import { FieldMessage, OperationMessage } from './messages';
import { Sender } from './sender';

const FLUSH_INTERVAL = 1 * 60 * 1000;

export class Aggregator {
  protected metrics: UsageMetrics;
  protected definitions: UsageDefinitions;
  protected knownOperations: Map<string, boolean>;
  protected serverVersion: string;

  protected fieldQueue: Denque<FieldMessage>;
  protected operationQueue: Denque<OperationMessage>;
  protected flushTimeout: NodeJS.Timeout;
  protected sender: Sender;

  protected logger: Logger;

  constructor(config: Configuration) {
    this.metrics = new UsageMetrics();
    this.definitions = new UsageDefinitions();
    this.knownOperations = new Map<string, boolean>();
    this.serverVersion = config.serverVersion ?? '';

    this.fieldQueue = new Denque<FieldMessage>();
    this.operationQueue = new Denque<OperationMessage>();
    this.flushTimeout = setInterval(this.flush.bind(this), FLUSH_INTERVAL);
    this.sender = new Sender(config);

    this.logger = config.logger ?? defaultLogger(config.advanced?.debug);
  }

  public pushField(msg: FieldMessage): void {
    // Ensure that the response is not blocked by the metrics processing.
    // We use setImmediate instead of process.nextTick or setTimeout
    // because setImmediate comes after IO, which is what we want.
    // We should have one processField call per item in the queue.
    this.fieldQueue.push(msg);
    setImmediate(this.processField.bind(this));
  }

  public pushOperation(msg: OperationMessage): void {
    this.operationQueue.push(msg);
    setImmediate(this.processOperation.bind(this));
  }

  private processField(): void {
    try {
      // Take a message
      const msg = this.fieldQueue.shift();
      if (msg === undefined) {
        this.logger.warn('Tried to process field with empty queue');
        return;
      }

      // Find field metrics
      const metrics = this.metrics.findContextMetrics({
        clientName: msg.client.name,
        clientVersion: msg.client.version,
        serverVersion: this.serverVersion,
      });
      const typeMetrics = metrics.findTypeMetrics(msg.typeName);
      const fieldMetrics = typeMetrics.findFieldMetrics(msg.fieldName);

      // Insert message
      fieldMetrics.histogram.accept(msg.duration);
      fieldMetrics.errorCount += msg.error ? 1 : 0;
      fieldMetrics.count += 1;
      fieldMetrics.returnType = msg.returnType;
    } catch (err) {
      this.logger.error('Unable to process field', { err });
    }
  }

  private processOperation(): void {
    try {
      // Take a message
      const msg = this.operationQueue.shift();
      if (msg === undefined) {
        this.logger.warn('Tried to process operation with empty queue');
        return;
      }

      // Find operation metrics
      const metrics = this.metrics.findContextMetrics({
        clientName: msg.client.name,
        clientVersion: msg.client.version,
        serverVersion: this.serverVersion,
      });
      const operationMetrics = metrics.findOperationMetrics(msg.hash);

      // Insert message
      operationMetrics.histogram.accept(msg.duration);
      operationMetrics.errorCount += msg.hasErrors ? 1 : 0;
      operationMetrics.count += 1;

      // Insert definition
      if (!this.knownOperations.get(msg.hash)) {
        this.definitions.operations.push({
          name: msg.name,
          type: msg.type,
          hash: msg.hash,
          signature: msg.signature,
        });
        this.knownOperations.set(msg.hash, true);
      }
    } catch (err) {
      this.logger.error('Unable to process operation', { err });
    }
  }

  public async stop(): Promise<void> {
    this.logger.debug('Stopping aggregator');
    clearInterval(this.flushTimeout);
    while (this.fieldQueue.length > 0) this.processField();
    this.flush();
    await this.sender.stop();
  }

  protected flush(): void {
    const now = new Date(); // We prefer end time as the TS
    if (this.metrics.metrics.length > 0) {
      const metrics = this.metrics;
      this.metrics = new UsageMetrics();
      metrics.timestamp = now;
      this.sender.sendMetrics(metrics);
    }
    if (this.definitions.operations.length > 0) {
      const definitions = this.definitions;
      this.definitions = new UsageDefinitions();
      definitions.timestamp = now;
      this.sender.sendDefinitions(definitions);
    }
  }
}
