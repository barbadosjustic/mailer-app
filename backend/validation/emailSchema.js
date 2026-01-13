import Joi from "joi";

export const emailSchema = Joi.object({
  to: Joi.string().email().required(),
  subject: Joi.string().max(998).required(),
  body: Joi.string().required(),
  format: Joi.string().valid("text", "html").required()
});

