const faunadb = require('faunadb');

const q = faunadb.query;
let _client;

function toRef(collection, id) {
  return q.Ref(q.Collection(collection), id);
}

function withId({ data, ref: { id } }) {
  return { id, ...data };
}

function create(collection, dataWithId, params) {
  const { id, ...data } = dataWithId;

  return _client.query(q.Create(toRef(collection, id), { data })).then(withId);
}

function find(collection, params = {}) {
  const { query = {} } = params;
  let xs = [];

  return _client
    .paginate(
      q.Intersection(
        Object.keys(query).map(key =>
          q.Match(q.Index(`${collection}_by_${key}`), query[key])
        )
      )
    )
    .map(ref => q.Get(ref))
    .each(page => {
      xs = xs.concat(page.map(withId));
    })
    .then(() => {
      return xs;
    });
}

function get(collection, id, params) {
  return _client.query(q.Get(toRef(collection, id))).then(withId);
}

function patch(collection, id, data, params) {
  return _client.query(q.Update(toRef(collection, id), { data })).then(withId);
}

async function remove(collection, id, params) {
  const data = await get(collection, id, params);
  return _client.query(q.Delete(toRef(collection, id))).then(data);
}

async function update(collection, id, data, params) {
  const { id: prevId, ...prevData } = await get(collection, id, params);

  return patch(
    collection,
    id,
    Object.fromEntries(
      Object.keys(prevData).map(key => [key, data[key] || null])
    ),
    params
  );
}

function curry(fn, ...args) {
  return (..._arg) => {
    return fn(...args, ..._arg);
  };
}

function createService(collection) {
  return {
    create: curry(create, collection),
    find: curry(find, collection),
    get: curry(get, collection),
    patch: curry(patch, collection),
    remove: curry(remove, collection),
    update: curry(update, collection)
  };
}

function init(secret) {
  _client = new faunadb.Client({ secret });
}

module.exports = { createService, init };
