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
    .custom((value) => {
      if (!ObjectId.isValid(value)) {
        throw new Error("Invalid organization id");
      }
      return true;
    }),

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

export const changePasswordValidator = [
  body("currentPassword")
    .notEmpty()
    .isString()
    .withMessage("Please provide your current password"),

  body("newPassword")
    .notEmpty()
    .withMessage("New password field cannot be empty")
    .isString()
    .withMessage("Password must be a string")
    .isStrongPassword()
    .withMessage(
      "Password must be at least eight characters, with at least one uppercase and lowercase letter, and a special character"
    ),

  errorResponse,
];

export const editUserProfileValidator = [
  body("yearsOfExperience")
    .isNumeric()
    .withMessage("Please provide a valid years of experience"),

  body("highestEducationLevel")
    .isString()
    .withMessage("Please select your highest education level"),

  body("gender").isString().withMessage("Please select a gender option"),

  body("dateOfBirth")
    .isDate()
    .withMessage("Please provide a valid date of birth"),

  body("username").isString().withMessage("Please provide a valid username"),

  body("firstName").isString().withMessage("Please provide a valid first name"),

  body("lastName").isString().withMessage("Please provide a valid last name"),

  body("phone")
    .isMobilePhone("any")
    .withMessage("Please provide a valid phone number"),
];
