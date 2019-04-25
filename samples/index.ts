import * as Conductor from '@zrpaplicacoes/caradhras';


Conductor.SDK.config({
  env: Conductor.Environment.staging,
  logLevel: Conductor.LogLevel.DEBUG,
  validate: true,
});

(async () => {
  Conductor.BankSlipService.create({
    accountId: 1,
    value: 100.0
  }).then((r) => console.log(r)).catch(e => console.log(e));

  Conductor.BankSlipService.create({
    accountId: 1,
    value: -1.0
  }).then((r) => console.log(r)).catch(e => console.log(e));

})();
