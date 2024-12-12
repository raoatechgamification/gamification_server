import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";

import CertificateController from "../controllers/certificate.controller";
import { upload } from "../utils/upload.utils";

const { 
  generateCertificate, 
  getCertificateById, 
  downloadCertificate,
  getAllCertificates,
  editCertificate
} = CertificateController;


const router = Router();

router.post(
  "/",
  authenticate,
  authorize("admin"),
  upload.array("file", 10),
  generateCertificate
)

router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  upload.array("file", 10),
  editCertificate
)

router.get(
  "/:id",
  authenticate,
  getCertificateById
)

router.get(
  "/:id/download",
  // authenticate,
  downloadCertificate
)

router.get(
  "/",
  authenticate,
  authorize("admin"),
  getAllCertificates
)


export default router;