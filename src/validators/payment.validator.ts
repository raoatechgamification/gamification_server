import { check } from 'express-validator';

export const cardValidator = [
  check('cardNumber')
    .isCreditCard()
    .withMessage('Invalid card number'),

  check('expiryMonth')
    .isLength({ min: 2, max: 2 })
    .withMessage('Invalid expiry month'),

  check('expiryYear')
    .isLength({ min: 4, max: 4 })
    .withMessage('Invalid expiry year'),

  check('cvv')
    .isLength({ min: 3, max: 4 })
    .withMessage('Invalid CVV'),

  check('email')
    .isEmail()
    .withMessage('Invalid email'),
];
