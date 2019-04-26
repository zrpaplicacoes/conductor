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


import * as request from 'request';

import { SDK } from './sdk';
import { Response, FileResponse } from './responses';

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
    const start = process.hrtime();

    const options: request.UrlOptions & request.CoreOptions = {
      url: this.url(path),
      method,
      qs,
      body,
      timeout: SDK.defaultTimeout,
      headers:
      {
        'Cache-Control': 'no-cache',
        'Accept': 'application/json',
        'Authorization': await SDK.token(),
        'Content-Type': 'application/json'
      }
    };

    SDK.logger.http('Request started', options);

    // tslint:disable-next-line:no-any
    return new Promise<Response>((resolve, reject) => {
      request(options, (error, response, responseBody) => {
        const time = process.hrtime(start);

        SDK.logger.http('Request completed', { elapsedTime: time, message: `${time[0]}s:${time[1] / 10.0 ^ 6}ms` });

        if (error) throw new Error(error);

        if (response.statusCode.toString().match(/(2|3)\d{2}/) !== null) {
          resolve({
            rawBody: responseBody,
            hasError: false,
            isRedirect: response.statusCode.toString().match(/3\d{2}/) !== null,
            statusCode: response.statusCode,
            headers: response.headers,
            requestBody: qs || body,
            elapsedTime: time,
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
            elapsedTime: time,
          });
        }
      });
    });
  }

  async download(method: HttpMethod, path: string, mime?: string, extension?: string): Promise<FileResponse> {
    const start = process.hrtime();

    const options: request.UrlOptions & request.CoreOptions = {
      url: this.url(path),
      method,
      headers:
      {
        'Accept': mime ? mime : 'application/octet-stream',
        'Authorization': await SDK.token(),
      }
    };

    return new Promise<FileResponse>((resolve, reject) => {
      const streamable = SDK.createWriteStream(extension);

      const r: request.Request = request(options);

      r.on('error', (error: Error) => {
        const res: request.Response | undefined = r.response;

        reject({
          error,
          statusCode: res && res.statusCode,
          headers: res && res.headers,
          elapsedTime: process.hrtime(start),
          hasError: true,
        } as FileResponse);
      }).pipe(streamable.writeStream).on('close', () => {
        const res: request.Response | undefined = r.response;

        resolve({
          absolutePath: streamable.absolutePath,
          fileId: streamable.fileId,
          statusCode: res && res.statusCode,
          headers: res && res.headers,
          elapsedTime: process.hrtime(start),
          hasError: false,
        } as FileResponse);
      });
    });
  }

  private url(path: string) {
    return SDK.isProd ? `https://api.caradhras.io/${path}` : `https://api.hml.caradhras.io/${path}`;
  }
}
