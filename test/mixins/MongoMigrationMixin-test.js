const { assert } = require('chai');
const sinon = require('sinon');
const _ = require('lodash');
const addonPath = process.env.ENV === 'build' ? "../../lib/index.dev" : "../../src/index.js";
const MongoAddon = require(addonPath).default;
const MapperAddon = require('@leansdk/leanes-mapper-addon/src').default;
const LeanES = require('@leansdk/leanes/src').default;
const {
  initialize, partOf, nameBy, meta, constant, mixin, plugin
} = LeanES.NS;
const {
  MongoClient,
  GridFSBucket,
  MongoError
} = require('mongodb');
const Parser = require('mongo-parse');
const moment = require('moment');

const connections = {};

describe('MongoMigrationMixin', () => {
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
    collection: 'test_tests'
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
  };

  before(async () => {
    const { default_db } = connectionData;
    __db = await createConnection(default_db);
    const dbCollection = await __db.createCollection(connectionData.collection);
  });

  after(async () => {
    for (const connection in connections) {
      await connection.dropDatabase();
      await connection.close(true);
    }
  });

  describe('.new', () => {
    it('Create instance of class LeanES::Collection with MongoCollectionMixin', () => {

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
        @nameBy static __filename = 'MongoCollection';
        @meta static object = {};
      }

      @initialize
      @partOf(Test)
      @mixin(Test.NS.MongoMigrationMixin)
      class TestMigration extends Test.NS.Migration {
        @nameBy static __filename = 'TestMigration';
        @meta static object = {};
      }
      const collection = TestCollection.new('MIGRATIONS', Object.assign({}, {
        delegate: 'TestMigration'
      }, connectionData));
      const migration = TestMigration.new({ type: 'Test::TestMigration' }, collection);
      assert.isTrue(migration != null);
      assert.instanceOf(migration, TestMigration);
    });
  });
  describe('.createCollection', () => {
    let collection = null;
    afterEach(async () => {
      if (collection != null) {
        const name = collection.collectionFullName();
        await collection.onRemove();
        if (name !== connectionData.collection) {
          await __db.dropCollection(name);
        }
        collection = null;
      }
    });
    it('Check correctness logic of the "createCollection" function', async () => {

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
      }

      @initialize
      @partOf(Test)
      class TestRecord extends Test.NS.Record {
        @nameBy static __filename = 'TestRecord';
        @meta static object = {};
        @Test.NS.attribute({ type: 'number' }) cid = -1;
        @Test.NS.attribute({ type: 'string' }) data = '';
      }
      const testCollectionName = 'examples';

      @initialize
      @partOf(Test)
      @mixin(Test.NS.MongoMigrationMixin)
      class TestMigration extends Test.NS.Migration {
        @nameBy static __filename = 'TestMigration'
        @meta static object = {}
      }
      TestMigration.change(function () {
        this.createCollection(testCollectionName);
      });
      collection = TestCollection.new('MIGRATIONS', Object.assign({}, {
        delegate: 'TestMigration'
      }, connectionData));
      collection.onRegister();
      collection.initializeNotifier('TEST1');
      const migration = await collection.build({});
      const spyCreateCollection = sinon.spy(migration, 'createCollection');
      await migration.up();
      assert.isTrue(spyCreateCollection.calledWith(testCollectionName));
      assert.isTrue((await __db.collection(testCollectionName)) != null);

      let testCollection = TestCollection.new(testCollectionName, Object.assign({}), {
        delegate: 'TestRecord'
      }, connectionData, {
        collection: testCollectionName
      });
      testCollection.initializeNotifier('TEST2');
      const date = new Date();
      const testRecord = TestRecord.new({
        id: 'u7',
        type: 'Test::ExampleRecord',
        cid: 7,
        data: ' :)',
        createdAt: date,
        updatedAt: date
      }, testCollection);
      await testCollection.push(testRecord);

      const spyDropCollection = sinon.spy(migration, 'dropCollection');
      await migration.down();
      assert.isTrue(spyDropCollection.calledWith(testCollectionName));
      testCollectionName = TestCollection.new(testCollectionName, Object.assign({}), {
        delegate: 'TestRecord'
      }, connectionData, {
        collection: testCollectionName
      });
      testCollection.initializeNotifier('TEST3');
      let err = null;
      try {
        await testCollection.take('u7');
      } catch (error) {
        err = error;
      }
      assert.instanceOf(err, MongoError);
      assert.include(err.message, 'Collection test_example does not exist');
    });
  });
  describe('.addField', () => {
    let collection = null;
    let testCollection = null;
    let testCollectionName = 'tests';
    let testCollectionFullName = 'test_tests';
    before(async () => {
      await __db.createCollection(testCollectionFullName);
    });
    after(async () => {
      try {
        await __db.dropCollection(testCollectionFullName);
      } catch (error) {
        throw new Error(error);
      }
    });
    afterEach(async () => {
      if (collection != null) {
        const name = collection.collectionFullName();
        await collection.onRemove();
        if (name !== connectionData.collection) {
          await __db.dropCollection(name);
        }
        collection = null;
      }
      if (testCollection != null) {
        const name = testCollection.collectionFullName();
        await testCollection.onRemove();
        if (name !== connectionData.collection) {
          await __db.dropCollection(name);
        }
        testCollection = null;
      }
    });
    it('Check correctness logic of the "addField" function', async () => {

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
      }

      @initialize
      @partOf(Test)
      class TestRecord extends Test.NS.Record {
        @nameBy static __filename = 'TestRecord';
        @meta static object = {};
        @Test.NS.attribute({ type: 'number' }) cid = -1;
        @Test.NS.attribute({ type: 'string' }) data = '';
      }
      testCollection = TestCollection.new(testCollectionName, Object.assign({}), {
        delegate: 'TestRecord'
      }, connectionData, {
        collection: testCollectionName
      });
      testCollection.onRegister();
      testCollection.initializeNotifier('TEST1');
      const date = new Date();
      const testRecord = TestRecord.new({
        id: 'u7',
        type: 'Test::TestRecord',
        cid: 7,
        data: ' :)',
        createdAt: date,
        updatedAt: date
      }, testCollection);
      await testCollection.push(testRecord);

      @initialize
      @partOf(Test)
      @mixin(Test.NS.MongoMigrationMixin)
      class TestMigration extends Test.NS.Migration {
        @nameBy static __filename = 'TestMigration'
        @meta static object = {}
      }
      TestMigration.change(function () {
        this.addField(testCollectionName, 'data1', {
          default: 'testdata1'
        }, {
          type: 'string'
        });
      });
      collection = TestCollection.new('MIGRATIONS', Object.assign({}), {
        delegate: 'TestMigration'
      }, connectionData);
      collection.onRegister();
      collection.initializeNotifier('TEST2');
      const migration = await collection.build({});
      const spyAddField = sinon.spy(migration, 'addField');

      await migration.up();
      assert.isTrue(spyAddField.calledWith(testCollectionName, 'data1', {
        default: 'testdata1'
      }, {
        type: 'string'
      }));
      const item = await (await __db.collectionFullName(testCollectionFullName)).findOne({ id: 'u7' });
      assert.strictEqual(item.data1, 'testdata1');

      const spyRemoveField = sinon.spy(migration, 'removeField');
      await migration.down();
      assert.isTrue(spyRemoveField.calledWith(testCollectionName, 'data1'));
      assert.isFalse(await (await __db.collection(testCollectionFullName)).findOne({ id: 'u7' }));
    });
  });
  describe('.addTimestamps', () => {
    let collection = null;
    let testCollectionName = 'tests';
    let testCollectionFullName = 'test_tests';
    before(async () => {
      await __db.createCollection(testCollectionFullName);
    });
    after(async () => {
      try {
        await __db.dropCollection(testCollectionFullName);
      } catch (error) {
        throw new Error(error);
      }
    });
    afterEach(async () => {
      if (collection != null) {
        const name = collection.collectionFullName();
        await collection.onRemove();
        if (name !== connectionData.collection) {
          await __db.dropCollection(name);
        }
        collection = null;
      }
    });
    it('Check correctness logic of the "addTimestamps" function', async () => {

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
      }

      @initialize
      @partOf(Test)
      class TestRecord extends Test.NS.Record {
        @nameBy static __filename = 'TestRecord';
        @meta static object = {};
        @Test.NS.attribute({ type: 'number' }) cid = -1;
        @Test.NS.attribute({ type: 'string' }) data = '';
      }

      const date = new Date();
      await (await __db.collection(testCollectionFullName)).insertOne({
        id: 'i8',
        cid: 8,
        data: ' :)',
        createdAt: date
      });

      @initialize
      @partOf(Test)
      @mixin(Test.NS.MongoMigrationMixin)
      class TestMigration extends Test.NS.Migration {
        @nameBy static __filename = 'TestMigration'
        @meta static object = {}
      }
      TestMigration.change(function () {
        this.addTimestamps(testCollectionName);
      });
      collection = TestCollection.new('MIGRATIONS', Object.assign({}, {
        delegate: 'TestMigration'
      }, connectionData));
      collection.onRegister();
      collection.initializeNotifier('TEST1');
      const migration = await collection.build({});
      const spyAddTimestamps = sinon.spy(migration, 'addTimestamps');

      await migration.up();
      assert.isTrue(spyAddTimestamps.calledWith(testCollectionName));

      const spyRemoveTimestamps = sinon.spy(migration, 'removeTimestamps');
      await migration.down();
      assert.isTrue(spyRemoveTimestamps.calledWith(testCollectionName));
    });
  });
  describe('.addIndex', () => {
    let collection = null;
    let testCollectionName = 'tests';
    let testCollectionFullName = 'test_tests';
    before(async () => {
      await __db.createCollection(testCollectionFullName);
    });
    after(async () => {
      try {
        await __db.dropCollection(testCollectionFullName);
      } catch (error) {
        throw new Error(error);
      }
    });
    afterEach(async () => {
      if (collection != null) {
        const name = collection.collectionFullName();
        await collection.onRemove();
        if (name !== connectionData.collection) {
          await __db.dropCollection(name);
        }
        await __db.dropCollection('test_tests');
      }
      collection = null;
    });
    it('Check correctness logic of the "addIndex" function', async () => {

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
      }

      @initialize
      @partOf(Test)
      class TestRecord extends Test.NS.Record {
        @nameBy static __filename = 'TestRecord';
        @meta static object = {};
        @Test.NS.attribute({ type: 'number' }) cid = -1;
        @Test.NS.attribute({ type: 'string' }) data = '';
      }
      const col = await __db.collection(testCollectionFullName);
      await collection.insertOne({
        id: 'u7',
        cid: 7,
        data: ' :)'
      });

      @initialize
      @partOf(Test)
      @mixin(Test.NS.MongoMigrationMixin)
      class TestMigration extends Test.NS.Migration {
        @nameBy static __filename = 'TestMigration'
        @meta static object = {}
      }
      TestMigration.change(function () {
        this.addIndex(testCollectionName, ['id', 'cid'], {
          type: "hash",
          unique: true,
          sparse: true,
          name: 'testIndex'
        });
      });
      collection = TestCollection.new('MIGRATIONS', Object.assign({}, {
        delegate: 'TestMigration'
      }, connectionData));
      collection.onRegister();
      collection.initializeNotifier('TEST1');
      const migration = await collection.build({});

      const spyAddIndex = sinon.spy(migration, 'addIndex');
      await migration.up();
      assert.isTrue(spyAddIndex.calledWith(testCollectionName));
      assert.isTrue(await (await __db.collection(testCollectionFullName)).indexExists('testIndex'));

      let err = null;
      try {
        await (await __db.collection(testCollectionFullName)).insertOne({
          id: 'u7',
          cid: 7,
          data: ' :)'
        });
      } catch (error) {
        err = error;
      }
      assert.isTrue(err != null);

      const spyRemoveIndex = sinon.spy(migration, 'removeIndex');
      await migration.down();
      assert.isTrue(spyRemoveIndex.calledWith(testCollectionName));
      assert.isFalse(await (await __db.collection(testCollectionFullName)).insertOne({
        id: 'u7',
        cid: 7,
        data: ' :)'
      }));
    });
  });
  describe('.changeField', () => {
    let collection = null;
    afterEach(async () => {
      if (collection != null) {
        const name = collection.collectionFullName();
        await collection.onRemove();
        if (name !== connectionData.collection) {
          await __db.dropCollection('test_tests');
        }
        collection = null;
      }
    });
    it('Check correctness logic of the "changeField" function', async () => {

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
      }
      const testCollectionName = 'tests';
      const testCollectionFullName = 'test_tests';
      const testCollection = __db.collection(testCollectionFullName);

      await testCollection.insertOne({
        id: 1,
        cid: 'q1',
        data: 1,
        createdAt: new Date()
      });

      await testCollection.insertOne({
        id: 2,
        cid: 'w2',
        data: '12',
        createdAt: new Date()
      });

      await testCollection.insertOne({
        id: 3,
        cid: 'e3',
        data: {
          val: 123
        },
        createdAt: new Date()
      });

      await testCollection.insertOne({
        id: 4,
        cid: 'r4',
        data: [1234],
        createdAt: new Date()
      });

      await testCollection.insertOne({
        id: 5,
        cid: 't5',
        data: [
          {
            val: 12345
          }
        ],
        createdAt: new Date()
      });

      await testCollection.insertOne({
        id: 6,
        cid: 'y6',
        data: false,
        createdAt: new Date()
      });

      await testCollection.insertOne({
        id: 7,
        cid: 'u7',
        data: 'false',
        createdAt: new Date()
      });

      await testCollection.insertOne({
        id: 8,
        cid: 'i8',
        data: null,
        createdAt: new Date()
      });

      @initialize
      @partOf(Test)
      @mixin(Test.NS.MongoMigrationMixin)
      class TestMigration extends Test.NS.Migration {
        @nameBy static __filename = 'TestMigration'
        @meta static object = {}
      }
      TestMigration.change(function () {
        this.changeField(testCollectionName, 'data', {
          type: TestMigration.NS.SUPPORTED_TYPES.boolean
        })
      });
      collection = TestCollection.new('MIGRATIONS', Object.assign({}, {
        delegate: 'TestMigration'
      }, connectionData));
      collection.onRegister();
      collection.initializeNotifier('TEST1');
      const migration = collection.build({});

      const spyChangeCollection = sinon.spy(migration, 'changeField');
      await migration.up();
      assert.isTrue(spyChangeCollection.calledWith(testCollectionName, 'data', {
        type: TestMigration.NS.SUPPORTED_TYPES.boolean
      }));
      assert.typeOf(await (await __db.collection(testCollectionFullName)).findOne({ id: 7 }).data, 'boolean');
      assert.typeOf(await (await __db.collection(testCollectionFullName)).findOne({ id: 8 }).data, 'boolean');
      await migration.down();
      assert.isTrue(spyChangeCollection.calledTwice);
    });
  });
  describe('.renameField', () => {
    let testCollection = null;
    let collection = null;
    afterEach(async () => {
      if (testCollection != null) {
        const name = testCollection.collectionFullName();
        await testCollection.onRemove();
        if (name !== connectionData.collection) {
          await __db.dropCollection(name);
        }
        testCollection = null;
      }
      if (collection != null) {
        const name = collection.collectionFullName();
        await collection.onRemove();
        if (name !== connectionData.collection) {
          await __db.dropCollection(name);
        }
        collection = null;
      }
    });
    it('Check correctness logic of the "renameField" function', async () => {

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
      }

      @initialize
      @partOf(Test)
      class TestRecord extends Test.NS.Record {
        @nameBy static __filename = 'TestRecord';
        @meta static object = {};
        @Test.NS.attribute({ type: 'number' }) cid = -1;
        @Test.NS.attribute({ type: 'string' }) data = '';
      }
      const testCollectionName = 'tests';
      const testCollectionFullName = 'test_tests';
      __db.createCollection(testCollectionFullName);
      testCollection = TestCollection.new(testCollectionName, Object.assign(
        {},
        {
          delegate: 'TestRecord'
        },
        connectionData,
        {
          collection: testCollectionName
        }
      ));
      testCollection.onRegister();
      testCollection.initializeNotifier('TEST1');
      const date = new Date();
      const testRecord = TestRecord.new({
        id: 'u7',
        type: 'Test::TestRecord',
        cid: 7,
        data: ' :)',
        createdAt: date,
        updatedAt: date
      }, testCollection);
      const res = await testCollection.push(testRecord);
      let result = await (await __db.collection(testCollectionFullName)).findOne({ id: 'u7' });

      @initialize
      @partOf(Test)
      @mixin(Test.NS.MongoMigrationMixin)
      class TestMigration extends Test.NS.Migration {
        @nameBy static __filename = 'TestMigration'
        @meta static object = {}
      }
      TestMigration.change(function () {
        this.renameField(testCollectionName, 'data', 'data1');
      });
      collection = TestCollection.new('MIGRATIONS', Object.assign({}, {
        delegate: 'TestMigration'
      }, connectionData));
      collection.onRegister()
      collection.initializeNotifier('TEST2');
      const migration = await collection.build({});

      const spyRenameField = sinon.spy(migration, 'renameField');
      result = await (await __db.collection(testCollectionFullName)).findOne({ id: 'u7' });
      await migration.up();
      assert.isTrue(spyRenameField.calledWith(testCollectionName, 'data', 'data1'));
      result = await (await __db.collection(testCollectionFullName)).findOne({ id: 'u7' });
      assert.isFalse(result.data != null);
      assert.strictEqual(result.data1, ' :)');

      await migration.down();
      assert.isTrue(spyRenameField.calledWith(testCollectionName, 'data1', 'data'));
      result = await (await __db.collection(testCollectionFullName)).findOne({ id: 'u7' });
      assert.strictEqual(result.data, ' :)');
      assert.isFalse(result.data1 != null);
    });
  });
  describe('.changeCollection', () => {
    let collection = null;
    afterEach(async () => {
      if (collection != null) {
        const name = collection.collectionFullName();
        await collection.onRemove();
        if (name !== connectionData.collection) {
          await __db.dropCollection(name);
        }
        collection = null;
      }
    });
    it('Check correctness logic of the "changeCollection" function', async () => {

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
      }

      @initialize
      @partOf(Test)
      @mixin(Test.NS.MongoMigrationMixin)
      class TestMigration extends Test.NS.Migration {
        @nameBy static __filename = 'TestMigration'
        @meta static object = {}
      }
      TestMigration.change(function () {
        this.changeCollection(testCollectionName, {});
      });
      collection = TestCollection.new('MIGRATIONS', Object.assign({}, {
        delegate: 'TestMigration'
      }, connectionData));
      collection.onRegister();
      const migration = await collection.build({});

      const spyChangeCollection = sinon.spy(migration, 'changeCollection');
      await migration.up();
      assert.isTrue(spyChangeCollection.calledOnce);

      await migration.down();
      assert.isTrue(spyChangeCollection.calledTwice);
    });
  });
  describe('.renameCollection', () => {
    let collection = null
    const oldTestCollectionName = 'tests_123'
    const newTestCollectionName = 'examples_123'
    const oldTestCollectionFullName = 'test_tests_123'
    const newTestCollectionFullName = 'test_examples_123'
    before(async () => {
      await __db.createCollection(oldTestCollectionFullName);
    });
    after(async () => {
      try {
        await __db.dropCollection(oldTestCollectionFullName);
      } catch (error) {
        throw new Error(error);
      }
      try {
        await __db.dropCollection(newTestCollectionFullName);
      } catch (error) {
        throw new Error(error);
      }
    });
    afterEach(async () => {
      if (collection != null) {
        const name = collection.collectionFullName();
        await collection.onRemove();
        if (name !== connectionData.collection) {
          await __db.dropCollection(name);
        }
        collection = null;
      }
    });
    it('Check correctness logic of the "renameCollection" function', async () => {

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
      }

      @initialize
      @partOf(Test)
      @mixin(Test.NS.MongoMigrationMixin)
      class TestMigration extends Test.NS.Migration {
        @nameBy static __filename = 'TestMigration'
        @meta static object = {}
      }
      TestMigration.change(function () {
        this.renameCollection(oldTestCollectionName, newTestCollectionName);
      });
      collection = TestCollection.new('MIGRATIONS', Object.assign({}, {
        delegate: 'TestMigration'
      }, connectionData));
      collection.onRegister();
      collection.initializeNotifier('TEST1');
      const migration = awaitcollection.build({});

      const date = new Date();
      await (await __db.collection(oldTestCollectionFullName)).insertOne({
        id: 'a11',
        cid: 11,
        data: ' :)',
        createdAt: date,
        updatedAt: date
      });

      const spyRenameCollection = sinon.spy(migration, 'renameCollection');
      await migration.up();
      assert.isTrue(spyRenameCollection.calledWith(oldTestCollectionName, newTestCollectionName));
      assert.lengthOf(await __db.listCollections({
        name: oldTestCollectionFullName
      }).toArray(), 0);
      let result = await (await __db.collection(oldTestCollectionFullName)).findOne({
        id: 'a11'
      });
      assert.strictEqual(result.cid, 11);

      await migration.down()
      assert.isTrue(spyRenameCollection.calledWith(newTestCollectionName, oldTestCollectionName));
      assert.lengthOf(__db.listCollections({
        name: newTestCollectionFullName
      }).toArray(), 0);
      let result = await (await __db.collection(oldTestCollectionFullName)).findOne({
        id: 'a11'
      });
      assert.strictEqual(result.cid, 11);
    });
  });
  describe('.renameIndex', () => {
    let collection = null;
    afterEach(async () => {
      if (collection != null) {
        const name = collection.collectionFullName();
        await collection.onRemove();
        if (name !== connectionData.collection) {
          await __db.dropCollection(name);
        }
        collection = null;
      }
    });
    it('Check correctness logic of the "renameIndex" function', async () => {

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
      }

      @initialize
      @partOf(Test)
      @mixin(Test.NS.MongoMigrationMixin)
      class TestMigration extends Test.NS.Migration {
        @nameBy static __filename = 'TestMigration'
        @meta static object = {}
      }
      const testCollectionName = 'tests';
      TestMigration.change(function () {
        this.renameIndex(testCollectionName, 'oldIndexName', 'newIndexName');
      });
      collection = TestCollection.new('MIGRATIONS', Object.assign({}, {
        delegate: 'TestMigration'
      }, connectionData));
      collection.onRegister();
      const migration = await collection.build({});

      const spyRenameIndex = sinon.spy(migration, 'renameIndex');
      await migration.up();
      assert.isTrue(spyRenameIndex.calledOnce);

      await migration.down();
      assert.isTrue(spyRenameIndex.calledTwice);
    });
  });
  describe('.dropCollection', () => {
    let collection = null;
    const testCollectionName = 'tests';
    const testCollectionFullName = 'test_tests';
    before(async () => {
      await __db.createCollection(testCollectionFullName);
    });
    after(async () => {
      try {
        await __db.dropCollection(testCollectionFullName);
      } catch (error) {
        throw new Error(error);
      }
    });
    afterEach(async () => {
      if (collection != null) {
        const name = collection.collectionFullName();
        await collection.onRemove();
        if (name !== connectionData.collection) {
          await __db.dropCollection(name);
        }
        collection = null;
      }
    });
    it('Check correctness logic of the "dropCollection" function', async () => {

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
      }

      @initialize
      @partOf(Test)
      class TestRecord extends Test.NS.Record {
        @nameBy static __filename = 'TestRecord';
        @meta static object = {};
        @Test.NS.attribute({ type: 'number' }) cid = -1;
        @Test.NS.attribute({ type: 'string' }) data = '';
      }

      @initialize
      @partOf(Test)
      @mixin(Test.NS.MongoMigrationMixin)
      class TestMigration extends Test.NS.Migration {
        @nameBy static __filename = 'TestMigration'
        @meta static object = {}
      }
      TestMigration.change(function () {
        this.dropCollection(testCollectionName);
      });
      collection = TestCollection.new('MIGRATIONS', Object.assign({}, {
        delegate: 'TestMigration'
      }, connectionData));
      collection.onRegister();
      collection.initializeNotifier('TEST1');
      const migration = await collection.build({});
      const spyDropCollection = sinon.spy(migration, 'dropCollection');

      let testCollection = TestCollection.new(testCollectionName, Object.assign({}, {
        delegate: 'TestRecord'
      }, connectionData, {
        collection: testCollectionName
      }));
      testCollection.initializeNotifier('TEST2');
      const date = new Date();
      const testRecord = TestRecord.new({
        id: 'u7',
        type: 'Test::TestRecord',
        cid: 7,
        data: ' :)',
        createdAt: date,
        updatedAt: date
      }, collection);
      await testCollection.push(testRecord);

      await migration.up();
      assert.isTrue(spyDropCollection.calledWith(testCollectionName));
      testCollection = TestCollection.new(testCollectionName, Object.assign({}, {
        delegate: 'TestRecord'
      }, connectionData, {
        collection: testCollectionName
      }));
      assert.isFalse((await testCollection.collection) != null);

      await migration.down();
    });
  });
  describe('.removeField', () => {
    let collection = null;
    let testCollection = null;
    const testCollectionName = 'tests';
    const testCollectionFullName = 'test_tests';
    before(async () => {
      await __db.createCollection(testCollectionFullName);
    });
    after(async () => {
      try {
        await __db.dropCollection(testCollectionFullName);
      } catch (error) {
        throw new Error(error);
      }
    });
    afterEach(async () => {
      if (collection != null) {
        const name = collection.collectionFullName();
        await collection.onRemove();
        if (name !== connectionData.collection) {
          await __db.dropCollection(name);
        }
        collection = null;
      }
      if (testCollection != null) {
        const name = testCollection.collectionFullName();
        await testCollection.onRemove();
        if (name !== connectionData.collection) {
          await __db.dropCollection(name);
        }
        testCollection = null;
      }
    });
    it('Check correctness logic of the "removeField" function', async () => {

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
      }

      @initialize
      @partOf(Test)
      class TestRecord extends Test.NS.Record {
        @nameBy static __filename = 'TestRecord';
        @meta static object = {};
        @Test.NS.attribute({ type: 'number' }) cid = -1;
        @Test.NS.attribute({ type: 'string' }) data = '';
        @Test.NS.attribute({ type: 'string' }) data1 = 'testdata1';
      }
      testCollection = TestCollection.new(testCollectionName, Object.assign({}, {
        delegate: 'TestRecord'
      }, connectionData, {
        collection: testCollectionName
      }));
      testCollection.onRegister();
      testCollection.initializeNotifier('TEST1');
      const date = new Date();
      const testRecord = TestRecord.new({
        id: 'o9',
        type: 'Test::TestRecord',
        cid: 9,
        data: ' :)',
        createdAt: date,
        updatedAt: date
      }, testCollection);
      await testCollection.push(testRecord);

      @initialize
      @partOf(Test)
      @mixin(Test.NS.MongoMigrationMixin)
      class TestMigration extends Test.NS.Migration {
        @nameBy static __filename = 'TestMigration'
        @meta static object = {}
      }
      TestMigration.change(function () {
        this.removeField(testCollectionName, 'data1');
      });
      collection = TestCollection.new('MIGRATIONS', Object.assign({}, {
        delegate: 'TestMigration'
      }, connectionData));
      collection.onRegister();
      collection.initializeNotifier('TEST2');
      const migration = await collection.build({});

      const spyRemoveField = sinon.spy(migration, 'removeField');
      await migration.up();
      assert.isTrue(spyRemoveField.calledWith(testCollectionName, 'data1'));
      testCollection = TestCollection.new(testCollectionName, Object.assign({}, {
        delegate: 'TestRecord'
      }, connectionData, {
        collection: testCollectionName
      }));
      testCollection.initializeNotifier('TEST3');
      assert.isFalse((await testCollection.take('o9')).data1 != null);

      await migration.down();
    });
  });
  describe('.removeTimestamps', () => {
    let collection = null;
    const testCollectionName = 'tests';
    const testCollectionFullName = 'test_tests';
    before(async () => {
      await __db.createCollection(testCollectionFullName);
    });
    after(async () => {
      try {
        await __db.dropCollection(testCollectionFullName);
      } catch (error) {
        throw new Error(error);
      }
    });
    afterEach(async () => {
      if (collection != null) {
        const name = collection.collectionFullName();
        await collection.onRemove();
        if (name !== connectionData.collection) {
          await __db.dropCollection(name);
        }
        collection = null;
      }
    });
    it('Check correctness logic of the "removeTimestamps" function', async () => {

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
      }

      @initialize
      @partOf(Test)
      class TestRecord extends Test.NS.Record {
        @nameBy static __filename = 'TestRecord';
        @meta static object = {};
        @Test.NS.attribute({ type: 'number' }) cid = -1;
        @Test.NS.attribute({ type: 'string' }) data = '';
      }
      const date = new Date();
      await (await __db.collection(testCollectionFullName)).insertOne({
        id: 'p0',
        cid: 0,
        data: ' :)',
        createdAt: date,
        updatedAt: date
      });

      @initialize
      @partOf(Test)
      @mixin(Test.NS.MongoMigrationMixin)
      class TestMigration extends Test.NS.Migration {
        @nameBy static __filename = 'TestMigration'
        @meta static object = {}
      }
      TestMigration.change(function () {
        this.removeTimestamps(testCollectionName);
      });
      collection = TestCollection.new('MIGRATIONS', Object.assign({}, {
        delegate: 'TestMigration'
      }, connectionData));
      collection.onRegister();
      collection.initializeNotifier('TEST1');
      const migration = await collection.build({});

      spyRemoveTimestamps = sinon.spy(migration, 'removeTimestamps');
      await migration.up();
      assert.isTrue(spyRemoveTimestamps.calledWith(testCollectionName));
      const result = await (await __db.collection(testCollectionFullName)).findOne({
        id: 'p0'
      });
      assert.isFalse(result.createdAt != null);
      assert.isFalse(result.updatedAt != null);
      assert.isFalse(result.deletedAt != null);

      await migration.down();
    });
  });
  describe('.removeIndex', () => {
    let collection = null;
    const testCollectionName = 'tests';
    const testCollectionFullName = 'test_tests';
    before(async () => {
      await __db.createCollection(testCollectionFullName);
    });
    after(async () => {
      try {
        await __db.dropCollection(testCollectionFullName);
      } catch (error) {
        throw new Error(error);
      }
    });
    afterEach(async () => {
      if (collection != null) {
        const name = collection.collectionFullName();
        await collection.onRemove();
        if (name !== connectionData.collection) {
          await __db.dropCollection(name);
        }
        collection = null;
      }
    });
    it('Check correctness logic of the "removeIndex" function', async () => {

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
      }

      @initialize
      @partOf(Test)
      class TestRecord extends Test.NS.Record {
        @nameBy static __filename = 'TestRecord';
        @meta static object = {};
        @Test.NS.attribute({ type: 'number' }) cid = -1;
        @Test.NS.attribute({ type: 'string' }) data = '';
      }

      @initialize
      @partOf(Test)
      @mixin(Test.NS.MongoMigrationMixin)
      class TestMigration extends Test.NS.Migration {
        @nameBy static __filename = 'TestMigration'
        @meta static object = {}
      }
      TestMigration.change(function () {
        this.removeIndex(testCollectionName, ['id', 'cid'], {
          type: 'hash',
          name: 'testIndex'
        });
      });
      collection = TestCollection.new('MIGRATIONS', Object.assign({}, {
        delegate: 'TestMigration'
      }, connectionData));
      collection.onRegister();
      collection.initializeNotifier('TEST1');
      const migration = await collection.build({});

      await (await __db.collection(testCollectionFullName)).ensureIndex({
        id: 1,
        cid: 1
      }, {
        unique: true,
        sparse: true,
        name: 'testIndex'
      });

      const spyRemoveIndex = sinon.spy(migration, 'removeIndex');
      await migration.up();
      assert.isTrue(spyRemoveIndex.calledWith(testCollectionName, ['id', 'cid'], {
        type: 'hash',
        name: 'testIndex'
      }));
      assert.isFalse(await (await __db.collection(testCollectionFullName)).indexExists('testIndex'));
      await (await __db.collection(testCollectionFullName)).insertOne({
        id: 'u777',
        type: 'Test::TestRecord',
        cid: 777,
        data: ' :)'
      });

      await migration.down();
    });
  });
});
