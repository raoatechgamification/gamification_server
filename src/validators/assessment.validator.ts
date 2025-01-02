import { Request, Response, NextFunction } from "express";
import { param, body, validationResult, check } from "express-validator";
import multer from 'multer';

const validateMarkingGuide = [
  body("markingGuide")
    .optional()
    .bail()
    .custom((value) => {
      if (typeof value !== "object" || value === null) {
        throw new Error("Marking guide must be an object");
      }

      const { question, expectedAnswer, keywords } = value;

      if (!question || typeof question !== "string") {
        throw new Error("Marking guide must contain a valid question");
      }

      if (!expectedAnswer || typeof expectedAnswer !== "string") {
        throw new Error("Marking guide must contain a valid expectedAnswer");
      }

      if (!Array.isArray(keywords)) {
        throw new Error("Keywords must be an array of strings");
      }

      for (let keyword of keywords) {
        if (typeof keyword !== "string") {
          throw new Error("All keywords must be valid strings");
        }
      }

      return true; 
    }),
];

const validateOptionalFile = [
  (req: Request, res: Response, next: NextFunction) => {
    if (req.file) {
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(422).json({
          success: false,
          errors: [{ field: "file", message: "Invalid file type" }],
        });
      }
    }
    next();
  },
];

const errorResponse = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array()[0] });
  }
  next();
};

export const createAssessmentValidator = [
  body("title")
    .notEmpty()
    .isString()
    .withMessage("Please provide the title of the assessment"),

  body("question")
    .notEmpty()
    .isString()
    .withMessage("Question is a required field"),

  body("highestAttainableScore")
    .notEmpty()
    .isNumeric()
    .withMessage(
      "Please provide the highest attaniable score and as an integer"
    ),

  validateMarkingGuide,

  validateOptionalFile,

  errorResponse,
];

export const createObjectiveAssessmentValidator = [
  check('title')
    .notEmpty()
    .withMessage('Title is required'),
  check('description')
    .notEmpty()
    .withMessage('Description is required'),
  check('marksPerQuestion')
    .optional()
    .isNumeric()
    .withMessage('Marks per question must be a number'),
  check('numberOfTrials')
    .notEmpty()
    .isNumeric()
    .withMessage('Number of trials must be a number'),
  check('purpose')
    .optional()
    .isString()
    .withMessage('Purpose must be a string'),
  check('passMark')
    .isNumeric()
    .withMessage('Pass mark must be a number')
    .notEmpty()
    .withMessage('Pass mark is required'),
  check('duration')
    .isNumeric()
    .withMessage('Duration must be a number')
    .notEmpty()
    .withMessage('Duration is required'),
  check('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO8601 date'),
  check('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO8601 date'),
  check('assessmentCode')
    .optional()
    .isString()
    .withMessage('Assessment code must be a string'),
  check('questions')
    .isArray()
    .withMessage('Questions must be an array')
    .notEmpty()
    .withMessage('Questions are required'),
  check('questions.*.question')
    .notEmpty()
    .withMessage('Each question must have a text'),
  check('questions.*.type')
    .isIn(['True or False', 'Yes or No', 'Fill in the Gap', 'Multichoice'])
    .withMessage(
      'Each question type must be one of True or False, Yes or No, Fill in the Gap, or Multichoice'
    ),
  check('questions.*.options')
    .optional()
    .isArray()
    .withMessage('Options must be an array for multichoice questions'),
  check('questions.*.answer')
    .notEmpty()
    .withMessage('Each question must have an answer'),
  check('questions.*.mark')
    .isNumeric()
    .withMessage('The mark for each question must be a positive number')
    .notEmpty()
    .withMessage('Each question must have a mark'),
  
  errorResponse
]

// export const bulkUploadAssessmentsValidator = [
//   check('title')
//     .notEmpty()
//     .withMessage('Title is required'),
//   check('description')
//     .notEmpty()
//     .withMessage('Description is required'),
//   check('marksPerQuestion')
//     .optional()
//     .isNumeric()
//     .withMessage('Marks per question must be a number'),
//   check('numberOfTrials')
//     .notEmpty()
//     .isNumeric()
//     .withMessage('Number of trials must be a number'),
//   check('purpose')
//     .optional()
//     .isString()
//     .withMessage('Purpose must be a string'),
//   check('passMark')
//     .isNumeric()
//     .withMessage('Pass mark must be a number')
//     .notEmpty()
//     .withMessage('Pass mark is required'),
//   check('duration')
//     .isNumeric()
//     .withMessage('Duration must be a number')
//     .notEmpty()
//     .withMessage('Duration is required'),
//   check('startDate')
//     .optional()
//     .isISO8601()
//     .withMessage('Start date must be a valid ISO8601 date'),
//   check('endDate')
//     .optional()
//     .isISO8601()
//     .withMessage('End date must be a valid ISO8601 date'),
//   check('assessmentCode')
//     .optional()
//     .isString(),

//   errorResponse
// ]

export const submissionValidator = [
  param("assessmentId")
    .notEmpty()
    .withMessage('Assessment ID is required')
    .isMongoId()
    .withMessage('Assessment ID must be a valid MongoDB ObjectId'),

  body("answerText")
    .notEmpty()
    .isString()
    .withMessage("Please provide the title of the assessment as a text"),

  validateOptionalFile,

  errorResponse,
];

export const gradeAssessmentValidator = [
  param("submissionId")
    .notEmpty()
    .withMessage('Submission ID is required')
    .isMongoId()
    .withMessage('Submission ID must be a valid MongoDB ObjectId'),

  body("score")
    .notEmpty()
    .isNumeric()
    .withMessage("Please provide the score as an integer"),

  body("comments").optional().isString(),

  body("useAI")
    .notEmpty()
    .isBoolean()
    .withMessage(
      "Please select if you want learners' submissions to be graded automatically or manually"
    ),

  errorResponse,
];

export const assessmentIdValidator = [
  param("assessmentId")
    .notEmpty()
    .withMessage('Assessment ID is required')
    .isMongoId()
    .withMessage('Assessment ID must be a valid MongoDB ObjectId'),

  errorResponse,
];

export const submissionIdValidator = [
  param("submissionId")
    .notEmpty()
    .withMessage('Submission ID is required')
    .isMongoId()
    .withMessage('Submission ID must be a valid MongoDB ObjectId'),

  errorResponse
]

export const submissionIdsValidator = [
  param("assessmentId")
    .notEmpty()
    .withMessage('Assessment ID is required')
    .isMongoId()
    .withMessage('Assessment ID must be a valid MongoDB ObjectId'),

  param("courseId")
    .notEmpty()
    .withMessage('Course ID is required')
    .isMongoId()
    .withMessage('Course ID must be a valid MongoDB ObjectId'),

  errorResponse,
];

export const validateManualQuestionsUpload = [
  body('questionsBankName')
    .notEmpty()
    .withMessage('Questions bank name is required')
    .isString()
    .withMessage('Questions bank name must be a string'),
  body('groupName')
    .notEmpty()
    .withMessage("Group name is required")
    .isString()
    .withMessage('Group name must be a string'),
    check('questions')
    .isArray()
    .withMessage('Questions must be an array')
    .notEmpty()
    .withMessage('Questions are required'),
  check('questions.*.question')
    .notEmpty()
    .withMessage('Each question must have a text'),
  check('questions.*.type')
    .isIn(['True or False', 'Yes or No', 'Fill in the Gap', 'Multichoice'])
    .withMessage(
      'Each question type must be one of True or False, Yes or No, Fill in the Gap, or Multichoice'
    ),
  check('questions.*.options')
    .optional()
    .isArray()
    .withMessage('Options must be an array for multichoice questions'),
  check('questions.*.answer')
    .notEmpty()
    .withMessage('Each question must have an answer'),
  check('questions.*.mark')
    .isNumeric()
    .withMessage('The mark for each question must be a positive number')
    .notEmpty()
    .withMessage('Each question must have a mark'),

  errorResponse
]


// Multer setup to validate file type
const upload = multer({
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(
        new Error('Invalid file type. Only Excel files (.xlsx, .xls) are allowed.')
      );
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // Optional: Limit file size to 5MB
  },
});

// Middleware to validate input fields
const validateBulkUploadInputs = [
  body('questionsBankName')
    .notEmpty()
    .withMessage('Questions bank name is required')
    .isString()
    .withMessage('Questions bank name must be a string'),
  body('groupName')
    .notEmpty()
    .withMessage("Group name is required")
    .isString()
    .withMessage('Group name must be a string'),
];

// Middleware to check validation results
const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array()[0] });
  }
  next();
};

// Error handling for multer
const multerErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    // Handle multer-specific errors
    return res.status(400).json({
      success: false,
      message: `Multer error: ${err.message}`,
    });
  }
  if (err) {
    // Handle custom file type error
    return res.status(400).json({
      success: false,
      message: err.message || 'An unknown error occurred during file upload.',
    });
  }
  next();
};

// Combine multer and validation middleware
export const validateBulkUploadRequest = [
  upload.single('file'), // Ensure 'file' is the field name for the Excel file
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please provide an Excel file.',
      });
    }
    next();
  },
  validateBulkUploadInputs,
  handleValidationErrors,
  multerErrorHandler, // Error handler for multer and file upload
];