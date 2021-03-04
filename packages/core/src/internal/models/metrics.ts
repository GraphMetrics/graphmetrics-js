import { DDSketch } from '@graphmetrics/sketches-js';

const RELATIVE_ACCURACY = 0.01;

class FieldMetrics {
  returnType: string;
  count: number;
  errorCount: number;
  readonly histogram: DDSketch;

  constructor(returnType: string) {
    this.returnType = returnType;
    this.count = 0;
    this.errorCount = 0;
    this.histogram = new DDSketch({ relativeAccuracy: RELATIVE_ACCURACY });
  }

  public toJSON() {
    const indexes: number[] = [];
    const counts: number[] = [];
    for (const bin of this.histogram.bins()) {
      indexes.push(bin.index);
      counts.push(bin.count);
    }

    return {
      returnType: this.returnType,
      count: this.count,
      errorCount: this.errorCount,
      histogram: {
        indexes,
        counts,
      },
    };
  }
}

class TypeMetrics {
  readonly fields: Map<string, FieldMetrics>;

  constructor() {
    this.fields = new Map();
  }

  public findFieldMetrics(fieldName: string): FieldMetrics {
    let fieldMetrics = this.fields.get(fieldName);
    if (fieldMetrics) return fieldMetrics;
    fieldMetrics = new FieldMetrics('');
    this.fields.set(fieldName, fieldMetrics);
    return fieldMetrics;
  }

  public toJSON() {
    return {
      fields: Object.fromEntries(this.fields),
    };
  }
}

class OperationMetrics {
  count: number;
  errorCount: number;
  readonly histogram: DDSketch;

  constructor() {
    this.count = 0;
    this.errorCount = 0;
    this.histogram = new DDSketch({ relativeAccuracy: RELATIVE_ACCURACY });
  }

  public toJSON() {
    const indexes: number[] = [];
    const counts: number[] = [];
    for (const bin of this.histogram.bins()) {
      indexes.push(bin.index);
      counts.push(bin.count);
    }

    return {
      count: this.count,
      errorCount: this.errorCount,
      histogram: {
        indexes,
        counts,
      },
    };
  }
}

interface MetricsContext {
  clientName: string;
  clientVersion: string;
  serverVersion: string;
}

class ContextualizedUsageMetrics {
  readonly context: MetricsContext;
  readonly types: Map<string, TypeMetrics>;
  readonly operations: Map<string, OperationMetrics>;

  constructor(context: MetricsContext) {
    this.context = context;
    this.types = new Map();
    this.operations = new Map();
  }

  public findTypeMetrics(typeName: string): TypeMetrics {
    let typeMetrics = this.types.get(typeName);
    if (typeMetrics) return typeMetrics;
    typeMetrics = new TypeMetrics();
    this.types.set(typeName, typeMetrics);
    return typeMetrics;
  }

  public findOperationMetrics(operationHash: string): OperationMetrics {
    let operationMetrics = this.operations.get(operationHash);
    if (operationMetrics) return operationMetrics;
    operationMetrics = new OperationMetrics();
    this.operations.set(operationHash, operationMetrics);
    return operationMetrics;
  }

  public toJSON() {
    return {
      context: this.context,
      types: Object.fromEntries(this.types),
      operations: Object.fromEntries(this.operations),
    };
  }
}

export class UsageMetrics {
  timestamp: Date;
  readonly metrics: ContextualizedUsageMetrics[];

  constructor() {
    this.timestamp = new Date();
    this.metrics = [];
  }

  public findTypesMetrics(context: MetricsContext): ContextualizedUsageMetrics {
    let typesMetrics = this.metrics.find(
      (t) =>
        t.context.clientName === context.clientName &&
        t.context.clientVersion === context.clientVersion &&
        t.context.serverVersion === context.serverVersion,
    );
    if (typesMetrics) return typesMetrics;
    typesMetrics = new ContextualizedUsageMetrics(context);
    this.metrics.push(typesMetrics);
    return typesMetrics;
  }
}
