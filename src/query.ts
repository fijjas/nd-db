import {
  DimensionalityReductionMapReducer,
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

export class DimensionalityReductionBuilder implements INestedBuilder<QueryBuilder> {
  atValue: unknown;
  mapReducer: DimensionalityReductionMapReducer|null = null;
  selectRandom = false;

  private xorLock = false;

  constructor(
    private readonly qbRef: QueryBuilder,
    public ddName: string,
  ) {}

  // reduction via point selection on a dd axis
  at(ddValue: unknown): this {
    this.setXorLock();
    this.atValue = ddValue;
    return this;
  }

  mapReduce(mapReducer: DimensionalityReductionMapReducer): this {
    this.setXorLock();
    this.mapReducer = mapReducer;
    return this;
  }

  random(): this {
    this.setXorLock();
    this.selectRandom = true;
    return this;
  }

  up(): QueryBuilder {
    this.validate();
    this.qbRef.dimensionalityReductions.push(this);
    return this.qbRef;
  }

  private setXorLock(): void {
    if (this.xorLock) {
      throw new Error('More than one reduction methods selected');
    }
    this.xorLock = true;
  }

  private validate(): void {
    if (!this.xorLock) {
      throw new Error('No reduction method selected');
    }
  }
}

export class QueryBuilder implements IBuilder<IProjection> {
  static readonly KD_MERGE_RAW: KdMergeColumnMapper = (k, c) => c;
  static readonly KD_MERGE_DOTTED: KdMergeColumnMapper = (k, c) => [k, c].filter(v => v).join('.');

  readonly kdQueries: KdQueryBuilder[] = [];
  readonly ddQueries: DdQueryBuilder[] = [];
  readonly mergeKds: string[] = [];
  mergeColumnMapper = QueryBuilder.KD_MERGE_DOTTED;
  readonly dimensionalityReductions: DimensionalityReductionBuilder[] = [];
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

  dr(ddName: string): DimensionalityReductionBuilder {
    return new DimensionalityReductionBuilder(this, ddName);
  }

  exec(): IProjection {
    return this.dbRef.execQuery(this);
  }
}
