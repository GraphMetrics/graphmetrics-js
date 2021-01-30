import { Logger as WinstonLogger } from './types/winston';
import { Logger } from './interface';

export class WinstonAdapter implements Logger {
  private logger: WinstonLogger;
  constructor(logger: WinstonLogger) {
    this.logger = logger;
  }

  public debug(msg: string, metadata: Record<string, unknown>): void {
    this.logger.debug(msg, metadata);
  }

  public info(msg: string, metadata: Record<string, unknown>): void {
    this.logger.info(msg, metadata);
  }

  public warn(msg: string, metadata: Record<string, unknown>): void {
    this.logger.warn(msg, metadata);
  }

  public error(msg: string, metadata: Record<string, unknown>): void {
    this.logger.error(msg, metadata);
  }
}
