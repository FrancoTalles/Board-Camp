import joi from "joi";

export const gameSchema = joi.object({
    name: joi.string().min(1),
    image: joi.string().required(),
    stockTotal: joi.number().integer().required(),
    pricePerDay: joi.number().integer().required()
})