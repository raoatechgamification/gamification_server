import { Request, Response, NextFunction } from "express";
import { ResponseHandler } from "../middlewares/responseHandler.middleware";
import Session from "../models/session.model";
import Bill from "../models/bill.model";
import AssignedBill from "../models/assignedBill.model";


class SessionController {
  async createSession (req: Request, res: Response) {
    try {
      const organizationId = req.admin._id
      
      const { name, terms, bills, oneBillForAnEntireSession } = req.body;

      const newSession = await Session.create({
        organizationId,
        name,
        terms,
        bills,
        oneBillForAnEntireSession
      });

      if (oneBillForAnEntireSession) {
        const { billId } = bills[0]; 
        await AssignedBill.create({
          billId,
          assigneeId: newSession._id,
          assigneeType: "session",
          status: "pending"
        });
      }

      return ResponseHandler.success(res, newSession, "Session created successfully", 201);
    } catch (error: any) {
      return ResponseHandler.failure(
        res, 
        "An error occurred, unable to create session.",
        500,
        error.message
      )
    }
  } 

  async editSession (req: Request, res: Response) {
    try {
      const organizationId = req.admin._id
      const { sessionId } = req.params

      const { name, terms, bills, oneBillForAnEntireSession } = req.body;

      const updatedSession = await Session.findOneAndUpdate(
        { _id: sessionId, organizationId },
        { name, terms, bills, oneBillForAnEntireSession },
        { new: true }
      );

      if (!updatedSession) {
        return ResponseHandler.failure(res, "Session not found", 404);
      }

      return ResponseHandler.success(res, updatedSession, "Session updated successfully", 200);
    } catch (error: any) {
      return ResponseHandler.failure(
        res, 
        "an error occurred, unable to edit session.",
        500,
        error.message
      )
    }
  } 

  async viewASession (req: Request, res: Response) {
    try {
      const { sessionId } = req.params

      const session = await Session.findById(sessionId);

      if (!session) {
        return ResponseHandler.failure(res, "Session not found", 404);
      }

      return ResponseHandler.success(res, session, "Session retrieved successfully", 200);
    } catch (error: any) {
      return ResponseHandler.failure(
        res, 
        "An error occurred, unable to fetch session.",
        500,
        error.message
      )
    }
  } 

  async viewAllSessions (req: Request, res: Response) {
    try {
      const organizationId = req.admin._id

      const sessions = await Session.find({ organizationId });

      return ResponseHandler.success(res, sessions, "All sessions retrieved successfully", 200);
    } catch (error: any) {
      return ResponseHandler.failure(
        res, 
        "An error occurred, unable to view all sessions.",
        500,
        error.message
      )
    }
  } 

  async deleteSession (req: Request, res: Response) {
    try {
      const organizationId = req.admin._id
      const { sessionId } = req.params

      const deletedSession = await Session.findByIdAndDelete(sessionId);

      if (!deletedSession) {
        return ResponseHandler.failure(res, "Session not found", 404);
      }

      return ResponseHandler.success(res, {}, "Session deleted successfully", 200);
    } catch (error: any) {
      return ResponseHandler.failure(
        res, 
        "An error occurred, unable to delete session.",
        500,
        error.message
      )
    }
  } 
}

export default new SessionController();