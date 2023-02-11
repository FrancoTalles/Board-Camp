import joi from "joi";

export const customerSchema = joi.object({
    name: joi.string().min(1).required(),
    phone: joi.string().regex(/^[0-9]+$/).min(10).max(11),
    cpf: joi.string().length(11).regex(/^[0-9]+$/).required(),
    birthday: joi.date().required(),
})