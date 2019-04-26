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

export enum BankSlipStatus {
  'CREATED' = 1,
  'REGISTERED' = 3,
}

export enum BankSlipType {
  PRIVATE = 7,
  AGREEMENT = 8,
  RECHARGE = 9
}

export interface BankSlip {
  id: number;
  processedAt: Date;
  receiver: string;
  sender: string;
  cashierInstructions: string[];
  paymentLocations: string[];
  digitableLine: string;
  barcode: string;
  status: BankSlipStatus;
  value: number;
}
