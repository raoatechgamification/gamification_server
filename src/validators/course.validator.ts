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
