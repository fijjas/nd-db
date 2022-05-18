import {
  IBuilder,
  IDdSchema,
  IKdSchema,
  INestedBuilder,
  ISchemaExecutor,
  IStoreSequencingSchema
} from './interfaces';

export class Schema implements IBuilder<void> {
  readonly collections: CollectionBuilder[] = [];

  constructor(
    private readonly dbRef: ISchemaExecutor,
  ) {}

  collection(collectionName: string): CollectionBuilder {
    return new CollectionBuilder(this, collectionName);
  }

  exec(): void {
    this.dbRef.execSchema(this);
  }
}

export class CollectionBuilder implements INestedBuilder<Schema> {
  readonly kds: IKdSchema[] = [];
  readonly dds: IDdSchema[] = [];
  storeSequencing: IStoreSequencingSchema|null = null;

  constructor(
    private readonly schemaRef: Schema,
    public readonly collectionName: string,
  ) {}

  kd(name: string, columns: string[]): this {
    this.kds.push({ name, columns });
    return this;
  }

  dd(name: string, kdName: string, kdColumn: string): this {
    this.dds.push({ name, kdName, kdColumn });
    return this;
  }

  sseq(kdName: string, dColumn: string): this {
    this.storeSequencing = { kdName, dColumn };
    return this;
  }

  up(): Schema {
    this.validateSchema();
    this.schemaRef.collections.push(this);
    return this.schemaRef;
  }

  private validateSchema(): void {
    if (!this.storeSequencing) {
      throw new Error('store sequencing is not defined');
    }
  }
}
