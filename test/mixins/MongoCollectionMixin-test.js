const fs = require('fs');
const crypto = require('crypto');
const { expect, assert } = require('chai');
const _ = require('lodash');
const addonPath = process.env.ENV === 'build' ? "../../lib/index.dev" : "../../src/index.js";
const MongoAddon = require(addonPath).default;
const MapperAddon = require('@leansdk/leanes-mapper-addon/src').default;
const LeanES = require('@leansdk/leanes/src').default;
const {
  Query,
  initialize, partOf, nameBy, meta, constant, mixin, property, method, plugin,
} = LeanES.NS;
const {
  MongoClient,
  GridFSBucket
} = require('mongodb');
const Parser = require('mongo-parse');
const moment = require('moment');

let configs = null;

describe('MongoCollectionMixin', () => {
  let __db = null;
  const connectionData = {
    mongodb: {
      username: null,
      password: null,
      host: 'localhost',
      port: '27017',
      dbName: 'just_for_test'
    },
    default_db: 'just_for_test',
    dbGridFS: 'just_for_test_gridfs',
    collection: 'test_tests'
  };
  const configs = {
    mongodb: connectionData.mongodb
  };
  const { mongodb: { username, password, host, port }, default_db } = connectionData;
  const credentials = (username != null && password != null) ? `${username}:${password}@` : '';
  const db_url = `mongodb://${credentials}${host}:${port}/${default_db}?authSource=admin`;

  const createConnection = async (dbName) => {
    if (!(connections[dbName] != null)) {
      const { username, password, host, port } = connectionData.mongodb;
      const creds = (username != null && password != null) ? `${username}:${password}@` : '';
      const dbUrl = `mongodb://${creds}${host}:${port}/${dbName}?authSource=admin`;
      connections[dbName] = await MongoClient.connect(dbUrl);
    }
    return connections[dbName];
  }

  before(async () => {
    const { default_db } = connectionData;
    __db = await createConnection(default_db);
    const dbCollection = await __db.createCollection('test_tests');
    let date = new Date().toISOString();
    await dbCollection.save({
      id: 'q1',
      type: 'Test::TestRecord',
      cid: 1,
      data: 'three',
      createdAt: date,
      updatedAt: date
    });
    date = new Date().toISOString();
    await dbCollection.save({
      id: 'w2',
      type: 'Test::TestRecord',
      cid: 2,
      data: 'men',
      createdAt: date,
      updatedAt: date
    });
    date = new Date(Date.now() + 1000).toISOString()
    await dbCollection.save({
      id: 'e3',
      type: 'Test::TestRecord',
      cid: 3,
      data: 'in',
      createdAt: date,
      updatedAt: date
    });
    await dbCollection.save({
      id: 'r4',
      type: 'Test::TestRecord',
      cid: 4,
      data: 'a boat',
      createdAt: date,
      updatedAt: date
    });
  });

  after(async () => {
    for (connection in connections) {
      await connection.dropDatabase();
      await connection.close(true);
    }
  });

  describe('.new', () => {
    it('Create instance of class LeanRC::Collection with MongoCollectionMixin', () => {

      @initialize
      @plugin(MongoAddon)
      @plugin(MapperAddon)
      class Test extends LeanES {
        @nameBy static __filename = 'Test';
        @meta static object = {};
        @constant ROOT = __dirname;
      }

      @initialize
      @partOf(Test)
      @mixin(Test.NS.QueryableCollectionMixin)
      @mixin(Test.NS.MongoCollectionMixin)
      class TestCollection extends Test.NS.Collection {
        @nameBy static __filename = 'TestCollection';
        @meta static object = {};

        @property configs = configs;
      }

      @initialize
      @partOf(Test)
      class TestRecord extends Test.NS.Record {
        @nameBy static __filename = 'TestRecord';
        @meta static object = {};
        @Test.NS.attribute({ type: 'number' }) cid = -1;
        @Test.NS.attribute({ type: 'string' }) data = '';
      }
      const collection = TestCollection.new();
      collection.setName('TEST_COLLECTION');
      collection.setData({
        delegate: 'TestRecord'
      });
      assert.isTrue(collection != null);
      assert.instanceOf(collection, TestCollection);
    });
  });
  describe('.connection', () => {
    it('Check "connection" property after creating instance of class LeanRC::Collection with MongoCollectionMixin', async () => {

      @initialize
      @plugin(MongoAddon)
      @plugin(MapperAddon)
      class Test extends LeanES {
        @nameBy static __filename = 'Test';
        @meta static object = {};
        @constant ROOT = __dirname;
      }

      @initialize
      @partOf(Test)
      @mixin(Test.NS.QueryableCollectionMixin)
      @mixin(Test.NS.MongoCollectionMixin)
      class TestCollection extends Test.NS.Collection {
        @nameBy static __filename = 'TestCollection';
        @meta static object = {};

        @property configs = configs;
      }

      @initialize
      @partOf(Test)
      class TestRecord extends Test.NS.Record {
        @nameBy static __filename = 'TestRecord';
        @meta static object = {};
        @Test.NS.attribute({ type: 'number' }) cid = -1;
        @Test.NS.attribute({ type: 'string' }) data = '';
      }
      const collection = TestCollection.new('TEST_COLLECTION', Object.assign({}, {
        delegate: 'TestRecord'
      }, connectionData));
      collection.onRegister();
      const { mongodb: { dbName }, collection: nativeCollectionName } = connectionData
      const connection = await collection.connection;
      assert.isTrue(connection != null);
      const voDB = await createConnection(dbName);
      const nativeCollection = await voDB.collection(nativeCollectionName);
      assert.isTrue(nativeCollection != null);
      assert.isTrue((await nativeCollection.find()) != null);
      await collection.onRemove();
    });
  });
  describe('.collection', () => {
    it('Check "collection" property after creating instance of class LeanRC::Collection with MongoCollectionMixin', async () => {

      @initialize
      @plugin(MongoAddon)
      @plugin(MapperAddon)
      class Test extends LeanES {
        @nameBy static __filename = 'Test';
        @meta static object = {};
        @constant ROOT = __dirname;
      }

      @initialize
      @partOf(Test)
      @mixin(Test.NS.QueryableCollectionMixin)
      @mixin(Test.NS.MongoCollectionMixin)
      class TestCollection extends Test.NS.Collection {
        @nameBy static __filename = 'TestCollection';
        @meta static object = {};

        @property configs = configs;
      }

      @initialize
      @partOf(Test)
      class TestRecord extends Test.NS.Record {
        @nameBy static __filename = 'TestRecord';
        @meta static object = {};
        @Test.NS.attribute({ type: 'number' }) cid = -1;
        @Test.NS.attribute({ type: 'string' }) data = '';
      }
      const collection = TestCollection.new('TEST_COLLECTION', Object.assign({}, {
        delegate: 'TestRecord'
      }, connectionData));
      collection.onRegister();
      const nativeCollection = await collection.collection;
      assert.isTrue(collection[TestCollection.instanceVariables._collection] != null);
      assert.isTrue(nativeCollection != null);
      assert.isTrue((await nativeCollection.find()) != null);
      const db = await createConnection(default_db);
      const nativeCollection2 = db.collection(connectionData.collection);
      assert.deepEqual((await nativeCollection.find().toArray())[0], (await nativeCollection2.find().toArray())[0]);
      await collection.onRemove();
    });
  });
  describe('.bucket', () => {
    it('Check "bucket" property after creating instance of class LeanRC::Collection with MongoCollectionMixin', async () => {

      @initialize
      @plugin(MongoAddon)
      @plugin(MapperAddon)
      class Test extends LeanES {
        @nameBy static __filename = 'Test';
        @meta static object = {};
        @constant ROOT = __dirname;
      }

      @initialize
      @partOf(Test)
      @mixin(Test.NS.QueryableCollectionMixin)
      @mixin(Test.NS.MongoCollectionMixin)
      class TestCollection extends Test.NS.Collection {
        @nameBy static __filename = 'TestCollection';
        @meta static object = {};

        @property configs = configs;
      }

      @initialize
      @partOf(Test)
      class TestRecord extends Test.NS.Record {
        @nameBy static __filename = 'TestRecord';
        @meta static object = {};
        @Test.NS.attribute({ type: 'number' }) cid = -1;
        @Test.NS.attribute({ type: 'string' }) data = '';
      }
      const collection = TestCollection.new('TEST_COLLECTION', Object.assign({}, {
        delegate: 'TestRecord'
      }, connectionData));
      collection.onRegister();
      collection.initializeNotifier('TEST');
      const bucket = await collection.bucket;
      assert.isTrue(collection[TestCollection.instanceVariables._bucket] != null);
      await collection.onRemove();
    });
  });
  describe('.onRegister', () => {
    it('Check correctness logic of the "onRegister" function', async () => {

      @initialize
      @plugin(MongoAddon)
      @plugin(MapperAddon)
      class Test extends LeanES {
        @nameBy static __filename = 'Test';
        @meta static object = {};
        @constant ROOT = __dirname;
      }

      @initialize
      @partOf(Test)
      @mixin(Test.NS.QueryableCollectionMixin)
      @mixin(Test.NS.MongoCollectionMixin)
      class TestCollection extends Test.NS.Collection {
        @nameBy static __filename = 'TestCollection';
        @meta static object = {};

        @property configs = configs;
      }

      @initialize
      @partOf(Test)
      class TestRecord extends Test.NS.Record {
        @nameBy static __filename = 'TestRecord';
        @meta static object = {};
        @Test.NS.attribute({ type: 'number' }) cid = -1;
        @Test.NS.attribute({ type: 'string' }) data = '';
      }
      const collection = TestCollection.new('TEST_COLLECTION', Object.assign({}, {
        delegate: 'TestRecord'
      }, connectionData));
      collection.onRegister();
      assert.isTrue(TestCollection[TestCollection.classVariables._connection] != null);
      await collection.onRemove();
    });
  });
  describe('.operatorsMap', () => {
    it('Check correctness logic of each function in the "operatorsMap" property', async () => {

      @initialize
      @plugin(MongoAddon)
      @plugin(MapperAddon)
      class Test extends LeanES {
        @nameBy static __filename = 'Test';
        @meta static object = {};
        @constant ROOT = __dirname;
      }

      @initialize
      @partOf(Test)
      @mixin(Test.NS.QueryableCollectionMixin)
      @mixin(Test.NS.MongoCollectionMixin)
      class TestCollection extends Test.NS.Collection {
        @nameBy static __filename = 'TestCollection';
        @meta static object = {};

        @property configs = configs;
      }

      @initialize
      @partOf(Test)
      class TestRecord extends Test.NS.Record {
        @nameBy static __filename = 'TestRecord';
        @meta static object = {};
        @Test.NS.attribute({ type: 'number' }) cid = -1;
        @Test.NS.attribute({ type: 'string' }) data = '';
      }
      const collection = TestCollection.new('TEST_COLLECTION', Object.assign({}, {
        delegate: 'TestRecord'
      }, connectionData));
      collection.onRegister();
      const { operatorsMap } = collection;

      assert.isFunction(operatorsMap['$and']);
      assert.isFunction(operatorsMap['$or']);
      assert.isFunction(operatorsMap['$not']);
      assert.isFunction(operatorsMap['$nor']);

      assert.isFunction(operatorsMap['$where']);

      assert.isFunction(operatorsMap['$eq']);
      assert.isFunction(operatorsMap['$ne']);
      assert.isFunction(operatorsMap['$lt']);
      assert.isFunction(operatorsMap['$lte']);
      assert.isFunction(operatorsMap['$gt']);
      assert.isFunction(operatorsMap['$gte']);
      assert.isFunction(operatorsMap['$in']);
      assert.isFunction(operatorsMap['$nin']);

      assert.isFunction(operatorsMap['$all']);
      assert.isFunction(operatorsMap['$elemMatch']);
      assert.isFunction(operatorsMap['$size']);

      assert.isFunction(operatorsMap['$exists']);
      assert.isFunction(operatorsMap['$type']);

      assert.isFunction(operatorsMap['$mod']);
      assert.isFunction(operatorsMap['$regex']);

      assert.isFunction(operatorsMap['$td']);
      assert.isFunction(operatorsMap['$ld']);
      assert.isFunction(operatorsMap['$tw']);
      assert.isFunction(operatorsMap['$lw']);
      assert.isFunction(operatorsMap['$tm']);
      assert.isFunction(operatorsMap['$lm']);
      assert.isFunction(operatorsMap['$ty']);
      assert.isFunction(operatorsMap['$ly']);

      let logicalOperator = operatorsMap['$and'](['a', 'b', 'c']);
      assert.deepEqual(logicalOperator, {
        $and: ['a', 'b', 'c']
      });
      logicalOperator = operatorsMap['$or'](['a', 'b', 'c']);
      assert.deepEqual(logicalOperator, {
        $or: ['a', 'b', 'c']
      });
      logicalOperator = operatorsMap['$not'](['a', 'b', 'c']);
      assert.deepEqual(logicalOperator, {
        $not: ['a', 'b', 'c']
      });
      logicalOperator = operatorsMap['$nor'](['a', 'b', 'c']);
      assert.deepEqual(logicalOperator, {
        $nor: ['a', 'b', 'c']
      });

      let compOperator = operatorsMap['$eq']('a', 3);
      assert.deepEqual(compOperator, {
        a: {
          $eq: 3
        }
      });
      compOperator = operatorsMap['$eq']('@a', '@doc.b');
      assert.deepEqual(compOperator, {
        a: {
          $eq: 'b'
        }
      });
      compOperator = operatorsMap['$ne']('a', 3);
      assert.deepEqual(compOperator, {
        a: {
          $ne: 3
        }
      });
      compOperator = operatorsMap['$ne']('@a', '@doc.b');
      assert.deepEqual(compOperator, {
        a: {
          $ne: 'b'
        }
      });
      compOperator = operatorsMap['$lt']('a', 3);
      assert.deepEqual(compOperator, {
        a: {
          $lt: 3
        }
      });
      compOperator = operatorsMap['$lt']('@a', '@doc.b');
      assert.deepEqual(compOperator, {
        a: {
          $lt: 'b'
        }
      });
      compOperator = operatorsMap['$lte']('a', 3);
      assert.deepEqual(compOperator, {
        a: {
          $lte: 3
        }
      });
      compOperator = operatorsMap['$lte']('@a', '@doc.b');
      assert.deepEqual(compOperator, {
        a: {
          $lte: 'b'
        }
      });
      compOperator = operatorsMap['$gt']('a', 3);
      assert.deepEqual(compOperator, {
        a: {
          $gt: 3
        }
      });
      compOperator = operatorsMap['$gt']('@a', '@doc.b');
      assert.deepEqual(compOperator, {
        a: {
          $gt: 'b'
        }
      });
      compOperator = operatorsMap['$gte']('a', 3);
      assert.deepEqual(compOperator, {
        a: {
          $gte: 3
        }
      });
      compOperator = operatorsMap['$gte']('@a', '@doc.b');
      assert.deepEqual(compOperator, {
        a: {
          $gte: 'b'
        }
      });
      compOperator = operatorsMap['$in']('a', ['b', 'c']);
      assert.deepEqual(compOperator, {
        a: {
          $in: ['b', 'c']
        }
      });
      compOperator = operatorsMap['$in']('@a', ['b', 'c']);
      assert.deepEqual(compOperator, {
        a: {
          $in: ['b', 'c']
        }
      });
      compOperator = operatorsMap['$nin']('a', ['b', 'c']);
      assert.deepEqual(compOperator, {
        a: {
          $nin: ['b', 'c']
        }
      });
      compOperator = operatorsMap['$nin']('@a', ['b', 'c']);
      assert.deepEqual(compOperator, {
        a: {
          $nin: ['b', 'c']
        }
      });

      let queryOperator = operatorsMap['$all']('@a', ['b', 'c', 'd']);
      assert.deepEqual(queryOperator, {
        a: {
          $all: ['b', 'c', 'd']
        }
      });
      queryOperator = operatorsMap['$elemMatch']('@a', {
        $gte: 80,
        $lt: 85
      });
      assert.deepEqual(queryOperator, {
        a: {
          $elemMatch: {
            $gte: 80,
            $lt: 85
          }
        }
      });
      queryOperator = operatorsMap['$size']('@a', 1);
      assert.deepEqual(queryOperator, {
        a: {
          $size: 1
        }
      });

      queryOperator = operatorsMap['$exists']('a', true);
      assert.deepEqual(queryOperator, {
        a: {
          $exists: true
        }
      });
      queryOperator = operatorsMap['$exists']('@a', true);
      assert.deepEqual(queryOperator, {
        a: {
          $exists: true
        }
      });
      queryOperator = operatorsMap['$type']('a', 1);
      assert.deepEqual(queryOperator, {
        a: {
          $type: 1
        }
      });
      queryOperator = operatorsMap['$type']('@a', 'string');
      assert.deepEqual(queryOperator, {
        a: {
          $type: 'string'
        }
      });

      queryOperator = operatorsMap['$mod']('a', [4, 0]);
      assert.deepEqual(queryOperator, {
        a: {
          $mod: [4, 0]
        }
      });
      queryOperator = operatorsMap['$mod']('@a', [4, 0]);
      assert.deepEqual(queryOperator, {
        a: {
          $mod: [4, 0]
        }
      });
      queryOperator = operatorsMap['$regex']('@a', '/^beep/i');
      assert.deepEqual(queryOperator, {
        a: {
          $regex: /^beep/i
        }
      });
      queryOperator = operatorsMap['$regex']('@a', '/^beep/', 'imxs');
      assert.deepEqual(queryOperator, {
        a: {
          $regex: /^beep/,
          $options: 'imxs'
        }
      });
      assert.throws((function () {
        return operatorsMap['$where']();
      }), Error);
      assert.throws((function () {
        return operatorsMap['$text']();
      }), Error);

      let todayStart = moment().utc().startOf('day').toISOString();
      let todayEnd = moment().utc().endOf('day').toISOString();
      queryOperator = operatorsMap['$td']('createdAt', true);
      assert.deepEqual(queryOperator, {
        $and: [
          {
            createdAt: {
              $gte: todayStart
            },
            createdAt: {
              $lt: todayEnd
            }
          }
        ]
      });
      queryOperator = operatorsMap['$td']('@createdAt', false);
      assert.deepEqual(queryOperator, {
        $not: {
          $and: [
            {
              createdAt: {
                $gte: todayStart
              },
              createdAt: {
                $lt: todayEnd
              }
            }
          ]
        }
      });

      yesterdayStart = moment().utc().subtract(1, 'days').startOf('day').toISOString();
      yesterdayEnd = moment().utc().subtract(1, 'days').endOf('day').toISOString();
      queryOperator = operatorsMap['$ld']('createdAt', true);
      assert.deepEqual(queryOperator, {
        $and: [
          {
            createdAt: {
              $gte: yesterdayStart
            },
            createdAt: {
              $lt: yesterdayEnd
            }
          }
        ]
      });
      queryOperator = operatorsMap['$ld']('@createdAt', false);
      assert.deepEqual(queryOperator, {
        $not: {
          $and: [
            {
              createdAt: {
                $gte: yesterdayStart
              },
              createdAt: {
                $lt: yesterdayEnd
              }
            }
          ]
        }
      });


      let weekStart = moment().utc().startOf('week').toISOString();
      let weekEnd = moment().utc().endOf('week').toISOString();
      queryOperator = operatorsMap['$tw']('createdAt', true);
      assert.deepEqual(queryOperator, {
        $and: [
          {
            createdAt: {
              $gte: weekStart
            },
            createdAt: {
              $lt: weekEnd
            }
          }
        ]
      });
      queryOperator = operatorsMap['$tw']('@createdAt', false);
      assert.deepEqual(queryOperator, {
        $not: {
          $and: [
            {
              createdAt: {
                $gte: weekStart
              },
              createdAt: {
                $lt: weekEnd
              }
            }
          ]
        }
      });

      weekStart = moment().utc().subtract(1, 'weeks').startOf('week').toISOString();
      weekEnd = moment().utc().subtract(1, 'weeks').endOf('week').toISOString();
      queryOperator = operatorsMap['$lw']('createdAt', true);
      assert.deepEqual(queryOperator, {
        $and: [
          {
            createdAt: {
              $gte: weekStart
            },
            createdAt: {
              $lt: weekEnd
            }
          }
        ]
      });
      queryOperator = operatorsMap['$lw']('createdAt', false);
      assert.deepEqual(queryOperator, {
        $not: {
          $and: [
            {
              createdAt: {
                $gte: weekStart
              },
              createdAt: {
                $lt: weekEnd
              }
            }
          ]
        }
      });

      let monthStart = moment().utc().startOf('month').toISOString();
      let monthEnd = moment().utc().endOf('month').toISOString();
      queryOperator = operatorsMap['$tm']('createdAt', true);
      assert.deepEqual(queryOperator, {
        $and: [
          {
            createdAt: {
              $gte: monthStart
            },
            createdAt: {
              $lt: monthEnd
            }
          }
        ]
      });
      queryOperator = operatorsMap['$tm']('createdAt', false);
      assert.deepEqual(queryOperator, {
        $not: {
          $and: [
            {
              createdAt: {
                $gte: monthStart
              },
              createdAt: {
                $lt: monthEnd
              }
            }
          ]
        }
      });

      monthStart = moment().utc().subtract(1, 'months').startOf('month').toISOString();
      monthEnd = moment().utc().subtract(1, 'months').endOf('month').toISOString();
      queryOperator = operatorsMap['$lm']('createdAt', true);
      assert.deepEqual(queryOperator, {
        $and: [
          {
            createdAt: {
              $gte: monthStart
            },
            createdAt: {
              $lt: monthEnd
            }
          }
        ]
      });
      queryOperator = operatorsMap['$lm']('createdAt', false);
      assert.deepEqual(queryOperator, {
        $not: {
          $and: [
            {
              createdAt: {
                $gte: monthStart
              },
              createdAt: {
                $lt: monthEnd
              }
            }
          ]
        }
      });

      let yearStart = moment().utc().startOf('year').toISOString();
      let yearEnd = moment().utc().endOf('year').toISOString();
      queryOperator = operatorsMap['$ty']('createdAt', true);
      assert.deepEqual(queryOperator, {
        $and: [
          {
            createdAt: {
              $gte: yearStart
            },
            createdAt: {
              $lt: yearEnd
            }
          }
        ]
      });
      queryOperator = operatorsMap['$ty']('createdAt', false);
      assert.deepEqual(queryOperator, {
        $not: {
          $and: [
            {
              createdAt: {
                $gte: yearStart
              },
              createdAt: {
                $lt: yearEnd
              }
            }
          ]
        }
      });

      yearStart = moment().utc().subtract(1, 'years').startOf('year').toISOString();
      yearEnd = moment().utc().subtract(1, 'years').endOf('year').toISOString();
      queryOperator = operatorsMap['$ly']('createdAt', true);
      assert.deepEqual(queryOperator, {
        $and: [
          {
            createdAt: {
              $gte: yearStart
            },
            createdAt: {
              $lt: yearEnd
            }
          }
        ]
      });
      queryOperator = operatorsMap['$ly']('createdAt', false);
      assert.deepEqual(queryOperator, {
        $not: {
          $and: [
            {
              createdAt: {
                $gte: yearStart
              },
              createdAt: {
                $lt: yearEnd
              }
            }
          ]
        }
      });
      await collection.onRemove();
    });
  });
  describe('.parseFilter', () => {
    it('Use the "parseFilter" method for simple parsed query', async () => {

      @initialize
      @plugin(MongoAddon)
      @plugin(MapperAddon)
      class Test extends LeanES {
        @nameBy static __filename = 'Test';
        @meta static object = {};
        @constant ROOT = __dirname;
      }

      @initialize
      @partOf(Test)
      @mixin(Test.NS.QueryableCollectionMixin)
      @mixin(Test.NS.MongoCollectionMixin)
      class TestCollection extends Test.NS.Collection {
        @nameBy static __filename = 'TestCollection';
        @meta static object = {};

        @property configs = configs;
      }

      @initialize
      @partOf(Test)
      class TestRecord extends Test.NS.Record {
        @nameBy static __filename = 'TestRecord';
        @meta static object = {};
        @Test.NS.attribute({ type: 'number' }) cid = -1;
        @Test.NS.attribute({ type: 'string' }) data = '';
      }
      const collection = TestCollection.new('TEST_COLLECTION', Object.assign({}, {
        delegate: 'TestRecord'
      }, connectionData));
      collection.onRegister();
      const result = collection.parseFilter({
        field: 'a',
        operator: '$eq',
        operand: 'b'
      });
      assert.deepEqual(result, {
        a: {
          $eq: 'b'
        }
      });
      await collection.onRemove();
    });
    it('Use the "parseFilter" method for parsed query', async () => {

      @initialize
      @plugin(MongoAddon)
      @plugin(MapperAddon)
      class Test extends LeanES {
        @nameBy static __filename = 'Test';
        @meta static object = {};
        @constant ROOT = __dirname;
      }

      @initialize
      @partOf(Test)
      @mixin(Test.NS.QueryableCollectionMixin)
      @mixin(Test.NS.MongoCollectionMixin)
      class TestCollection extends Test.NS.Collection {
        @nameBy static __filename = 'TestCollection';
        @meta static object = {};

        @property configs = configs;
      }

      @initialize
      @partOf(Test)
      class TestRecord extends Test.NS.Record {
        @nameBy static __filename = 'TestRecord';
        @meta static object = {};
        @Test.NS.attribute({ type: 'number' }) cid = -1;
        @Test.NS.attribute({ type: 'string' }) data = '';
      }
      const collection = TestCollection.new('TEST_COLLECTION', Object.assign({}, {
        delegate: 'TestRecord'
      }, connectionData));
      collection.onRegister();
      const result = collection.parseFilter({
        parts: [
          {
            operator: '$or',
            parts: [
              {
                field: 'c',
                operand: 1,
                operator: '$eq'
              },
              {
                field: '@b',
                operand: 2,
                operator: '$eq'
              }
            ]
          },
          {
            operator: '$nor',
            parts: [
              {
                field: '@d',
                operand: '1',
                operator: '$eq'
              },
              {
                field: 'b',
                operand: '2',
                operator: '$eq'
              }
            ]
          }
        ],
        operator: '$and'
      });
      assert.deepEqual(result, {
        $and: [
          {
            $or: [
              { c: { $eq: 1 } },
              { b: { $eq: 2 } }
            ]
          },
          {
            $nor: [
              { d: { $eq: '1' } },
              { b: { $eq: '2' } }
            ]
          }
        ]
      });
      await collection.onRemove();
    });
    it('Use the "parseFilter" method for parsed query with operator "$elemMatch" and implicitField:no', async () => {

      @initialize
      @plugin(MongoAddon)
      @plugin(MapperAddon)
      class Test extends LeanES {
        @nameBy static __filename = 'Test';
        @meta static object = {};
        @constant ROOT = __dirname;
      }

      @initialize
      @partOf(Test)
      @mixin(Test.NS.QueryableCollectionMixin)
      @mixin(Test.NS.MongoCollectionMixin)
      class TestCollection extends Test.NS.Collection {
        @nameBy static __filename = 'TestCollection';
        @meta static object = {};

        @property configs = configs;
      }

      @initialize
      @partOf(Test)
      class TestRecord extends Test.NS.Record {
        @nameBy static __filename = 'TestRecord';
        @meta static object = {};
        @Test.NS.attribute({ type: 'number' }) cid = -1;
        @Test.NS.attribute({ type: 'string' }) data = '';
      }
      const collection = TestCollection.new('TEST_COLLECTION', Object.assign({}, {
        delegate: 'TestRecord'
      }, connectionData));
      collection.onRegister();
      const result = collection.parseFilter({
        operator: '$elemMatch',
        field: '@a',
        parts: [
          {
            field: '@doc.b',
            operand: 'c',
            operator: '$eq'
          },
          {
            field: '@doc.d',
            operand: 2,
            operator: '$eq'
          }
        ],
        implicitField: false
      });
      assert.deepEqual(result, {
        a: {
          $elemMatch: {
            b: { $eq: 'c' },
            d: { $eq: 2 }
          }
        }
      });
      await collection.onRemove();
    });
    it('Use the "parseFilter" method for parsed query with operator "$elemMatch" and implicitField:yes', async () => {

      @initialize
      @plugin(MongoAddon)
      @plugin(MapperAddon)
      class Test extends LeanES {
        @nameBy static __filename = 'Test';
        @meta static object = {};
        @constant ROOT = __dirname;
      }

      @initialize
      @partOf(Test)
      @mixin(Test.NS.QueryableCollectionMixin)
      @mixin(Test.NS.MongoCollectionMixin)
      class TestCollection extends Test.NS.Collection {
        @nameBy static __filename = 'TestCollection';
        @meta static object = {};

        @property configs = configs;
      }

      @initialize
      @partOf(Test)
      class TestRecord extends Test.NS.Record {
        @nameBy static __filename = 'TestRecord';
        @meta static object = {};
        @Test.NS.attribute({ type: 'number' }) cid = -1;
        @Test.NS.attribute({ type: 'string' }) data = '';
      }
      const collection = TestCollection.new('TEST_COLLECTION', Object.assign({}, {
        delegate: 'TestRecord'
      }, connectionData));
      collection.onRegister();
      const result = collection.parseFilter({
        operator: '$elemMatch',
        field: '@a',
        parts: [
          {
            operand: 10,
            operator: '$gte'
          },
          {
            operand: 15,
            operator: '$lt'
          }
        ],
        implicitField: true
      });
      assert.deepEqual(result, {
        a: {
          $elemMatch: {
            $gte: 10,
            $lt: 15
          }
        }
      });
      await collection.onRemove();
    });
  });
  describe('.parseQuery', () => {
    it('Check correctness logic of the "parseQuery" method for "remove" record', async () => {

      @initialize
      @plugin(MongoAddon)
      @plugin(MapperAddon)
      class Test extends LeanES {
        @nameBy static __filename = 'Test';
        @meta static object = {};
        @constant ROOT = __dirname;
      }

      @initialize
      @partOf(Test)
      @mixin(Test.NS.QueryableCollectionMixin)
      @mixin(Test.NS.MongoCollectionMixin)
      class TestCollection extends Test.NS.Collection {
        @nameBy static __filename = 'TestCollection';
        @meta static object = {};

        @property configs = configs;
      }

      @initialize
      @partOf(Test)
      class TestRecord extends Test.NS.Record {
        @nameBy static __filename = 'TestRecord';
        @meta static object = {};
        @Test.NS.attribute({ type: 'number' }) cid = -1;
        @Test.NS.attribute({ type: 'string' }) data = '';
      }
      const collection = TestCollection.new('TEST_COLLECTION', Object.assign({}, {
        delegate: 'TestRecord'
      }, connectionData));
      collection.onRegister();
      const date = new Date();
      const query = Test.NS.Query.new()
        .forIn({ '@doc': collection.collectionFullName() })
        .into(collection.collectionFullName())
        .filter({
          '@doc.cid': { $eq: 5 }
        })
        .remove('@doc');
      const result1 = await collection.parseQuery(query);
      const result2 = await collection.parseQuery({
        '$forIn': {
          '@doc': collection.collectionFullName()
        },
        '$into': collection.collectionFullName(),
        '$filter': {
          '@doc.cid': { $eq: 5 }
        },
        '$remove': '@doc'
      });
      const correctResult = {
        queryType: 'removeBy',
        pipeline: [
          {
            "$match": {
              "$and": [{ "cid": { "$eq": 5 } }]
            }
          }
        ],
        isCustomReturn: true
      };
      assert.deepEqual(result1, correctResult);
      assert.deepEqual(result2, correctResult);
    });
    it('Check correctness logic of the "parseQuery" method for "count" records', async () => {

      @initialize
      @plugin(MongoAddon)
      @plugin(MapperAddon)
      class Test extends LeanES {
        @nameBy static __filename = 'Test';
        @meta static object = {};
        @constant ROOT = __dirname;
      }

      @initialize
      @partOf(Test)
      @mixin(Test.NS.QueryableCollectionMixin)
      @mixin(Test.NS.MongoCollectionMixin)
      class TestCollection extends Test.NS.Collection {
        @nameBy static __filename = 'TestCollection';
        @meta static object = {};

        @property configs = configs;
      }

      @initialize
      @partOf(Test)
      class TestRecord extends Test.NS.Record {
        @nameBy static __filename = 'TestRecord';
        @meta static object = {};
        @Test.NS.attribute({ type: 'number' }) cid = -1;
        @Test.NS.attribute({ type: 'string' }) data = '';
      }
      const collection = TestCollection.new('TEST_COLLECTION', Object.assign({}, {
        delegate: 'TestRecord'
      }, connectionData));
      collection.onRegister();
      const date = new Date();
      const query = Test.NS.Query.new()
        .forIn({ '@doc': collection.collectionFullName() })
        .filter({ '@doc.cid': { $gt: 2 } })
        .count();

      const result1 = await collection.parseQuery(query);
      const result2 = await collection.parseQuery({
        '$forIn': {
          '@doc': collection.collectionFullName()
        },
        '$filter': {
          '@doc.cid': {
            $gt: 2
          }
        },
        '$count': true
      });
      const correctResult = {
        pipeline: [
          {
            $match: {
              $and: [{ cid: { $gt: 2 } }]
            }
          },
          {
            $count: 'result'
          }
        ],
        queryType: 'query',
        isCustomReturn: true
      };
      assert.deepEqual(result1, correctResult);
      assert.deepEqual(result2, correctResult);
      await collection.onRemove();
    });
    it('Check correctness logic of the "parseQuery" method for "sum" records', async () => {

      @initialize
      @plugin(MongoAddon)
      @plugin(MapperAddon)
      class Test extends LeanES {
        @nameBy static __filename = 'Test';
        @meta static object = {};
        @constant ROOT = __dirname;
      }

      @initialize
      @partOf(Test)
      @mixin(Test.NS.QueryableCollectionMixin)
      @mixin(Test.NS.MongoCollectionMixin)
      class TestCollection extends Test.NS.Collection {
        @nameBy static __filename = 'TestCollection';
        @meta static object = {};

        @property configs = configs;
      }

      @initialize
      @partOf(Test)
      class TestRecord extends Test.NS.Record {
        @nameBy static __filename = 'TestRecord';
        @meta static object = {};
        @Test.NS.attribute({ type: 'number' }) cid = -1;
        @Test.NS.attribute({ type: 'string' }) data = '';
      }
      const collection = TestCollection.new('TEST_COLLECTION', Object.assign({}, {
        delegate: 'TestRecord'
      }, connectionData));
      collection.onRegister();
      const date = new Date();
      const query = Test.NS.Query.new()
        .forIn({ '@doc': collection.collectionFullName() })
        .filter({
          '@doc.cid': { $gt: 2 }
        })
        .sum('cid');
      const result1 = await collection.parseQuery(query);
      const result2 = await collection.parseQuery({
        '$forIn': {
          '@doc': collection.collectionFullName()
        },
        '$filter': {
          '@doc.cid': { $gt: 2 }
        },
        '$sum': 'cid'
      });
      const correctResult = {
        pipeline: [
          {
            $match: {
              $and: [{ cid: { $gt: 2 } }]
            }
          },
          {
            $group: {
              _id: null,
              result: { $sum: '$cid' }
            }
          },
          {
            $project: {
              _id: 0
            }
          }
        ],
        queryType: 'query',
        isCustomReturn: true
      };
      assert.deepEqual(result1, correctResult);
      assert.deepEqual(result2, correctResult);
      await collection.onRemove();
    });
    it('Check correctness logic of the "parseQuery" method for "min" records', async () => {

      @initialize
      @plugin(MongoAddon)
      @plugin(MapperAddon)
      class Test extends LeanES {
        @nameBy static __filename = 'Test';
        @meta static object = {};
        @constant ROOT = __dirname;
      }

      @initialize
      @partOf(Test)
      @mixin(Test.NS.QueryableCollectionMixin)
      @mixin(Test.NS.MongoCollectionMixin)
      class TestCollection extends Test.NS.Collection {
        @nameBy static __filename = 'TestCollection';
        @meta static object = {};

        @property configs = configs;
      }

      @initialize
      @partOf(Test)
      class TestRecord extends Test.NS.Record {
        @nameBy static __filename = 'TestRecord';
        @meta static object = {};
        @Test.NS.attribute({ type: 'number' }) cid = -1;
        @Test.NS.attribute({ type: 'string' }) data = '';
      }
      const collection = TestCollection.new('TEST_COLLECTION', Object.assign({}, {
        delegate: 'TestRecord'
      }, connectionData));
      collection.onRegister();
      const date = new Date();
      const query = Test.NS.Query.new()
        .forIn({ '@doc': collection.collectionFullName() })
        .filter({
          '@doc.cid': { $gt: 2 }
        })
        .min('cid');
      const result1 = await collection.parseQuery(query);
      const result2 = await collection.parseQuery({
        '$forIn': {
          '@doc': collection.collectionFullName()
        },
        '$filter': {
          '@doc.cid': { $gt: 2 }
        },
        '$min': 'cid'
      });
      const correctResult = {
        pipeline: [
          {
            $match: {
              $and: [{
                cid: { $gt: 2 }
              }]
            }
          },
          {
            $sort: {
              cid: 1
            }
          },
          {
            $limit: 1
          },
          {
            $project: {
              _id: 0,
              result: "$cid"
            }
          }
        ],
        queryType: 'query',
        isCustomReturn: true
      };
      assert.deepEqual(result1, correctResult);
      assert.deepEqual(result2, correctResult);
      await collection.onRemove();
    });
    it('Check correctness logic of the "parseQuery" method for "max" records', async () => {

      @initialize
      @plugin(MongoAddon)
      @plugin(MapperAddon)
      class Test extends LeanES {
        @nameBy static __filename = 'Test';
        @meta static object = {};
        @constant ROOT = __dirname;
      }

      @initialize
      @partOf(Test)
      @mixin(Test.NS.QueryableCollectionMixin)
      @mixin(Test.NS.MongoCollectionMixin)
      class TestCollection extends Test.NS.Collection {
        @nameBy static __filename = 'TestCollection';
        @meta static object = {};

        @property configs = configs;
      }

      @initialize
      @partOf(Test)
      class TestRecord extends Test.NS.Record {
        @nameBy static __filename = 'TestRecord';
        @meta static object = {};
        @Test.NS.attribute({ type: 'number' }) cid = -1;
        @Test.NS.attribute({ type: 'string' }) data = '';
      }
      const collection = TestCollection.new('TEST_COLLECTION', Object.assign({}, {
        delegate: 'TestRecord'
      }, connectionData));
      collection.onRegister();
      const date = new Date();
      const query = Test.NS.Query.new()
        .forIn({ '@doc': collection.collectionFullName() })
        .filter({
          '@doc.cid': { $gt: 2 }
        })
        .max('cid');
      const result1 = await collection.parseQuery(query);
      const result2 = await collection.parseQuery({
        '$forIn': {
          '@doc': collection.collectionFullName()
        },
        '$filter': {
          '@doc.cid': { $gt: 2 }
        },
        '$max': 'cid'
      });
      const correctResult = {
        pipeline: [
          {
            $match: {
              $and: [{
                cid: { $gt: 2 }
              }]
            }
          },
          {
            $sort: {
              cid: -1
            }
          },
          {
            $limit: 1
          },
          {
            $project: {
              _id: 0,
              result: "$cid"
            }
          }
        ],
        queryType: 'query',
        isCustomReturn: true
      };
      assert.deepEqual(result1, correctResult);
      assert.deepEqual(result2, correctResult);
      await collection.onRemove();
    });
    it('Check correctness logic of the "parseQuery" method for "avg" records', async () => {

      @initialize
      @plugin(MongoAddon)
      @plugin(MapperAddon)
      class Test extends LeanES {
        @nameBy static __filename = 'Test';
        @meta static object = {};
        @constant ROOT = __dirname;
      }

      @initialize
      @partOf(Test)
      @mixin(Test.NS.QueryableCollectionMixin)
      @mixin(Test.NS.MongoCollectionMixin)
      class TestCollection extends Test.NS.Collection {
        @nameBy static __filename = 'TestCollection';
        @meta static object = {};

        @property configs = configs;
      }

      @initialize
      @partOf(Test)
      class TestRecord extends Test.NS.Record {
        @nameBy static __filename = 'TestRecord';
        @meta static object = {};
        @Test.NS.attribute({ type: 'number' }) cid = -1;
        @Test.NS.attribute({ type: 'string' }) data = '';
      }
      const collection = TestCollection.new('TEST_COLLECTION', Object.assign({}, {
        delegate: 'TestRecord'
      }, connectionData));
      collection.onRegister();
      const date = new Date();
      const query = Test.NS.Query.new()
        .forIn({ '@doc': collection.collectionFullName() })
        .filter({
          '@doc.cid': { $gt: 2 }
        })
        .avg('cid');
      const result1 = await collection.parseQuery(query);
      const result2 = await collection.parseQuery({
        '$forIn': {
          '@doc': collection.collectionFullName()
        },
        '$filter': {
          '@doc.cid': { $gt: 2 }
        },
        '$avg': 'cid'
      });
      const correctResult = {
        pipeline: [
          {
            $match: {
              $and: [{
                cid: { $gt: 2 }
              }]
            }
          },
          {
            $qroup: {
              _id: null,
              result: {
                $avg: '$cid'
              }
            }
          },
          {
            $project: {
              _id: 0,
              result: "$cid"
            }
          }
        ],
        queryType: 'query',
        isCustomReturn: true
      };
      assert.deepEqual(result1, correctResult);
      assert.deepEqual(result2, correctResult);
      await collection.onRemove();
    });
    it('Check correctness logic of the "parseQuery" method for "sort" records', async () => {

      @initialize
      @plugin(MongoAddon)
      @plugin(MapperAddon)
      class Test extends LeanES {
        @nameBy static __filename = 'Test';
        @meta static object = {};
        @constant ROOT = __dirname;
      }

      @initialize
      @partOf(Test)
      @mixin(Test.NS.QueryableCollectionMixin)
      @mixin(Test.NS.MongoCollectionMixin)
      class TestCollection extends Test.NS.Collection {
        @nameBy static __filename = 'TestCollection';
        @meta static object = {};

        @property configs = configs;
      }

      @initialize
      @partOf(Test)
      class TestRecord extends Test.NS.Record {
        @nameBy static __filename = 'TestRecord';
        @meta static object = {};
        @Test.NS.attribute({ type: 'number' }) cid = -1;
        @Test.NS.attribute({ type: 'string' }) data = '';
      }
      const collection = TestCollection.new('TEST_COLLECTION', Object.assign({}, {
        delegate: 'TestRecord'
      }, connectionData));
      collection.onRegister();
      const date = new Date();
      const query = Test.NS.Query.new()
        .forIn({ '@doc': collection.collectionFullName() })
        .filter({
          '@doc.cid': { $gt: 2 }
        })
        .sort({
          cid: 'DESC'
        })
        .sort({
          data: 'ASC'
        });
      const result1 = await collection.parseQuery(query);
      const result2 = await collection.parseQuery({
        '$forIn': {
          '@doc': collection.collectionFullName()
        },
        '$filter': {
          '@doc.cid': { $gt: 2 }
        },
        '$sort': [
          { cid: 'DESC' },
          { data: 'ASC' }
        ]
      });
      const correctResult = {
        pipeline: [
          {
            $match: {
              $and: [{
                cid: { $gt: 2 }
              }]
            }
          },
          {
            $sort: {
              cid: -1,
              data: 1
            }
          }
        ],
        queryType: 'query',
        isCustomReturn: false
      };
      assert.deepEqual(result1, correctResult);
      assert.deepEqual(result2, correctResult);
      await collection.onRemove();
    });
    it('Check correctness logic of the "parseQuery" method for "limit" records', async () => {

      @initialize
      @plugin(MongoAddon)
      @plugin(MapperAddon)
      class Test extends LeanES {
        @nameBy static __filename = 'Test';
        @meta static object = {};
        @constant ROOT = __dirname;
      }

      @initialize
      @partOf(Test)
      @mixin(Test.NS.QueryableCollectionMixin)
      @mixin(Test.NS.MongoCollectionMixin)
      class TestCollection extends Test.NS.Collection {
        @nameBy static __filename = 'TestCollection';
        @meta static object = {};

        @property configs = configs;
      }

      @initialize
      @partOf(Test)
      class TestRecord extends Test.NS.Record {
        @nameBy static __filename = 'TestRecord';
        @meta static object = {};
        @Test.NS.attribute({ type: 'number' }) cid = -1;
        @Test.NS.attribute({ type: 'string' }) data = '';
      }
      const collection = TestCollection.new('TEST_COLLECTION', Object.assign({}, {
        delegate: 'TestRecord'
      }, connectionData));
      collection.onRegister();
      const date = new Date();
      const query = Test.NS.Query.new()
        .forIn({ '@doc': collection.collectionFullName() })
        .filter({
          '@doc.cid': { $gt: 2 }
        })
        .limit(1);
      const result1 = await collection.parseQuery(query);
      const result2 = await collection.parseQuery({
        '$forIn': {
          '@doc': collection.collectionFullName()
        },
        '$filter': {
          '@doc.cid': { $gt: 2 }
        },
        '$limit': 1
      });
      const correctResult = {
        pipeline: [
          {
            $match: {
              $and: [{ cid: { $gt: 2 } }]
            }
          },
          {
            $limit: 1
          }
        ],
        queryType: 'query',
        isCustomReturn: false
      };
      assert.deepEqual(result1, correctResult);
      assert.deepEqual(result2, correctResult);
      await collection.onRemove();
    });
    it('Check correctness logic of the "parseQuery" method for "offset" records', async () => {

      @initialize
      @plugin(MongoAddon)
      @plugin(MapperAddon)
      class Test extends LeanES {
        @nameBy static __filename = 'Test';
        @meta static object = {};
        @constant ROOT = __dirname;
      }

      @initialize
      @partOf(Test)
      @mixin(Test.NS.QueryableCollectionMixin)
      @mixin(Test.NS.MongoCollectionMixin)
      class TestCollection extends Test.NS.Collection {
        @nameBy static __filename = 'TestCollection';
        @meta static object = {};

        @property configs = configs;
      }

      @initialize
      @partOf(Test)
      class TestRecord extends Test.NS.Record {
        @nameBy static __filename = 'TestRecord';
        @meta static object = {};
        @Test.NS.attribute({ type: 'number' }) cid = -1;
        @Test.NS.attribute({ type: 'string' }) data = '';
      }
      const collection = TestCollection.new('TEST_COLLECTION', Object.assign({}, {
        delegate: 'TestRecord'
      }, connectionData));
      collection.onRegister();
      const date = new Date();
      const query = Test.NS.Query.new()
        .forIn({ '@doc': collection.collectionFullName() })
        .filter({
          '@doc.cid': { $gt: 2 }
        })
        .offset(1);
      const result1 = await collection.parseQuery(query);
      const result2 = await collection.parseQuery({
        '$forIn': {
          '@doc': collection.collectionFullName()
        },
        '$filter': {
          '@doc.cid': { $gt: 2 }
        },
        '$ofset': 1
      });
      const correctResult = {
        pipeline: [
          {
            $match: {
              $and: [{ cid: { $gt: 2 } }]
            }
          },
          {
            $skip: 1
          }
        ],
        queryType: 'query',
        isCustomReturn: false
      };
      assert.deepEqual(result1, correctResult);
      assert.deepEqual(result2, correctResult);
      await collection.onRemove();
    });
    it('Check correctness logic of the "parseQuery" method for "collect" records, with using "into"', async () => {

      @initialize
      @plugin(MongoAddon)
      @plugin(MapperAddon)
      class Test extends LeanES {
        @nameBy static __filename = 'Test';
        @meta static object = {};
        @constant ROOT = __dirname;
      }

      @initialize
      @partOf(Test)
      @mixin(Test.NS.QueryableCollectionMixin)
      @mixin(Test.NS.MongoCollectionMixin)
      class TestCollection extends Test.NS.Collection {
        @nameBy static __filename = 'TestCollection';
        @meta static object = {};

        @property configs = configs;
      }

      @initialize
      @partOf(Test)
      class TestRecord extends Test.NS.Record {
        @nameBy static __filename = 'TestRecord';
        @meta static object = {};
        @Test.NS.attribute({ type: 'number' }) cid = -1;
        @Test.NS.attribute({ type: 'string' }) data = '';
      }
      const collection = TestCollection.new('TEST_COLLECTION', Object.assign({}, {
        delegate: 'TestRecord'
      }, connectionData));
      collection.onRegister();
      const date = new Date();
      const query = Test.NS.Query.new()
        .forIn({ '@doc': collection.collectionFullName() })
        .filter({
          '@doc.cid': { $gt: 2 }
        })
        .collect({ date: '$createdAt' })
        .into('data');
      const result1 = await collection.parseQuery(query);
      const result2 = await collection.parseQuery({
        '$forIn': {
          '@doc': collection.collectionFullName()
        },
        '$filter': {
          '@doc.cid': { $gt: 2 }
        },
        '$collect': {
          date: '$createdAt'
        },
        '$ofset': 'data'
      });
      const correctResult = {
        pipeline: [
          {
            $match: {
              $and: [{ cid: { $gt: 2 } }]
            }
          },
          {
            $group: {
              _id: {
                date: '$createdAt'
              },
              data: {
                $push: {
                  id: '$id',
                  rev: '$rev',
                  type: '$type',
                  cid: '$cid',
                  data: '$data',
                  isHidden: '$isHidden',
                  createdAt: '$createdAt',
                  deletedAt: '$deletedAt',
                  updatedAt: '$updatedAt'
                }
              }
            }
          }
        ],
        queryType: 'query',
        isCustomReturn: true
      };
      assert.deepEqual(result1, correctResult);
      assert.deepEqual(result2, correctResult);
      await collection.onRemove();
    });
    it('Check correctness logic of the "parseQuery" method for "having" records', async () => {

      @initialize
      @plugin(MongoAddon)
      @plugin(MapperAddon)
      class Test extends LeanES {
        @nameBy static __filename = 'Test';
        @meta static object = {};
        @constant ROOT = __dirname;
      }

      @initialize
      @partOf(Test)
      @mixin(Test.NS.QueryableCollectionMixin)
      @mixin(Test.NS.MongoCollectionMixin)
      class TestCollection extends Test.NS.Collection {
        @nameBy static __filename = 'TestCollection';
        @meta static object = {};

        @property configs = configs;
      }

      @initialize
      @partOf(Test)
      class TestRecord extends Test.NS.Record {
        @nameBy static __filename = 'TestRecord';
        @meta static object = {};
        @Test.NS.attribute({ type: 'number' }) cid = -1;
        @Test.NS.attribute({ type: 'string' }) data = '';
      }
      const collection = TestCollection.new('TEST_COLLECTION', Object.assign({}, {
        delegate: 'TestRecord'
      }, connectionData));
      collection.onRegister();
      const date = new Date();
      const query = Test.NS.Query.new()
        .forIn({ '@doc': collection.collectionFullName() })
        .filter({
          '@doc.cid': { $gt: 2 }
        })
        .having({
          '@doc.cid': { $lt: 3 }
        });
      const result1 = await collection.parseQuery(query);
      const result2 = await collection.parseQuery({
        '$forIn': {
          '@doc': collection.collectionFullName()
        },
        '$filter': {
          '@doc.cid': { $gt: 2 }
        },
        '$having': {
          '@doc.cid': { $lt: 3 }
        }
      });
      const correctResult = {
        pipeline: [
          {
            $match: {
              $and: [{ cid: { $gt: 2 } }]
            },
            $match: {
              $and: [{ cid: { $lt: 3 } }]
            }
          }
        ],
        queryType: 'query',
        isCustomReturn: false
      };
      assert.deepEqual(result1, correctResult);
      assert.deepEqual(result2, correctResult);
      await collection.onRemove();
    });
    it('Check correctness logic of the "parseQuery" method for simple format "return" records', async () => {

      @initialize
      @plugin(MongoAddon)
      @plugin(MapperAddon)
      class Test extends LeanES {
        @nameBy static __filename = 'Test';
        @meta static object = {};
        @constant ROOT = __dirname;
      }

      @initialize
      @partOf(Test)
      @mixin(Test.NS.QueryableCollectionMixin)
      @mixin(Test.NS.MongoCollectionMixin)
      class TestCollection extends Test.NS.Collection {
        @nameBy static __filename = 'TestCollection';
        @meta static object = {};

        @property configs = configs;
      }

      @initialize
      @partOf(Test)
      class TestRecord extends Test.NS.Record {
        @nameBy static __filename = 'TestRecord';
        @meta static object = {};
        @Test.NS.attribute({ type: 'number' }) cid = -1;
        @Test.NS.attribute({ type: 'string' }) data = '';
      }
      const collection = TestCollection.new('TEST_COLLECTION', Object.assign({}, {
        delegate: 'TestRecord'
      }, connectionData));
      collection.onRegister();
      const date = new Date();
      const query = Test.NS.Query.new()
        .forIn({ '@doc': collection.collectionFullName() })
        .filter({
          '@doc.cid': { $gt: 2 }
        })
        .return('data')
      const result1 = await collection.parseQuery(query);
      const result2 = await collection.parseQuery({
        '$forIn': {
          '@doc': collection.collectionFullName()
        },
        '$filter': {
          '@doc.cid': { $gt: 2 }
        },
        '$return': '@doc.data'
      });
      const correctResult = {
        pipeline: [
          {
            $match: {
              $and: [{ cid: { $gt: 2 } }]
            },
            $project: {
              _id: 0,
              data: 1
            }
          }
        ],
        queryType: 'query',
        isCustomReturn: true
      };
      assert.deepEqual(result1, correctResult);
      assert.deepEqual(result2, correctResult);
      await collection.onRemove();
    });
    it('Check correctness logic of the "parseQuery" method for complex format "return" records', async () => {

      @initialize
      @plugin(MongoAddon)
      @plugin(MapperAddon)
      class Test extends LeanES {
        @nameBy static __filename = 'Test';
        @meta static object = {};
        @constant ROOT = __dirname;
      }

      @initialize
      @partOf(Test)
      @mixin(Test.NS.QueryableCollectionMixin)
      @mixin(Test.NS.MongoCollectionMixin)
      class TestCollection extends Test.NS.Collection {
        @nameBy static __filename = 'TestCollection';
        @meta static object = {};

        @property configs = configs;
      }

      @initialize
      @partOf(Test)
      class TestRecord extends Test.NS.Record {
        @nameBy static __filename = 'TestRecord';
        @meta static object = {};
        @Test.NS.attribute({ type: 'number' }) cid = -1;
        @Test.NS.attribute({ type: 'string' }) data = '';
      }
      const collection = TestCollection.new('TEST_COLLECTION', Object.assign({}, {
        delegate: 'TestRecord'
      }, connectionData));
      collection.onRegister();
      const date = new Date();
      const query = Test.NS.Query.new()
        .forIn({ '@doc': collection.collectionFullName() })
        .filter({
          '@doc.cid': { $gt: 2 }
        })
        .return({
          superdata: 'data'
        })
      const result1 = await collection.parseQuery(query);
      const result2 = await collection.parseQuery({
        '$forIn': {
          '@doc': collection.collectionFullName()
        },
        '$filter': {
          '@doc.cid': { $gt: 2 }
        },
        '$return': { superdata: '@doc.data' }
      });
      const correctResult = {
        pipeline: [
          {
            $match: {
              $and: [{ cid: { $gt: 2 } }]
            },
            $addFields: {
              superdata: '$data'
            },
            $project: {
              superdata: 1
            }
          }
        ],
        queryType: 'query',
        isCustomReturn: true
      };
      assert.deepEqual(result1, correctResult);
      assert.deepEqual(result2, correctResult);
      await collection.onRemove();
    });
    it('Check correctness logic of the "parseQuery" method for "return" with "distinct" format records', async () => {

      @initialize
      @plugin(MongoAddon)
      @plugin(MapperAddon)
      class Test extends LeanES {
        @nameBy static __filename = 'Test';
        @meta static object = {};
        @constant ROOT = __dirname;
      }

      @initialize
      @partOf(Test)
      @mixin(Test.NS.QueryableCollectionMixin)
      @mixin(Test.NS.MongoCollectionMixin)
      class TestCollection extends Test.NS.Collection {
        @nameBy static __filename = 'TestCollection';
        @meta static object = {};

        @property configs = configs;
      }

      @initialize
      @partOf(Test)
      class TestRecord extends Test.NS.Record {
        @nameBy static __filename = 'TestRecord';
        @meta static object = {};
        @Test.NS.attribute({ type: 'number' }) cid = -1;
        @Test.NS.attribute({ type: 'string' }) data = '';
      }
      const collection = TestCollection.new('TEST_COLLECTION', Object.assign({}, {
        delegate: 'TestRecord'
      }, connectionData));
      collection.onRegister();
      const date = new Date();
      const query = Test.NS.Query.new()
        .forIn({ '@doc': collection.collectionFullName() })
        .filter({
          '@doc.cid': { $gt: 2 }
        })
        .return('data')
        .distinct()
      const result1 = await collection.parseQuery(query);
      const result2 = await collection.parseQuery({
        '$forIn': {
          '@doc': collection.collectionFullName()
        },
        '$filter': {
          '@doc.cid': { $gt: 2 }
        },
        '$return': '@doc.data',
        '$distinct': true
      });
      const correctResult = {
        pipeline: [
          {
            $match: {
              $and: [{ cid: { $gt: 2 } }]
            },
            $project: {
              _id: 0,
              data: 1
            },
            $group: {
              _id: "$$CURRENT"
            }
          }
        ],
        queryType: 'query',
        isCustomReturn: true
      };
      assert.deepEqual(result1, correctResult);
      assert.deepEqual(result2, correctResult);
      await collection.onRemove();
    });
  });
  describe('.executeQuery', () => {
    it('Check correctness logic of the "executeQuery" method for "removeBy" record', async () => {

      @initialize
      @plugin(MongoAddon)
      @plugin(MapperAddon)
      class Test extends LeanES {
        @nameBy static __filename = 'Test';
        @meta static object = {};
        @constant ROOT = __dirname;
      }

      @initialize
      @partOf(Test)
      @mixin(Test.NS.QueryableCollectionMixin)
      @mixin(Test.NS.MongoCollectionMixin)
      class TestCollection extends Test.NS.Collection {
        @nameBy static __filename = 'TestCollection';
        @meta static object = {};

        @property configs = configs;
      }

      @initialize
      @partOf(Test)
      class TestRecord extends Test.NS.Record {
        @nameBy static __filename = 'TestRecord';
        @meta static object = {};
        @Test.NS.attribute({ type: 'number' }) cid = -1;
        @Test.NS.attribute({ type: 'string' }) data = '';
      }
      const collection = TestCollection.new('TEST_COLLECTION', Object.assign({}, {
        delegate: 'TestRecord'
      }, connectionData));
      collection.onRegister();
      collection.initializeNotifier('TEST');
      const query = Test.NS.Query.new()
        .forIn({ '@doc': collection.collectionFullName() })
        .into(collection.collectionFullName())
        .filter({
          '@doc.cid': { $eq: 6 }
        })
        .remove('@doc');
      const result = await collection.executeQuery(query);
      const resultArray = await result.toArray();
      assert.strictEqual(resultArray.length, 0);
      await collection.onRemove();
    });
    it('Check correctness logic of the "parseQuery" method for "find" records', async () => {

      @initialize
      @plugin(MongoAddon)
      @plugin(MapperAddon)
      class Test extends LeanES {
        @nameBy static __filename = 'Test';
        @meta static object = {};
        @constant ROOT = __dirname;
      }

      @initialize
      @partOf(Test)
      @mixin(Test.NS.QueryableCollectionMixin)
      @mixin(Test.NS.MongoCollectionMixin)
      class TestCollection extends Test.NS.Collection {
        @nameBy static __filename = 'TestCollection';
        @meta static object = {};

        @property configs = configs;
      }

      @initialize
      @partOf(Test)
      class TestRecord extends Test.NS.Record {
        @nameBy static __filename = 'TestRecord';
        @meta static object = {};
        @Test.NS.attribute({ type: 'number' }) cid = -1;
        @Test.NS.attribute({ type: 'string' }) data = '';
      }
      const collection = TestCollection.new('TEST_COLLECTION', Object.assign({}, {
        delegate: 'TestRecord'
      }, connectionData));
      collection.onRegister();
      collection.initializeNotifier('TEST');
      const query = {
        queryType: 'query',
        pipeline: [{
          $match: {
            $and: [{ cid: { $gt: 2 } }]
          }
        }, {
          $sort: {
            cid: -1,
            data: 1
          }
        }, {
          $limit: 1
        }],
        isCustomReturn: true
      };
      const result = await collection.executeQuery(query);
      const resultArray = await result.toArray();
      assert.strictEqual(resultArray[0].cid, 4);
      assert.strictEqual(resultArray[0].data, 'a boat');
      await collection.onRemove();
    });
  });
  describe('.take', () => {
    it('Check correctness logic of the "take" function', async () => {

      @initialize
      @plugin(MongoAddon)
      @plugin(MapperAddon)
      class Test extends LeanES {
        @nameBy static __filename = 'Test';
        @meta static object = {};
        @constant ROOT = __dirname;
      }

      @initialize
      @partOf(Test)
      @mixin(Test.NS.QueryableCollectionMixin)
      @mixin(Test.NS.MongoCollectionMixin)
      class TestCollection extends Test.NS.Collection {
        @nameBy static __filename = 'TestCollection';
        @meta static object = {};

        @property configs = configs;
      }

      @initialize
      @partOf(Test)
      class TestRecord extends Test.NS.Record {
        @nameBy static __filename = 'TestRecord';
        @meta static object = {};
        @Test.NS.attribute({ type: 'number' }) cid = -1;
        @Test.NS.attribute({ type: 'string' }) data = '';
      }
      const collection = TestCollection.new('TEST_COLLECTION', Object.assign({}, {
        delegate: 'TestRecord'
      }, connectionData));
      collection.onRegister();
      collection.initializeNotifier('TEST');
      const result = await collection.take('r4');
      assert.instanceOf(result, TestRecord);
      assert.strictEqual(result.cid, 4);
      assert.strictEqual(result.data, 'a boat');
      await collection.onRemove();
    });
  });
  describe('.takeMany', () => {
    it('Check correctness logic of the "takeMany" function', async () => {

      @initialize
      @plugin(MongoAddon)
      @plugin(MapperAddon)
      class Test extends LeanES {
        @nameBy static __filename = 'Test';
        @meta static object = {};
        @constant ROOT = __dirname;
      }

      @initialize
      @partOf(Test)
      @mixin(Test.NS.QueryableCollectionMixin)
      @mixin(Test.NS.MongoCollectionMixin)
      class TestCollection extends Test.NS.Collection {
        @nameBy static __filename = 'TestCollection';
        @meta static object = {};

        @property configs = configs;
      }

      @initialize
      @partOf(Test)
      class TestRecord extends Test.NS.Record {
        @nameBy static __filename = 'TestRecord';
        @meta static object = {};
        @Test.NS.attribute({ type: 'number' }) cid = -1;
        @Test.NS.attribute({ type: 'string' }) data = '';
      }
      const collection = TestCollection.new('TEST_COLLECTION', Object.assign({}, {
        delegate: 'TestRecord'
      }, connectionData));
      collection.onRegister();
      collection.initializeNotifier('TEST');
      const result = await collection.takeMany(['e3', 'r4']);
      const resultArray = await result.toArray();
      assert.strictEqual(resultArray.length, 2);
      assert.strictEqual(resultArray[1].cid, 4);
      assert.strictEqual(resultArray[1].data, 'a boat');
      await collection.onRemove();
    });
  });
  describe('.takeAll', () => {
    it('Check correctness logic of the "takeAll" function', async () => {

      @initialize
      @plugin(MongoAddon)
      @plugin(MapperAddon)
      class Test extends LeanES {
        @nameBy static __filename = 'Test';
        @meta static object = {};
        @constant ROOT = __dirname;
      }

      @initialize
      @partOf(Test)
      @mixin(Test.NS.QueryableCollectionMixin)
      @mixin(Test.NS.MongoCollectionMixin)
      class TestCollection extends Test.NS.Collection {
        @nameBy static __filename = 'TestCollection';
        @meta static object = {};

        @property configs = configs;
      }

      @initialize
      @partOf(Test)
      class TestRecord extends Test.NS.Record {
        @nameBy static __filename = 'TestRecord';
        @meta static object = {};
        @Test.NS.attribute({ type: 'number' }) cid = -1;
        @Test.NS.attribute({ type: 'string' }) data = '';
      }
      const collection = TestCollection.new('TEST_COLLECTION', Object.assign({}, {
        delegate: 'TestRecord'
      }, connectionData));
      collection.onRegister();
      collection.initializeNotifier('TEST');
      const result = await collection.takeAll();
      const resultArray = await result.toArray();
      assert.strictEqual(resultArray.length, 4);
      assert.strictEqual(resultArray[1].cid, 2);
      assert.strictEqual(resultArray[1].data, 'men');
      await collection.onRemove();
    });
  });
  describe('.includes', () => {
    it('', () => {

    })
    it('Check correctness logic of the "includes" function', async () => {

      @initialize
      @plugin(MongoAddon)
      @plugin(MapperAddon)
      class Test extends LeanES {
        @nameBy static __filename = 'Test';
        @meta static object = {};
        @constant ROOT = __dirname;
      }

      @initialize
      @partOf(Test)
      @mixin(Test.NS.QueryableCollectionMixin)
      @mixin(Test.NS.MongoCollectionMixin)
      class TestCollection extends Test.NS.Collection {
        @nameBy static __filename = 'TestCollection';
        @meta static object = {};

        @property configs = configs;
      }

      @initialize
      @partOf(Test)
      class TestRecord extends Test.NS.Record {
        @nameBy static __filename = 'TestRecord';
        @meta static object = {};
        @Test.NS.attribute({ type: 'number' }) cid = -1;
        @Test.NS.attribute({ type: 'string' }) data = '';
      }
      const collection = TestCollection.new('TEST_COLLECTION', Object.assign({}, {
        delegate: 'TestRecord'
      }, connectionData));
      collection.onRegister();
      collection.initializeNotifier('TEST');
      let result = await collection.includes('w2');
      assert.isTrue(result);
      result = await collection.includes('w3');
      assert.isFalse(result);
      await collection.onRemove();
    });
  });
  describe('.length', () => {
    it('Check correctness logic of the "length" function', async () => {

      @initialize
      @plugin(MongoAddon)
      @plugin(MapperAddon)
      class Test extends LeanES {
        @nameBy static __filename = 'Test';
        @meta static object = {};
        @constant ROOT = __dirname;
      }

      @initialize
      @partOf(Test)
      @mixin(Test.NS.QueryableCollectionMixin)
      @mixin(Test.NS.MongoCollectionMixin)
      class TestCollection extends Test.NS.Collection {
        @nameBy static __filename = 'TestCollection';
        @meta static object = {};

        @property configs = configs;
      }

      @initialize
      @partOf(Test)
      class TestRecord extends Test.NS.Record {
        @nameBy static __filename = 'TestRecord';
        @meta static object = {};
        @Test.NS.attribute({ type: 'number' }) cid = -1;
        @Test.NS.attribute({ type: 'string' }) data = '';
      }
      const collection = TestCollection.new('TEST_COLLECTION', Object.assign({}, {
        delegate: 'TestRecord'
      }, connectionData));
      collection.onRegister();
      collection.initializeNotifier('TEST');
      const result = await collection.length();
      assert.strictEqual(result, 4);
      await collection.onRemove();
    });
  });
  describe('.push', () => {
    it('Check correctness logic of the "push" function', async () => {

      @initialize
      @plugin(MongoAddon)
      @plugin(MapperAddon)
      class Test extends LeanES {
        @nameBy static __filename = 'Test';
        @meta static object = {};
        @constant ROOT = __dirname;
      }

      @initialize
      @partOf(Test)
      @mixin(Test.NS.QueryableCollectionMixin)
      @mixin(Test.NS.MongoCollectionMixin)
      class TestCollection extends Test.NS.Collection {
        @nameBy static __filename = 'TestCollection';
        @meta static object = {};

        @property configs = configs;
      }

      @initialize
      @partOf(Test)
      class TestRecord extends Test.NS.Record {
        @nameBy static __filename = 'TestRecord';
        @meta static object = {};
        @Test.NS.attribute({ type: 'number' }) cid = -1;
        @Test.NS.attribute({ type: 'string' }) data = '';
      }
      const collection = TestCollection.new('TEST_COLLECTION', Object.assign({}, {
        delegate: 'TestRecord'
      }, connectionData));
      collection.onRegister();
      collection.initializeNotifier('TEST');
      const date = new Date();
      const testRecord = TestRecord.new({
        id: 'u7',
        type: 'Test::TestRecord',
        cid: 7,
        data: ' :)',
        createdAt: date,
        updatedAt: date
      }, collection);
      const result = await collection.push(testRecord);
      assert.isTrue(result != null);
      const insertedResult = await collection.take('u7');
      assert.strictEqual(insertedResult.cid, 7);
      assert.strictEqual(insertedResult.data, ' :)');
      await collection.onRemove();
    });
  });
  describe('.override', () => {
    it('Check correctness logic of the "override" function', async () => {

      @initialize
      @plugin(MongoAddon)
      @plugin(MapperAddon)
      class Test extends LeanES {
        @nameBy static __filename = 'Test';
        @meta static object = {};
        @constant ROOT = __dirname;
      }

      @initialize
      @partOf(Test)
      @mixin(Test.NS.QueryableCollectionMixin)
      @mixin(Test.NS.MongoCollectionMixin)
      class TestCollection extends Test.NS.Collection {
        @nameBy static __filename = 'TestCollection';
        @meta static object = {};

        @property configs = configs;
      }

      @initialize
      @partOf(Test)
      class TestRecord extends Test.NS.Record {
        @nameBy static __filename = 'TestRecord';
        @meta static object = {};
        @Test.NS.attribute({ type: 'number' }) cid = -1;
        @Test.NS.attribute({ type: 'string' }) data = '';
      }
      const collection = TestCollection.new('TEST_COLLECTION', Object.assign({}, {
        delegate: 'TestRecord'
      }, connectionData));
      collection.onRegister();
      collection.initializeNotifier('TEST');
      const date = new Date();
      const testRecord = await collection.take('u7');
      assert.isTrue(testRecord != null);
      testRecord.data = ' ;)';
      assert.strictEqual(testRecord.data, ' ;)');
      const resultObject = await collection.override(testRecord.id, testRecord);
      assert.strictEqual(resultObject.cid, 7);
      assert.strictEqual(resultObject.data, ' ;)');
      const overridedResult = await collection.take('u7');
      assert.strictEqual(overridedResult.cid, 7);
      assert.strictEqual(overridedResult.data, ' ;)');
      await collection.onRemove();
    });
  });
  describe('.patch', () => {
    it('Check correctness logic of the "patch" function', async () => {

      @initialize
      @plugin(MongoAddon)
      @plugin(MapperAddon)
      class Test extends LeanES {
        @nameBy static __filename = 'Test';
        @meta static object = {};
        @constant ROOT = __dirname;
      }

      @initialize
      @partOf(Test)
      @mixin(Test.NS.QueryableCollectionMixin)
      @mixin(Test.NS.MongoCollectionMixin)
      class TestCollection extends Test.NS.Collection {
        @nameBy static __filename = 'TestCollection';
        @meta static object = {};

        @property configs = configs;
      }

      @initialize
      @partOf(Test)
      class TestRecord extends Test.NS.Record {
        @nameBy static __filename = 'TestRecord';
        @meta static object = {};
        @Test.NS.attribute({ type: 'number' }) cid = -1;
        @Test.NS.attribute({ type: 'string' }) data = '';
      }
      const collection = TestCollection.new('TEST_COLLECTION', Object.assign({}, {
        delegate: 'TestRecord'
      }, connectionData));
      collection.onRegister();
      collection.initializeNotifier('TEST');
      const date = new Date();
      const testRecord = await collection.take('u7');
      assert.isTrue(testRecord != null);
      testRecord.data = ' ;-)';
      assert.strictEqual(testRecord.data, ' ;-)');
      const resultObject = await collection.override(testRecord.id, testRecord);
      assert.strictEqual(resultObject.cid, 7);
      assert.strictEqual(resultObject.data, ' ;-)');
      const overridedResult = await collection.take('u7');
      assert.strictEqual(overridedResult.cid, 7);
      assert.strictEqual(overridedResult.data, ' ;-)');
      await collection.onRemove();
    });
  });
  describe('.remove', () => {
    it('Check correctness logic of the "remove" function', async () => {

      @initialize
      @plugin(MongoAddon)
      @plugin(MapperAddon)
      class Test extends LeanES {
        @nameBy static __filename = 'Test';
        @meta static object = {};
        @constant ROOT = __dirname;
      }

      @initialize
      @partOf(Test)
      @mixin(Test.NS.QueryableCollectionMixin)
      @mixin(Test.NS.MongoCollectionMixin)
      class TestCollection extends Test.NS.Collection {
        @nameBy static __filename = 'TestCollection';
        @meta static object = {};

        @property configs = configs;
      }

      @initialize
      @partOf(Test)
      class TestRecord extends Test.NS.Record {
        @nameBy static __filename = 'TestRecord';
        @meta static object = {};
        @Test.NS.attribute({ type: 'number' }) cid = -1;
        @Test.NS.attribute({ type: 'string' }) data = '';
      }
      let collection = TestCollection.new('TEST_COLLECTION', Object.assign({}, {
        delegate: 'TestRecord'
      }, connectionData));
      collection.onRegister();
      collection.initializeNotifier('TEST1');
      const notDeletedResult = await collection.take('u7');
      assert.isTrue(notDeletedResult != null);
      await collection.onRemove();
      collection = TestCollection.new('TEST_COLLECTION', Object.assign({}, {
        delegate: 'TestRecord'
      }, connectionData));
      collection.onRegister();
      collection.initializeNotifier('TEST2');
      const result = await collection.remove(notDeletedResult.id);
      assert.isUndefined(result);
      await collection.onRemove();
      collection = TestCollection.new('TEST_COLLECTION', Object.assign({}, {
        delegate: 'TestRecord'
      }, connectionData));
      collection.onRegister();
      collection.initializeNotifier('TEST3');
      const deletedResult = await collection.take('u7');
      assert.isFalse(deletedResult != null);
      await collection.onRemove();
    });
  });
  describe('.createFileWriteStream', () => {
    it('Check correctness logic of the "createFileWriteStream" function', async () => {

      @initialize
      @plugin(MongoAddon)
      @plugin(MapperAddon)
      class Test extends LeanES {
        @nameBy static __filename = 'Test';
        @meta static object = {};
        @constant ROOT = __dirname;
      }

      @initialize
      @partOf(Test)
      @mixin(Test.NS.QueryableCollectionMixin)
      @mixin(Test.NS.MongoCollectionMixin)
      class TestCollection extends Test.NS.Collection {
        @nameBy static __filename = 'TestCollection';
        @meta static object = {};

        @property configs = configs;
      }

      @initialize
      @partOf(Test)
      class TestRecord extends Test.NS.Record {
        @nameBy static __filename = 'TestRecord';
        @meta static object = {};
        @Test.NS.attribute({ type: 'number' }) cid = -1;
        @Test.NS.attribute({ type: 'string' }) data = '';
      }
      let collection = TestCollection.new('TEST_COLLECTION', Object.assign({}, {
        delegate: 'TestRecord'
      }, connectionData));
      collection.onRegister();
      collection.initializeNotifier('TEST1');
      const { mongodb: { dbName } } = connectionData;
      const collectionName = 'binary-store';
      const connection = await collection.connection;
      const voDB = await createConnection(`${dbName}_fs`);
      const filesCollection = await voDB.collection(`${collectionName}.files`);
      const chunksCollection = await voDB.collection(`${collectionName}.chunks`);

      const readFileStream = fs.createReadStream(`${__dirname}/test-data/gridfs-test`);
      const licenseFile = fs.readFileSync(`${__dirname}/test-data/gridfs-test`);
      const stream = await collection.createFileWriteStream({
        _id: 'license.test'
      });
      const id = stream.id;
      const promise = LeanES.NS.Promise.new((resolve, reject) => {
        stream.once('finish', resolve);
      });
      readFileStream.pipe(stream);
      await promise;

      const chunksQuery = await chunksCollection.find({ files_id: id });

      let docs = await chunksQuery.toArray();
      assert.strictEqual(docs.length, 1);
      assert.strictEqual(docs[0].data.toString('hex'), licenseFile.toString('hex'));

      const filesQuery = await filesCollection.find({ _id: id });

      docs = await filesQuery.toArray();
      assert.strictEqual(docs.length, 1);

      const hash = crypto.createHash('md5');
      hash.update(licenseFile);
      assert.strictEqual(docs[0].md5, hash.digest('hex'));

      let indexes = await filesCollection.listIndexes().toArray();
      assert.strictEqual(indexes.length, 2);
      assert.strictEqual(indexes[1].name, 'filename_1_uploadDate_1');

      indexes = await chunksCollection.listIndexes().toArray();
      assert.strictEqual(indexes.length, 2);
      assert.strictEqual(indexes[1].name, 'files_id_1_n_1');
      await collection.onRemove();
    });
  });
  describe('.createFileReadStream', () => {
    it('Check correctness logic of the "createFileWriteStream" function', async () => {

      @initialize
      @plugin(MongoAddon)
      @plugin(MapperAddon)
      class Test extends LeanES {
        @nameBy static __filename = 'Test';
        @meta static object = {};
        @constant ROOT = __dirname;
      }

      @initialize
      @partOf(Test)
      @mixin(Test.NS.QueryableCollectionMixin)
      @mixin(Test.NS.MongoCollectionMixin)
      class TestCollection extends Test.NS.Collection {
        @nameBy static __filename = 'TestCollection';
        @meta static object = {};

        @property configs = configs;
      }

      @initialize
      @partOf(Test)
      class TestRecord extends Test.NS.Record {
        @nameBy static __filename = 'TestRecord';
        @meta static object = {};
        @Test.NS.attribute({ type: 'number' }) cid = -1;
        @Test.NS.attribute({ type: 'string' }) data = '';
      }
      let collection = TestCollection.new('TEST_COLLECTION', Object.assign({}, {
        delegate: 'TestRecord'
      }, connectionData));
      collection.onRegister();
      collection.initializeNotifier('TEST');

      const readFileStream = fs.createReadStream(`${__dirname}/test-data/gridfs-test`);
      const licenseFile = fs.readFileSync(`${__dirname}/test-data/gridfs-test`);
      const stream = await collection.createFileWriteStream({
        _id: 'license.test'
      });
      let promise = LeanES.Promise.new((resolve, reject) => {
        stream.once('finish', resolve);
      });
      readFileStream.pipe(stream);
      await promise;

      const readStream = await collection.createFileReadStream({ _id: 'license.test' });
      const gotData = false;
      const buffer = Buffer.from([]);
      promise = LeanES.Promise.new((resolve, reject) => {
        readStream.once('end', resolve);
        readStream.on('data', (chunk) => {
          gotData = true;
          buffer = Buffer.concat([buffer, chunk], buffer.length + chunk.length);
        });
      });
      await promise;
      assert.include(buffer.toString('utf8'), 'TERMS AND CONDITIONS');
      assert.isTrue(gotData);
      await collection.onRemove();
    });
  });
  describe('.fileExists', () => {
    it('', async () => {

      @initialize
      @plugin(MongoAddon)
      @plugin(MapperAddon)
      class Test extends LeanES {
        @nameBy static __filename = 'Test';
        @meta static object = {};
        @constant ROOT = __dirname;
      }

      @initialize
      @partOf(Test)
      @mixin(Test.NS.QueryableCollectionMixin)
      @mixin(Test.NS.MongoCollectionMixin)
      class TestCollection extends Test.NS.Collection {
        @nameBy static __filename = 'TestCollection';
        @meta static object = {};

        @property configs = configs;
      }

      @initialize
      @partOf(Test)
      class TestRecord extends Test.NS.Record {
        @nameBy static __filename = 'TestRecord';
        @meta static object = {};
        @Test.NS.attribute({ type: 'number' }) cid = -1;
        @Test.NS.attribute({ type: 'string' }) data = '';
      }
      let collection = TestCollection.new('TEST_COLLECTION', Object.assign({}, {
        delegate: 'TestRecord'
      }, connectionData));
      collection.onRegister();
      collection.initializeNotifier('TEST');

      const readFileStream = fs.createReadStream(`${__dirname}/test-data/gridfs-test`);
      const licenseFile = fs.readFileSync(`${__dirname}/test-data/gridfs-test`);
      const stream = await collection.createFileWriteStream({
        _id: 'license.test'
      });
      const promise = LeanES.NS.Promise.new((resolve, reject) => {
        stream.once('finish', resolve);
      });
      readFileStream.pipe(stream);
      await promise;
      assert.isTrue(await collection.fileExists({ _id: 'license.test' }));
      assert.isFalse(await collection.fileExists({ _id: 'license.test11' }));
      await collection.onRemove();
    });
  });
});
