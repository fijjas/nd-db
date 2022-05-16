import { QueryBuilder } from './query';
import { EditBuilder } from './editor';
import { Storage } from './storage';
import { IDbData, IEditExecutor, IProjection, IQueryExecutor, ISchemaExecutor } from './interfaces';
import { Schema } from './schema';

export class Db implements ISchemaExecutor, IEditExecutor, IQueryExecutor {
  private readonly data: IDbData;

  constructor(
    private readonly storage: Storage<IDbData>,
  ) {
    this.data = this.storage.read();
  }

  dump(): IDbData {
    return this.data;
  }

  save(): void {
    this.storage.write(this.data);
  }

  schema(): Schema {
    return new Schema(this);
  }

  execSchema(s: Schema): void {
    console.log('exec schema', s);
    // write(): void {
    //   if (!this.name || !this.kds.length || !this.dds.length) {
    //     throw new Error('Please define name, key dimensions and data dimensions');
    //   }
    //
    //   if (!this.db.data.collections) {
    //     this.db.data.collections = {};
    //   }
    //   if (this.db.data.collections[this.name]) {
    //     throw new Error(`Collection "${this.name}" already exists`);
    //   }
    //   this.db.data.collections[this.name] = {
    //     schema: { kds: this.kds, dds: this.dds },
    //     data: [],
    //   };
    // }
  }

  edit(collectionName: string): EditBuilder {
    return new EditBuilder(this, collectionName);
  }

  execEdit(eb: EditBuilder): any {
    console.log('exec edit', eb);
    /*
      save() {
    let n = this.findNode(this.hyperPath);
    if (n) {
      _.keys(this.data).forEach(k => Object.assign(n[k], this.data[k]));
      return n;
    }
    this.db.data.collections[this.collectionName].data.push(this.data);
    return this.data;
  }

  findNode(hyperPath) {
    if (_.isNil(hyperPath) || _.isEmpty(hyperPath)) {
      return null;
    }
    const hp = _.toPairs(hyperPath)
    .map(([kd, params]) => [kd, _.toPairs(params)]);
    return _.find(
      this.db.data.collections[this.collectionName].data,
      n => _.every(
        hp,
        ([kd, params]) => !!_.get(n, kd) && (
          !params.length ||
          _.every(params, ([k, v]) => n[k] === v)
        )
      )
    );
  }
     */
  }

  query(collectionName: string): QueryBuilder {
    return new QueryBuilder(this, collectionName);
  }

  execQuery(qb: QueryBuilder): IProjection {
    console.log('exec query', qb);
    return [{ implement: 'me' }];
  }
}
