export default (Module) => {
  const {
    initializeMixin, meta
  } = Module.NS;

  return [ 'MongoStorage', (BaseClass) => {
    @initializeMixin
    class Mixin extends BaseClass {
      @meta static object = {};
    }

    require('./iterator/MongoCursor').default(Mixin)

    require('./mixins/MongoCollectionMixin').default(Mixin);
    require('./mixins/MongoSerializerMixin').default(Mixin);
    require('./mixins/MongoMigrationMixin').default(Mixin);

    return Mixin;
  }]
}