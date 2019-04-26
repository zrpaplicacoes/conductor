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

import * as Conductor from '@zrpaplicacoes/conductor';
import { BankSlipType } from '../build/src/requests';

Conductor.SDK.config({
  env: Conductor.Environment.staging,
  logLevel: Conductor.LogLevel.DEBUG,
  validate: true,
  clientId: '5j056414cnaj5tlndgf1eic9eb',
  clientSecret: '9a2to25n5eus7kr25915sbd7j0rl9sp51qv57arvo0ecfjhl56h',
  productId: 1,
  comercialOriginId: 1,
  plasticId: 2,
});

(async () => {
  // Bank Slip
  const bankSlipResponse = await Conductor.BankSlipService.create({
    accountId: 9,
    value: 100.0,
    type: BankSlipType.PRIVATE,
  });

  console.log(bankSlipResponse.data);

  const bankSlipId = bankSlipResponse.data ? bankSlipResponse.data.id : null;

  if (bankSlipId) {
    const file = await Conductor.BankSlipService.download(bankSlipId);

    console.log(file);
  }


  // Product
  await Conductor.ProductService.all().then((r) => console.log(r.data)).catch(e => console.error(e));
})();
