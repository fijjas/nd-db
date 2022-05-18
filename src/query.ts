import {
  IBuilder,
  INestedBuilder,
  IProjection,
  IQueryExecutor, IQuerySequencing,
  IWhere,
  KdMergeColumnMapper
} from './interfaces';

export class KdQueryBuilder implements INestedBuilder<QueryBuilder> {
  readonly wheres: IWhere[] = [];

  constructor(
    private readonly qbRef: QueryBuilder,
    public readonly kdName: string,
  ) {}

  where(where: IWhere): this {
    this.wheres.push(where);
    return this;
  }

  up(): QueryBuilder {
    this.qbRef.kdQueries.push(this);
    return this.qbRef;
  }
}

export class DdQueryBuilder implements INestedBuilder<QueryBuilder> {
  readonly wheres: IWhere[] = [];

  constructor(
    private qbRef: QueryBuilder,
    public readonly ddName: string,
    public readonly ddValue: unknown,
  ) {
  }

  where(where: IWhere): this {
    this.wheres.push(where);
    return this;
  }

  up(): QueryBuilder {
    this.qbRef.ddQueries.push(this);
    return this.qbRef;
  }
}

export class ProjectionBuilder implements INestedBuilder<QueryBuilder> {
  constructor(
    private readonly qbRef: QueryBuilder,
    public byDdName?: string,
    public atDdValue?: unknown,
  ) {}

  by(ddName: string): this {
    this.byDdName = ddName;
    return this;
  }

  at(ddValue: unknown): this {
    this.atDdValue = ddValue;
    return this;
  }

  up(): QueryBuilder {
    this.qbRef.projections.push(this);
    return this.qbRef;
  }
}

export class QueryBuilder implements IBuilder<IProjection> {
  static readonly KD_MERGE_RAW: KdMergeColumnMapper = (k, c) => c;
  static readonly KD_MERGE_DOTTED: KdMergeColumnMapper = (k, c) => [k, c].filter(v => v).join('.');

  readonly kdQueries: KdQueryBuilder[] = [];
  readonly ddQueries: DdQueryBuilder[] = [];
  readonly mergeKds: string[] = [];
  mergeColumnMapper = QueryBuilder.KD_MERGE_DOTTED;
  readonly projections: ProjectionBuilder[] = [];
  querySequencing: IQuerySequencing|null = null;

  constructor(
    private dbRef: IQueryExecutor,
    public readonly collectionName: string,
  ) {}

  kd(kdName: string): KdQueryBuilder {
    return new KdQueryBuilder(this, kdName);
  }

  dd(ddName: string, ddValue: unknown): DdQueryBuilder {
    return new DdQueryBuilder(this, ddName, ddValue);
  }

  qseq(dName: string): this {
    this.querySequencing = { dName };
    return this;
  }

  merge(kds: string[], columnMapper?: KdMergeColumnMapper): this {
    this.mergeKds.push(...kds);
    if (columnMapper) {
      this.mergeColumnMapper = columnMapper as KdMergeColumnMapper;
    }
    return this;
  }

  project(): ProjectionBuilder {
    return new ProjectionBuilder(this);
  }

  exec(): IProjection {
    return this.dbRef.execQuery(this);
  }
}
