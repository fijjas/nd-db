import { IBuilder, IDdSchema, IKdSchema, INestedBuilder, ISchemaExecutor } from './interfaces';

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
  static readonly MAIN_KD_NAME = '';
  static readonly MAIN_KD_COLUMNS: string[] = ['id'];

  readonly kds: IKdSchema[] = [];
  readonly dds: IDdSchema[] = [];

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

  up(): Schema {
    this.schemaRef.collections.push(this);
    return this.schemaRef;
  }
}
