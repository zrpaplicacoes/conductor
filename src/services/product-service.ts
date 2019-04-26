/*!
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const mapper = require('object-mapper');

import { Client, HttpMethod } from "../client";
import { ProductListResponse } from "../responses";

export class ProductService {
  static async all(): Promise<ProductListResponse> {
    const client: Client = new Client();

    const response = await client.request(HttpMethod.GET, 'produtos');

    const parsedBody = JSON.parse(response.rawBody);

    const incomingMap = {
      'id': 'id',
      'nome': 'name',
    };

    return {
      response,
      data: mapper(parsedBody['content'], incomingMap),
    };
  }
}
