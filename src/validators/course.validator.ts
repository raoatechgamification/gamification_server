import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import { ObjectId } from "mongodb";

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

export const createCourseValidator = [
  body("title")
    .notEmpty()
    .isString()
    .withMessage("Please provide an organization name"),

  body("objective")
    .notEmpty()
    .isEmail()
    .withMessage("Please provide a valid email"),

  body("price")
    .notEmpty()
    .isString()
    .withMessage("Please provide a phone number"),

  body("duration")
    .notEmpty()
    .isString()
    .isURL()
    .withMessage("Please provide a valid url"),

  body("lessionFormat")
    .notEmpty()
    .isString()
    .isStrongPassword()
    .withMessage(
      "Please provide a strong password. Password must be at least eight characters, with uppercase and lowercase letter, and a special character"
    ),

  errorResponse,
];
