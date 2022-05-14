const fs = require('fs');
const _ = require('lodash');

const SSYM_PREFIX = 'kmyq9gys_';

function ssym(val) {
  return `${SSYM_PREFIX}${val}`;
}

class Storage {
  constructor(path) {
    this.path = path;
    this.fs = fs;
  }

  read() {
    return JSON.parse(this.fs.readFileSync(this.path, { encoding: 'utf-8' }));
  }

  write(data) {
    fs.writeFileSync(this.path, JSON.stringify(data), { encoding: 'utf-8' });
  }
}

class CollectionBuilder {
  constructor(db, name) {
    this.name = name;
    this.db = db;
    this.kds = [];
    this.dds = [];
  }

  kd(name, columns) {
    this.kds.push({ name, columns });
    return this;
  }

  dd(name, kd, column) {
    this.dds.push({ name, kd, column });
    return this;
  }

  write() {
    if (!this.name || !this.kds.length || !this.dds.length) {
      throw new Error('Please define name, key dimensions and data dimensions');
    }

    if (!this.db.data.collections) {
      this.db.data.collections = {};
    }
    if (this.db.data.collections[this.name]) {
      throw new Error(`Collection "${this.name}" already exists`);
    }
    this.db.data.collections[this.name] = {
      schema: { kds: this.kds, dds: this.dds },
      data: [],
    };
  }
}

class QueryBuilder {
  constructor(db) {
    this.db = db;
    this.wheres = [];
    this.kds = [];
    this.dd = null;
  }

  collection(collectionName) {
    this.collectionName = collectionName;
    return this;
  }

  kd(kdName) {
    this.kds.push(kdName);
    return this;
  }

  dd(ddName, ddValue) {
    this.dd = { name: ddName, value: ddValue };
    return this;
  }

  where([k, op, v]) {
    this.wheres.push([k, op, v]);
    return this;
  }

  exec() {
  }
}

class EditBuilder {
  constructor(db, collectionName) {
    this.db = db;
    this.collectionName = collectionName;
    this.hyperPath = {};
    this.data = {};
  }

  locate(hyperPath) {
    // { kd1: {...}, kd2: {...}, ... }
    this.hyperPath = hyperPath;
    return this;
  }

  set(hyperData) {
    // { kd1: {...}, kd2: {...}, ... }
    this.data = hyperData;
    return this;
  }

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
}

// Database:
// { kd1: {...}, kd2: {...}, ..., dds: ['.updated_at:12345678', ...]  }[]

class Db {
  constructor(storage) {
    this.storage = storage;
    this.data = this.storage.read();
  }

  save() {
    this.storage.write(this.data);
  }

  createCollection(name) {
    return new CollectionBuilder(this, name);
  }

  query() {
    return new QueryBuilder(this);
  }

  edit(collectionName) {
    return new EditBuilder(this, collectionName);
  }
}

module.exports = {
  Db,
  Storage,
};
