import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";

import billController from "../controllers/bill.controller";

const{
  createBill,
  fetchAllBills,
  viewBill, 
  deleteBill
} = billController;

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("admin"),
  createBill
)

router.get(
  "/view-all",
  authenticate, 
  authorize('admin'),
  fetchAllBills
)

router.get(
  "/:billId",
  authenticate,
  authorize('admin'),
  viewBill
)

router.delete(
  "/:billId",
  authenticate,
  authorize("admin"),
  deleteBill
)

export default router;