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

import { IncomingHttpHeaders } from "http";

export interface Response {
  error?: Error;
  rawBody: string;
  hasError: boolean;
  isRedirect: boolean;
  statusCode: number;
  headers: IncomingHttpHeaders;
  // tslint:disable-next-line:no-any
  requestBody: any;
  elapsedTime: [number, number] | number | undefined;
}

export interface FileResponse {
  error?: Error;
  absolutePath?: string;
  fileId?: string;
  hasError: boolean;
  statusCode: number;
  headers: IncomingHttpHeaders;
  elapsedTime: [number, number] | number | undefined;
}
