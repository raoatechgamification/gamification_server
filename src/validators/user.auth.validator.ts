import { Request, Response, NextFunction } from "express";
import { param, body, validationResult, query } from "express-validator";

const errorResponse = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      errors: errors.array().map((error) => ({
        field: error.type,
        message: error.msg,
      })),
    });
  }
  next();
};

export const registerUserValidator = [
  body("email")
    .notEmpty()
    .isEmail()
    .withMessage("Please provide a valid email"),

  body("password")
    .notEmpty()
    .isString()
    .isStrongPassword()
    .withMessage(
      "Please provide a strong password. Password must be at least eight characters, with uppercase and lowercase letter, and a special character"
    ),

  body("username")
    .notEmpty()
    .isString()
    .withMessage("Please provide your preferred username"),

  body("organizationId")
    .optional()
    .isUUID()
    .withMessage("Invalid organization ID"),

  errorResponse,
];

export const loginUserValidator = [
  body("email")
    .notEmpty()
    .isEmail()
    .withMessage("Please provide an email address"),

  body("password")
    .notEmpty()
    .isString()
    .withMessage("Please provide your password"),

  errorResponse,
];
