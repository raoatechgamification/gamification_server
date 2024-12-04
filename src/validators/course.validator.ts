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
      errors: errors.array().map((error: any) => ({
        field: error.param,
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

  // body("objective")
  //   .notEmpty()
  //   .isString()
  //   .withMessage("Please provide the course objective"),

  body("cost")
    .notEmpty()
    .isNumeric()
    .withMessage("Please provide the course price"),

  // body("duration")
  //   .notEmpty()
  //   .isString()
  //   .withMessage("Please provide a the course duration"),

  // body("lessonFormat")
  //   .notEmpty()
  //   .isString()
  //   .withMessage("Please provide the lessons format"),

  errorResponse,
];


export const courseContentValidator = [
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

export const validateCourseId = [
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

export const validateCreateCourse = [
  body("code")
    .notEmpty()
    .withMessage("Course code is required")
    .isString()
    .withMessage("Course code must be a string"),

  body("showInstructor")
    .notEmpty()
    .withMessage("A value for showInstructor is required")
    .isBoolean()
    .withMessage("showInstructor value must be boolean"),

  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isString()
    .withMessage('Title must be a string'),

  body('objective')
    .notEmpty()
    .withMessage('Objective is required')
    .isString()
    .withMessage('Objective must be a string'),

  // body('price')
  //   .optional()
  //   .isFloat({ gt: 1000 })
  //   .withMessage('Price must be a greater than NGN1000'),

  body('instructorId')
    .notEmpty()
    .withMessage('Instructor ID is required')
    .isMongoId()
    .withMessage('Instructor ID must be a valid MongoDB ObjectId'),

  body('duration')
    .notEmpty()
    .withMessage('Duration is required')
    .isString()
    .withMessage('Duration must be a string'),

  body('lessonFormat')
    .notEmpty()
    .withMessage('Lesson format is required')
    .isString()
    .withMessage('Lesson format must be a string'),

  // body('lessons')
  //   .notEmpty()
  //   .withMessage('Lessons are required')
  //   .isArray()
  //   .withMessage('Lessons must be an array')
  //   .custom((lessons) => {
  //     if (!lessons.every((lesson: string) => /^[a-f\d]{24}$/i.test(lesson))) {
  //       throw new Error('Lessons must be an array of valid MongoDB ObjectIds');
  //     }
  //     return true;
  //   }),

    body("assessments")
      .optional({ nullable: true })
      .isArray()
      .withMessage("Assessments must be an array")
      .custom((assessments) => {
        if (assessments && !assessments.every((assessment: string) => /^[a-f\d]{24}$/i.test(assessment))) {
          throw new Error("Assessments must be an array of valid MongoDB ObjectIds");
        }
        return true;
      }),

    body("announcements")
      .optional({ nullable: true })
      .isArray()
      .withMessage("Announcements must be an array")
      .custom((announcements) => {
        if (announcements && !announcements.every(
          (announcement: { title: string; details: string }) =>
            typeof announcement.title === "string" &&
            typeof announcement.details === "string"
        )) {
          throw new Error("Each announcement must contain a title and details as strings");
        }
        return true;
      }),

  errorResponse
];