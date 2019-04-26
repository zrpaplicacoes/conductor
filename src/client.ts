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


const uuid = require('uuid/v4');
import * as request from 'request';
import * as fs from 'fs';

import { SDK } from './sdk';
import { Response } from './responses';

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PATCH = 'PATCH',
  PUT = 'PUT',
  DELETE = 'DELETE',
  OPTIONS = 'OPTIONS'
}

export class Client {
  async request(
    method: HttpMethod,
    path: string,
    // tslint:disable-next-line:no-any
    body?: any,
    // tslint:disable-next-line:no-any
    qs?: any,
    // tslint:disable-next-line:no-any
  ): Promise<Response> {
    const options: request.UrlOptions & request.CoreOptions = {
      url: this.url(path),
      method,
      qs,
      body,
      headers:
      {
        'Cache-Control': 'no-cache',
        'Accept': 'application/json',
        'Authorization': await SDK.token(),
        'Content-Type': 'application/json'
      }
    };

    // tslint:disable-next-line:no-any
    return new Promise<Response>((resolve, reject) => {
      request(options, (error, response, responseBody) => {
        if (error) throw new Error(error);

        if (response.statusCode.toString().match(/(2,3)\d{2}/)) {
          resolve({
            rawBody: responseBody,
            hasError: false,
            isRedirect: response.statusCode.toString().match(/3\d{2}/) !== null,
            statusCode: response.statusCode,
            headers: response.headers,
            requestBody: qs || body,
            elapsedTime: response.elapsedTime,
          });
        } else {
          resolve({
            error,
            rawBody: responseBody,
            hasError: true,
            isRedirect: false,
            statusCode: response.statusCode,
            headers: response.headers,
            requestBody: qs || body,
            elapsedTime: response.elapsedTime,
          });
        }
      });
    });
  }

  async download(method: HttpMethod, path: string, mime: string) {
    const filename: string = uuid();

    const options: request.UrlOptions & request.CoreOptions = {
      url: this.url(path),
      method,
      headers:
      {
        'Accept': mime ? mime : 'application/octet-stream',
        'Authorization': await SDK.token(),
      }
    };

    return new Promise((resolve, reject) => {
      const path: string = SDK.write(new Buffer('abcasd123123'));

      resolve({
        path
      });
    });
  }

  private url(path: string) {
    return SDK.isProd ? `https://api.caradhras.io/${path}` : `https://api.hml.caradhras.io/${path}`;
  }
}
