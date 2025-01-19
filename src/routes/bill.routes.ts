import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import billController from "../controllers/bill.controller";

import {
  createBillValidators,
  billIdValidator,
} from "../validators/bill.validator";

const { createBill, fetchAllBills, viewBill, deleteBill } = billController;

const router = Router();

router.post(
  "/",
  authenticate,
  authorize(["admin"]),
  ...createBillValidators,
  createBill
);

router.get("/view-all", authenticate,   authorize(["admin"]), fetchAllBills);

router.get(
  "/:billId",
  authenticate,
  // authorize(["admin"]),
  ...billIdValidator,
  viewBill
);

router.delete(
  "/:billId",
  authenticate,
  authorize(["admin"]),
  ...billIdValidator,
  deleteBill
);

export default router;
