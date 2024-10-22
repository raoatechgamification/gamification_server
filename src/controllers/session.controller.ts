import { Request, Response, NextFunction } from "express";
import { ResponseHandler } from "../middlewares/responseHandler.middleware";
import Session from "../models/session.model";
import Bill from "../models/bill.model";
import AssignedBill from "../models/assignedBill.model";


class SessionController {
  async createSession(req: Request, res: Response) {
    try {
      const organizationId = req.admin._id;
      const { name, terms, bills, oneBillForAnEntireSession } = req.body;
  
      // Step 1: Validate the number of terms matches termsInSession
      if (terms.length !== name.termsInSession) {
        return ResponseHandler.failure(
          res,
          `The number of terms (${terms.length}) does not match termsInSession (${name.termsInSession}).`,
          400
        );
      }
  
      // Step 2: Validate that when oneBillForAnEntireSession is false, the number of bills matches the number of terms
      if (!oneBillForAnEntireSession && bills.length !== terms.length) {
        return ResponseHandler.failure(
          res,
          `The number of bills (${bills.length}) does not match the number of terms (${terms.length}).`,
          400
        );
      }
  
      const sessionData = {
        organizationId,
        name,
        terms: oneBillForAnEntireSession ? [] : terms,
        oneBillForAnEntireSession
      };
  
      const session = new Session(sessionData);
      await session.save();
  
      if (oneBillForAnEntireSession) {
        // Case 1: One bill for the entire session
        const billData = {
          billId: bills[0].billId,
          assigneeId: organizationId,  // Assuming admin/organization is the assignee
          assigneeType: "organization",
          status: "pending",
        };
        const assignedBill = new AssignedBill(billData);
        await assignedBill.save();
  
        // Attach bill to session
        session.bills.push({ termName: "Full Session", billId: assignedBill.billId });
        await session.save();
      } else {
        // Case 2: Separate bills for each term
        for (let i = 0; i < terms.length; i++) {
          const term = terms[i];
          const billForTerm = bills[i];
  
          // Step 3: Ensure termName for the bill matches the term title
          if (billForTerm.termName !== term.title) {
            return ResponseHandler.failure(
              res,
              `Term name mismatch: The bill for term "${term.title}" should have termName "${term.title}".`,
              400
            );
          }
  
          // Create an assigned bill for each term
          const billData = {
            billId: billForTerm.billId,
            assigneeId: organizationId,
            assigneeType: "organization",
            status: "pending",
          };
          const assignedBill = new AssignedBill(billData);
          await assignedBill.save();
  
          // Attach bill to the corresponding term
          session.bills.push({ termName: term.title, billId: assignedBill.billId });
        }
  
        await session.save();
      }
  
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