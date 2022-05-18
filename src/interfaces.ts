import { QueryBuilder } from './query';
import { EditBuilder } from './editor';
import { Schema } from './schema';

export interface IKdSchema {
  name: string;
  columns: string[];
}

export interface IDdSchema {
  name: string;
  kdName: string;
  kdColumn: string;
}

export interface IStoreSequencingSchema {
  kdName: string;
  dColumn: string;
}

export interface ICollectionSchema {
  kds: IKdSchema[];
  dds: IDdSchema[];
}

export interface ICollection {
  schema: ICollectionSchema;
  data: IHyperNode[];
}

export interface IBuilder<EXEC_RESULT_T> {
  exec(): EXEC_RESULT_T;
}

export interface ISchemaExecutor {
  execSchema(sb: Schema): void;
}

export interface IEditExecutor {
  execEdit(eb: EditBuilder): any;
}

export interface IQueryExecutor {
  execQuery(qb: QueryBuilder): IProjection;
}

export interface INestedBuilder<PARENT_T> {
  up(): PARENT_T;
}

export interface IDataNode {
  [key: string]: unknown;
}

export type IDdNode = string;

export interface IHyperNode {
  [kdOrDdIdentifier: string]: IDataNode|IDdNode;
}

export interface IDbData {
  collections?: {
    [collectionName: string]: ICollection;
  };
}

export interface IWhere {
  [key: string]: unknown;
}

export interface IQuerySequencing {
  dName: string;
}

export type KdMergeColumnMapper = (kdName: string, columnName: string) => string;

export interface IProjectionNode extends IDataNode {
  [ddIdentifier: string]: IDdNode;
}

export type IProjection = IProjectionNode[];
