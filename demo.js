const path = require('path');
const { Db, Storage } = require('./nd-db');

const storage = new Storage(path.join(__dirname, 'db.json'));
const db = new Db(storage);

function dump() {
  console.log('db dump:', JSON.stringify(db.data, null, 2));
}
console.log('initial');
dump();

console.log('creating a collection');
db.createCollection('accounts')
  .kd('', ['id', 'project_id', 'created_at', 'updated_at'])
  .kd('users', ['name'])
  .kd('admins', ['admin_role'])
  .kd('customers', ['phone', 'zip'])
  .kd('partners', ['business_name'])
  .dd('changelog', '', 'updated_at')
  .dd('project', '', 'project_id')
  .dd('customer_location', 'customers', 'zip')
  .write();

console.log('created:');
dump();

console.log('inserting an item');
db.edit('accounts')
  .locate({})
  .set({
    '': { id: 1, project_id: 'dev', created_at: 1234, updated_at: 1234 },
    users: { name: 'test' },
    customers: { phone: '+12345', zip: '90210' },
  })
  .save();

console.log('after insert');
dump();

console.log('editing hyper-data');
db.edit('accounts')
  .locate({ '': { id: 1 } })
  .set({ '': { updated_at: 1235 }, customers: { name: 'test 2' } })
  .save();

console.log('edited:');
dump();

console.log('querying');
const r = db.query()
  .collection('accounts')
  .kd('')
  .kd('customers')
  .dd('', 'updated_at', 1235)
  .where([]) // hyperWhere?
  .exec();

console.log('query result: ', r);
