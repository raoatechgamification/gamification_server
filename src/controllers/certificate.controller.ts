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
          organisationName,
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
            organisationName,
            certificateTitle,
            recipientName,
            awardedOn,
            expiryDate,
            authorizedSignature1: Urls[0],
            authorizedSignature1Name,
            authorizedSignature1Title,
            authorizedSignature2: Urls[1],
            authorizedSignature2Name,
            authorizedSignature2Title,
            logo1: Urls[2],
            logo2: Urls[3],
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

  async editCertificate(req: Request, res: Response) {
    try {
        const {
          
            certificateTitle,
            recipientName,
            awardedOn,
            expiryDate,
            // authorizedSignature1,
            // authorizedSignature2,
            authorizedSignature1Name,
            authorizedSignature1Title,
            authorizedSignature2Name,
            authorizedSignature2Title,
            // logo1,
            // logo2,
        } = req.body;


      
        const id = req.params.id
        const files = req.files as Express.Multer.File[];
        const certificate = await Certificate.findById(id);

        if (!certificate) {
            return ResponseHandler.failure(res, "Certificate not found", 404);
        }

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
 

        certificate.certificateTitle = certificateTitle || certificate.certificateTitle;
        certificate.recipientName = recipientName || certificate.recipientName;
        certificate.awardedOn = awardedOn || certificate.awardedOn;
        certificate.expiryDate = expiryDate || certificate.expiryDate;
        certificate.authorizedSignature1 = Urls[0];
        certificate.authorizedSignature1Name = authorizedSignature1Name || certificate.authorizedSignature1Name;
        certificate.authorizedSignature1Title = authorizedSignature1Title || certificate.authorizedSignature1Title;
        certificate.authorizedSignature2 =  Urls[1] ;
        certificate.logo1 =  Urls[2];
        certificate.logo2 =  Urls[3];
        certificate.authorizedSignature2Name = authorizedSignature2Name || certificate.authorizedSignature2Name;
        certificate.authorizedSignature2Title = authorizedSignature2Title || certificate.authorizedSignature2Title;

        const updatedCertificate = await certificate.save();

        return ResponseHandler.success(
            res,
            updatedCertificate,
            "Certificate updated successfully",
            200
        );
    } catch (error:any) {
        return ResponseHandler.failure(
            res,
            `Error updating certificate: ${error.message}`,
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
      const organizationId = req.admin._id;
       const certificates = await Certificate.find({organizationId: organizationId});
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
