import dotenv from "dotenv";
import { Request, Response } from "express";
import { ResponseHandler } from "../middlewares/responseHandler.middleware";
import Course from "../models/course.model";
import Payment from "../models/payment.model";
import User from "../models/user.model";
import PaymentService from "../services/payment.service";
dotenv.config();

class PaymentController {
  async processPayment(req: Request, res: Response) {
    try {
      const userId = req.user.id;

      const user = await User.findOne({ _id: userId });
      if (!user) {
        return ResponseHandler.failure(res, "User not found", 404);
      }

      const { assignedBillId } = req.params;

      if (!user.assignedPrograms) {
        return ResponseHandler.failure(
          res,
          "No assigned programs found for the user",
          404
        );
      }

      const assignedBill = user.assignedPrograms.find(
        (program) =>
          program._id?.toString() === assignedBillId &&
          program.status === "unpaid"
      );

      if (!assignedBill) {
        return ResponseHandler.failure(
          res,
          "No matching unpaid assigned bill found",
          404
        );
      }

      const { courseId, amount } = assignedBill;

      const course = await Course.findOne({ _id: courseId });
      if (!course) {
        return ResponseHandler.failure(res, "Course not found", 404);
      }

      const reference = `TX-${userId}-${Date.now()}`;

      const paymentPayload = {
        reference,
        userId,
        billId: assignedBillId,
        email: user.email,
        amount,
      };

      const paymentResult = await PaymentService.processPayment(paymentPayload);

      await Payment.create({
        userId,
        assignedBillId,
        courseId,
        status: "pending",
        reference,
      });

      await User.updateOne(
        { _id: userId, "assignedPrograms._id": assignedBillId },
        { $set: { "assignedPrograms.$.status": "pending" } }
      );

      return ResponseHandler.success(
        res,
        paymentResult,
        "Payment link created"
      );
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        `Server error: ${error.message}`,
        500
      );
    }
  }

  async processPayment2(req: Request, res: Response) {
    try {
      const userId = req.user.id;

      const user = await User.findOne({ _id: userId });
      if (!user) {
        return ResponseHandler.failure(res, "User not found", 404);
      }

      const { courseId, amount } = req.body;
      console.log(courseId, amount);

      const course = await Course.findOne({ _id: courseId });
      if (!course) {
        return ResponseHandler.failure(res, "Course not found", 404);
      }

      const reference = `TX-${userId}-${Date.now()}`;

      const paymentPayload = {
        reference,
        userId,
        billId: courseId,
        email: user.email,
        amount,
      };

      const paymentResult = await PaymentService.processPayment(paymentPayload);

      await Payment.create({
        userId,
        courseId,
        status: "pending",
        reference,
      });

      // await User.updateOne(
      //   { _id: userId, "assignedPrograms._id": assignedBillId },
      //   { $set: { "assignedPrograms.$.status": "pending" } }
      // );

      return ResponseHandler.success(
        res,
        paymentResult,
        "Payment link created"
      );
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        `Server error: ${error.message}`,
        500
      );
    }
  }

  async verifyPayment(req: Request, res: Response) {
    const { transactionId } = req.params;

    try {
      const verificationData =
        await PaymentService.verifyPayment(transactionId);

      // const url = `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`;

      // // Make the request to Flutterwave
      // const response = await axios.get(url, {
      //   headers: {
      //     Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
      //   },
      // });

      // const verificationData = response.data;

      // Check if the transaction was successful
      if (
        verificationData.status === "success" &&
        verificationData.data.status === "successful"
      ) {
        return res.status(200).json({
          message: "Payment verified successfully",
          data: verificationData.data,
        });
      } else {
        // Transaction is not successful
        return res.status(400).json({
          message: "Payment verification failed",
          data: verificationData.data,
        });
      }
    } catch (error: any) {
      console.error("Error verifying payment:", error);

      return res.status(500).json({
        message: "Server error while verifying payment",
        error: error.response?.data || error.message,
      });
    }
  }

  async paymentWebhook(req: Request, res: Response) {
    try {
      console.log(12);
      // const flutterwaveVerifHash = req.headers["verif-hash"];
      // const secretHash = process.env.FLUTTERWAVE_SECRET_HASH;

      // if (flutterwaveVerifHash !== secretHash) {
      //   console.log("Hash mismatch - Unauthorized request");
      //   return res.status(403).json({ message: "Invalid signature" });
      // }

      const data = req.body;
      console.log("Webhook received with data (request body)", data);
      console.log(data.status, "status before if statement");
      if (data.status === "successful") {
        const { txRef } = data;
        console.log("successs");
        console.log("Transaction reference:", data.txRef);

        // Retrieve the payment using the correct reference key
        const payment = await Payment.findOne({ reference: txRef });

        console.log(payment, "payment");
        if (payment) {
          const { userId, assignedBillId, courseId } = payment;

          await Payment.updateOne(
            { _id: payment._id }, // or { userId: userId } if unique
            { status: "successful", data },
            { new: true }
          );

          await User.updateOne(
            { _id: userId },
            { $push: { purchasedCourses: courseId } }
          );

          await Course.updateOne(
            { _id: courseId },
            { $addToSet: { learnerIds: { userId, progress: 0 } } }
          );

          console.log("Payment successful and completed");
        }
      } else if (data.status === "failed") {
        const { txRef } = data;

        const payment = await Payment.findOne({ reference: data.txRef });

        if (payment) {
          await Payment.updateOne(
            { _id: payment._id },
            { status: "failed", data },
            { new: true }
          );
        }
        console.log("Payment failed:", data);
      }

      res.status(200).json({ status: "success" });
    } catch (error: any) {
      console.error("Error in payment webhook:", error);
      res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  }
}

export default new PaymentController();
