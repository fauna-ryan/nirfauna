# nirfauna

[faunadb](https://github.com/fauna/faunadb-js) CRUD helpers

## Installation
```
yarn add https://github.com/fauna-ryan/nirfauna
```

## Usage
```
const nirfauna = require('nirfauna');

nirfauna.init(process.env.FAUNADB_SERVER_SECRET);

const customersSvc = nirfauna.createService('customers');

async function main() {
  const id = 424242;

  await customersSvc.create({ id, foo: 'bar', baz: 'qux' }).then(customer => {
    console.log('create', customer);
  });

  // rudimentary equivalent to `SELECT * FROM customers WHERE foo = 'bar' AND baz = 'qux'`
  // an index must exist with name `<collection>_by_<key>` for each key in `query`
  await customersSvc
    .find({ query: { foo: 'bar', baz: 'qux' } })
    .then(customers => {
      console.log('find', customers);
    });

  await customersSvc.get(id).then(customer => {
    console.log('get', customer);
  });

  // merge
  await customersSvc.patch(id, { foo: 'baz' }).then(customer => {
    console.log('patch', customer);
  });

  // replace
  await customersSvc.update(id, { foo: 'qux' }).then(customer => {
    console.log('update', customer);
  });

  await customersSvc.remove(id).then(customer => {
    console.log('remove', customer);
  });
}

main();
```
