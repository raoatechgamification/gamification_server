import mongoose, { Types } from "mongoose";
import { Request, Response, NextFunction } from "express";
import { ResponseHandler } from "../middlewares/responseHandler.middleware";
import Session from "../models/session.model";
import Bill, { BillDocument } from "../models/bill.model";
import AssignedBill from "../models/assignedBill.model";
import Group from "../models/group.model";

interface Bill extends BillDocument {
  billId: Types.ObjectId | string;
}

class SessionController {
  constructor() {
    this.createSession = this.createSession.bind(this);
    this.validateTermCount = this.validateTermCount.bind(this);
    this.validateBillCount = this.validateBillCount.bind(this);
    this.validateBillIds = this.validateBillIds.bind(this);
    this.handleSessionBills = this.handleSessionBills.bind(this);
  }

  async createSession(req: Request, res: Response) {
    try {
      const organizationId = req.admin._id;
      const { name, terms, bills, oneBillForAnEntireSession } = req.body;
  
      await this.validateTermCount(terms, name.termsInSession);
      await this.validateBillCount(bills, terms, oneBillForAnEntireSession);
      await this.validateBillIds(bills);
  
      const sessionData = {
        organizationId,
        name,
        terms: oneBillForAnEntireSession ? [] : terms,
        oneBillForAnEntireSession
      };
      const session = new Session(sessionData);
      await session.save();
  
      await this.handleSessionBills(session, terms, bills, oneBillForAnEntireSession, organizationId);
  
      return ResponseHandler.success(res, session, "Session created successfully", 201);
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        "An error occurred, unable to create session.",
        500,
        error.message
      );
    }
  }

  async editSession(req: Request, res: Response) {
    try {
      const organizationId = req.admin._id;
      const { sessionId } = req.params;

      const { name, terms, bills, oneBillForAnEntireSession } = req.body;

      const updatedSession = await Session.findOneAndUpdate(
        { _id: sessionId, organizationId },
        { name, terms, bills, oneBillForAnEntireSession },
        { new: true }
      );

      if (!updatedSession) {
        return ResponseHandler.failure(res, "Session not found", 404);
      }

      return ResponseHandler.success(
        res,
        updatedSession,
        "Session updated successfully",
        200
      );
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        "an error occurred, unable to edit session.",
        500,
        error.message
      );
    }
  }

  async viewASession(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;

      const session = await Session.findById(sessionId);

      if (!session) {
        return ResponseHandler.failure(res, "Session not found", 404);
      }

      return ResponseHandler.success(
        res,
        session,
        "Session retrieved successfully",
        200
      );
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        "An error occurred, unable to fetch session.",
        500,
        error.message
      );
    }
  }

  async viewAllSessions(req: Request, res: Response) {
    try {
      const organizationId = req.admin._id;

      const sessions = await Session.find({ organizationId });

      return ResponseHandler.success(
        res,
        sessions,
        "All sessions retrieved successfully",
        200
      );
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        "An error occurred, unable to view all sessions.",
        500,
        error.message
      );
    }
  }

  async deleteSession(req: Request, res: Response) {
    try {
      const organizationId = req.admin._id;
      const { sessionId } = req.params;

      const deletedSession = await Session.findByIdAndDelete(sessionId);

      if (!deletedSession) {
        return ResponseHandler.failure(res, "Session not found", 404);
      }

      return ResponseHandler.success(
        res,
        {},
        "Session deleted successfully",
        200
      );
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        "An error occurred, unable to delete session.",
        500,
        error.message
      );
    }
  }

  private async validateTermCount(terms: any[], termsInSession: number) {
    if (terms.length !== termsInSession) {
      throw new Error(`The number of terms (${terms.length}) does not match termsInSession (${termsInSession}).`);
    }
  }

  private async validateBillCount(bills: any[], terms: any[], oneBillForAnEntireSession: boolean) {
    if (!oneBillForAnEntireSession && bills.length !== terms.length) {
      throw new Error(`The number of bills (${bills.length}) does not match the number of terms (${terms.length}).`);
    }
  }
  
  private async validateBillIds(bills: any[]) {
    for (const bill of bills) {
      const billExists = await Bill.findById(bill.billId);
      if (!billExists) {
        throw new Error(`Bill with ID ${bill.billId} does not exist.`);
      }
    }
  }

  private async createAssignedBill(billId: mongoose.Types.ObjectId, organizationId: string) {
    const billData = {
      billId,
      assigneeId: organizationId,
      assigneeType: "organization",
      status: "unpaid",
    };
    const assignedBill = new AssignedBill(billData);
    await assignedBill.save();
    return assignedBill;
  }

  private async handleSessionBills(
    session: any,
    terms: any[],
    bills: any[],
    oneBillForAnEntireSession: boolean,
    organizationId: string
  ) {
    if (oneBillForAnEntireSession) {
      // One bill for the entire session
      const assignedBill = await this.createAssignedBill(bills[0].billId, organizationId);
      session.bills.push({ termName: "Full Session", billId: assignedBill.billId });
    } else {
      // Separate bills for each term
      for (let i = 0; i < terms.length; i++) {
        const term = terms[i];
        const billForTerm = bills[i];
  
        // Ensure the termName for the bill matches the term title
        if (billForTerm.termName !== term.title) {
          throw new Error(`Term name mismatch: The bill for term "${term.title}" should have termName "${term.title}".`);
        }
  
        // Create an assigned bill for each term
        const assignedBill = await this.createAssignedBill(billForTerm.billId, organizationId);
        session.bills.push({ termName: term.title, billId: assignedBill.billId });
      }
    }
    await session.save();
  }
}

export default new SessionController();
