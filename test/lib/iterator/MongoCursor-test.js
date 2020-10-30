const { expect, assert } = require('chai');
const sinon = require('sinon');
const _ = require('lodash');
const LeanES = require('@leansdk/leanes/src/leanes').default;
const MongoStorage = require('../../../lib/index.js').default;
const { MongoClient } = require('mongodb');


const {
  initialize, partOf, nameBy, meta, constant, mixin, property, method, attribute, action, plugin,
} = LeanES.NS;

describe('MongoCursor', () => {
  let db = null;

  before(async () => {
    const db_url = "mongodb://127.0.0.1:27017";
    db = await MongoClient.connect(db_url);
    const dbCollection = await db.createCollection('test_thames_travel');
    let date = new Date().toISOString();
    await dbCollection.save({
      id: 1,
      type: 'Test::TestRecord',
      data: 'three',
      createdAt: date,
      updatedAt: date
    });
    date = new Date().toISOString();
    await dbCollection.save({
      id: 2,
      type: 'Test::TestRecord',
      data: 'men',
      createdAt: date,
      updatedAt: date
    });
    date = new Date().toISOString();
    await dbCollection.save({
      id: 3,
      type: 'Test::TestRecord',
      data: 'in',
      createdAt: date,
      updatedAt: date
    });
    date = new Date().toISOString();
    await dbCollection.save({
      id: 4,
      type: 'Test::TestRecord',
      data: 'a boat',
      createdAt: date,
      updatedAt: date
    });
  });

  after(async () => {
    await db.dropCollection('test_thames_travel');
    db.close();
  });

  describe('.new', () => {
    it('Create MongoCursor instance with two valid params', async () => {

      @initialize
      @plugin(MongoStorage)
      class Test extends LeanES {
        @nameBy static __filename = 'Test';
        @meta static object = {};
        @constant ROOT = __dirname;
      }

      @initialize
      @partOf(Test)
      class TestCollection extends Test.NS.Collection {
        @nameBy static __filename = 'TestCollection';
        @meta static object = {};
      }

      @initialize
      @partOf(Test)
      class TestRecord extends Test.NS.Record {
        @nameBy static __filename = 'TestRecord';
        @meta static object = {};
        @attribute({ type: 'string' }) data = '';
      }
      const testCollectionInstance = TestCollection.new();
      testCollectionInstance.setName('TEST_COLLECTION');
      testCollectionInstance.setData({
        delegate: 'TestRecord'
      });
      const dbCollection = db.collection('test_thames_travel');
      const nativeCursor = await dbCollection.find();
      const cursor = Test.NS.MongoCursor.new(testCollectionInstance, nativeCursor);
      assert.isTrue(cursor != null, 'Cursor not defined');
      assert.instanceOf(cursor[Test.NS.MongoCursor.instanceVariables._collection], TestCollection);
      assert.strictEqual(cursor[Test.NS.MongoCursor.instanceVariables._collection], testCollectionInstance);
      assert.isTrue(cursor[Test.NS.MongoCursor.instanceVariables._cursor] != null);
      assert.strictEqual(cursor[Test.NS.MongoCursor.instanceVariables._cursor], nativeCursor);
    });
    it('Create MongoCursor instance with only Collection instance as param', () => {

      @initialize
      @plugin(MongoStorage)
      class Test extends LeanES {
        @nameBy static __filename = 'Test';
        @meta static object = {};
        @constant ROOT = __dirname;
      }

      @initialize
      @partOf(Test)
      class TestCollection extends Test.NS.Collection {
        @nameBy static __filename = 'TestCollection';
        @meta static object = {};
      }

      @initialize
      @partOf(Test)
      class TestRecord extends Test.NS.Record {
        @nameBy static __filename = 'TestRecord';
        @meta static object = {};
        @attribute({ type: 'string' }) data = '';
      }
      const testCollectionInstance = TestCollection.new();
      testCollectionInstance.setName('TEST_COLLECTION');
      testCollectionInstance.setData({
        delegate: 'TestRecord'
      });
      const cursor = Test.NS.MongoCursor.new(testCollectionInstance);
      assert.isTrue(cursor != null, 'Cursor not defined');
      assert.instanceOf(cursor[Test.NS.MongoCursor.instanceVariables._collection], TestCollection);
      assert.strictEqual(cursor[Test.NS.MongoCursor.instanceVariables._collection], testCollectionInstance);
    });
    it('Create MongoCursor instance with only NativeCursor as param', async () => {

      @initialize
      @plugin(MongoStorage)
      class Test extends LeanES {
        @nameBy static __filename = 'Test';
        @meta static object = {};
        @constant ROOT = __dirname;
      }
      const dbCollection = db.collection('test_thames_travel');
      const nativeCursor = await dbCollection.find();
      const cursor = Test.NS.MongoCursor.new(null, nativeCursor);
      assert.isTrue(cursor != null, 'Cursor not defined');
      assert.isTrue(cursor[Test.NS.MongoCursor.instanceVariables._cursor] != null);
      assert.strictEqual(cursor[Test.NS.MongoCursor.instanceVariables._cursor], nativeCursor);
    });
    it('Create MongoCursor instance without params', () => {

      @initialize
      @plugin(MongoStorage)
      class Test extends LeanES {
        @nameBy static __filename = 'Test';
        @meta static object = {};
        @constant ROOT = __dirname;
      }
      const cursor = Test.NS.MongoCursor.new();
      assert.isTrue(cursor != null, 'Cursor not defined');
    });
  });
  describe('.setCollection', () => {
    it('Setup collection on created MongoCursor instance with valid params', () => {

      @initialize
      @plugin(MongoStorage)
      class Test extends LeanES {
        @nameBy static __filename = 'Test';
        @meta static object = {};
        @constant ROOT = __dirname;
      }

      @initialize
      @partOf(Test)
      class TestCollection extends Test.NS.Collection {
        @nameBy static __filename = 'TestCollection';
        @meta static object = {};
      }

      @initialize
      @partOf(Test)
      class TestRecord extends Test.NS.Record {
        @nameBy static __filename = 'TestRecord';
        @meta static object = {};
        @attribute({ type: 'string' }) data = '';
      }
      const testCollectionInstance = TestCollection.new();
      testCollectionInstance.setName('TEST_COLLECTION');
      testCollectionInstance.setData({
        delegate: 'TestRecord'
      });
      const cursor = Test.NS.MongoCursor.new();
      cursor.setCollection(testCollectionInstance);
      assert.instanceOf(cursor[Test.NS.MongoCursor.instanceVariables._collection], TestCollection);
      assert.strictEqual(cursor[Test.NS.MongoCursor.instanceVariables._collection], testCollectionInstance);
    });
    it('Use method setCollection for change used collection', () => {

      @initialize
      @plugin(MongoStorage)
      class Test extends LeanES {
        @nameBy static __filename = 'Test';
        @meta static object = {};
        @constant ROOT = __dirname;
      }

      @initialize
      @partOf(Test)
      class TestCollection extends Test.NS.Collection {
        @nameBy static __filename = 'TestCollection';
        @meta static object = {};
      }

      @initialize
      @partOf(Test)
      class TestRecord extends Test.NS.Record {
        @nameBy static __filename = 'TestRecord';
        @meta static object = {};
        @attribute({ type: 'string' }) data = '';
      }
      const testCollectionInstance = TestCollection.new();
      testCollectionInstance.setName('TEST_COLLECTION_1');
      testCollectionInstance.setData({
        delegate: 'TestRecord'
      });
      const testCollectionInstance2 = TestCollection.new();
      testCollectionInstance2.setName('TEST_COLLECTION_2');
      testCollectionInstance2.setData({
        delegate: 'TestRecord'
      });
      const cursor = Test.NS.MongoCursor.new(testCollectionInstance);
      cursor.setCollection(testCollectionInstance2);
      assert.strictEqual(cursor[Test.NS.MongoCursor.instanceVariables._collection], testCollectionInstance2);
    });
  });
  describe('.setIterable', () => {
    it('Setup cursor on created MongoCursor instance with valid params', async () => {

      @initialize
      @plugin(MongoStorage)
      class Test extends LeanES {
        @nameBy static __filename = 'Test';
        @meta static object = {};
        @constant ROOT = __dirname;
      }
      const dbCollection = db.collection("test_thames_travel");
      const nativeCursor = await dbCollection.find();
      const cursor = Test.NS.MongoCursor.new();
      cursor.setIterable(nativeCursor);
      assert.isTrue(cursor[Test.NS.MongoCursor.instanceVariables._cursor] != null);
      assert.strictEqual(cursor[Test.NS.MongoCursor.instanceVariables._cursor], nativeCursor);
    });
    it('Use method setIterable for change used cursor', async () => {

      @initialize
      @plugin(MongoStorage)
      class Test extends LeanES {
        @nameBy static __filename = 'Test';
        @meta static object = {};
        @constant ROOT = __dirname;
      }
      const dbCollection = db.collection("test_thames_travel");
      const nativeCursor = await dbCollection.find();
      const nativeCursor2 = await dbCollection.find();
      const cursor = Test.NS.MongoCursor.new(null, nativeCursor);
      cursor.setIterable(nativeCursor2);
      assert.isTrue(cursor[Test.NS.MongoCursor.instanceVariables._cursor] != null);
      assert.strictEqual(cursor[Test.NS.MongoCursor.instanceVariables._cursor], nativeCursor2);
    });
  });
  describe('.hasNext', () => {
    it('Check correctness logic of the "hasNext" function', async () => {

      @initialize
      @plugin(MongoStorage)
      class Test extends LeanES {
        @nameBy static __filename = 'Test';
        @meta static object = {};
        @constant ROOT = __dirname;
      }

      @initialize
      @partOf(Test)
      class TestCollection extends Test.NS.Collection {
        @nameBy static __filename = 'TestCollection';
        @meta static object = {};
      }

      @initialize
      @partOf(Test)
      class TestRecord extends Test.NS.Record {
        @nameBy static __filename = 'TestRecord';
        @meta static object = {};
        @attribute({ type: 'string' }) data = '';
      }
      const testCollectionInstance = TestCollection.new();
      testCollectionInstance.setName('TEST_COLLECTION');
      testCollectionInstance.setData({
        delegate: 'TestRecord'
      });
      const dbCollection = db.collection("test_thames_travel");
      const nativeCursor = await dbCollection.find().limit(1);
      const cursor = Test.NS.MongoCursor.new(testCollectionInstance, nativeCursor);
      assert.isTrue(await cursor.hasNext());
      await cursor.next();
      assert.isFalse(await cursor.hasNext());
    });
  });
  describe('.next', () => {
    it('Use next manually', async () => {

      @initialize
      @plugin(MongoStorage)
      class Test extends LeanES {
        @nameBy static __filename = 'Test';
        @meta static object = {};
        @constant ROOT = __dirname;
      }

      @initialize
      @partOf(Test)
      class TestCollection extends Test.NS.Collection {
        @nameBy static __filename = 'TestCollection';
        @meta static object = {};
      }

      @initialize
      @partOf(Test)
      class TestRecord extends Test.NS.Record {
        @nameBy static __filename = 'TestRecord';
        @meta static object = {};
        @attribute({ type: 'string' }) data = '';
      }
      const testCollectionInstance = TestCollection.new();
      testCollectionInstance.setName('TEST_COLLECTION');
      testCollectionInstance.setData({
        delegate: 'TestRecord'
      });
      const dbCollection = db.collection("test_thames_travel");
      const nativeCursor = await dbCollection.find().sort({ id: 1 });
      const cursor = Test.NS.MongoCursor.new(testCollectionInstance, nativeCursor);
      assert.strictEqual((await cursor.next()).data, 'three', 'First item is incorrect');
      assert.strictEqual((await cursor.next()).data, 'men', 'Second item is incorrect');
      assert.strictEqual((await cursor.next()).data, 'in', 'Third item is incorrect');
      assert.strictEqual((await cursor.next()).data, 'a boat', 'Fourth item is incorrect');
      assert.isFalse((await cursor.next()) != null, 'Unexpected item is present');
      let err = null;
      try {
        await cursor.next();
      } catch (error) {
        err = error;
      }
      assert.isTrue(err != null);
    });
    it('Use next automatic', async () => {

      @initialize
      @plugin(MongoStorage)
      class Test extends LeanES {
        @nameBy static __filename = 'Test';
        @meta static object = {};
        @constant ROOT = __dirname;
      }

      @initialize
      @partOf(Test)
      class TestCollection extends Test.NS.Collection {
        @nameBy static __filename = 'TestCollection';
        @meta static object = {};
      }

      @initialize
      @partOf(Test)
      class TestRecord extends Test.NS.Record {
        @nameBy static __filename = 'TestRecord';
        @meta static object = {};
        @attribute({ type: 'string' }) data = '';
      }
      const testCollectionInstance = TestCollection.new();
      testCollectionInstance.setName('TEST_COLLECTION');
      testCollectionInstance.setData({
        delegate: 'TestRecord'
      });
      const dbCollection = db.collection("test_thames_travel");
      const nativeCursor = await dbCollection.find().sort({ id: 1 });
      const cursor = Test.NS.MongoCursor.new(testCollectionInstance, nativeCursor);
      const expectedData = ['three', 'men', 'in', 'a boat'];
      let index = 0;
      const data = (await cursor.next()) != null ? await cursor.next() : void 0;
      while (data.data() != null) {
        assert.strictEqual(data, expectedData[index++]);
      }
      let err = null;
      try {
        await cursor.next();
      } catch (error) {
        err = error;
      }
      assert.isTrue(err != null);
    });
    it('Use next automatic (with hasNext)', async () => {

      @initialize
      @plugin(MongoStorage)
      class Test extends LeanES {
        @nameBy static __filename = 'Test';
        @meta static object = {};
        @constant ROOT = __dirname;
      }

      @initialize
      @partOf(Test)
      class TestCollection extends Test.NS.Collection {
        @nameBy static __filename = 'TestCollection';
        @meta static object = {};
      }

      @initialize
      @partOf(Test)
      class TestRecord extends Test.NS.Record {
        @nameBy static __filename = 'TestRecord';
        @meta static object = {};
        @attribute({ type: 'string' }) data = '';
      }
      const testCollectionInstance = TestCollection.new();
      testCollectionInstance.setName('TEST_COLLECTION');
      testCollectionInstance.setData({
        delegate: 'TestRecord'
      });
      const dbCollection = db.collection("test_thames_travel");
      const nativeCursor = await dbCollection.find().sort({ id: 1 });
      const cursor = Test.NS.MongoCursor.new(testCollectionInstance, nativeCursor);
      const expectedData = ['three', 'men', 'in', 'a boat'];
      let index = 0;
      while (await cursor.hasNext()) {
        assert.strictEqual((await cursor.next()).data, expectedData[index++]);
      }
      let err = null;
      try {
        await cursor.next();
      } catch (error) {
        err = error;
      }
      assert.isTrue(err != null);
    });
  });
  describe('.toArray', () => {
    it('Check correctness logic of the "toArray" function', async () => {

      @initialize
      @plugin(MongoStorage)
      class Test extends LeanES {
        @nameBy static __filename = 'Test';
        @meta static object = {};
        @constant ROOT = __dirname;
      }

      @initialize
      @partOf(Test)
      class TestCollection extends Test.NS.Collection {
        @nameBy static __filename = 'TestCollection';
        @meta static object = {};
      }

      @initialize
      @partOf(Test)
      class TestRecord extends Test.NS.Record {
        @nameBy static __filename = 'TestRecord';
        @meta static object = {};
        @attribute({ type: 'string' }) data = '';
      }
      const testCollectionInstance = TestCollection.new();
      testCollectionInstance.setName('TestCollection');
      testCollectionInstance.setData({
        delegate: 'TestRecord'
      });
      const dbCollection = db.collection("test_thames_travel");
      const nativeCursor = await dbCollection.find().sort({ id: 1 });
      const nativeRecords = await nativeCursor.toArray();
      const nativeCursor2 = await dbCollection.find().sort({ id: 1 });
      const cursor = Test.NS.MongoCursor.new(testCollectionInstance, nativeCursor2);
      const records = await cursor.toArray();
      assert.strictEqual(records.length, nativeCursor.length, 'Counts of input and output data are different');
      assert.instanceOf(records, Array, 'Counts of input and output data are different');
      for (record of records) {
        const index = records.indexOf(record);
        assert.instanceOf(record, TestRecord, `Record ${index} has incorrect Class`);
        assert.strictEqual(record.data, nativeRecords[index].data, `Record ${index} "data" is incorrect`);
      }
    });
  });
  describe('.close', () => {
    it('Check correctness logic of the "close" function', async () => {

      @initialize
      @plugin(MongoStorage)
      class Test extends LeanES {
        @nameBy static __filename = 'Test';
        @meta static object = {};
        @constant ROOT = __dirname;
      }

      @initialize
      @partOf(Test)
      class TestCollection extends Test.NS.Collection {
        @nameBy static __filename = 'TestCollection';
        @meta static object = {};
      }

      @initialize
      @partOf(Test)
      class TestRecord extends Test.NS.Record {
        @nameBy static __filename = 'TestRecord';
        @meta static object = {};
        @attribute({ type: 'string' }) data = '';
      }
      const testCollectionInstance = TestCollection.new();
      testCollectionInstance.setName('TEST_COLLECTION');
      testCollectionInstance.setData({
        delegate: 'TestRecord'
      });
      const dbCollection = db.collection("test_thames_travel");
      const nativeCursor = await dbCollection.find().sort({ id: 1 });
      const cursor = Test.NS.MongoCursor.new(testCollectionInstance, nativeCursor);
      assert.isTrue(await cursor.hasNext());
      await cursor.close();
      assert.isFalse(await cursor.hasNext());
      await cursor.close();
    });
    it('Check correctness logic of the "close" function when cursor haven\'t Collection instance', async () => {

      @initialize
      @plugin(MongoStorage)
      class Test extends LeanES {
        @nameBy static __filename = 'Test';
        @meta static object = {};
        @constant ROOT = __dirname;
      }
      const dbCollection = db.collection("test_thames_travel");
      const nativeCursor = await dbCollection.find().sort({ id: 1 });
      const cursor = Test.NS.MongoCursor.new(null, nativeCursor);
      assert.isTrue(await cursor.hasNext());
      await cursor.close();
      assert.isFalse(await cursor.hasNext());
      await cursor.close();
    });
  });
  describe('.count', () => {
    it('Check correctness logic of the "count function', async () => {

      @initialize
      @plugin(MongoStorage)
      class Test extends LeanES {
        @nameBy static __filename = 'Test';
        @meta static object = {};
        @constant ROOT = __dirname;
      }

      @initialize
      @partOf(Test)
      class TestCollection extends Test.NS.Collection {
        @nameBy static __filename = 'TestCollection';
        @meta static object = {};
      }

      @initialize
      @partOf(test)
      class TestRecord extends Test.NS.Record {
        @nameBy static __filename = 'TestRecord';
        @meta static object = {};
        @attribute({ type: 'string' }) data = '';
      }
      const testCollectionInstance = TestCollection.new();
      testCollectionInstance.setName('TEST_COLLECTION');
      testCollectionInstance.setData({
        delegate: 'TestRecord'
      });
      const dbCollection = db.collection("test_thames_travel");
      const nativeCursor = await dbCollection.find().sort({ id: 1 });
      const cursor = Test.MongoCursor.new(testCollectionInstance, nativeCursor);
      assert.strictEqual(await cursor.count(), await nativeCursor.count());
    });
  });
  describe('.forEach', () => {
    it('Check correctness logic of the "forEach" function', async () => {

      @initialize
      @plugin(MongoStorage)
      class Test extends LeanES {
        @nameBy static __filename = 'Test';
        @meta static object = {};
        @constant ROOT = __dirname;
      }

      @initialize
      @partOf(Test)
      class TestCollection extends Test.NS.Collection {
        @nameBy static __filename = 'TestCollection';
        @meta static object = {};
      }

      @initialize
      @partOf(Test)
      class TestRecord extends Test.NS.Record {
        @nameBy static __filename = 'TestRecord';
        @meta static object = {};
        @attribute({ type: 'string' }) data = '';
      }
      const testCollectionInstance = TestCollection.new();
      testCollectionInstance.setName('TestCollection');
      testCollectionInstance.setData({
        delegate: 'TestRecord'
      });
      const dbCollection = db.collection("test_thames_travel");
      const nativeCursor = await dbCollection.find().sort({ id: 1 });
      const cursor = Test.MongoCursor.new(testCollectionInstance, nativeCursor);
      const spyLambda = sinon.spy(() => { });
      await cursor.forEach(spyLambda);
      assert.isTrue(spyLambda.called, 'Lambda never called');
      assert.strictEqual(spyLambda.callCount, 4, 'Lambda calls are not match');
      assert.strictEqual(spyLambda.args[0][0].data, 'three', 'Lambda 1st call is not match');
      assert.strictEqual(spyLambda.args[0][1], 0, 'Lambda 1st call is not match');
      assert.strictEqual(spyLambda.args[1][0].data, 'men', 'Lambda 2nd call is not match');
      assert.strictEqual(spyLambda.args[1][1], 1, 'Lambda 2nd call is not match');
      assert.strictEqual(spyLambda.args[2][0].data, 'in', 'Lambda 3rd call is not match');
      assert.strictEqual(spyLambda.args[2][1], 2, 'Lambda 3rd call is not match');
      assert.strictEqual(spyLambda.args[3][0].data, 'a boat', 'Lambda 4th call is not match');
      assert.strictEqual(spyLambda.args[3][1], 3, 'Lambda 4th call is not match');
    });
    it('Check correctness logic of the "forEach" function without Record class', async () => {

      @initialize
      @plugin(MongoStorage)
      class Test extends LeanES {
        @nameBy static __filename = 'Test';
        @meta static object = {};
        @constant ROOT = __dirname;
      }
      const dbCollection = db.collection("test_thames_travel");
      const nativeCursor = await dbCollection.find().sort({ id: 1 });
      const cursor = Test.NS.MongoCursor.new(null, nativeCursor);
      const spyLambda = sinon.spy(() => { });
      await cursor.forEach(spyLambda);
      assert.isTrue(spyLambda.called, 'Lambda never called');
      assert.strictEqual(spyLambda.callCount, 4, 'Lambda calls are not match');
      assert.strictEqual(spyLambda.args[0][0].data, 'three', 'Lambda 1st call is not match');
      assert.strictEqual(spyLambda.args[0][1], 0, 'Lambda 1st call is not match');
      assert.strictEqual(spyLambda.args[1][0].data, 'men', 'Lambda 2nd call is not match');
      assert.strictEqual(spyLambda.args[1][1], 1, 'Lambda 2nd call is not match');
      assert.strictEqual(spyLambda.args[2][0].data, 'in', 'Lambda 3rd call is not match');
      assert.strictEqual(spyLambda.args[2][1], 2, 'Lambda 3rd call is not match');
      assert.strictEqual(spyLambda.args[3][0].data, 'a boat', 'Lambda 4th call is not match');
      assert.strictEqual(spyLambda.args[3][1], 3, 'Lambda 4th call is not match');
    });
  });
  describe('.map', () => {
    it('Check correctness logic of the "map" function', async () => {

      @initialize
      @plugin(MongoStorage)
      class Test extends LeanES {
        @nameBy static __filename = 'Test';
        @meta static object = {};
        @constant ROOT = __dirname;
      }

      @initialize
      @partOf(Test)
      class TestCollection extends Test.NS.Collection {
        @nameBy static __filename = 'TestCollection';
        @meta static object = {};
      }

      @initialize
      @partOf(Test)
      class TestRecord extends Test.NS.Record {
        @nameBy static __filename = 'TestRecord';
        @meta static object = {};
        @attribute({ type: 'string' }) data = '';
      }
      const testCollectionInstance = TestCollection.new();
      testCollectionInstance.setName('TestCollection');
      testCollectionInstance.setData({
        delegate: 'TestRecord'
      });
      const dbCollection = db.collection("test_thames_travel");
      const nativeCursor = await dbCollection.find().sort({ id: 1 });
      const cursor = Test.NS.MongoCursor.new(testCollectionInstance, nativeCursor);
      const records = await cursor.map((record, index) => {
        record.data = `${index + 1}.${record.data}`;
        await Test.NS.Promise.resolve(record);
      });
      assert.lengthOf(records, 4, 'Records count is not match');
      assert.strictEqual(records[0].data, '1.three', '1st record is not match');
      assert.strictEqual(records[1].data, '2.men', '2nd records is not match');
      assert.strictEqual(records[2], '3.in', '3rd record is not match');
      assert.strictEqual(records[3].data, '4.a boat', '4th record is not match');
    });
    it('Check correctness logic of the "map" function without Record class', async () => {

      @initialize
      @plugin(MongoStorage)
      class Test extends LeanES {
        @nameBy static __filename = 'Test';
        @meta static object = {};
        @constant ROOT = __dirname;
      }
      const dbCollection = db.collection("test_thames_travel");
      const nativeCursor = await dbCollection.find().sort({ id: 1 });
      const cursor = Test.NS.MongoCursor.new(null, nativeCursor);
      const records = await cursor.map((record, index) => {
        record.data = `${index + 1}.${record.data}`;
        await Test.NS.Promise.resolve(record);
      });
      assert.lengthOf(records, 4, 'Records count is not match');
      assert.strictEqual(records[0].data, '1.three', '1st record is not match');
      assert.strictEqual(records[1].data, '2.men', '2nd record is not match');
      assert.strictEqual(records[2].data, '3.in', '3rd record is not match');
      assert.strictEqual(records[3].data, '4.a boat', '4th record is not match');
    });
  });
  describe('.filter', () => {
    it('Check correctness logic of the "filter" function', async () => {

      @initialize
      @plugin(MongoStorage)
      class Test extends LeanES {
        @nameBy static __filename = 'Test';
        @meta static object = {};
        @constant ROOT = __dirname;
      }

      @initialize
      @partOf(Test)
      class TestCollection extends Test.NS.Collection {
        @nameBy static __filename = 'TestCollection';
        @meta static object = {};
      }

      @initialize
      @partOf(Test)
      class TestRecord extends Test.NS.Record {
        @nameBy static __filename = 'TestRecord';
        @meta static object = {};
        @attribute({ type: 'string' }) data = '';
      }
      const testCollectionInstance = TestCollection.new();
      testCollectionInstance.setName('TestCollection');
      testCollectionInstance.setData({
        delegate: 'TestRecord'
      });
      const dbCollection = db.collection("test_thames_travel");
      const nativeCursor = await dbCollection.find().sort({ id: 1 });
      const cursor = Test.NS.MongoCursor.new(testCollectionInstance, nativeCursor);
      const records = await cursor.filter((record, index) => {
        await Test.NS.Promise.resolve(record.data.length > 3 && index < 3);
      });
      assert.lengthOf(records, 1, 'Records count is not match');
      assert.strictEqual(records[0].data, 'three', '1st record is not match');
    });
    it('Check correctness logic of the "filter" function without Record class', async () => {

      @initialize
      @plugin(MongoStorage)
      class Test extends LeanES {
        @nameBy static __filename = 'Test';
        @meta static object = {};
        @constant ROOT = __dirname;
      }
      const dbCollection = db.collection("test_thames_travel");
      const nativeCursor = await dbCollection.find().sort({ id: 1 });
      const cursor = Test.NS.MongoCursor.new(null, nativeCursor);
      const records = await cursor.filter((record, index) => {
        await Test.NS.Promise.resolve(record.data.length > 3 && index < 3);
      });
      assert.lengthOf(records, 1, 'Records count is not match');
      assert.strictEqual(records[0].data, 'three', '1st record is not match');
    });
  });
  describe('.find', () => {
    it('Check correctness logic of the "find" function', async () => {

      @initialize
      @plugin(MongoStorage)
      class Test extends LeanES {
        @nameBy static __filename = 'Test';
        @meta static object = {};
        @constant ROOT = __dirname;
      }

      @initialize
      @partOf(Test)
      class TestCollection extends Test.NS.Collection {
        @nameBy static __filename = 'TestCollection';
        @meta static object = {};
      }

      @initialize
      @partOf(Test)
      class TestRecord extends Test.NS.Record {
        @nameBy static __filename = 'TestRecord';
        @meta static object = {};
        @attribute({ type: 'string' }) data = '';
      }
      const testCollectionInstance = TestCollection.new();
      testCollectionInstance.setName('TestCollection');
      testCollectionInstance.setData({
        delegate: 'TestRecord'
      });
      const dbCollection = db.collection("test_thames_travel");
      const nativeCursor = await dbCollection.find().sort({ id: 1 });
      const cursor = Test.NS.MongoCursor.new(testCollectionInstance, nativeCursor);
      const findedRecord = await cursor.find((record, index) => {
        await Test.NS.Promise.resolve(record.data.length > 3 && index < 3);
      });
      assert.isTrue(findedRecord != null);
      assert.strictEqual(findedRecord.data, 'three', 'Record is not match');
      const notFindedRecord = await cursor.find((record, index) => {
        await Test.NS.Promise.resolve(record.data.length > 3 && index > 5);
      });
      assert.isNull(notFindedRecord);
    });
    it('Check correctness logic of the "find" function without Record class', async () => {

      @initialize
      @plugin(MongoStorage)
      class Test extends LeanES {
        @nameBy static __filename = 'Test';
        @meta static object = {};
        @constant ROOT = __dirname;
      }

      @initialize
      @partOf(Test)
      class TestCollection extends Test.NS.Collection {
        @nameBy static __filename = 'TestCollection';
        @meta static object = {};
      }

      @initialize
      @partOf(Test)
      class TestRecord extends Test.NS.Record {
        @nameBy static __filename = 'TestRecord';
        @meta static object = {};
        @attribute({ type: 'string' }) data = '';
      }
      const dbCollection = db.collection("test_thames_travel");
      const nativeCursor = await dbCollection.find().sort({ id: 1 });
      const cursor = Test.NS.MongoCursor.new(null, nativeCursor);
      const findedRecord = await cursor.find((record, index) => {
        await Test.NS.Promise.resolve(record.data.length > 3 && index < 3);
      });
      assert.isTrue(findedRecord != null);
      assert.strictEqual(findedRecord.data, 'three', 'Record is not match');
      const notFindedRecord = await cursor.find((record, index) => {
        await Test.NS.Promise.resolve(record.data.length > 3 && index > 5);
      });
      assert.isNull(notFindedRecord);
    });
  });
  describe('.compact', () => {
    it('Check correctness logic of the "compact" function when cursor haven\'t native cursor', async () => {

      @initialize
      @plugin(MongoStorage)
      class Test extends LeanES {
        @nameBy static __filename = 'Test';
        @meta static object = {};
        @constant ROOT = __dirname;
      }
      const cursor = Test.NS.MongoCursor.new();
      let err = null;
      try {
        await cursor.compact()
      } catch (error) {
        err = error;
      }
      assert.isTrue(err != null);
    });
  });
  describe('.reduce', () => {
    it('Check correctness logic of the "reduce" function', async () => {

      @initialize
      @plugin(MongoStorage)
      class Test extends LeanES {
        @nameBy static __filename = 'Test';
        @meta static object = {};
        @constant ROOT = __dirname;
      }

      @initialize
      @partOf(Test)
      class TestCollection extends Test.NS.Collection {
        @nameBy static __filename = 'TestCollection';
        @meta static object = {};
      }

      @initialize
      @partOf(Test)
      class TestRecord extends Test.NS.Record {
        @nameBy static __filename = 'TestRecord';
        @meta static object = {};
        @attribute({ type: 'string' }) data = '';
      }
      const testCollectionInstance = TestCollection.new();
      testCollectionInstance.setName('TestCollection');
      testCollectionInstance.setData({
        delegate: 'TestRecord'
      });
      const dbCollection = db.collection("test_thames_travel");
      const nativeCursor = await dbCollection.find().sort({ id: 1 });
      const cursor = Test.NS.MongoCursor.new(testCollectionInstance, nativeCursor);
      const records = await cursor.reduce((accumulator, item, index) => {
        accumulator[`${index + 1}.${item.data}`] = item;
        await Test.NS.Promise.resolve(accumulator);
      }, {});
      assert.strictEqual(records['1.three'].data, 'three', '1st record is not match');
      assert.strictEqual(records['2.men'].data, 'men', '2nd record is not match');
      assert.strictEqual(records['3.in'].data, 'in', '3rd record is not match');
      assert.strictEqual(records['4.a boat'].data, 'a boat', '4th record is not match');
    });
    it('Check correctness logic of the "reduce" function without Record class', async () => {

      @initialize
      @plugin(MongoStorage)
      class Test extends LeanES {
        @nameBy static __filename = 'Test';
        @meta static object = {};
        @constant ROOT = __dirname;
      }
      const dbCollection = db.collection("test_thames_travel");
      const nativeCursor = await dbCollection.find().sort({ id: 1 });
      const cursor = Test.NS.MongoCursor.new(null, nativeCursor);
      const records = await cursor.reduce((accumulator, item, index) => {
        accumulator[`${index + 1}.${item.data}`] = item;
        await Test.NS.Promise.resolve(accumulator);
      }, {});
      assert.strictEqual(records['1.three'].data, 'three', '1st record is not match');
      assert.strictEqual(records['2.men'].data, 'men', '2nd record is not match');
      assert.strictEqual(records['3.in'].data, 'in', '3rd record is not match');
      assert.strictEqual(records['4.a boat'].data, 'a boat', '4th record is not match');
    });
  });
  describe('.first', () => {
    it('Check correctness logic of the "first" function', async () => {

      @initialize
      @plugin(MongoStorage)
      class Test extends LeanES {
        @nameBy static __filename = 'Test';
        @meta static object = {};
        @constant ROOT = __dirname;
      }

      @initialize
      @partOf(Test)
      class TestCollection extends Test.NS.Collection {
        @nameBy static __filename = 'TestCollection';
        @meta static object = {};
      }

      @initialize
      @partOf(Test)
      class TestRecord extends Test.NS.Record {
        @nameBy static __filename = 'TestRecord';
        @meta static object = {};
        @attribute({ type: 'string' }) data = '';
      }
      const testCollectionInstance = TestCollection.new();
      testCollectionInstance.setName('TestCollection');
      testCollectionInstance.setData({
        delegate: 'TestRecord'
      });
      const dbCollection = db.collection("test_thames_travel");
      const nativeCursor = await dbCollection.find().sort({ id: 1 });
      const cursor = Test.NS.MongoCursor.new(testCollectionInstance, nativeCursor);
      let firstRecord = await cursor.first();
      assert.isTrue(firstRecord != null);
      assert.strictEqual(firstRecord.data, 'three', '1st record is not match');
      firstRecord = await cursor.first();
      assert.isTrue(cursor.isClosed);
      const nativeCursor2 = await dbCollection.find().sort({ id: 1 });
      cursor.setIterable(nativeCursor2);
      firstRecord = await cursor.first();
      assert.isTrue(firstRecord != null);
      assert.strictEqual(firstRecord.data, 'three', '1st record is not match');
      const secondFirstRecord = await cursor.first();
      assert.isTrue(cursor.isClosed);
    });
    it('Check correctness logic of the "first" function without Record class', async () => {

      @initialize
      @plugin(MongoStorage)
      class Test extends LeanES {
        @nameBy static __filename = 'Test';
        @meta static object = {};
        @constant ROOT = __dirname;
      }
      const dbCollection = db.collection("test_thames_travel");
      const nativeCursor = await dbCollection.find().sort({ id: 1 });
      const cursor = Test.NS.MongoCursor.new(null, nativeCursor);
      const firstRecord = await cursor.first();
      assert.isTrue(firstRecord != null);
      assert.strictEqual(firstRecord.data, 'three', '1st record is not match');
      const secondFirstRecord = await cursor.first();
      assert.isNull(secondFirstRecord);
      assert.isTrue(cursor.isClosed);
    });
  });
  describe('.restoreObject', () => {
    it('Check correctness logic of the "restoreObject" static function', async () => {

      @initialize
      @plugin(MongoStorage)
      class Test extends LeanES {
        @nameBy static __filename = 'Test';
        @meta static object = {};
        @constant ROOT = __dirname;
      }
      let err = null;
      try {
        await Test.NS.MongoCursor.restoreObject();
      } catch (error) {
        err = error;
      }
      assert.isTrue(err != null);
    });
  });
  describe('.replicateObject', () => {
    it('Check correctness logic of the "replicateObject" static function', async () => {

      @initialize
      @plugin(MongoStorage)
      class Test extends LeanES {
        @nameBy static __filename = 'Test';
        @meta static object = {};
        @constant ROOT = __dirname;
      }
      let err = null;
      try {
        await Test.NS.MongoCursor.replicateObject();
      } catch (error) {
        err = error;
      }
      assert.isTrue(err != null);
    });
  });
});