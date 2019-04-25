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
const joi = require('@hapi/joi');

import { BankSlipCreateRequest, BankSlipType } from "../requests";
import { BankSlipCreateResponse } from "../responses";
import { SDK } from "../config";
import { ValidationError } from "joi";


export class BankSlipService {

  /**
   *
   * @param r - The {@link BankSlipCreateRquest} requires an accountId and
   * a minimal value of 30.0 to create a BankSlip, by default, the bank slip
   * is recorded as a recharge / topup bank slip. Also, by default, the dueDate
   * for the ticket is set for 2 business days from now
   */
  static async create(r: BankSlipCreateRequest): Promise<BankSlipCreateResponse> {
    r = {
      ...{
        type: BankSlipType.RECHARGE,
        // TODO: Change here to actually compute business days
        dueDate: new Date(Date.now() + 3600 * 48),
      },
      ...r,
    };

    if (SDK.validate) {
      const schema = joi.object().keys({
        'accountId': joi.number().required(),
        'type': joi.number().required().min(7).max(9).required(),
        'dueDate': joi.date().required().min(Date.now()).required(),
        'value': joi.number().positive().min(0.01).required()
      });

      try {
        await schema.validate(r);
      } catch (e) {
        console.log('Validation error');
        throw e;
      }
    }

    const outgoingMap = {
      'accountId': 'idConta',
      'type': 'tipoBoleto',
      'dueDate': 'dataVencimento',
      'value': 'valor',
    };

    const incomingMap = {

    };

    const response = await SDK.post<BankSlipCreateResponse>('billet', r, {}, outgoingMap, incomingMap);

    return response as BankSlipCreateResponse;
  }
}
