￼/*
This file is part of leanrc-mongo-storage.

leanrc-mongo-storage is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

leanrc-mongo-storage is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with leanrc-mongo-storage.  If not, see <https://www.gnu.org/licenses/>.
*/

import crypto from 'crypto';

export default (Module) => {
  const {
    RecordInterface,
    Mixin,
    Serializer,
    initializeMixin, meta, property, method,
  } = Module.NS;

  Module.defineMixin('MongoSerializerMixin', (BaseClass = Serializer) => {
    @initializeMixin
    class Mixin extends BaseClass {
      @meta static object = {};

      @method async normalize(acRecord: RecordInterface, ahPayload: ?any): RecordInterface {
        ahPayload.rev = ahPayload._rev;
        ahPayload._rev = undefined;
        delete ahPayload._rev;
        return await acRecord.normalize(ahPayload, this.collection);
      }

      @method async serialize(aoRecord: ?RecordInterface, options: ?object = null): any {
        const vcRecord = aoRecord.constructor;
        const serialized = await vcRecord.serialize(aoRecord, options);
        serialized.rev = undefined;
        const hash = crypto.createHash('md5');
        hash.update(JSON.stringify(serialized));
        serialized._rev = hash.digest('hex');
        delete serialized.rev;
        return serialized;
      }
    }
    return Mixin;
  });
}