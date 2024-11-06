import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";

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

export const createOrganizationValidator = [
  body("name")
    .notEmpty()
    .isString()
    .withMessage("Please provide an organization name"),

  body("email")
    .notEmpty()
    .isEmail()
    .withMessage("Please provide a valid email"),

  body("phone")
    .notEmpty()
    .isString()
    .withMessage("Please provide a phone number"),

  body("preferredUrl")
    .notEmpty()
    .isString()
    .isURL()
    .withMessage("Please provide a valid url"),

  body("password")
    .notEmpty()
    .isString()
    .isStrongPassword()
    .withMessage(
      "Please provide a strong password. Password must be at least eight characters, with uppercase and lowercase letter, and a special character"
    ),

  body("confirmPassword")
    .notEmpty()
    .isString()
    .withMessage("Please confirm your password"),

  body("referral").optional().isString().withMessage("Invalid referral"),

  body("referralSource")
    .notEmpty()
    .isString()
    .withMessage("Kindly fill in how you heard about us"),

  errorResponse,
];

export const loginValidator = [
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
