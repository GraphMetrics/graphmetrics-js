import { Logger } from './interface';

export class DefaultLogger implements Logger {
  constructor(private enableDebug: boolean) {}

  debug(msg: string, metadata: Record<string, unknown> = {}): void {
    if (!this.enableDebug) return;
    console.log(`[DEBUG] ${msg} ${JSON.stringify(metadata)}`);
  }
  info(msg: string, metadata: Record<string, unknown> = {}): void {
    console.log(`[INFO] ${msg} ${JSON.stringify(metadata)}`);
  }
  warn(msg: string, metadata: Record<string, unknown> = {}): void {
    console.log(`[WARN] ${msg} ${JSON.stringify(metadata)}`);
  }
  error(msg: string, metadata: Record<string, unknown> = {}): void {
    console.log(`[ERROR] ${msg} ${JSON.stringify(metadata)}`);
  }
}

export function defaultLogger(debug = false): Logger {
  return new DefaultLogger(debug);
}
