import { Request, Response, NextFunction } from "express";
import { ResponseHandler } from "../middlewares/responseHandler.middleware";
import Certificate from "../models/certificate.model";
import Course from "../models/course.model";
import { generateCertificatePDF } from "../services/certificate.service";
import { uploadToCloudinary } from "../utils/cloudinaryUpload";

class CertificateController {
  async generateCertificate(req: Request, res: Response) {
    try {
        const {
            certificateTitle,
            recipientName,
            awardedOn,
            expiryDate,
            authorizedSignature1Name,
            authorizedSignature1Title,
            authorizedSignature2Name,
            authorizedSignature2Title
        } = req.body;
        const files = req.files as Express.Multer.File[];
       
        const organizationId = req.admin._id;

        // Check for file uploads and ensure they are processed
        let Urls: string[] = [];

      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const uploadResult = await uploadToCloudinary(
            file.buffer,
            file.mimetype,
            "course-content"
          );
          if (uploadResult && uploadResult.secure_url) {
            Urls.push(uploadResult.secure_url);
          }
        }
      }
        const newCertificate = new Certificate({
            organizationId,
            certificateTitle,
            recipientName,
            awardedOn,
            expiryDate,
            authorizedSignature1: Urls[0],
            authorizedSignature1Name,
            authorizedSignature1Title,
            authorizedSignature2: Urls[1],
            authorizedSignature2Name,
            authorizedSignature2Title
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

      const certificate = await Certificate.findOne({ _id: id });

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

      const course = await Course.findById( certificate.courseId )

      const certificateVariables = {
        traineeName: certificate.recipientName,
        date: certificate.dateIssued,
        organization: certificate.organizationName,
        course: course?.title
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