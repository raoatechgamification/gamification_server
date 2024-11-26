import { Request, Response, NextFunction } from "express";
import { check, validationResult } from 'express-validator';

const errorResponse = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }
  next();
  // const errors = validationResult(req);
  // if (!errors.isEmpty()) {
  //   return res.status(422).json({
  //     success: false,
  //     errors: errors.array().map((error) => ({
  //       field: error.type,
  //       message: error.msg,
  //     })),
  //   });
  // }
  // next();
};

export const validateCertificate = [
  check('organizationLogo')
    .optional()
    .isURL()
    .withMessage('Organization logo must be a valid URL'),

  check('organizationName')
    .notEmpty()
    .withMessage('Organization name is required'),

  check('certificateTitle')
    .notEmpty()
    .withMessage('Certificate title is required'),

  check('contentsBeforeRecipient')
    .notEmpty()
    .withMessage('Contents before recipient are required'),

  check('contentsAfterRecipient')
    .notEmpty()
    .withMessage('Contents after recipient are required'),
    
  check('recipientName')
    .notEmpty()
    .withMessage('Recipient name is required'),

  check('awardedOn')
    .isDate()
    .withMessage('Awarded date must be valid'),

  check('dateIssued')
    .isDate()
    .withMessage('Date issued must be valid'),

  check('expiryDate')
    .optional()
    .isDate()
    .withMessage('Expiry date must be valid'),

  check('authorizedHeadName')
    .notEmpty()
    .withMessage('Authorized head name is required'),

  check('authorizedSignature')
    .optional()
    .isURL()
    .withMessage('Authorized signature must be a valid URL'),
  
  errorResponse
];
