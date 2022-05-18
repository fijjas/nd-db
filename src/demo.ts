import path from 'path';
import { IDbData } from './interfaces';
import { Db } from './db';
import { Storage } from './storage';

const storage = new Storage<IDbData>(path.join(__dirname, '..', 'db.json'));
const db = new Db(storage);

function dump(msg: string) {
  console.log(msg, JSON.stringify(db.dump(), null, 2));
}

dump('initial');

db.schema()
  .collection('accounts')
    .kd('users', ['id', 'name', 'created_at', 'updated_at', 'version'])
    .sseq('users', 'id')
    .kd('admins', ['admin_role'])
    .kd('customers', ['phone', 'zip'])
    .kd('partners', ['business_name'])
    .dd('changelog', 'users', 'version')
    .dd('customer_location', 'customers', 'zip')
    .up()
  .collection('products')
    .kd('products', ['id', 'name', 'price', 'created_at', 'updated_at'])
    .sseq('products', 'id')
    .dd('price_change', 'products', 'price')
    .up()
  .exec();

dump('schema executed');

// db.edit('accounts').exec();
// db.edit('products').exec();

// db.edit('accounts')
//   .locate({})
//   .set({
//     '': { id: 1, project_id: 'dev', created_at: 1234, updated_at: 1234 },
//     users: { name: 'test' },
//     customers: { phone: '+12345', zip: '90210' },
//   })
//   .save();

// db.edit('accounts')
//   .locate({ '': { id: 1 } })
//   .set({ '': { updated_at: 1235 }, customers: { name: 'test 2' } })
//   .save();

// dump('edits executed');
//
// console.log('querying');
//
// const r = db.query('accounts')
//   .kd('users').where({ name: 'egor' }).up()
//   .kd('customers').where(['phone', '+12345']).up()
//   .merge(['users', 'customers'])
//   .dr('customer_location').at('90210').up()
//   .qseq('changelog')
//   .exec();
//
// console.log('query result: ', r);
