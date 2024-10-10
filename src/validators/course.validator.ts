import { Request, Response, NextFunction } from "express";
import { body, param, validationResult } from "express-validator";

const validateOptionalFile = [
  (req: Request, res: Response, next: NextFunction) => {
    if (req.files && Array.isArray(req.files)) {
      const allowedTypes = [
        // Accept the following file types according to the design
        // Image files
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",

        // PDF 
        "application/pdf",

        // Word documents
        "application/msword", // .doc
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx

        // Excel files
        "application/vnd.ms-excel", // .xls
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx

        // PowerPoint files
        "application/vnd.ms-powerpoint", // .ppt
        "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx

        // HTML/webpage files
        "text/html",
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
  param('courseId')
    .isMongoId()
    .withMessage('Invalid courseId format. Please provide a valid courseId.'),

  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isString()
    .withMessage('Title must be a string'),

  body('objectives')
    .notEmpty()
    .withMessage('Objectives are required')
    .isString()
    .withMessage('Objectives must be a string'),

  body('link')
    .optional()
    .isURL()
    .withMessage('Link must be a valid URL'),
  
  validateOptionalFile,

  errorResponse
];
