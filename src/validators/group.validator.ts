import { body, param } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

const errorResponse = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      errors: errors.array().map((error) => ({
        field: error.type,
        message: error.msg,
      })),
    });
    // return res.status(400).json({ errors: errors.array() });
  }
  next();
};


export const validateCreateGroup = [
  body('name')
    .notEmpty()
    .withMessage('Group name is required')
    .isString()
    .withMessage('Group name must be a string'),

  body('learnerTerm')
    .notEmpty()
    .withMessage('Learner term is required')
    .isIn(['learner', 'staff', 'student', 'trainee', 'user'])
    .withMessage('Learner term must be one of: learner, staff, student, trainee, or user'),

  body('generalLearnerGroupTerm')
    .notEmpty()
    .withMessage('General learner group term is required')
    .isIn(['class', 'group', 'batch'])
    .withMessage('General learner group term must be one of: class, group, or batch'),

  body('groups')
    .isArray({ min: 1 })
    .withMessage('Groups must be a non-empty array')
    .custom((groups) => groups.every((group: any) => typeof group === 'string'))
    .withMessage('Each group must be a string'),

  body('generalSubLearnerGroupTerm')
    .notEmpty()
    .withMessage('General sub-learner group term is required')
    .isIn(['facilitator', 'arm', 'cohort'])
    .withMessage('General sub-learner group term must be one of: facilitator, arm, or cohort'),

  body('subGroups')
    .isArray({ min: 1 })
    .withMessage('Sub-groups must be a non-empty array')
    .custom((subGroups) => subGroups.every((subGroup: any) => typeof subGroup === 'string'))
    .withMessage('Each sub-group must be a string'),

  body('generalInstructorTerm')
    .notEmpty()
    .withMessage('General instructor term is required')
    .isIn(['instructor', 'teacher', 'facilitator', 'trainer', 'lecturer'])
    .withMessage('General instructor term must be one of: instructor, teacher, facilitator, trainer, or lecturer'),

  body('instructorNames')
    .isArray({ min: 1 })
    .withMessage('Instructor names must be a non-empty array')
    .custom((names) => names.every((name: any) => typeof name === 'string'))
    .withMessage('Each instructor name must be a string'),

  body('maxMembersPerProgram')
    .notEmpty()
    .withMessage('Max members per program is required')
    .isInt({ min: 1 })
    .withMessage('Max members per program must be a positive integer'),

  body('idFormat')
    .notEmpty()
    .withMessage('ID format is required')
    .isIn(['learner', 'staff', 'student', 'trainee', 'user'])
    .withMessage('ID format must be one of: learner, staff, student, trainee, or user'),

  body('personalization')
    .optional()
    .isString()
    .withMessage('Personalization must be a string'),

  errorResponse
];

export const validateEditGroup = [
  param('groupId')
    .notEmpty()
    .withMessage('Group ID is required')
    .isMongoId()
    .withMessage('Group ID must be a valid MongoDB ObjectId'),

  body('name')
    .optional()
    .isString()
    .withMessage('Group name must be a string'),

  body('learnerTerm')
    .optional()
    .isIn(['learner', 'staff', 'student', 'trainee', 'user'])
    .withMessage('Learner term must be one of: learner, staff, student, trainee, or user'),

  body('generalLearnerGroupTerm')
    .optional()
    .isIn(['class', 'group', 'batch'])
    .withMessage('General learner group term must be one of: class, group, or batch'),

  body('groups')
    .optional()
    .isArray()
    .withMessage('Groups must be an array')
    .custom((groups) => groups.every((group: any) => typeof group === 'string'))
    .withMessage('Each group must be a string'),

  body('generalSubLearnerGroupTerm')
    .optional()
    .isIn(['facilitator', 'arm', 'cohort'])
    .withMessage('General sub-learner group term must be one of: facilitator, arm, or cohort'),

  body('subGroups')
    .optional()
    .isArray()
    .withMessage('Sub-groups must be an array')
    .custom((subGroups) => subGroups.every((subGroup: any) => typeof subGroup === 'string'))
    .withMessage('Each sub-group must be a string'),

  body('generalInstructorTerm')
    .optional()
    .isIn(['instructor', 'teacher', 'facilitator', 'trainer', 'lecturer'])
    .withMessage('General instructor term must be one of: instructor, teacher, facilitator, trainer, or lecturer'),

  body('instructorNames')
    .optional()
    .isArray()
    .withMessage('Instructor names must be an array')
    .custom((names) => names.every((name: any) => typeof name === 'string'))
    .withMessage('Each instructor name must be a string'),

  body('maxMembersPerProgram')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max members per program must be a positive integer'),

  body('idFormat')
    .optional()
    .isIn(['learner', 'staff', 'student', 'trainee', 'user'])
    .withMessage('ID format must be one of: learner, staff, student, trainee, or user'),

  body('personalization')
    .optional()
    .isString()
    .withMessage('Personalization must be a string'),

  errorResponse
];