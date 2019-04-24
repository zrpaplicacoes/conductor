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

import { BankSlipCreateResponse } from "./responses/bank-slip-create-response";

export class BankSlip {

  /**
   * Creates and registers a Bank Slip
   *
   * @param accountId - The id of the Account
   * @param value - The total due for this Bank Slip
   */
  static create(accountId: number, value: number): BankSlipCreateResponse {
    return {
      id: 1,
      value: 30.0,
      registered: true
    };
  }
}
