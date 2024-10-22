import { Request, Response, NextFunction } from "express";
import PaymentService from "../services/payment.service";
import User from "../models/user.model";
import CourseAccess from "../models/courseAssess.model";
import Bill, { BillDocument } from "../models/bill.model";
import AssignedBill from "../models/assignedBill.model";
import Payment from "../models/payment.model";
import { ResponseHandler } from "../middlewares/responseHandler.middleware";

class PaymentController {
  async processPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;

      const user = await User.findOne({ _id: userId });
      if (!user) {
        return ResponseHandler.failure(res, "User not found", 404);
      }

      const { assignedBillId } = req.params;
      const assginedBill = await AssignedBill.findOne({ _id: assignedBillId });
      if (!assginedBill) {
        return ResponseHandler.failure(res, "No assigned bill found", 404);
      }

      const bill: BillDocument | null = await Bill.findOne({
        _id: assginedBill.billId,
      });
      if (!bill) {
        return ResponseHandler.failure(res, "No bill found", 404);
      }

      const paymentPayload = {
        userId,
        billId: bill._id.toString(),
        amount: bill.amount,
        email: user.email,
      };

      const paymentResult = await PaymentService.processPayment(paymentPayload);

      await Payment.create({
        userId,
        billId: bill._id,
        assignedBillId
      })

      // if (paymentResult.success) {
      //   await CourseAccess.create({
      //     userId,
      //     billId: bill._id,
      //     hasAccess: true,
      //   });
      // }

      console.log("payment link", paymentResult.data.link)

      // res.redirect(paymentResult.data.link)

      return ResponseHandler.success(
        res,
        paymentResult,
        "Payment processed successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  async verifyPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { paymentId } = req.params;
      const paymentStatus = await PaymentService.verifyPayment(paymentId);

      return ResponseHandler.success(
        res,
        paymentStatus,
        "Payment status verified successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  async paymentWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const webhookData = req.body;

      if (webhookData.status === "successfully") {
        const paymentId = webhookData.transaction._id;

        const paymentStatus = await PaymentService.verifyPayment(paymentId);

        if (paymentStatus.status === "success") {
          const userId = webhookData.customer.id;
          const billId = webhookData.tx_ref;

          await CourseAccess.create({
            userId,
            billId,
            hasAccess: true,
          });

          return res.status(200).json({
            status: "success",
            message: "Payment verifed and access granted",
          });
        }
      }

      return res
        .status(400)
        .json({ status: "failure", message: "Invalid webhook event" });
    } catch (error) {
      next(error);
    }
  }
}

export default new PaymentController();
