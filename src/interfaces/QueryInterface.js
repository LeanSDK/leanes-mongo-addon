// This file is part of leanes-queryable-addon.
//
// leanes-queryable-addon is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// leanes-queryable-addon is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with leanes-queryable-addon.  If not, see <https://www.gnu.org/licenses/>.

export interface QueryInterface {
  $forIn: ?object;

  $join: ?object;

  $let: ?object;

  $filter: ?object;

  $collect: ?object;

  $into: ?(string | object);

  $having: ?object;

  $sort: ?Array;

  $limit: ?number;

  $offset: ?number;

  $avg: ?string;

  $sum: ?string;

  $min: ?string;

  $max: ?string;

  $count: ?boolean;

  $distinct: ?boolean;

  $remove: ?(string | object);

  $patch: ?object;

  $return: ?(string | object);

  forIn(aoDefinitions: object): QueryInterface;

  join(aoDefinitions: object): QueryInterface;

  filter(aoDefinitions: object): QueryInterface;

  'let'(aoDefinitions: object): QueryInterface;

  collect(aoDefinition: object): QueryInterface;

  into(aoDefinition: string | object): QueryInterface;

  having(aoDefinition: object): QueryInterface;

  sort(aoDefinition: object): QueryInterface;

  limit(anValue: number): QueryInterface;

  offset(anValue: number): QueryInterface;

  distinct(): QueryInterface;

  remove(expr: ?(string | object)): QueryInterface;

  patch(aoDefinition: object): QueryInterface;

  'return'(aoDefinition: string | object): QueryInterface;

  count(): QueryInterface;

  avg(asDefinition: string): QueryInterface;

  min(asDefinition: string): QueryInterface;

  max(asDefinition: string): QueryInterface;

  sum(asDefinition: string): QueryInterface;
}
