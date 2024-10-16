import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware"; 

import PaymentController from "../controllers/payment.controller";
import {
  cardValidator
} from "../validators/payment.validator";

const { 
  processPayment,
  addCard,
  deleteCard,
  verifyPayment
} = PaymentController

const router = Router();

router.post(
  "/pay",
  authenticate, 
  authorize('user'),
  processPayment
);

router.post(
  "/add-card",
  authenticate, 
  authorize('user'),
  ...cardValidator,
  addCard 
);

router.patch(
  "/delete-card/:cardToken",
  authenticate,
  authorize('user'),
  deleteCard
);

router.get(
  "/verify-payment/:paymentId",
  authenticate,
  verifyPayment
);

export default router;
