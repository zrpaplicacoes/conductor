import * as Joi from '@hapi/joi';

export const validationConfig: Joi.ValidationOptions = {
  stripUnknown: true,
  abortEarly: true
};
