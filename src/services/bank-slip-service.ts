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

import { SDK } from "../sdk";
import { BankSlipCreateRequest } from "../requests";
import { BankSlipCreateResponse, Response } from "../responses";
import { bankSlipCreateRequestValidator, bankSlipDownloadRequestValidator } from "../validations";
import { Client, HttpMethod } from "../client";
import { BankSlipType } from "../models";

export class BankSlipService {
  /**
   *
   * @param payload - The BankSlipCreateRequest requires an accountId and
   * a minimal value of 0.01 to create a BankSlip, by default, the bank slip
   * is recorded as a private bank slip. Also, by default, the dueDate
   * for the ticket is set for 2 business days from now
   */
  static async create(payload: BankSlipCreateRequest): Promise<BankSlipCreateResponse> {
    const client: Client = new Client();

    payload = {
      ...{
        type: BankSlipType.PRIVATE,
        // TODO: Change here to actually compute business days
        dueDate: new Date(Date.now() + (3600 * 48 * 1000)),
      },
      ...payload,
    };

    if (SDK.isValidationEnabled) {
      payload = await bankSlipCreateRequestValidator(payload);
    }

    const outgoingMap = {
      'accountId': 'idConta',
      'type': 'tipoBoleto',
      'dueDate': 'dataVencimento',
      'value': 'valor',
    };

    payload = mapper(payload, outgoingMap);

    const response: Response = await client.request(HttpMethod.GET, 'billet', null, payload);

    const parsedBody = JSON.parse(response.rawBody);

    const incomingMap = {
      'id': 'id',
      'dataProcessamento': {
        key: 'processedAt',
        transform: (v: string) => (new Date(v)),
      },
      'nomeBeneficiario': 'receiver',
      'instrucoes': 'cashierInstructions',
      'locaisDePagamento': 'paymentLocations',
      'nomePagador': 'sender',
      'linhaDigitavel': {
        key: 'digitableLine',
        transform: (v: string) => v.replace(/(\s|\.)/ig, ""),
      },
      'status': 'status',
      'valorBoleto': 'value'
    };

    return {
      response,
      data: mapper(parsedBody, incomingMap),
    };
  }


  /**
   *
   * @param id - The Bank Slip ID
   * @returns {Buffer}
   */
  // tslint:disable-next-line:no-any
  static async download(id: number): Promise<any> {
    const client: Client = new Client();

    if (SDK.isValidationEnabled) {
      id = await bankSlipDownloadRequestValidator(id);
    }

    // tslint:disable-next-line:no-any
    const response: any = await client.download(HttpMethod.GET, `boletos/${id}/pdf`, 'application/pdf');

    return response;
  }
}
