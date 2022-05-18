import { IDbData, IStoreSequencingSchema } from './interfaces';
import { CollectionBuilder, Schema } from './schema';

export class Engine {
  constructor(
    public readonly dbDataRef: IDbData,
  ) {}

  applySchema(schema: Schema): void {
    schema.collections.forEach((cb: CollectionBuilder) => {
      if (!this.dbDataRef.collections) {
        this.dbDataRef.collections = {};
      }
      if (this.dbDataRef.collections[cb.collectionName]) {
        throw new Error(`Collection '${cb.collectionName}' already exists`);
      }
      this.dbDataRef.collections[cb.collectionName] = {
        schema: {
          kds: cb.kds,
          dds: cb.dds,
          storeSequencing: cb.storeSequencing as IStoreSequencingSchema,
        },
        data: [],
      };
    });
  }
}
