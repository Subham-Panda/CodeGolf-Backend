import Joi from 'joi';

const id = Joi.string().required();
const questionName = Joi.string().required();
const code = Joi.string().required();
const language = Joi.string().required();
const submitTime = Joi.date().required();

export const idValidation = Joi.object({
    id,
});

export const submissionValidation = Joi.object({
    questionName,
    code,
    language,
    submitTime,
});
