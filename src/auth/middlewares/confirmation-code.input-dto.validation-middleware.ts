import {body} from "express-validator";

const confirmationCode = body('code')
    .exists().withMessage('Code is required')
    .isUUID().withMessage('Incorrect code')

export const confirmationCodeInputValidation = [
    confirmationCode
];