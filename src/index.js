// This file is part of leanes-mongo-addon.
//
// leanes-mongo-addon is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// leanes-mongo-addon is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with leanes-mongo-addon.  If not, see <https://www.gnu.org/licenses/>.

import MongoCursor from './iterator/MongoCursor';

import MongoCollectionMixin from './mixins/MongoCollectionMixin';
import MongoSerializerMixin from './mixins/MongoSerializerMixin';
import MongoMigrationMixin from './mixins/MongoMigrationMixin';

export default (Module) => {
  const {
    initializeMixin, meta
  } = Module.NS;

  return [ 'MongoAddon', (BaseClass) => {
    @MongoMigrationMixin
    @MongoSerializerMixin
    @MongoCollectionMixin
    @MongoCursor

    @initializeMixin
    class Mixin extends BaseClass {
      @meta static object = {};
    }
    return Mixin;
  }]
}
