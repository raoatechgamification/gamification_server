import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";


export const generateCertificatePDF = (certificateData: any): Buffer => {
  const doc = new PDFDocument();
  const chunks: any[] = [];

  doc.on('data', (chunk) => chunks.push(chunk));
  doc.on('end', () => Buffer.concat(chunks));

  // Add organization logo
  if (certificateData.organizationLogo) {
    doc.image(certificateData.organizationLogo, 50, 50, { width: 100 });
  }

  // Add certificate title
  doc.fontSize(24).text(certificateData.certificateTitle, { align: 'center' });

  // Add contents before and after recipient's name
  doc.moveDown().fontSize(14).text(certificateData.contentsBeforeRecipient, { align: 'center' });
  doc.fontSize(18).text(certificateData.recipientName, { align: 'center', underline: true });
  doc.fontSize(14).text(certificateData.contentsAfterRecipient, { align: 'center' });

  // Add dates
  doc.moveDown();
  doc.text(`Awarded On: ${certificateData.awardedOn}`, { align: 'left' });
  doc.text(`Date Issued: ${certificateData.dateIssued}`, { align: 'left' });
  doc.text(`Expiry Date: ${certificateData.expiryDate}`, { align: 'left' });

  // Add authorized signature
  if (certificateData.authorizedSignature) {
    doc.image(certificateData.authorizedSignature, 50, 300, { width: 100 });
  }
  doc.text(`Authorized By: ${certificateData.authorizedHeadName}`, { align: 'left' });

  doc.end();

  return Buffer.concat(chunks);
};
