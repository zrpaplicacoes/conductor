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
import { BankSlipCreateResponse, Response, BankSlipGetResponse, FileResponse } from "../responses";
import { bankSlipCreateRequestValidator, bankSlipIdValidator } from "../validations";
import { Client, HttpMethod } from "../client";
import { BankSlipType } from "../models";

export class BankSlipService {
  // tslint:disable-next-line:no-any
  private static incomingMapper: any = {
    'id': 'id',
    'dataProcessamento': {
      key: 'processedAt',
      transform: (v: string) => v && (new Date(v)),
    },
    'nomeBeneficiario': 'receiver',
    'instrucoes': 'cashierInstructions',
    'locaisDePagamento': {
      key: 'paymentLocations',
      transform: (v: string[]) => v && v.filter(value => !!value),
    },
    'nomePagador': 'sender',
    'linhaDigitavel': {
      key: 'digitableLine',
      transform: (v: string) => v && v.replace(/(\s|\.)/ig, ""),
    },
    'codigoDeBarras': 'barcode',
    'status': 'status',
    'valorBoleto': 'value'
  };

  /**
   *
   * @param id - The Bank Slip ID
   * @returns {BankSlipGetResponse}
   */
  static async get(id: number): Promise<BankSlipGetResponse> {
    const client: Client = new Client();

    if (SDK.isValidationEnabled) {
      id = await bankSlipIdValidator(id);
    }

    const response: Response = await client.request(HttpMethod.GET, `boletos/${id}`);

    return {
      response,
      data: mapper(JSON.parse(response.rawBody, BankSlipService.incomingMapper)),
    };

  }
  /**
   *
   * @param payload - The BankSlipCreateRequest requires an accountId and
   * a minimal value of 0.01 to create a BankSlip, by default, the bank slip
   * is recorded as a recharge bank slip. Also, by default, the dueDate
   * for the ticket is set for the next business day
   */
  static async create(payload: BankSlipCreateRequest): Promise<BankSlipCreateResponse> {
    const client: Client = new Client();

    payload = {
      ...{
        type: BankSlipType.RECHARGE,
        // TODO: Change here to actually compute business days
        dueDate: new Date(Date.now() + (3600 * 72 * 1000)),
      },
      ...payload,
    };

    if (SDK.isValidationEnabled) {
      payload = await bankSlipCreateRequestValidator(payload);
    }

    const outgoingMap = {
      'accountId': 'idConta',
      'type': 'tipoBoleto',
      'dueDate': {
        key: 'dataVencimento',
        transform: (v: Date) => v.toISOString().substring(0, 10)
      },
      'value': 'valor',
    };

    const convertedPayload = mapper(payload, outgoingMap);

    SDK.logger.info('BankSlipService.create: Payload was converted', { from: payload, to: convertedPayload });

    const response: Response = await client.request(HttpMethod.GET, 'billet', null, payload);

    // SDK.logger.silly(response);

    const parsedBody = JSON.parse(response.rawBody);

    return {
      response,
      data: mapper(parsedBody, BankSlipService.incomingMapper),
    };
  }


  /**
   *
   * @param id - The Bank Slip ID
   * @returns {string} - The absolute path for the file in the fs
   */
  static async download(id: number): Promise<FileResponse> {
    const client: Client = new Client();

    if (SDK.isValidationEnabled) {
      id = await bankSlipIdValidator(id);
    }

    // tslint:disable-next-line:no-any
    return await client.download(
      HttpMethod.GET,
      `boletos/${id}/pdf`,
      'application/pdf',
      'pdf',
    );
  }
}
