const { assert } = require('chai');
const sinon = require('sinon');
const addonPath = process.env.ENV === 'build' ? "../../lib/index.dev" : "../../src/index.js";
const MongoAddon = require(addonPath).default;
const MapperAddon = require('@leansdk/leanes-mapper-addon/src').default;
const LeanES = require('@leansdk/leanes/src').default;
const {
  initialize, partOf, nameBy, mixin, meta, method, plugin
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
      @plugin(MongoAddon)
      @plugin(MapperAddon)
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
        @Test.NS.attribute({ type: 'number' }) number;
        @Test.NS.attribute({ type: 'string' }) string;
        @Test.NS.attribute({ type: 'boolean' }) boolean;

        @method findRecordByName(asType) {
          return TestRecord;
        }
      }

      @initialize
      @partOf(Test)
      @mixin(Test.NS.MongoSerializerMixin)
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
      @plugin(MongoAddon)
      @plugin(MapperAddon)
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
        @Test.NS.attribute({ type: 'number' }) number;
        @Test.NS.attribute({ type: 'string' }) string;
        @Test.NS.attribute({ type: 'boolean' }) boolean;

        @method findRecordByName(asType) {
          return TestRecord;
        }
      }

      @initialize
      @partOf(Test)
      @mixin(Test.NS.MongoSerializerMixin)
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
