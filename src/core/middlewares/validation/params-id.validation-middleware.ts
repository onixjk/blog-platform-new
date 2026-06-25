import { param } from 'express-validator';

export const idValidation = param('id')
    .exists()
    .withMessage('ID is required')
    .isString()
    .withMessage('ID must be a string')
    .isMongoId()
    .withMessage('Invalid format ObjectId');

export const blogIdValidation = param('blogId')
    .exists()
    .withMessage('ID is required')
    .isString()
    .withMessage('ID must be a string')
    .isMongoId()
    .withMessage('Invalid format ObjectId');

export const postIdValidation = param('postId')
    .exists()
    .withMessage('ID is required')
    .isString()
    .withMessage('ID must be a string')
    .isMongoId()
    .withMessage('Invalid format ObjectId');

export const deviceIdValidation = param('deviceId')
    .exists()
    .withMessage('ID is required')
    .isString()
    .withMessage('ID must be a string')
    .isMongoId()
    .withMessage('Invalid format ObjectId');