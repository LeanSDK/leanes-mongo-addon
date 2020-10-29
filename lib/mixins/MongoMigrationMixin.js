/*
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

// Миксин объявляет реализации для виртуальных методов основного Migration класса
// миксин должен содержать нативный платформозависимый код для обращения к релаьной базе данных на понятном ей языке.


export default (Module) => {
  const {
    Migration,
    Mixin,
    LogMessage: {
      SEND_TO_LOG,
      LEVELS,
      DEBUG
    },
    initializeMixin, meta, property, method,
    Utils: { _, co, jsonStringify }
  } = Module.NS;

  const getCollection = async (db: object, collectionFullName: string): object => {
    return await new Promise((resolve, reject) => {
      db.collection(collectionFullName, {
        strict: true
      }, (err, col) => {
        err != null ? reject(err) : resolve(col);
      });
    });
  }

  Module.defineMixin('MongoMigrationMixin', (BaseClass = Migration) => {
    const { UP, DOWN, SUPPORTED_TYPES } = this.NS;

    @initializeMixin
    class Mixin extends BaseClass {
      @meta static object = {};

      @method async createCollection(collectionName: string, options: ?object = {}) {
        const qualifiedName = this.collection.collectionFullName(collectionName);
        const voDB = voDB.createCollection(qualifiedName, options);
      }

      @method async createEdgeCollection(collectionName1: string, collectionName2: string, options: ?object = {}) {
        const qualifiedName = this.collection.collectionFullName(`${collectionName1}_${collectionName2}`);
        const voDB = await this.collection.connection;
        this.collection.sendNotification(
          SEND_TO_LOG,
          `MongoMigrationMixin::createEdgeCollection qualifiedName = ${qualifiedName}, options = ${jsonStringify(options)}`,
          LEVELS[DEBUG]
        );
        await voDB.createCollection(qualifiedName, options);
      }

      @method async addField(collectionName: string, fieldName: string, options: SUPPORTED_TYPES): {
        type: SUPPORTED_TYPES,
        default: any
      } {
        const qualifiedName = this.collection.collectionFullName(collectionName);
        if (_.isString(options)) {
          return;
        }
        let initial = null;
        if (options.default != null) {
          if (_.isNumber(options.default) || _.isBoolean(options.default)) {
            initial = options.default;
          } else {
            if (_.isDate(options.default)) {
              initial = options.default.toISOString();
            } else {
              if (_.isString(options.default)) {
                initial = `${options.default}`;
              } else {
                initial = null;
              }
            }
          }
        } else {
          initial = null;
        }
        if (initial != null) {
          const voDB = await this.collection.connection;
          this.collection.sendNotification(
            SEND_TO_LOG,
            `MongoMigrationMixin::addField qualifiedName = ${qualifiedName}, $set: ${jsonStringify({
              [`${fieldName}`]: initial
            })}`,
            LEVELS[DEBUG]
          );
          const collection = await getCollection(voDB, qualifiedName);
          await collection.updateMany({}, {
            $set: {
              [`${fieldName}`]: initial
            },
            w: 1
          });
        }
      }

      @method async addIndex(collectionName: string, fieldNames: string[], options: {
        type: 'hash' | 'skiplist' | 'persistent' | 'geo' | 'fulltext',
        unique: ?boolean,
        sparse: ?boolean
      }) {
        const qualifiedName = this.collection.collectionFullName(collectionName);
        const voDB = await this.collection.connection;
        const collection = await getCollection(voDB, qualifiedName);
        const indexFields = {};
        fieldNames.forEach((fieldName) => {
          indexFields[fieldName] = 1;
        });
        const opts = {
          unique: options.unique,
          sparse: options.sparse,
          background: options.background,
          name: options.name
        };
        this.collection.sendNotification(
          SEND_TO_LOG,
          `MongoMigrationMixin::addIndex indexFields = ${jsonStringify(indexFields)}, opts = ${jsonStringify(opts)}`,
          LEVELS[DEBUG]
        );
        await collection.ensureIndex(indexFields, opts);
      }

      @method async addTimestamps(collectionName: string, options: ?object = {}) {
        // NOTE: нет смысла выполнять запрос, т.к. в addField есть проверка if initial? и если null, то атрибут не добавляется
      }

      @method async changeCollection(name: string, options: object) {
        // not supported in MongoDB because a collection can't been modified
      }

      @method async changeField(collectionName: string, fieldName: string,
        options: SUPPORTED_TYPES | {
          type: SUPPORTED_TYPES
        }) {
        const {
          json,
          binary,
          boolean,
          date,
          datetime,
          number,
          decimal,
          float,
          integer,
          primary_key,
          string,
          text,
          time,
          timestamp,
          array,
          hash
        } = SUPPORTED_TYPES;
        const qualifiedName = this.collection.collectionFullName(collectionName);
        const voDB = await this.collection.connection;
        const collection = await getCollection(voDB, qualifiedName);
        const cursor = await collection.find().batchSize(1);
        const type = _.isString(options) ? options : options.type;
        while (await cursor.hasNext()) {
          const document = await cursor.next();
          let newValue = null;
          switch (type) {
            case boolean:
              newValue = Boolean(document[fieldName]);
              break;
            case decimal | float | integer | number:
              newValue = Number(document[fieldName]);
              break;
            case string | text | primary_key | binary | array:
              newValue = JSON.stringify(document[fieldName]);
              break;
            case json | hash:
              newValue = JSON.parse(String(document[fieldName]));
              break;
            case date | datetime:
              newValue = (new Date(document[fieldName])).toISOString();
              break;
            case time | timestamp:
              newValue = Number(new Date(document[fieldName]));
              break;
          }
        }
        this.collection.sendNotification(
          SEND_TO_LOG,
          `MongoMigrationMixin::changeField qualifiedName = ${qualifiedName}, _id: ${jsonStringify(document._id)}, $set: ${jsonStringify({
            [`${fieldName}`]: newValue
          })}`,
          LEVELS[DEBUG]
        );
        await collection.updateOne({
          _id: document._id
        }, {
          $set: {
            [`${fieldName}`]: newValue
          }
        })
      }

      @method async renameField(collectionName: string, oldFieldName: string, newFieldName: string) {
        const qualifiedName = this.collection.collectionFullName(collectionName);
        const voDB = await this.collection.connection;
        const collection = await getCollection(voDB, qualifiedName);
        this.collection.sendNotification(
          SEND_TO_LOG,
          `MongoMigrationMixin::renameField qualifiedName = ${qualifiedName}, $rename: ${jsonStringify({
            [`${oldFieldName}`]: newFieldName
          })}`,
          LEVELS[DEBUG]
        );
        await collection.updateMany(
          {},
          {
            $rename: {
              [`${oldFieldName}`]: newFieldName
            }
          }
        );
      }

      @method async renameIndex(collectionName: string, oldIndexName: string, newIndexName: string) {
        // not supported in MongoDB because a index can't been modified
      }

      @method async renameCollection(collectionName: string, newCollectionName: string) {
        const qualifiedName = this.collection.collectionFullName(collectionName);
        const newQualifiedName = this.collection.collectionFullName(newCollectionName);
        this.collection.sendNotification(
          SEND_TO_LOG,
          `MongoMigrationMixin::renameCollection qualifiedName = ${qualifiedName}, newQualifiedName = ${newQualifiedName}`,
          LEVELS[DEBUG]
        );
        const voDB = await this.collection.connection;
        const collection = await getCollection(voDB, qualifiedName);
        await collection.rename(newQualifiedName);
      }

      @method async dropCollection(collectionName: string) {
        const qualifiedName = this.collection.collectionFullName(collectionName);
        const voDB = await this.collection.connection;
        if ((await voDB.listCollections({ name: qualifiedName }).toArray()).length !== 0) {
          this.collection.sendNotification(
            SEND_TO_LOG,
            `MongoMigrationMixin::dropCollection qualifiedName = ${qualifiedName}`,
            LEVELS[DEBUG]
          );
          await voDB.dropCollection(qualifiedName);
        }
      }

      @method async dropEdgeCollection(collectionName1: string, collectionName2: string) {
        const voDB = await this.collection.connection;
        const qualifiedName = this.collection.collectionFullName(`${collectionName1}_${collectionName2}`);
        if ((await voDB.listCollections({ name: qualifiedName }).toArray()).length !== 0) {
          this.collection.sendNotification(
            SEND_TO_LOG,
            `MongoMigrationMixin::dropEdgeCollection qualifiedName = ${qualifiedName}`,
            LEVELS[DEBUG]
          );
          await voDB.dropCollection(qualifiedName);
        }
      }

      @method async removeField(collectionName: string, fieldName: string) {
        const qualifiedName = this.collection.collectionFullName(collectionName);
        const voDB = await this.collection.connection;
        const collection = await getCollection(voDB, qualifiedName);
        this.collection.sendNotification(
          SEND_TO_LOG,
          `MongoMigrationMixin::removeField qualifiedName = ${qualifiedName}, $unset: ${jsonStringify({
            [`${fieldName}`]: ''
          })}`,
          LEVELS[DEBUG]
        );
        await collection.updateMany(
          {},
          {
            $unset: {
              [`${fieldName}`]: ''
            }
          },
          {
            w: 1
          }
        );
      }

      @method async removeIndex(collectionName: string, fieldNames: string,
        options: {
          type: 'hash' | 'skiplist' | 'persistent' | 'geo' | 'fulltext',
          unique: ?boolean,
          sparse: ?boolean
        }) {
        const qualifiedName = this.collection.collectionFullName(collectionName);
        const voDB = await this.collection.connection;
        const collection = await getCollection(voDB, qualifiedName);
        const indexName = options.name;
        if (!(indexName != null)) {
          const indexFields = {};
          fieldNames.forEach((fieldName) => {
            indexFields[fieldName] = 1;
          });
          const indexName = await collection.ensureIndex(indexFields, {
            unique: options.unique,
            sparse: options.sparse,
            background: options.background,
            name: options.name
          });
        }
        if (await collection.indexExists(indexName)) {
          this.collection.sendNotification(
            SEND_TO_LOG,
            `MongoMigrationMixin::removeIndex qualifiedName = ${qualifiedName}, indexName = ${indexName}, indexFields = ${jsonStringify(indexFields)}, options = ${jsonStringify(options)}`,
            LEVELS[DEBUG]
          );
          await collection.dropIndex(indexName);
        }
      }

      @method async removeTimestamps(collectionName: string, options: ?object = {}) {
        const qualifiedName = this.collection.collectionFullName(collectionName);
        const voDB = await this.collection.connection;
        const collection = await getCollection(voDB, qualifiedName);
        const timestamps = {
          createdAt: null,
          updatedAt: null,
          deletedAt: null
        };
        this.collection.sendNotification(
          SEND_TO_LOG,
          `MongoMigrationMixin::removeTimestamps qualifiedName = ${qualifiedName}, $unset: ${jsonStringify(timestamps)}`,
          LEVELS[DEBUG]
        );
        await collection.updateMany(
          {},
          {
            $unset: timestamps
          },
          {
            w: 1
          }
        );
      }
    }
    return Mixin;
  });
}