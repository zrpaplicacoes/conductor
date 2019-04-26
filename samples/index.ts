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

import {
  Environment,
  LogLevel,
  SDK,
  BankSlipService,
  ProductService,
} from '@zrpaplicacoes/conductor';

SDK.config({
  env: Environment.staging,
  logLevel: LogLevel.silly,
  validate: true,
  productId: 1,
  comercialOriginId: 1,
  plasticId: 2,
});

(async () => {
  // Bank Slip
  const bankSlipResponse = await BankSlipService.create({
    accountId: 50,
    value: 100.0,
  });

  SDK.logger.info('bankSlipResponse', bankSlipResponse.data);

  const bankSlipId = bankSlipResponse.data ? bankSlipResponse.data.id : null;

  if (bankSlipId) {
    const file = await BankSlipService.download(bankSlipId);

    SDK.logger.info('Downloaded BankSlip', file);
  }

  // Product
  await ProductService.all().then((r) => SDK.logger.info('Response', r.data)).catch(e => SDK.logger.error('Error', e));

  process.exit(0);
})();
