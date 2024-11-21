import { Request, Response, NextFunction } from "express";
import { ResponseHandler } from "../middlewares/responseHandler.middleware";
import Certificate from "../models/certificate.model";
import { generateCertificatePDF } from "../services/certificate.service";

class CertificateController {
  async generateCertificate(req: Request, res: Response) {
    try {
      const {
        organizationLogo,
        organizationName,
        certificateTitle,
        contentsBeforeRecipient,
        contentsAfterRecipient,
        recipientName,
        awardedOn,
        expiryDate,
        authorizedHeadName,
        authorizedSignature,
      } = req.body;

      const organizationId = req.admin._id;

      const newCertificate = new Certificate({
        organizationId,
        organizationLogo,
        organizationName,
        certificateTitle,
        contentsBeforeRecipient,
        contentsAfterRecipient,
        recipientName,
        awardedOn,
        expiryDate,
        authorizedHeadName,
        authorizedSignature,
      });

      const savedCertificate = await newCertificate.save();

      return ResponseHandler.success(
        res,
        savedCertificate,
        "Certificate generated successfully",
        201
      );
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        `Error generating certificate: ${error.message}`,
        500
      );
    }
  }

  async getCertificateById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const certificate = await Certificate.findOne({ certificateId: id });

      if (!certificate) {
        return ResponseHandler.failure(res, "Certificate not found", 404);
      }

      return ResponseHandler.success(res, certificate);
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        `Error retrieving certificate: ${error.message}`,
        500
      );
    }
  }

  async getAllCertificates(req: Request, res: Response) {
    try {
      const certificates = await Certificate.find({});
      return ResponseHandler.success(res, certificates);
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        `Error retrieving all certificates: ${error.message}`,
        500
      );
    }
  }

  async downloadCertificate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const certificate = await Certificate.findOne({ certificateId: id });

      console.log("Certificate data:", certificate);

      if (!certificate) {
        return ResponseHandler.failure(res, "Certificate not found", 404);
      }

      const pdfBuffer = await generateCertificatePDF(certificate);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${certificate.certificateId}.pdf`
      );
      res.send(pdfBuffer);
    } catch (error: any) {
      console.error("Error generating certificate PDF:", error.message);

      return ResponseHandler.failure(
        res,
        `Error generating certificate PDF: ${error.message}`,
        500
      );
    }
  }
}

export default new CertificateController();
