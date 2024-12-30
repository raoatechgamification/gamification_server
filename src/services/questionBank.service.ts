import { Request, Response } from 'express';
import multer from 'multer';
import * as XLSX from 'xlsx';
import ObjectiveAssessment from '../models/objectiveAssessment.model';
import QuestionBank from '../models/questionBank.model';

interface ExcelRow {
  title: string;
  description: string;
  marksPerQuestion: number;
  numberOfTrials?: number;
  purpose?: string;
  position: number;
  totalMark: number;
  passMark: number;
  duration: number;
  assessmentCode: string;
  questions: { question: string; type: string; options?: string[]; answer: string; mark: number }[];
}


const upload = multer({ storage: multer.memoryStorage() });

export const uploadQuestionBank = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const organizationId = req.admin._id
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Parse the Excel file
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheetData: unknown[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (!Array.isArray(sheetData) || sheetData.length === 0) {
      return res.status(400).json({ message: 'The uploaded file is empty or invalid' });
    }

    // Save assessments
    const assessmentIds = [];
    for (const rawRow  of sheetData) {
      const row = rawRow as ExcelRow; 
      const assessmentData = {
        organizationId,
        title: row.title,
        description: row.description,
        marksPerQuestion: row.marksPerQuestion,
        numberOfTrials: row.numberOfTrials,
        purpose: row.purpose,
        position: row.position,
        totalMark: row.totalMark,
        passMark: row.passMark,
        duration: row.duration,
        assessmentCode: row.assessmentCode,
        questions: row.questions, // Ensure questions is structured correctly
      };

      const newAssessment = await ObjectiveAssessment.create(assessmentData);
      assessmentIds.push(newAssessment._id);
    }

    // Create the question bank
    const questionBank = await QuestionBank.create({
      name,
      organizationId,
      assessmentIds,
    });

    res.status(201).json({
      message: 'Question bank created successfully',
      data: questionBank,
    });
  } catch (error) {
    console.error('Error uploading question bank:', error);
    res.status(500).json({ message: 'An error occurred', error });
  }
};

// Middleware to handle file uploads
export const uploadMiddleware = upload.single('file');
