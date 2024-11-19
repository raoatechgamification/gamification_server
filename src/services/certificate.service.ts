import PDFDocument from "pdfkit";


export const generateCertificatePDF = (certificateData: any): Buffer => {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const chunks: any[] = [];

  doc.on('data', (chunk) => chunks.push(chunk));
  doc.on('end', () => Buffer.concat(chunks));

  // Colors
  const purple = '#572E7F';
  const gold = '#FFD700';

  // Header: Organization Logo and Name
  if (certificateData.organizationLogo) {
    doc.image(certificateData.organizationLogo, 50, 50, { width: 100 });
  }
  doc.fontSize(20).fillColor(purple).text(certificateData.organizationName, 200, 50, { align: 'center' });

  // Certificate Title
  doc.fontSize(28).fillColor(gold).text(certificateData.certificateTitle, { align: 'center', underline: true });

  // Body: Contents and Recipient Name
  doc.moveDown(2).fontSize(14).fillColor('black');
  doc.text(certificateData.contentsBeforeRecipient, { align: 'center' });
  doc.moveDown(1).fontSize(18).fillColor(purple).text(certificateData.recipientName, { align: 'center', underline: true });
  doc.moveDown(1).fontSize(14).fillColor('black').text(certificateData.contentsAfterRecipient, { align: 'center' });

  // Footer: Dates and Authorization
  doc.moveDown(2);
  doc.text(`Awarded On: ${certificateData.awardedOn}`, { align: 'left' });
  doc.text(`Date Issued: ${certificateData.dateIssued}`, { align: 'left' });
  doc.text(`Expiry Date: ${certificateData.expiryDate}`, { align: 'left' });

  if (certificateData.authorizedSignature) {
    doc.image(certificateData.authorizedSignature, 50, 550, { width: 100 });
  }
  doc.text(`Authorized By: ${certificateData.authorizedHeadName}`, 200, 550, { align: 'left' });

  doc.end();
  return Buffer.concat(chunks);
};


// export const generateCertificatePDF = (certificateData: any): Buffer => {
//   const doc = new PDFDocument();
//   const chunks: any[] = [];

//   doc.on('data', (chunk) => chunks.push(chunk));
//   doc.on('end', () => Buffer.concat(chunks));

//   // Add organization logo
//   if (certificateData.organizationLogo) {
//     doc.image(certificateData.organizationLogo, 50, 50, { width: 100 });
//   }

//   // Add certificate title
//   doc.fontSize(24).text(certificateData.certificateTitle, { align: 'center' });

//   // Add contents before and after recipient's name
//   doc.moveDown().fontSize(14).text(certificateData.contentsBeforeRecipient, { align: 'center' });
//   doc.fontSize(18).text(certificateData.recipientName, { align: 'center', underline: true });
//   doc.fontSize(14).text(certificateData.contentsAfterRecipient, { align: 'center' });

//   // Add dates
//   doc.moveDown();
//   doc.text(`Awarded On: ${certificateData.awardedOn}`, { align: 'left' });
//   doc.text(`Date Issued: ${certificateData.dateIssued}`, { align: 'left' });
//   doc.text(`Expiry Date: ${certificateData.expiryDate}`, { align: 'left' });

//   // Add authorized signature
//   if (certificateData.authorizedSignature) {
//     doc.image(certificateData.authorizedSignature, 50, 300, { width: 100 });
//   }
//   doc.text(`Authorized By: ${certificateData.authorizedHeadName}`, { align: 'left' });

//   doc.end();

//   return Buffer.concat(chunks);
// };
