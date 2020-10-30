/*
This file is part of leanes-mongo-storage.

leanes-mongo-storage is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

leanes-mongo-storage is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with leanes-mongo-storage.  If not, see <https://www.gnu.org/licenses/>.
*/
import type {CollectionInterface, CursorInterface} from '@leansdk/leanes/src/leanes';

export default (Module) => {
  const {
    CoreObject,
    initialize, partOf, meta, property, method, nameBy,
    Utils: { _ }
  } = Module.NS;

  @initialize
  @partOf(Module)
  class MongoCursor extends CoreObject {
    @nameBy static __filename = __filename;
    @meta static object = {};

    @property _cursor: ?object;
    @property _collection: ?CollectionInterface;
    @property get isClosed(): boolean {
      if (this._cursor != null) {
        return this._cursor.isClosed() != null ? this._cursor.isClosed() : true;
      }
    }

    @method setIterable(aoCursor: object): CursorInterface {
      this._cursor = aoCursor;
      return this;
    }

    @method setCollection(aoCollection: CollectionInterface): CursorInterface {
      this._collection = aoCollection;
      return this;
    }

    @method async toArray(): array {
      while (await this.hasNext()) {
        await this.next();
      }
    }

    @method async next(): any {
      if (this._cursor == null) {
        return;
      }
      const data = await this._cursor.next();
      switch (false) {
        case !(data == null):
          return data;
        case this._collection == null:
          return await this._collection.normalize(data)
        default:
          return data;
      }
    }

    @method async hasNext(): boolean {
      return await !this.isClosed && (await this._cursor.hasNext());
    }

    @method async close() {
      await Module.NS.Promise.resolve(
        this._cursor != null ? this._cursor.close() : void 0
      );
    }

    @method async count(): number {
      if (this._cursor == null) {
        return 0;
      }
      return await (await this._cursor.count(true));
    }

    @method async forEach(lambda: function) {
      const index = 0;
      try {
        while (await this.hasNext()) {
          await lambda(await this.next(), index++)
        }
      } catch (err) {
        await this.close();
        throw (err);
      }
    }

    @method async map(lambda: function): array {
      const index = 0;
      try {
        while (await this.hasNext()) {
          await lambda(await this.next(), index++)
        }
      } catch (err) {
        await this.close();
        throw (err);
      }
    }

    @method async filter(lambda: function): array {
      const index = 0;
      const records = [];
      try {
        while (await this.hasNext()) {
          const record = await this.next();
          if (await lambda(record, index++)) {
            records.push(record);
          }
        }
        return records;
      } catch (err) {
        await this.close();
        throw (err);
      }
    }

    @method async find(lambda: function): any {
      const index = 0;
      let _record = null;
      try {
        while (await this.hasNext()) {
          const record = await this.next();
          if (await lambda(record, index++)) {
            _record = record;
            break;
          }
          return _record;
        }
      } catch (err) {
        await this.close();
        throw (err);
      }
    }

    @method async compact(): array {
      if (this._cursor == null) {
        return [];
      }
      const records = [];
      try {
        while (await this.hasNext()) {
          const rawRecord = await this._cursor.next();
          if (!_.isEmpty(rawRecord)) {
            const record = this._collection != null ? this._collection.normalize(rawRecord) : rawRecord;
            records.push(record);
          }
        }
        return records;
      } catch (err) {
        this.close();
        throw (err);
      }
    }

    @method async reduce(lambda: function, initialValue: ?any): any {
      try {
        const index = 0;
        let _initialValue = initialValue;
        while (await this.hasNext()) {
          _initialValue = await lambda(_initialValue, (await this.next()), index++);
        }
        return _initialValue;
      } catch (err) {
        await this.close();
        throw (err);
      }
    }

    @method async first(): any {
      try {
        const result = await this.hasNext() != null ? this.next : null;
        this.close();
        return result;
      } catch (err) {
        await this.close();
        throw(err);
      }
    }

    @method static async restoreObject() {
      throw new Error(`restoreObject method not supported for ${this.name}`);
    }

    @method static async replicateObject() {
      throw new Error(`replicateObject method not supported for ${this.name}`);
    }

    constructor(aoCollection = null, aoCursor = null) {
      super(...arguments);
      if(aoCollection != null) {
        this._collection = aoCollection;
      }
      if(aoCursor != null) {
        this._cursor = aoCursor;
      }
    }
  }
}