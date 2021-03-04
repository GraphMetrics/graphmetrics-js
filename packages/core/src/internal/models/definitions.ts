interface OperationDefinition {
  name: string;
  type: string;
  hash: string;
  signature: string;
}

export class UsageDefinitions {
  timestamp: Date;
  readonly operations: OperationDefinition[];

  constructor() {
    this.timestamp = new Date();
    this.operations = [];
  }
}
