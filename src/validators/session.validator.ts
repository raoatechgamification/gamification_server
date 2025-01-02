import { Request, Response, NextFunction } from "express";
import { body, param, validationResult  } from "express-validator";

const errorResponse = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array()[0] });
  }
  next();
};

export const createOrEditSessionValidator = [
  body("name.title")
    .notEmpty()
    .withMessage("Session title is required"),

  body("name.commencementDate")
    .isISO8601()
    .toDate()
    .withMessage("Valid commencement date is required"),

  body("name.endDate")
    .isISO8601()
    .toDate()
    .withMessage("Valid end date is required"),

  body("name.termsInSession")
    .isInt({ gt: 0 })
    .withMessage("Number of terms in session must be greater than 0"),

  body("terms.*.title").notEmpty().withMessage("Term title is required"),

  body("terms.*.commencementDate")
    .isISO8601()
    .toDate()
    .withMessage("Valid commencement date is required"),

  body("terms.*.endDate")
    .isISO8601()
    .toDate()
    .withMessage("Valid end date is required"),

  body("bills.*.termName")
    .notEmpty()
    .withMessage("Bill term name is required"),

  body("bills.*.billId")
    .notEmpty()
    .withMessage("Bill ID is required"),

  body("oneBillForAnEntireSession")
    .isBoolean()
    .withMessage("Valid boolean value for oneBillForAnEntireSession is required"),

  errorResponse
];

export const sessionIdValidator = [
  param("sessionId")
    .isMongoId()
    .withMessage("Valid session ID is required"),

  errorResponse
];
