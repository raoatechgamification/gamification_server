import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware"; 

import PaymentController from "../controllers/payment.controller";
import {
  cardValidator
} from "../validators/payment.validator";

const { 
  processPayment,
  verifyPayment,
  paymentWebhook
} = PaymentController

const router = Router();

router.post(
  "/process-payment/:assignedBillId",
  authenticate, 
  authorize('user'),
  processPayment
);

router.get(
  "/verify-payment/:paymentId",
  authenticate,
  verifyPayment
);

router.post(
  '/payment-webhook', 
  paymentWebhook
);

export default router;
