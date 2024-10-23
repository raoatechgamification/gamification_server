import { Request, Response, NextFunction } from "express";
import { body, param, validationResult } from "express-validator";

const validateOptionalFile = [
  (req: Request, res: Response, next: NextFunction) => {
    if (req.files && Array.isArray(req.files)) {
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",

        "application/pdf", 

        "application/msword", 
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document", 

        "application/vnd.ms-excel", 
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 

        "application/vnd.ms-powerpoint", 
        "application/vnd.openxmlformats-officedocument.presentationml.presentation", 

        "text/html", // HTML/webpage files
      ];

      for (const file of req.files) {
        if (!allowedTypes.includes(file.mimetype)) {
          return res.status(422).json({
            success: false,
            errors: [{ field: "file", message: "Invalid file type" }],
          });
        }
      }
    }
    next();
  },
];

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
    .withMessage("Please provide the course title"),

  body("objective")
    .notEmpty()
    .isString()
    .withMessage("Please provide the course objective"),

  body("price")
    .notEmpty()
    .isNumeric()
    .withMessage("Please provide the course price"),

  body("duration")
    .notEmpty()
    .isString()
    .withMessage("Please provide a the course duration"),

  body("lessonFormat")
    .notEmpty()
    .isString()
    .withMessage("Please provide the lessons format"),

  errorResponse,
];

export const courseContentValidator = [
  param("courseId")
    .isMongoId()
    .withMessage("Invalid courseId format. Please provide a valid courseId."),

  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isString()
    .withMessage("Title must be a string"),

  body("objectives")
    .notEmpty()
    .withMessage("Objectives are required")
    .isString()
    .withMessage("Objectives must be a string"),

  body("link").optional().isURL().withMessage("Link must be a valid URL"),

  validateOptionalFile,

  errorResponse,
];

export const getCourseCurriculumValidator = [
  param("courseId").isMongoId().withMessage("Invalid courseId"),

  errorResponse,
];

export const createAnnouncementValidator = [
  param("courseId").isMongoId().withMessage("Invalid courseId"),

  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isString()
    .withMessage("Title must be a string"),

  body("details")
    .notEmpty()
    .withMessage("Details are required")
    .isString()
    .withMessage("Details must be a string"),

  body("courseList")
    .optional()
    .isArray()
    .withMessage("courseList must be an array"),

  body("sendEmail")
    .optional()
    .isBoolean()
    .withMessage("sendEmail must be a boolean"),

  errorResponse,
];
