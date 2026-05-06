import { param } from 'express-validator';

export const idValidation = param('id')
    .exists()
    .withMessage('ID is required') // Проверка на наличие
    .isString()
    .withMessage('ID must be a string') // Проверка, что это строка
    .isMongoId()
    .withMessage('Неверный формат ObjectId');

export const blogIdValidation = param('blogId')
    .exists()
    .withMessage('ID is required') // Проверка на наличие
    .isString()
    .withMessage('ID must be a string') // Проверка, что это строка
    .isMongoId()
    .withMessage('Неверный формат ObjectId');