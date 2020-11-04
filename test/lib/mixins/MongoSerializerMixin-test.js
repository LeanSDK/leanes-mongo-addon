const { assert } = require('chai');
const sinon = require('sinon');
const LeanES = require('@leansdk/leanes/src/leanes').default;
const MongoStorage = require('../../../lib/index.js').default;
const {
  initialize, partOf, nameBy, mixin, meta, method, attribute, plugin
} = LeanES.NS;

describe('MongoSerializerMixin', () => {
  describe('.normalize', () => {
    let facade = null;
    afterEach(() => {
      if (typeof facade !== "undefined" && facade !== null) {
        if (typeof facade.remove === "function") {
          facade.remove();
        }
      }
    });
    it('should normalize object value', async () => {
      const KEY = 'TEST_SERIALIZER_001';
      facade = LeanES.NS.Facade.getInstance(KEY);

      @initialize
      @plugin(MongoStorage)
      class Test extends LeanES {
        @nameBy static __filename = 'Test';
        @meta static object = {};
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
        @attribute({ type: 'number' }) number;
        @attribute({ type: 'string' }) string;
        @attribute({ type: 'boolean' }) boolean;

        @method findRecordByName(asType) {
          return TestRecord;
        }
      }

      @initialize
      @mixin(Test.NS.MongoSerializerMixin)
      @partOf(Test)
      class TestSerializer extends LeanES.NS.Collection {
        @nameBy static __filename = 'TestSerializer';
        @meta static object = {};
      }
      const boundCollection = TestsCollection.new('TestsCollection', {
        delegate: 'TestRecord'
      });
      facade.registerProxy(boundCollection);
      const serializer = TestSerializer.new(boundCollection);
      const record = await serializer.normalize(TestRecord, {
        type: 'Test::TestRecord',
        string: 'string',
        number: 123,
        boolean: true,
        _rev: '5d2ff0e0951b29c992e17774d4dbae5e'
      });
      assert.instanceOf(record, TestRecord, 'Normalize is incorrect');
      assert.include(record, {
        type: 'Test::TestRecord',
        string: 'string',
        number: 123,
        boolean: true,
        rev: '5d2ff0e0951b29c992e17774d4dbae5e'
      });
    });
  });
  describe('.serialize', () => {
    it('should serialize Record.prototype value', async () => {
      const KEY = 'TEST_SERIALIZER_00';
      facade = LeanES.NS.Facade.getInstance(KEY);

      @initialize
      @plugin(MongoStorage)
      class Test extends LeanES {
        @nameBy static __filename = 'Test';
        @meta static object = {};
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
        @attribute({ type: 'number' }) number;
        @attribute({ type: 'string' }) string;
        @attribute({ type: 'boolean' }) boolean;

        @method findRecordByName(asType) {
          return TestRecord;
        }
      }

      @initialize
      @mixin(Test.NS.MongoSerializerMixin)
      @partOf(Test)
      class TestSerializer extends LeanES.NS.Collection {
        @nameBy static __filename = 'TestSerializer';
        @meta static object = {};
      }
      const boundCollection = TestsCollection.new('TestsCollection', {
        delegate: 'TestRecord'
      });
      facade.registerProxy(boundCollection);
      const serializer = TestSerializer.new(boundCollection);
      const data = await serializer.normalize(TestRecord, {
        type: 'Test::TestRecord',
        string: 'string',
        number: 123,
        boolean: true
      });
      assert.instanceOf(data, Object, 'Serialize is incorrect');
      assert.include(data, {
        type: 'Test::TestRecord',
        string: 'string',
        number: 123,
        boolean: true,
      });
    });
  });
});