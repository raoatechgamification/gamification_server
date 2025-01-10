import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";

import PaymentController from "../controllers/payment.controller";

const { processPayment, verifyPayment, paymentWebhook } = PaymentController;

const router = Router();

router.post(
  "/process-payment/:assignedBillId",
  authenticate,
  authorize("user"),
  processPayment
);

router.post(
  "/process-payment/:courseIds",
  authenticate,
  authorize("user"),
  processPayment
);

router.get("/verify-payment/:transactionId", authenticate, verifyPayment);

router.post("/webhook", paymentWebhook);

export default router;
