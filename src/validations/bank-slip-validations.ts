import * as Joi from '@hapi/joi';

import { BankSlipCreateRequest } from "../requests";
import { validationConfig } from "./config";

export async function bankSlipCreateRequestValidator(r: BankSlipCreateRequest): Promise<BankSlipCreateRequest> {
  return new Promise<BankSlipCreateRequest>((resolve, reject) => {
    const schema = Joi.object().keys({
      'accountId': Joi.number().required(),
      'type': Joi.number().required().min(7).max(9).required(),
      'dueDate': Joi.date().required().min(Date.now()).required(),
      'value': Joi.number().positive().min(0.01).required()
    });

    Joi.validate(r, schema, validationConfig, (err: Joi.ValidationError, value: BankSlipCreateRequest) => {
      err ? reject(err.details) : resolve(value);
    });
  });
}

export async function bankSlipIdValidator(id: number) {
  return new Promise<number>((resolve, reject) => {
    try {
      Joi.assert(id, Joi.number().required().positive());
      resolve(id);
    } catch (e) {
      reject((e as Joi.ValidationError).details);
    }
  });
}
