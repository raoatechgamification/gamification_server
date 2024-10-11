import { Request, Response, NextFunction } from "express";
import { body, param, validationResult } from "express-validator";

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


export const createNotificationValidator = [
  body("userId")
    .notEmpty()
    .withMessage("User ID is required")
    .isMongoId()
    .withMessage("User ID must be a valid Mongo ID"),

  body("courseId")
    .notEmpty()
    .withMessage("Course ID is required")
    .isMongoId()
    .withMessage("Course ID must be a valid Mongo ID"),

  body("message")
    .notEmpty()
    .withMessage("Message is required")
    .isString()
    .withMessage("Message must be a string"),

  errorResponse
];

export const markAsReadValidator = [
  param("notificationId")
    .notEmpty()
    .withMessage("Notification ID is required")
    .isMongoId()
    .withMessage("Notification ID must be a valid Mongo ID"),

  errorResponse
];

