import { Request, Response, NextFunction } from "express";
import { body, param, validationResult } from "express-validator";
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

export const adminEditUserProfileValidator = [
  param("userId")
    .notEmpty()
    .withMessage("User ID is required")
    .isMongoId()
    .withMessage("User ID must be a valid MongoDB ObjectId"),

  body("firstName")
    .notEmpty()
    .withMessage("First name is required")
    .isString()
    .withMessage("First name must be a string"),

  body("lastName")
    .notEmpty()
    .withMessage("Last name is required")
    .isString()
    .withMessage("Last name must be a string"),

  body('batch')
    .notEmpty()
    .withMessage("Batch is required")
    .isString()
    .withMessage("Batch must be a string"),

  body('role')
    .notEmpty()
    .withMessage("User role is required")
    .isString()
    .withMessage("User role must be a string"),

  errorResponse
]