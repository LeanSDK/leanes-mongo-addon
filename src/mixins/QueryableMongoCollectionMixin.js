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

import type { CollectionInterface } from '../interfaces/CollectionInterface';
import type { RecordInterface } from '../interfaces/RecordInterface';
import type { CursorInterface } from '../interfaces/CursorInterface';
import type { QueryInterface } from '../interfaces/QueryInterface';
import type { MongoNativeCursorInterface } from '../interfaces/MongoNativeCursorInterface';

// import type { MomentT } from '../types/MomentT';
// import type { StreamT } from '../types/StreamT';

// import { MongoClient } from 'mongodb';
// import { GridFSBucket } from 'mongodb';
// import Parser from 'mongo-parse'; //mongo-parse@2.0.2

export default (Module) => {
  const {
    // Pipes,
    // Query,
    // Cursor, MongoCursor,
    initializeMixin, meta, property, method,
    // Utils: { _, jsonStringify, moment, assign }
  } = Module.NS;
  // const { LogMessage } = Pipes.NS;
  // const {
  //   SEND_TO_LOG, LEVELS, DEBUG
  // } = LogMessage;

  // let _connection = null;
  // let _consumers = null;

  // const wrapReference = (value) => {
  //   if (_.isString(value)) {
  //     if (/^\@doc\./.test(value)) {
  //       return value.replace('@doc.', '');
  //     } else {
  //       return value.replace('@', '');
  //     }
  //   } else {
  //     return value;
  //   }
  // }
  //
  // const buildIntervalQuery = (
  //   aoKey: string,
  //   aoInterval: MomentT,
  //   aoIntervalSize: ('day' | 'week' | 'month' | 'year'),
  //   aoDirect: boolean
  // ): object => {
  //   const aoInterval = aoInterval.utc();
  //   const voIntervalStart = aoInterval.startOf(aoIntervalSize).toISOString();
  //   const voIntervalEnd = aoInterval.clone().endOf(aoIntervalSize).toISOString();
  //   if (aoDirect) {
  //     return {
  //       $and: [
  //         {
  //           [`${aoKey}`]: { $gte: voIntervalStart },
  //           [`${aoKey}`]: { $lt: voIntervalEnd }
  //         }
  //       ]
  //     };
  //   } else {
  //     return {
  //       $not: {
  //         $and: [
  //           {
  //             [`${aoKey}`]: { $gte: voIntervalStart },
  //             [`${aoKey}`]: { $lt: voIntervalEnd }
  //           }
  //         ]
  //       }
  //     };
  //   }
  // }

  Module.defineMixin(__filename, (BaseClass) => {
    @initializeMixin
    class Mixin<
      D = RecordInterface, C = CollectionInterface<D>, A = MongoNativeCursorInterface
    > extends BaseClass {
      @meta static object = {};

      // @property _collection: ?Promise<T>;
      // @property _bucket: ?Promise<T>;
      //
      // @property get connection(): Promise<T> {
      //   const self = this;
      //   if (_connection == null) {
      //     _connection = async function () {
      //       let credentials = '';
      //       const mongodb = self.getData().mongodb != null ? self.getData().mongodb : self.configs.mongodb;
      //       const { username, password, host, port, dbName } = mongodb;
      //       if (username && password) {
      //         credentials = `${username}:${password}@`;
      //       }
      //       const db_url = `mongodb://${credentials}${host}:${port}/${dbName}?authSource=admin`;
      //       const connection = await MongoClient.connect(db_url);
      //       return connection;
      //     };
      //   }
      //   return _connection;
      // }

      // @property get collection(): Promise<T> {
      //   const self = this;
      //   if (this._collection == null) {
      //     this._collection = async function () {
      //       const connection = await self.connection;
      //       const name = self.collectionFullName();
      //       await new Promise((resolve, reject) => {
      //         connection.collection(name, { strict: true }, (err, col) => {
      //           err != null ? reject(err) : resolve(col);
      //         });
      //       });
      //     };
      //   }
      //   return this._collection;
      // }
      //
      // @property get bucket(): Promise<T> {
      //   const self = this;
      //   if (this._bucket == null) {
      //     this._bucket = async function () {
      //       const mongodb = self.getData().mongodb != null ? self.getData().mongodb : self.configs.mongodb;
      //       const { dbName } = mongodb;
      //       const connection = await self.connection;
      //       const voDB = connection.db(`${dbName}_fs`);
      //       return new GridFSBucket(voDB, {
      //         chunkSizeBytes: 64512,
      //         bucketName: 'binary-store'
      //       });
      //     };
      //   }
      //   return this._bucket;
      // }

      // @method onRegister() {
      //   super(...arguments);
      //   (() => {
      //     return this.connection;
      //   })();
      //   _consumers != null ? _consumers : 0;
      //   _consumers++;
      // }
      //
      // @method async onRemove() {
      //   super(...arguments);
      //   _consumers--;
      //   if (_consumers == 0) {
      //     const connection = await _connection;
      //     await connection.close(true);
      //   }
      // }

      // @method async push(aoRecord: RecordInterface): RecordInterface {
      //   const collection = await this.collection;
      //   // const ipoMultitonKey = this.constructor.instanceVariables['~multitonKey'].pointer;
      //   const stats = await collection.stats();
      //   const snapshot = await this.serialize(aoRecord);
      //   const raw1 = await collection.findOne({
      //     id: {
      //       $eq: snapshot.id
      //     }
      //   });
      //   this.send(
      //     SEND_TO_LOG,
      //     `MongoCollectionMixin::push ns = ${stats.ns}, snapshot = ${jsonStringify(snapshot)}`,
      //     LEVELS[DEBUG]
      //   );
      //   await collection.insertOne(snapshot, {
      //     w: 'majority',
      //     j: true,
      //     wtimeout: 500
      //   });
      //   return await this.normalize(await collection.findOne({
      //     id: {
      //       $eq: snapshot.id
      //     }
      //   }));
      // }

      // @method async remove(id: string | number) {
      //   const collection = await this.collection;
      //   const stats = await collection.stats();
      //   this.send(
      //     SEND_TO_LOG,
      //     `MongoCollectionMixin::remove ns = ${stats.ns}, id = ${id}`,
      //     LEVELS[DEBUG]
      //   );
      //   await collection.deleteOne({
      //     id: {
      //       $eq: id
      //     }
      //   }, {
      //     w: 'majority',
      //     j: true,
      //     wtimeout: 500
      //   });
      // }

      // @method async take(id: string | number): ?RecordInterface {
      //   const collection = await this.collection;
      //   const stats = await collection.stats();
      //   this.send(
      //     SEND_TO_LOG,
      //     `MongoCollectionMixin::take ns = ${stats.ns}, id = ${id}`,
      //     LEVELS[DEBUG]
      //   );
      //   const rawRecord = await collection.findOne({
      //     id: {
      //       $eq: id
      //     }
      //   });
      //   if (rawRecord != null) {
      //     return await this.normalize(rawRecord);
      //   }
      // }

      @method async takeBy(
        query: object, options: ?object = {}
      ): Promise<CursorInterface<C, D, A>> {
        const result = await this.adapter.takeBy(this.delegate, query, options);
        return this._cursorFactory(this.getName(), result, 'MongoCursor');

        // const collection = await this.collection;
        // const stats = await collection.stats();
        // const voQuery = this.parseFilter(Parser.parse(query));
        // this.send(
        //   SEND_TO_LOG,
        //   `MongoCollectionMixin::takeBy ns = ${stats.ns}, voQuery = ${jsonStringify(voQuery)}`,
        //   LEVELS[DEBUG]
        // );
        // const voNativeCursor = await collection.find(voQuery);
        // const vnLimit = options.$limit;
        // if (vnLimit != null) {
        //   voNativeCursor = voNativeCursor.limit(vnLimit);
        // }
        // const vnOffset = options.$offset;
        // if (vnOffset != null) {
        //   voNativeCursor = voNativeCursor.skip(vnOffset);
        // }
        // const voSort = options.$sort;
        // if (voSort != null) {
        //   const voNativeCursor = voNativeCursor.sort(voSort.reduce((result, item) => {
        //     for (const asRef in item) {
        //       if (!{}.hasOwnProperty.call(item, asRef)) continue;
        //       const asSortDirect = item[asRef];
        //       result[wrapReference(asRef)] = asSortDirect === 'ASC' ? 1 : -1;
        //     }
        //     return result;
        //   }), {});
        // }
        // return MongoCursor.new(this, voNativeCursor);
      }

      // @method async takeMany(ids: [string | number]): CursorInterface {
      //   const collection = await this.collection;
      //   const stats = await collection.stats();
      //   this.send(
      //     SEND_TO_LOG,
      //     `MongoCollectionMixin::takeMany ns = ${stats.ns}, ids = ${jsonStringify(ids)}`,
      //     LEVELS[DEBUG]
      //   );
      //   const voNativeCursor = await collection.find({
      //     id: {
      //       $in: ids
      //     }
      //   });
      //   return MongoCursor.new(this, voNativeCursor);
      // }

      // @method async takeAll(): CursorInterface {
      //   const collection = await this.collection;
      //   const stats = await collection.stats();
      //   this.send(
      //     SEND_TO_LOG,
      //     `MongoCollectionMixin::takeAll ns = ${stats.ns}`,
      //     LEVELS[DEBUG]
      //   );
      //   const voNativeCursor = await collection.find();
      //   return MongoCursor.new(this, voNativeCursor);
      // }

      // @method async override(id: string | number, aoRecord: RecordInterface): RecordInterface {
      //   const collection = await this.collection;
      //   const snapshot = await this.serialize(aoRecord);
      //   const stats = await collection.stats();
      //   this.send(
      //     SEND_TO_LOG,
      //     `MongoCollectionMixin::override ns = ${stats.ns}, id = ${id}, snapshot = ${jsonStringify(snapshot)}`,
      //     LEVELS[DEBUG]
      //   );
      //   await collection.updateOne({
      //     id: {
      //       $eq: id
      //     }
      //   }, {
      //     $set: snapshot
      //   }, {
      //     multi: true,
      //     w: 'majority',
      //     j: true,
      //     wtimeout: 500
      //   });
      //   const rawRecord = await collection.findOne({
      //     id: {
      //       $eq: id
      //     }
      //   });
      //   return await this.normalize(rawRecord);
      // }

      // @method async includes(id: string | number): boolean {
      //   const collection = await this.collection;
      //   const stats = await collection.stats();
      //   this.send(
      //     SEND_TO_LOG,
      //     `MongoCollectionMixin::includes ns = ${stats.ns}, id = ${id}`,
      //     LEVELS[DEBUG]
      //   );
      //   return (await collection.findOne({
      //     id: {
      //       $eq: id
      //     }
      //   })) != null;
      // }

      @method async exists(query: object): Promise<boolean> {
        return await this.adapter.exists(this.delegate, query);
        // const collection = await this.collection;
        // const stats = await collection.stats();
        // const voQuery = this.parseFilter(Parser.parse(query));
        // this.send(
        //   SEND_TO_LOG,
        //   `MongoCollectionMixin::exists ns = ${stats.ns}, voQuery = ${jsonStringify(voQuery)}`,
        //   LEVELS[DEBUG]
        // );
        // return (await collection.count(voQuery)) !== 0;
      }

      // @method async length(): number {
      //   const collection = await this.collection;
      //   const stats = await collection.stats();
      //   this.send(
      //     SEND_TO_LOG,
      //     `MongoCollectionMixin::length ns = ${stats.ns}`,
      //     LEVELS[DEBUG]
      //   );
      //   return stats.count;
      // }

      // // @TODO Нужно добавить описание входных параметров опреторам и соответственно их проверку
      // @property operatorsMap: { [key: string]: Function } = {
      //   // Logical Query Operators
      //   $and: (def) => {
      //     return { $and: def };
      //   },
      //   $or: (def) => {
      //     return { $or: def };
      //   },
      //   $not: (def) => {
      //     return { $not: def };
      //   },
      //   $nor: (def) => {
      //     return { $nor: def }; //not or # !(a||b) === !a && !b
      //   },
      //
      //   // Comparison Query Operators (aoSecond is NOT sub-query)
      //   $eq: (aoFirst, aoSecond) => {
      //     return {
      //       [`${wrapReference(aoFirst)}`]: { $eq: wrapReference(aoSecond) } // ==
      //     };
      //   },
      //   $ne: (aoFirst, aoSecond) => {
      //     return {
      //       [`${wrapReference(aoFirst)}`]: { $ne: wrapReference(aoSecond) } // !=
      //     };
      //   },
      //   $lt: (aoFirst, aoSecond) => {
      //     return {
      //       [`${wrapReference(aoFirst)}`]: { $lt: wrapReference(aoSecond) } // <
      //     };
      //   },
      //   $lte: (aoFirst, aoSecond) => {
      //     return {
      //       [`${wrapReference(aoFirst)}`]: { $lte: wrapReference(aoSecond) } // <=
      //     };
      //   },
      //   $gt: (aoFirst, aoSecond) => {
      //     return {
      //       [`${wrapReference(aoFirst)}`]: { $gt: wrapReference(aoSecond) } // >
      //     };
      //   },
      //   $gte: (aoFirst, aoSecond) => {
      //     return {
      //       [`${wrapReference(aoFirst)}`]: { $gte: wrapReference(aoSecond) } // >=
      //     };
      //   },
      //   $in: (aoFirst, alItems) => { // check value present in array
      //     return {
      //       [`${wrapReference(aoFirst)}`]: { $in: alItems }
      //     };
      //   },
      //   $nin: (aoFirst, alItems) => { // ... not present in array
      //     return {
      //       [`${wrapReference(aoFirst)}`]: { $nin: alItems }
      //     };
      //   },
      //
      //   // Array Query Operators
      //   $all: (aoFirst, alItems) => { // contains some values
      //     return {
      //       [`${wrapReference(aoFirst)}`]: { $all: alItems }
      //     };
      //   },
      //   $elemMatch: (aoFirst, aoSecond) => { // conditions for complex item
      //     return {
      //       [`${wrapReference(aoFirst)}`]: { $elemMatch: aoSecond }
      //     };
      //   },
      //   $size: (aoFirst, aoSecond) => {
      //     return {
      //       [`${wrapReference(aoFirst)}`]: { $size: aoSecond }
      //     };
      //   },
      //
      //   // Element Query Operators
      //   $exists: (aoFirst, aoSecond) => { // condition for check present some value in field
      //     return {
      //       [`${wrapReference(aoFirst)}`]: { $exists: aoSecond }
      //     };
      //   },
      //   $type: (aoFirst, aoSecond) => {
      //     return {
      //       [`${wrapReference(aoFirst)}`]: { $type: aoSecond }
      //     };
      //   },
      //
      //   // Evaluation Query Operators
      //   $mod: (aoFirst, aoSecond) => {
      //     return {
      //       [`${wrapReference(aoFirst)}`]: { $mod: aoSecond }
      //     };
      //   },
      //   $regex: (aoFirst, aoSecond, aoThird) => { // value must be string. check it by RegExp.
      //     const regExpDefinitions = /^\/([\s\S]*)\/(i?m?)$/i.exec(aoSecond);
      //     if (!(regExpDefinitions != null)) {
      //       throw new Error('Invalid Regular Expression');
      //     }
      //     const [full, regexp, params] = regExpDefinitions;
      //     const value = {
      //       $regex: new RegExp(regexp, params)
      //     };
      //     if (aoThird != null) {
      //       value['$options'] = aoThird;
      //     }
      //     return {
      //       [`${wrapReference(aoFirst)}`]: value
      //     };
      //   },
      //   $text: () => { throw new Error('Not supported') },
      //   $where: () => { throw new Error('Not supported') },
      //
      //   // Datetime Query Operators
      //   $td: (aoFirst, aoSecond) => { // this day (today)
      //     return buildIntervalQuery(wrapReference(aoFirst), moment(), 'day', aoSecond);
      //   },
      //   $ld: (aoFirst, aoSecond) => { // last day (yesterday)
      //     return buildIntervalQuery(wrapReference(aoFirst), moment().subtract(1, 'days'), 'day', aoSecond);
      //   },
      //   $tw: (aoFirst, aoSecond) => { // this week
      //     return buildIntervalQuery(wrapReference(aoFirst), moment(), 'week', aoSecond);
      //   },
      //   $lw: (aoFirst, aoSecond) => { // last week
      //     return buildIntervalQuery(wrapReference(aoFirst), moment().subtract(1, 'weeks'), 'week', aoSecond);
      //   },
      //   $tm: (aoFirst, aoSecond) => { // this month
      //     return buildIntervalQuery(wrapReference(aoFirst), moment(), 'month', aoSecond);
      //   },
      //   $lm: (aoFirst, aoSecond) => { // last month
      //     return buildIntervalQuery(wrapReference(aoFirst), moment().subtract(1, 'months'), 'month', aoSecond);
      //   },
      //   $ty: (aoFirst, aoSecond) => { // this year
      //     return buildIntervalQuery(wrapReference(aoFirst), moment(), 'year', aoSecond);
      //   },
      //   $ly: (aoFirst, aoSecond) => { // last year
      //     return buildIntervalQuery(wrapReference(aoFirst), moment().subtract(1, 'years'), 'year', aoSecond);
      //   }
      // }
      //
      // @method parseFilter(
      //   {
      //     field, parts = [], operator, operand, implicitField
      //   }: {
      //     field: ?string, parts: ?object[], operator: ?string, operand: ?any, implicitField: ?boolean
      //   }
      // ): object {
      //   if (field != null && operator !== '$elemMatch' && parts.length === 0) {
      //     const customFilter = this.delegate.customFilters[field];
      //     if (customFilter != null && customFilter[operator] != null) {
      //       const customFilterFunc = customFilter[operator];
      //       customFilterFunc.call(this, operand);
      //     } else {
      //       this.operatorsMap[operator](field, operand);
      //     }
      //   } else {
      //     if (field != null && operator === '$elemMatch') {
      //       this.operatorsMap[operator](field, parts.reduce((result, part) => {
      //         if (implicitField && !(part.field != null) && (!(part.parts != null) || part.parts.length === 0)) {
      //           const subquery = this.operatorsMap[part.operator]('temporaryField', part.operand);
      //           Object.assign(result, subquery.temporaryField)
      //         } else {
      //           Object.assign(result, this.parseFilter(part));
      //         }
      //       }, {}))
      //     } else {
      //       this.operatorsMap[operator != null ? operator : '$and'](parts.map(this.parseFilter.bind(this)));
      //     }
      //   }
      // }
      //
      // @method async parseQuery(aoQuery: object | QueryInterface): object | string | QueryInterface {
      //   if (aoQuery.$join != null) {
      //     throw new Error('`$join` not available for Mongo queries');
      //   }
      //   if (aoQuery.$let != null) {
      //     throw new Error('`$let` not available for Mongo queries');
      //   }
      //   if (aoQuery.$aggregate != null) {
      //     throw new Error('`$aggregate` not available for Mongo queries');
      //   }
      //
      //   const voQuery = {};
      //   const aggUsed = null;
      //   const aggPartial = null;
      //   const intoUsed = null;
      //   const intoPartial = null;
      //   const finAggUsed = null;
      //   const finAggPartial = null;
      //   let isCustomReturn = false;
      //
      //   if (aoQuery.$remove != null) {
      //     if (aoQuery.$into != null) {
      //       voQuery.queryType = 'removeBy';
      //       if (aoQuery.$forIn != null) {
      //         // работа будет только с одной коллекцией, поэтому не учитываем $forIn
      //
      //         voQuery.pipeline = [];
      //
      //         const voFilter = aoQuery.$filter
      //         if (voFilter != null) {
      //           voQuery.pipeline.push({
      //             $match: this.parseFilter(Parser.parse(voFilter))
      //           });
      //         }
      //
      //         const voSort = aoQuery.$sort;
      //         if (voSort != null) {
      //           voQuery.pipeline.push({
      //             $sort: voSort.reduce((result, item) => {
      //               for (const asRef in item) {
      //                 if (!{}.hasOwnProperty.call(item, asRef)) continue;
      //                 const asSortDirect = item[asRef];
      //                 result[wrapReference(asRef)] = asSortDirect === 'ASC' ? 1 : -1;
      //               }
      //               return result;
      //             }, {})
      //           });
      //         }
      //
      //         const vnOffset = aoQuery.$offset;
      //         if (vnOffset != null) {
      //           voQuery.pipeline.push({
      //             $skip: vnOffset
      //           });
      //         }
      //
      //         const vnLimit = aoQuery.$limit;
      //         if (vnLimit != null) {
      //           voQuery.pipeline.push({
      //             $limit: vnLimit
      //           });
      //         }
      //         isCustomReturn = true;
      //         return voQuery;
      //       }
      //     }
      //   } else {
      //     if (aoQuery.$patch != null) {
      //       if (aoQuery.$into != null) {
      //         voQuery.queryType = 'patchBy';
      //         if (aoQuery.$forIn != null) {
      //           // работа будет только с одной коллекцией, поэтому не учитываем $forIn
      //
      //           voQuery.pipeline = [];
      //
      //           const voFilter = aoQuery.$filter;
      //           if (voFilter != null) {
      //             voQuery.pipeline.push({
      //               $match: this.parseFilter(Parser.parse(voFilter))
      //             });
      //           }
      //
      //           const voSort = aoQuery.$sort;
      //           if (voSort != null) {
      //             voQuery.pipeline.push({
      //               $sort: voSort.reduce((result, item) => {
      //                 for (const asRef in item) {
      //                   if (!{}.hasOwnProperty.call(item, asRef)) continue;
      //                   const asSortDirect = item[asRef];
      //                   result[wrapReference(asRef)] = asSortDirect === 'ASC' ? 1 : -1;
      //                 }
      //                 return result;
      //               }, {})
      //             });
      //           }
      //
      //           const vnOffset = aoQuery.$offset;
      //           if (vnOffset != null) {
      //             voQuery.pipeline.push({
      //               $skip: vnOffset
      //             });
      //           }
      //
      //           const vnLimit = aoQuery.$limit;
      //           if (vnLimit != null) {
      //             voQuery.pipeline.push({
      //               $limit: vnLimit
      //             });
      //           }
      //           voQuery.patch = aoQuery.$patch;
      //           isCustomReturn = true;
      //           return voQuery;
      //
      //         }
      //       }
      //     } else {
      //       if (aoQuery.$forIn != null) {
      //         voQuery.queryType = 'query';
      //         voQuery.pipeline = [];
      //
      //         const voFilter = aoQuery.$filter;
      //         if (voFilter != null) {
      //           voQuery.pipeline.push({
      //             $match: this.parseFilter(Parser.parse(voFilter))
      //           });
      //         }
      //
      //         const voSort = aoQuery.$sort;
      //         if (voSort != null) {
      //           voQuery.pipeline.push({
      //             $sort: voSort.reduce((result, item) => {
      //               for (const asRef in item) {
      //                 if (!{}.hasOwnProperty.call(item, asRef)) continue;
      //                 const asSortDirect = item[asRef];
      //                 result[wrapReference(asRef)] = asSortDirect === 'ASC' ? 1 : -1;
      //               }
      //               return result;
      //             }, {})
      //           });
      //         }
      //
      //         const vnOffset = aoQuery.$offset;
      //         if (vnOffset != null) {
      //           voQuery.pipeline.push({
      //             $skip: vnOffset
      //           });
      //         }
      //
      //         const vnLimit = aoQuery.$limit;
      //         if (vnLimit != null) {
      //           voQuery.pipeline.push({
      //             $limit: vnLimit
      //           });
      //         }
      //
      //         const voCollect = aoQuery.$collect;
      //         if (voCollect != null) {
      //           isCustomReturn = true;
      //           const collect = {};
      //           for (const asRef in item) {
      //             if (!{}.hasOwnProperty.call(item, asRef)) continue;
      //             const aoValue = item[asRef];
      //             ((asRef, aoValue) => {
      //               collect[wrapReference(asRef)] = wrapReference(aoValue);
      //             })();
      //           }
      //           const vsInto = aoQuery.$into;
      //           const into = vsInto != null ? wrapReference(vsInto) : 'GROUP';
      //           voQuery.pipeline.push({
      //             $group: {
      //               _id: collect,
      //               [`${into}`]: {
      //                 $push: Object.keys(this.delegate.attributes).reduce(function (p, c) {
      //                   p[c] = `$${c}`;
      //                   return p;
      //                 }, {})
      //               }
      //             }
      //           });
      //
      //           const voHaving = aoQuery.$having;
      //           if (voHaving != null) {
      //             voQuery.pipeline.push({
      //               $match: this.parseFilter(Parser.parse(voHaving))
      //             });
      //           }
      //
      //           if (aoQuery.$count != null) {
      //             isCustomReturn = true;
      //             voQuery.pipeline.push({
      //               $count: 'result'
      //             });
      //           } else {
      //             const vsSum = aoQuery.$sum;
      //             if (vsSum != null) {
      //               isCustomReturn = true;
      //               voQuery.pipeline.push({
      //                 $group: {
      //                   _id: null,
      //                   result: {
      //                     $sum: `${wrapReference(vsSum)}`
      //                   }
      //                 }
      //               });
      //               voQuery.pipeline.push({
      //                 $project: {
      //                   _id: 0
      //                 }
      //               });
      //             } else {
      //               const vsMin = aoQuery.$min;
      //               if (vsMin != null) {
      //                 isCustomReturn = true;
      //                 voQuery.pipeline.push({
      //                   $sort: {
      //                     [`${wrapReference(vsMin)}`]: 1
      //                   }
      //                 });
      //                 voQuery.pipeline.push({
      //                   $limit: 1
      //                 });
      //                 voQuery.pipeline.push({
      //                   $project: {
      //                     _id: 0,
      //                     result: `${wrapReference(vsMin)}`
      //                   }
      //                 });
      //               } else {
      //                 const vsMax = aoQuery.$max;
      //                 if (vsMax != null) {
      //                   isCustomReturn = true;
      //                   voQuery.pipeline.push({
      //                     $sort: {
      //                       [`${wrapReference(vsMax)}`]: -1
      //                     }
      //                   });
      //                   voQuery.pipeline.push({
      //                     $limit: 1
      //                   });
      //                   voQuery.pipeline.push({
      //                     $project: {
      //                       _id: 0,
      //                       result: `${wrapReference(vsMax)}`
      //                     }
      //                   });
      //                 } else {
      //                   const vsAvg = aoQuery.$avg;
      //                   if (vsAvg != null) {
      //                     isCustomReturn = true;
      //                     voQuery.pipeline.push({
      //                       $group: {
      //                         _id: null,
      //                         result: {
      //                           $avg: `${wrapReference(vsAvg)}`
      //                         }
      //                       }
      //                     });
      //                     voQuery.pipeline.push({
      //                       $project: {
      //                         _id: 0
      //                       }
      //                     })
      //                   } else {
      //                     const voReturn = aoQuery.$return;
      //                     if (voReturn != null) {
      //                       if (voReturn !== '@doc') {
      //                         isCustomReturn = true;
      //                       }
      //                       if (_.isString(voReturn)) {
      //                         if (voReturn !== '@doc') {
      //                           voQuery.pipeline.push({
      //                             $project: {
      //                               _id: 0,
      //                               [`${wrapReference(voReturn)}`]: 1
      //                             }
      //                           })
      //                         }
      //                       }
      //                     } else {
      //                       if (_.isObject(voReturn)) {
      //                         const vhObj = {};
      //                         const projectObj = {};
      //                         for (key in voReturn) {
      //                           if ({}.hasOwnProperty.call(voReturn, key)) continue;
      //                           const value = voReturn[key];
      //                           ((key, value) => {
      //                             vhObj[key] = `${wrapReference(value)}`;
      //                             projectObj[key] = 1;
      //                             voQuery.pipeline.push({
      //                               $addFields: vhObj
      //                             });
      //                             voQuery.pipeline.push({
      //                               $project: projectObj
      //                             });
      //                           })
      //                         }
      //                       }
      //                     }
      //
      //                     if (aoQuery.$distinct) {
      //                       voQuery.pipeline.push({
      //                         $group: {
      //                           _id: '$$CURRENT'
      //                         }
      //                       });
      //                     }
      //                   }
      //                 }
      //               }
      //             }
      //           }
      //         }
      //       }
      //     }
      //   }
      //   voQuery.isCustomReturn = isCustomReturn != null ? isCustomReturn : false;
      //   return voQuery;
      // }

      @method async executeQuery(
        query: object | string | QueryInterface
      ): Promise<CursorInterface<?C, *, A>> {
        const result = await this.adapter.executeQuery(this.delegate, query);
        if (query.isCustomReturn) {
          if (result != null) {
            return (this._cursorFactory(null, result, 'MongoCursor'): CursorInterface<null, *, A>);
          } else {
            return (this._cursorFactory(null, [], 'Cursor'): CursorInterface<null, *>);
          }
        } else {
          return (this._cursorFactory(this.getName(), result, 'MongoCursor'): CursorInterface<C, D, A>);
        }

        // const collection = await this.collection;
        // const stats = await collection.stats();
        // this.send(
        //   SEND_TO_LOG,
        //   `MongoCollectionMixin::executeQuery ns = ${stats.ns}, aoQuery = ${jsonStringify(aoQuery)}`,
        //   LEVELS[DEBUG]
        // );
        //
        // let voNativeCursor = null;
        //
        // switch (aoQuery.queryType) {
        //   case 'query':
        //     voNativeCursor = await collection.aggregate(aoQuery.pipeline, {
        //       cursor: {
        //         batchSize: 1
        //       }
        //     });
        //     break;
        //   case 'patchBy':
        //     const voPipeline = aoQuery.pipeline;
        //     voPipeline.push({
        //       $project: {
        //         _id: 1
        //       }
        //     });
        //     const subCursor = MongoCursor.new(
        //       null,
        //       await collection.aggregate(voPipeline, {
        //         cursor: {
        //           batchSize: 1000
        //         }
        //       })
        //     );
        //     const ids = await subCursor.map(co.wrap((i) => {
        //       return i._id;
        //     }));
        //     voNativeCursor = await collection.updateMany({
        //       _id: {
        //         $in: ids
        //       }
        //     }, {
        //       $set: aoQuery.patch,
        //     }, {
        //       multi: true,
        //       w: "majority",
        //       j: true,
        //       wtimeout: 500
        //     }, null);
        //     break;
        //   case 'removeBy':
        //     const voPipeline = aoQuery.pipeline;
        //     voPipeline.push({
        //       $project: {
        //         _id: 1
        //       }
        //     });
        //     const subCursor = MongoCursor.new(
        //       null,
        //       await collection.aggregate(voPipeline, {
        //         cursor: {
        //           batchSize: 1000
        //         }
        //       })
        //     );
        //     const ids = await subCursor.map(co.wrap((i) => {
        //       return i._id;
        //     }));
        //
        //     voNativeCursor = await collection.deleteMany({
        //       _id: {
        //         $in: ids
        //       }
        //     }, {
        //       w: "majority",
        //       j: true,
        //       wtimeout: 500
        //     }, null);
        //     break;
        // }
        //
        // let voCursor = null;
        //
        // if (aoQuery.isCustomReturn) {
        //   voCursor = voNativeCursor != null ? MongoCursor.new(null, voNativeCursor) : Cursor.new(null, []);
        // } else {
        //   voCursor = MongoCursor.new(this, voNativeCursor);
        // }
        // return voCursor;
      }

      // @method async createFileWriteStream(opts: { filename: string }, metadata: ?object = {}): Promise<StreamT> {
      //   const bucket = await this.bucket;
      //   this.send(
      //     SEND_TO_LOG,
      //     `MongoCollectionMixin::createFileWriteStream opts = ${jsonStringify(opts)}`,
      //     LEVELS[DEBUG]
      //   );
      //   const mongodb = this.getData().mongodb != null ? this.getData().mongodb : this.configs.mongodb;
      //   const { dbName } = mongodb;
      //   const metadata = assign({}, { dbName }, metadata);
      //   return bucket.openUploadStream(opts.filename, { metadata });
      // }

      // @method async createFileReadStream(opts: { filename: string }): Promise<?StreamT> {
      //   const bucket = await this.bucket;
      //   this.send(
      //     SEND_TO_LOG,
      //     `MongoCollectionMixin::createFileReadStream opts = ${jsonStringify(opts)}`,
      //     LEVELS[DEBUG]
      //   );
      //   if (await this.fileExists(opts)) {
      //     return bucket.openDownloadStreamByName(opts.filename, {});
      //   } else {
      //     return;
      //   }
      // }

      // @method async fileExists(opts: { filename: string }): Promise<boolean> {
      //   const bucket = await this.bucket;
      //   this.send(
      //     SEND_TO_LOG,
      //     `MongoCollectionMixin::fileExists opts = ${jsonStringify(opts)}`,
      //     LEVELS[DEBUG]
      //   );
      //   return await (await bucket.find({
      //     filename: opts.filename
      //   }).hasNext());
      // }

      // @method async removeFile(opts: { filename: string }): Promise<void> {
      //   const bucket = await this.bucket;
      //   this.send(
      //     SEND_TO_LOG,
      //     `MongoCollectionMixin::removeFile opts = ${jsonStringify(opts)}`,
      //     LEVELS[DEBUG]
      //   );
      //   const cursor = await bucket.find({
      //     filename: opts.filename
      //   });
      //   const file = yield cursor.next();
      //   if (file != null) {
      //     await bucket.delete(file._id);
      //   }
      // }
    }
  });
  return Mixin;
}
