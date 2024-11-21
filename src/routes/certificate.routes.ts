import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";

import CertificateController from "../controllers/certificate.controller";

const { 
  generateCertificate, 
  getCertificateById, 
  downloadCertificate,
  getAllCertificates 
} = CertificateController;


const router = Router();

router.post(
  "/",
  authenticate,
  authorize("admin"),
  generateCertificate
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