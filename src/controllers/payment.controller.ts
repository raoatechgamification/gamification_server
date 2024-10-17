import { Request, Response, NextFunction } from "express";
import PaymentService from "../services/payment.service";
import User from "../models/user.model";
import CourseAccess from "../models/courseAssess.model";
import Bill from "../models/bill.model";
import AssignedBill from "../models/assignedBill.model";
import { ResponseHandler } from "../middlewares/responseHandler.middleware";


class PaymentController {
  // async processPayment(req: Request, res: Response) {
  //   const { courseId } = req.params;
  //   const {
  //     email,
  //     cardNumber,
  //     expiryMonth,
  //     expiryYear,
  //     cvv,
  //     currency,
  //     amount,
  //   } = req.body;

  //   try {
  //     const paymentData = {
  //       email,
  //       card: {
  //         number: cardNumber,
  //         cvv,
  //         expiry_month: expiryMonth,
  //         expiry_year: expiryYear,
  //       },
  //       currency,
  //       amount,
  //     };

  //     const paymentResponse = await PaymentService.chargeCard(paymentData);

  //     if (paymentResponse.status === "success") {
  //       // Handle successful payment, e.g., save to DB, send response
  //       return res
  //         .status(200)
  //         .json({ message: "Payment successful", data: paymentResponse });
  //     }

  //     return res
  //       .status(400)
  //       .json({ message: "Payment failed", data: paymentResponse });
  //   } catch (error) {
  //     return res.status(500).json({ message: "Server error", error });
  //   }
  // }

  async processPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { assignedBillId } = req.params;
      const userId = req.user.id;

      const assginedBill = await AssignedBill.findOne({ _id: assignedBillId });
      if ( !assginedBill ) {
        return ResponseHandler.failure(res, "No assigned bill found", 404);
      }

      const bill = await Bill.findOne({ _id: assginedBill.billId})
      if ( !bill ) {
        return ResponseHandler.failure(res, "No bill found", 404);
      }

      const { courseId, cardToken, amount } = req.body;

      const paymentResult = await PaymentService.processPayment(
        userId,
        cardToken,
        bill.amount,
        courseId
      );

      if (paymentResult.success) {
        await CourseAccess.create({ userId, courseId, hasAccess: true });
      }

      return ResponseHandler.success(
        res,
        paymentResult,
        "Payment processed successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  async addCard(req: Request, res: Response) {
    const { email, cardNumber, expiryMonth, expiryYear, cvv } = req.body;

    try {
      const cardData = {
        email,
        card: {
          number: cardNumber,
          cvv,
          expiry_month: expiryMonth,
          expiry_year: expiryYear,
        },
      };

      const cardResponse = await PaymentService.saveCard(cardData);

      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Save card to the database

      // user.cards.push({
      //   cardToken: cardResponse.data.token,
      //   last4: cardResponse.data.card.last_4digits,
      //   brand: cardResponse.data.card.brand,
      //   expiryMonth,
      //   expiryYear,
      // });

      // await user.save();

      return res.status(200).json({ message: "Card saved successfully" });
    } catch (error) {
      return res.status(500).json({ message: "Server error", error });
    }
  }

  async deleteCard(req: Request, res: Response) {
    const { cardToken } = req.params;
    // Get the email from the token
    const { email } = req.body;

    try {
      await PaymentService.deleteCard(cardToken);

      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // user.cards = user.cards.filter(
      //   (card: { cardToken: string }) => card.cardToken !== cardToken
      // );
      // await user.save();

      return res.status(200).json({ message: "Card deleted successfully" });
    } catch (error) {
      return res.status(500).json({ message: "Server error", error });
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
}

export default new PaymentController();
