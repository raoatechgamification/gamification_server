import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import PaymentService from "../services/payment.service";
import User from "../models/user.model";
import CourseAccess from "../models/courseAssess.model";
import Bill, { BillDocument } from "../models/bill.model";
import AssignedBill from "../models/assignedBill.model";
import Payment from "../models/payment.model";
import { ResponseHandler } from "../middlewares/responseHandler.middleware";
import dotenv from 'dotenv';
import axios from "axios";
dotenv.config();


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

      const reference = `TX-${userId}-${Date.now()}`;

      const paymentPayload = {
        reference,
        userId,
        billId: bill._id.toString(),
        amount: bill.amount,
        email: user.email,
      };

      const paymentResult = await PaymentService.processPayment(paymentPayload);

      await Payment.create({
        userId,
        billId: bill._id,
        assignedBillId,
        status: "pending",
        reference,
      });

      return ResponseHandler.success(
        res,
        paymentResult,
        "Payment link created"
      );
    } catch (error) {
      next(error);
    }
  }

  async verifyPayment(req: Request, res: Response, next: NextFunction) {
    const { transactionId } = req.params;

    try {
      const verificationData = await PaymentService.verifyPayment(transactionId)

      // const url = `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`;

      // // Make the request to Flutterwave
      // const response = await axios.get(url, {
      //   headers: {
      //     Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
      //   },
      // });

      // const verificationData = response.data;

      // Check if the transaction was successful
      if (verificationData.status === 'success' && verificationData.data.status === 'successful') {
        return res.status(200).json({
          message: 'Payment verified successfully',
          data: verificationData.data,
        });
      } else {
        // Transaction is not successful
        return res.status(400).json({
          message: 'Payment verification failed',
          data: verificationData.data,
        });
      }
    } catch (error: any) {
      console.error('Error verifying payment:', error);
      
      return res.status(500).json({
        message: 'Server error while verifying payment',
        error: error.response?.data || error.message,
      });
    }
  }

  
  async paymentWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      // const hash = crypto
      //   .createHmac("sha256", process.env.FLUTTERWAVE_SECRET_HASH as string)
      //   .update(JSON.stringify(req.body))
      //   .digest("hex");

      // console.log("Generated hash:", hash);
      // console.log("Flutterwave verif-hash header:", req.headers["verif-hash"]);

      const flutterwaveVerifHash = req.headers['verif-hash'];
      const secretHash = process.env.FLUTTERWAVE_SECRET_HASH;
      
      console.log("Flutterwave verif-hash header:", flutterwaveVerifHash);
      console.log("Expected secret hash:", secretHash);

      if (flutterwaveVerifHash !== secretHash) {
        console.log("Hash mismatch - Unauthorized request");

        return res.status(403).json({ message: "Invalid signature" });
      }

      const { event, data } = req.body;
      // const data = req.body;

      console.log("Webhook received with data", data)
      if (data.status === "successful") {
        const userId = data.customer.id
        const billId = data.customizations.billId

        await CourseAccess.create({
          userId, 
          billId,
          hasAccess: true
        })

        await Payment.findByIdAndUpdate({
          _id: userId,
          status: "successful",
          data,
          event
        })

          // Send success notification to the user 
        console.log("Payment successful and completed");
      } else if (data.status === "failed") {
        await Payment.findByIdAndUpdate({
          _id: data.customer.id,
          status: "failed",
          data,
          event
        })
        console.log("Payment failed:", data);
      }

      res.status(200).json({ status: "success" });
    } catch (error: any) {
      res.status(500).json({ 
        message: "Server error",
        error: error.message 
      });
    }
  }


  // async verifyPayment(req: Request, res: Response, next: NextFunction) {
  //   try {
  //     const { paymentId } = req.params;
  //     const paymentStatus = await PaymentService.verifyPayment(paymentId);

  //     return ResponseHandler.success(
  //       res,
  //       paymentStatus,
  //       "Payment status verified successfully"
  //     );

  //     // app.get('/payment-callback', async (req, res) => {
  //     //   if (req.query.status === 'successful') {
  //     //       const transactionDetails = await Transaction.find({ref: req.query.tx_ref});
  //     //       const response = await flw.Transaction.verify({id: req.query.transaction_id});
  //     //       if (
  //     //           response.data.status === "successful"
  //     //           && response.data.amount === transactionDetails.amount
  //     //           && response.data.currency === "NGN") {
  //     //           // Success! Confirm the customer's payment
  //     //       } else {
  //     //           // Inform the customer their payment was unsuccessful
  //     //       }
  //     //   }
  //     // );

  //     // Install with: npm i flutterwave-node-v3

  //     // const Flutterwave = require('flutterwave-node-v3');
  //     // const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY);
  //     // flw.Transaction.verify({ id: transactionId })
  //     //     .then((response) => {
  //     //         if (
  //     //             response.data.status === "successful"
  //     //             && response.data.amount === expectedAmount
  //     //             && response.data.currency === expectedCurrency) {
  //     //             // Success! Confirm the customer's payment
  //     //         } else {
  //     //             // Inform the customer their payment was unsuccessful
  //     //         }
  //     //     })
  //     //     .catch(console.log);
  //   } catch (error) {
  //     next(error);
  //   }
  // }

  // async paymentWebhookkk(req: Request, res: Response, next: NextFunction) {
  //   try {
  //     const webhookData = req.body;

  //     if (webhookData.status === "successfully") {
  //       const paymentId = webhookData.transaction._id;

  //       const paymentStatus = await PaymentService.verifyPayment(paymentId);

  //       if (paymentStatus.status === "success") {
  //         const userId = webhookData.customer.id;
  //         const billId = webhookData.tx_ref;

  //         await CourseAccess.create({
  //           userId,
  //           billId,
  //           hasAccess: true,
  //         });

  //         return res.status(200).json({
  //           status: "success",
  //           message: "Payment verifed and access granted",
  //         });
  //       }
  //     }

  //     return res
  //       .status(400)
  //       .json({ status: "failure", message: "Invalid webhook event" });
  //   } catch (error) {
  //     next(error);
  //   }
  // }
}

export default new PaymentController();
