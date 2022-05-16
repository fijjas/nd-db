import { CollectionBuilder as Cb, Db, IDbData, Storage } from './index';
import path from 'path';

const storage = new Storage<IDbData>(path.join(__dirname, '..', 'db.json'));
const db = new Db(storage);

function dump(msg: string) {
  console.log(msg, JSON.stringify(db.dump(), null, 2));
}

dump('initial');

db.schema()
  .collection('accounts')
    .kd(Cb.MAIN_KD_NAME, [...Cb.MAIN_KD_COLUMNS, 'created_at', 'updated_at'])
    .kd('users', ['name'])
    .kd('admins', ['admin_role'])
    .kd('customers', ['phone', 'zip'])
    .kd('partners', ['business_name'])
    .dd('changelog', '', 'updated_at')
    .dd('customer_location', 'customers', 'zip')
    .up()
  .collection('products')
    .kd(Cb.MAIN_KD_NAME, [...Cb.MAIN_KD_COLUMNS, 'name', 'price', 'created_at', 'updated_at'])
    .dd('price_change', Cb.MAIN_KD_NAME, 'price')
    .up()
  .exec();

dump('schema executed');

db.edit('accounts').exec(); // todo
db.edit('products').exec(); // todo

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

dump('edits executed');

console.log('querying');

const r = db.query('accounts')
  .kd('users').where({ name: 'egor' }).up()
  .kd('customers').where({ phone: '+12345' }).up()
  // todo: dd() vs project() - ?
  .merge([Cb.MAIN_KD_NAME, 'users', 'customers'])
  .project().by('customer_location').at('90210').up()
  .exec();

// Note:
// kd() - merge column vectors _|_ -> _,_,_
// dd() - apply a filter to a tensor in the hypercube
// project() - for the nodes filtered by kd()'s and dd()'s collapse the hypercube into (n-1) per call
// TODO: how to rotate kd-vector to dd-vector ? (for eg., columns -> changelog), - something like _.groupBy() => { [key: ddValue]: [...] }
// (kd1..., kd2..., kd3..., ...) -> 90º -> (ddVal1, ddVal2, ddVal3, ddVal4, ...)

console.log('query result: ', r);
