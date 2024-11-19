import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";

import CertificateController from "../controllers/certificate.controller";

const { 
  generateCertificate, 
  getCertificateById, 
  downloadCertificate 
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
  generateCertificate
)

router.get(
  "/:id/download",
  authenticate,
  generateCertificate
)


export default router;