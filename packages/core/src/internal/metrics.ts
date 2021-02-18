import { DDSketch } from '@graphmetrics/sketches-js';

const RELATIVE_ACCURACY = 0.01;

class FieldMetric {
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

class TypeMetric {
  readonly fields: Map<string, FieldMetric>;

  constructor() {
    this.fields = new Map();
  }

  public findFieldMetric(fieldName: string): FieldMetric {
    let fieldMetric = this.fields.get(fieldName);
    if (fieldMetric) return fieldMetric;
    fieldMetric = new FieldMetric('');
    this.fields.set(fieldName, fieldMetric);
    return fieldMetric;
  }

  public toJSON() {
    return {
      fields: Object.fromEntries(this.fields),
    };
  }
}

interface MetricsContext {
  clientName: string;
  clientVersion: string;
  serverVersion: string;
}

class ContextualizedTypesMetrics {
  readonly context: MetricsContext;
  readonly types: Map<string, TypeMetric>;

  constructor(context: MetricsContext) {
    this.context = context;
    this.types = new Map();
  }

  public findTypeMetric(typeName: string): TypeMetric {
    let typeMetric = this.types.get(typeName);
    if (typeMetric) return typeMetric;
    typeMetric = new TypeMetric();
    this.types.set(typeName, typeMetric);
    return typeMetric;
  }

  public toJSON() {
    return {
      context: this.context,
      types: Object.fromEntries(this.types),
    };
  }
}

export class UsageMetrics {
  timestamp: Date;
  readonly types: ContextualizedTypesMetrics[];

  constructor() {
    this.timestamp = new Date();
    this.types = [];
  }

  public findTypesMetrics(context: MetricsContext): ContextualizedTypesMetrics {
    let typesMetrics = this.types.find(
      (t) =>
        t.context.clientName === context.clientName &&
        t.context.clientVersion === context.clientVersion &&
        t.context.serverVersion === context.serverVersion,
    );
    if (typesMetrics) return typesMetrics;
    typesMetrics = new ContextualizedTypesMetrics(context);
    this.types.push(typesMetrics);
    return typesMetrics;
  }
}
