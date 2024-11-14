import { Request, Response, NextFunction } from "express";
import { param, body, validationResult } from "express-validator";

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

export const superAdminValidator = [
  body("email")
    .notEmpty()
    .isEmail()
    .withMessage("Please provide a valid email"),

  body("password")
    .notEmpty()
    .isString()
    .isStrongPassword()
    .withMessage("Please provide a strong password. Password must be at least eight characters, with uppercase and lowercase letter, and a special character"),

  errorResponse,
];

export const userIdValidator = [
  param("userId")
    .notEmpty()
    .withMessage("User ID is required")
    .isMongoId()
    .withMessage("User ID mush be a valid MongoDB ObjectId"),

  errorResponse
]

export const organizationIdValidator = [
  param("organizationId")
    .notEmpty()
    .withMessage("Organization ID is required")
    .isMongoId()
    .withMessage("Organization ID must be a valid MongoDB ObjectId"),

  errorResponse
]

export const updateOrganizationValidator = [
  param("organizationId")
    .notEmpty()
    .withMessage("Organization ID is required")
    .isMongoId()
    .withMessage("Organization ID mush be a valid MongoDB ObjectId"),

  body("name")
    .isString()
    .withMessage("Please a valid name"),
  
  body("firstName")
    .isString()
    .withMessage("Please provide a valid first name"),
  
  body("lastName")
    .isString()
    .withMessage("Please provide a valid last name"),
  
  body("industry")
    .isString()
    .withMessage("Please provide a valid industry"),

  body("preferredUrl")
    .isURL()
    .withMessage("Please provide a valid preferred URL"),

  errorResponse
]

export const updateUserValidator = [
  param("userId")
    .notEmpty()
    .withMessage("Organization ID is required")
    .isMongoId()
    .withMessage("Organization ID mush be a valid MongoDB ObjectId"),

  body("yearsOfExperience")
    .isNumeric()
    .withMessage("Please provide a valid years of experience"),

  body("highestEducationLevel")
    .isString()
    .withMessage("Please select your highest education level"),

  body("gender")
    .isString()
    .withMessage("Please select a gender option"),

  body("dateOfBirth")
    .isDate()
    .withMessage("Please provide a valid date of birth"),

  body("username")
    .isString()
    .withMessage("Please provide a valid username"),

  body("firstName")
    .isString()
    .withMessage("Please provide a valid first name"),

  body("lastName")
    .isString()
    .withMessage("Please provide a valid last name"),

  body("batch")
    .isString()
    .withMessage("Please provide a valid batch value"),

  body("role")
    .isString()
    .withMessage("Please provide user role type"),

  errorResponse
]

export const validateOrganizationExportData = [
  body('data')
    .isArray({ min: 1 })
    .withMessage('Data must be a non-empty array of objects'),
  
  body('data.*.name')
    .isString()
    .withMessage('Each item must have a "name" field of type string'),
  
  body('data.*.firstName')
    .isString()
    .withMessage('Each item must have a "firstName" field of type string'),

  body('data.*.lastName')
    .isString()
    .withMessage('Each item must have a "lastName" field of type string'),

  body('data.*.email')
    .isEmail()
    .withMessage('Each item must have a valid "email" field'),

  body('data.*.phone')
    .isString()
    .withMessage('Each item must have a "phone" field of type string'),

  body('data.*.preferredUrl')
    .optional()
    .isString()
    .withMessage('Each item must have a "preferredUrl" field of type string'),

  body('data.*.referral')
    .optional()
    .isString()
    .withMessage('Each item must have a "referral" field of type string'),

  body('data.*.referralSource')
    .optional()
    .isString()
    .withMessage('Each item must have a "referralSource" field of type string'),

  body('data.*.industry')
    .optional()
    .isString()
    .withMessage('Each item must have a "industry" field of type string'),
  
  errorResponse
]

export const validateUserExportData = [
  body('data')
    .isArray({ min: 1 })
    .withMessage('Data must be a non-empty array of objects'),
  
  body('data.*.username')
    .isString()
    .withMessage('Each item must have a "username" field of type string'),
  
  body('data.*.firstName')
    .isString()
    .withMessage('Each item must have a "firstName" field of type string'),

  body('data.*.lastName')
    .isString()
    .withMessage('Each item must have a "lastName" field of type string'),

  body('data.*.email')
    .isEmail()
    .withMessage('Each item must have a valid "email" field'),

  body('data.*.phone')
    .isString()
    .withMessage('Each item must have a "phone" field of type string'),

  body('data.*.organizationId')
    .optional()
    .isMongoId()
    .withMessage('OrganizationId must be a valid MongoDB ObjectId'),

  body('data.*.batch')
    .optional()
    .isString()
    .withMessage('batch must be a string'),

  body('data.*.userType')
    .optional()
    .isString()
    .withMessage('userType must be a string'),

  body('data.*.yearsOfExperience')
    .optional()
    .isNumeric()
    .withMessage('yearsOfExperience must be an integer'),

  body('data.*.highestEducationLevel')
    .optional()
    .isString()
    .withMessage('highestEducationLevel must be a date'),

  body('data.*.gender')
    .optional()
    .isString()
    .withMessage('gender must be a string'),
  
  body('data.*.dateOfBirth')
    .optional()
    .isDate()
    .withMessage('dateOfBirth must be a date'),
  
  errorResponse
]