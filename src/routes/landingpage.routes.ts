import express from "express";
import { LandingPageController } from "../controllers/landingpage.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { upload } from "../utils/upload.utils";

const router = express.Router();
const {
  CreateLandingPage,
  GetLandingPageById,
  GetAllLandingPages,
  GetAllTotalLandingPages,
  GetAllRaoatechLandingPages,
  DeleteLandingPage,
  updateLandingPageDetails,
  UpdateLandingPageWithCourse,
} = new LandingPageController();

router.post(
  "/",
  authenticate,
  authorize(["admin", "subAdmin"]),
  upload.array("file", 3),
  CreateLandingPage
);

router.get("/", authenticate, authorize(["admin", "subAdmin"]), GetAllLandingPages);
router.get("/raoatech", GetAllRaoatechLandingPages);
router.get(
  "/all-landing-page",
  authenticate,
  authorize(["user"]),
  GetAllTotalLandingPages
);
router.get("/:id", authenticate, authorize(["admin"]), GetLandingPageById);
router.patch(
  "/:id",
  authenticate,
  authorize(["admin"]),
  upload.array("file", 1),
  updateLandingPageDetails
);
router.put(
  "/create-new-course-landing/:id",
  authenticate,
  authorize(["admin"]),
  upload.array("file", 2),
  UpdateLandingPageWithCourse
);
router.delete("/:id", authenticate, authorize(["admin"]), DeleteLandingPage);

export default router;
