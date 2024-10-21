import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { UserController } from "../controllers/user.controller";
import { editUserProfileValidator } from "../validators/user.auth.validator";

const { 
  editProfile, 
  billHistory, 
  dueBills,  
  viewBill, 
} = new UserController();

const router = Router();

router.put(
  "/profile/edit",
  authenticate,
  authorize("user"),
  ...editUserProfileValidator,
  editProfile
);

router.get(
  "/bill-history", 
  authenticate, 
  authorize("user"),
  billHistory
);

router.get(
  "/due-bills",
  authenticate, 
  authorize("user"),
  dueBills
)

router.get(
  "/view-bill/:paymentId", 
  authenticate,
  authorize("user"),
  viewBill
)

export default router;
