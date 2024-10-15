import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware"; 

import PaymentController from "../controllers/payment.controller";
import {
  cardValidator
} from "../validators/payment.validator";

const { 
  payForCourse,
  addCard,
  deleteCard
} = PaymentController

const router = Router();

router.post(
  "/pay",
  authenticate, 
  authorize('user'),
  payForCourse
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
  authenticateUser,
  PaymentController.prototype.verifyPayment
);

export default router;
