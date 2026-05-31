import {body} from "express-validator";

const emailValidation = body('email')
    .exists().withMessage('Email is required')
    .isString().withMessage('Email should be string')
    .trim().isLength({min: 1})
    .isEmail().withMessage('Email is not correct')
    .matches(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/)
    .withMessage('Invalid login format, must match the pattern')

export const emailInputValidation = [
    emailValidation
];