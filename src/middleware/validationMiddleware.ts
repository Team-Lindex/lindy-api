import { Request, Response, NextFunction } from 'express';
import { validationResult, body, param, query, ValidationChain } from 'express-validator';

// Middleware to check for validation errors
export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      errors: errors.array(),
    });
    return;
  }
  next();
};

// Validation rules for date parameters
export const dateRangeValidation = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('startDate must be a valid date in ISO 8601 format'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('endDate must be a valid date in ISO 8601 format'),
  validate,
];

// Validation rules for pagination parameters
export const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be between 1 and 100'),
  validate,
];

// Validation rules for customer ID parameter
export const customerIdValidation = [
  param('customerId')
    .isInt({ min: 1 })
    .withMessage('customerId must be a positive integer'),
  validate,
];

// Validation rules for variant ID parameter
export const variantIdValidation = [
  param('variantId')
    .notEmpty()
    .withMessage('variantId is required'),
  validate,
];

// Validation rules for product group parameter
export const productGroupValidation = [
  param('productGroup')
    .notEmpty()
    .withMessage('productGroup is required'),
  validate,
];

// Validation rules for sales trends period parameter
export const salesTrendsPeriodValidation = [
  query('period')
    .optional()
    .isIn(['day', 'week', 'month', 'year'])
    .withMessage('period must be one of: day, week, month, year'),
  validate,
];

// Validation rules for search query parameter
export const searchQueryValidation = [
  query('query')
    .notEmpty()
    .withMessage('search query is required'),
  validate,
];

// Validation rules for name search parameter
export const nameSearchValidation = [
  query('name')
    .notEmpty()
    .withMessage('name search parameter is required'),
  validate,
];

// Validation rules for keyword search parameter
export const keywordSearchValidation = [
  query('keyword')
    .notEmpty()
    .withMessage('keyword search parameter is required'),
  validate,
];

// Validation rules for style name parameter
export const styleNameValidation = [
  param('style')
    .notEmpty()
    .withMessage('style name is required'),
  validate,
];
