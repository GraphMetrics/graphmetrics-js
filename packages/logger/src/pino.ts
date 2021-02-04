import { Logger as PinoLogger } from './types/pino';
import { Logger } from './interface';

export class PinoAdapter implements Logger {
  private logger: PinoLogger;
  constructor(logger: PinoLogger) {
    this.logger = logger;
  }

  public debug(msg: string, metadata: Record<string, unknown>): void {
    this.logger.debug(metadata, msg);
  }

  public info(msg: string, metadata: Record<string, unknown>): void {
    this.logger.info(metadata, msg);
  }

  public warn(msg: string, metadata: Record<string, unknown>): void {
    this.logger.warn(metadata, msg);
  }

  public error(msg: string, metadata: Record<string, unknown>): void {
    this.logger.error(metadata, msg);
  }
}

export function fromPino(logger: PinoLogger): Logger {
  return new PinoAdapter(logger);
}
