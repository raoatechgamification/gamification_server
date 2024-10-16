import { body, param } from "express-validator";

export const createBillValidators = [
  body("title")
    .notEmpty()
    .withMessage("Title is required"),
    
  body("summary")
    .optional()
    .isString(),

  body("amount")
    .isNumeric()
    .withMessage("Amount must be a number"),

  body("dueDate")
    .isISO8601()
    .withMessage("Due date must be a valid date"),

  body("billFor")
    .isIn(["candidate", "trainee", "instructor", "group"])
    .withMessage("Invalid bill type"),
    
  body("assignee")
    .optional()
    .isString(),
];

export const billIdValidator = [
  param("billId")
    .isMongoId()
    .withMessage("Invalid bill ID"),
];
