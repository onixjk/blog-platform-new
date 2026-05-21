import {body} from "express-validator";

const content = body('content')
    .exists()
    .withMessage('Content is required')
    .isString().withMessage('Content should be string')
    .trim().isLength({min: 20, max: 300})
    .withMessage('Length of content is not correct');

export const commentInputValidation = [
    content
];