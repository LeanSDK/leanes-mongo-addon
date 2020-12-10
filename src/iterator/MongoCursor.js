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

// import type { CollectionInterface } from '../interfaces/CollectionInterface';

import type { RecordInterface } from '../interfaces/RecordInterface';
import type { CursorInterface } from '../interfaces/CursorInterface';
import type { MongoNativeCursorInterface } from '../interfaces/MongoNativeCursorInterface';

export default (Module) => {
  const {
    CoreObject,
    initialize, partOf, meta, property, method, nameBy, injectable, inject,
    Utils: { _ }
  } = Module.NS;

  @initialize
  @injectable()
  @partOf(Module)
  class MongoCursor<
    C = { normalize: (ahData: any) => Promise<RecordInterface> }, T = MongoNativeCursorInterface
  > extends CoreObject implements CursorInterface<C, RecordInterface, T> {
    @nameBy static __filename = __filename;
    @meta static object = {};

    @property _cursor: ?T;
    @property _collection: ?C;
    @property get isClosed(): boolean {
      if (this._cursor != null) {
        return this._cursor.isClosed != null ? this._cursor.isClosed() : true;
      }
      return true;
    }

    @method setIterable(aoCursor: T): CursorInterface<C, RecordInterface, T> {
      this._cursor = aoCursor;
      return this;
    }

    @method setCollection(aoCollection: C): CursorInterface<C, RecordInterface, T> {
      this._collection = aoCollection;
      return this;
    }

    @property collectionName: ?string = null;

    @inject('CollectionFactory<*>')
    @property _collectionFactory: (string) => C;

    @property get collection(): ?C {
      if (this.collectionName != null) {
        return this._collectionFactory(this.collectionName)
      } else {
        return this._collection
      }
    }

    @method async toArray(): Promise<Array<?RecordInterface>> {
      const results = [];
      while ((await this.hasNext())) {
        results.push(await this.next());
      }
      return results;
    }

    @method async next(): Promise<?RecordInterface> {
      if (this._cursor == null) return;
      const data = await this._cursor.next();
      return await (this.collection != null ? this.collection.normalize(data) : data);
    }

    @method async hasNext(): Promise<boolean> {
      return await !this.isClosed && (await this._cursor.hasNext());
    }

    @method async close(): Promise<void> {
      await Promise.resolve(
        this._cursor != null ? this._cursor.close() : void 0
      );
    }

    @method async count(): Promise<number> {
      if (this._cursor == null) return 0;
      return await (await this._cursor.count(true));
    }

    @method async forEach(lambda: (RecordInterface, number) =>?Promise<void>): Promise<void> {
      let index = 0;
      try {
        while ((await this.hasNext())) {
          await lambda(await this.next(), index++)
        }
      } catch (err) {
        await this.close();
        throw (err);
      }
    }

    @method async map<R>(lambda: (RecordInterface, number) => R | Promise<R>): Promise<Array<?R>> {
      let index = 0;
      try {
        const results = [];
        while ((await this.hasNext())) {
          results.push(await lambda((await this.next()), index++));
        }
        return results;
      } catch (err) {
        await this.close();
        throw (err);
      }
    }

    @method async filter(lambda: (RecordInterface, number) => boolean | Promise<boolean>): Promise<Array<?RecordInterface>> {
      let index = 0;
      const records = [];
      try {
        while ((await this.hasNext())) {
          const record = (await this.next());
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

    @method async find(lambda: (RecordInterface, number) => boolean | Promise<boolean>): Promise<?RecordInterface> {
      let index = 0;
      let _record = null;
      try {
        while ((await this.hasNext())) {
          const record = (await this.next());
          if (await lambda(record, index++)) {
            _record = record;
            break;
          }
        }
        return _record;
      } catch (err) {
        await this.close();
        throw (err);
      }
    }

    @method async compact(): Promise<Array<?RecordInterface>> {
      if (this._cursor == null) return [];
      const results = [];
      try {
        while ((await this.hasNext())) {
          const rawResult = await (this._cursor.next());
          if (!_.isEmpty(rawResult)) {
            const result = await (this.collection != null ? this.collection.normalize(rawResult) : rawResult);
            results.push(result);
          }
        }
        return results;
      } catch (err) {
        await this.close();
        throw (err);
      }
    }

    @method async reduce<I>(lambda: (I, RecordInterface, number) => I | Promise<I>, initialValue: I): Promise<I> {
      try {
        let index = 0;
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

    @method async first(): Promise<?RecordInterface> {
      try {
        const result = (await this.hasNext()) != null ? (await this.next()) : null;
        await this.close();
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
  }
}
