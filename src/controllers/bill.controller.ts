import { Request, Response, NextFunction } from "express";
import Bill from "../models/bill.model";
import AssignedBill from "../models/assignedBill.model";
import { ResponseHandler } from "../middlewares/responseHandler.middleware";

class BillController {
  async createBill(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        title,
        summary,
        amount,
        dueDate,
        billFor,
        assigneeType,
        assignee,
      } = req.body;
      const organizationId = req.admin._id;
      console.log(organizationId);

      const newBill = await Bill.create({
        organizationId,
        title,
        summary,
        amount,
        dueDate,
        billFor,
      });

      const newAssignedBill = await AssignedBill.create({
        billId: newBill._id,
        assigneeId: assignee,
        assigneeType,
        status: "unpaid",
      });

      return ResponseHandler.success(
        res,
        { bill: newBill, assignedBill: newAssignedBill },
        "Bill created and assigned successfully",
        201
      );
    } catch (error: any) {
      console.log(error)
      return res.status(500).json({
        success: false,
        message: 'An error occurred while creating a bill',
        error: error.message,
      });
    }
  }

  async fetchAllBills(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = req.admin._id;
      const bills = await Bill.find({ organizationId });

      if (bills.length === 0) {
        return ResponseHandler.failure(res, "No bills found", 404);
      }

      return ResponseHandler.success(
        res,
        bills,
        "All bills retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  async viewBill(req: Request, res: Response, next: NextFunction) {
    try {
      const { billId } = req.params;
      const bill = await Bill.findOne({ _id: billId });

      if (!bill) {
        return ResponseHandler.failure(res, "No bill found", 404);
      }

      return ResponseHandler.success(res, bill);
    } catch (error) {
      next(error);
    }
  }

  async deleteBill(req: Request, res: Response, next: NextFunction) {
    try {
      const { billId } = req.params;
      const bill = await Bill.findOne({ _id: billId });

      if (!bill) {
        return ResponseHandler.failure(res, "No bill found", 404);
      }

      await Bill.deleteOne({ _id: billId });
      return ResponseHandler.success(res, "Bill deleted successfully");
    } catch (error) {
      next(error);
    }
  }
}

export default new BillController();
