import {body} from "express-validator";

const loginValidation = body('login')
    .exists().withMessage('Login is required')
    .isString().withMessage('Login should be string')
    .trim().isLength({min: 3, max: 10})
    .withMessage('Length of login is not correct')
    .matches(/^[a-zA-Z0-9_-]*$/)
    .withMessage('Invalid login format, must match the pattern')

export const passwordValidation = body('password')
    .exists().withMessage('Password is required')
    .isString().withMessage('Password should be string')
    .trim().isLength({min: 6, max: 20})
    .withMessage('Length of password is not correct');

export const emailValidation = body('email')
    .exists().withMessage('Email is required')
    .isString().withMessage('Email should be string')
    .trim().isLength({min: 1})
    .isEmail().withMessage('Email is not correct')
    .matches(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/)
    .withMessage('Invalid login format, must match the pattern')

export const loginOrEmailValidation = body('loginOrEmail')
    .exists().withMessage('Login or email is required')
    .isString().withMessage('Login or email should be string')
    .trim()
    .notEmpty().withMessage('Login or email cannot be empty');

export const userInputValidation = [
    loginValidation,
    passwordValidation,
    emailValidation
];
