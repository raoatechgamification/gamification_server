import PDFDocument from "pdfkit";
import axios from "axios";
import fs from "fs"; // To load local files

export const generateCertificatePDF = async (certificateData: any): Promise<Buffer> => {
  const doc = new PDFDocument({ size: 'A4', margin: 0 }); // Adjust margin to ensure alignment with template
  const chunks: any[] = [];

  // Preload the logo and signature if provided
  let logoBuffer: Buffer | undefined;
  let signatureBuffer: Buffer | undefined;

  if (certificateData.organizationLogo) {
    try {
      const response = await axios.get(certificateData.organizationLogo, {
        responseType: 'arraybuffer',
      });
      logoBuffer = Buffer.from(response.data, 'binary');
    } catch (error: any) {
      console.error('Error fetching organization logo:', error.message);
    }
  }

  if (certificateData.authorizedSignature) {
    try {
      const response = await axios.get(certificateData.authorizedSignature, {
        responseType: 'arraybuffer',
      });
      signatureBuffer = Buffer.from(response.data, 'binary');
    } catch (error: any) {
      console.error('Error fetching authorized signature:', error.message);
    }
  }

  // Load the chosen certificate template as a background image
  const templatePath = 'certificate-template.png'; // Replace with the correct file path for the purple-modified template
  const templateBuffer = fs.readFileSync(templatePath);

  // Create and return the PDF in a Promise
  return new Promise((resolve, reject) => {
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', (error) => reject(error));

    // Colors
    const purple = '#572E7F';

    // Add the template as the background
    doc.image(templateBuffer, 0, 0, { width: doc.page.width, height: doc.page.height });

    // Add organization logo
    if (logoBuffer) {
      doc.image(logoBuffer, 60, 60, { width: 100 });
    }

    // Organization Name
    doc.fontSize(20).fillColor(purple).text(certificateData.organizationName, 200, 70, { align: 'center' });

    // Certificate Title
    doc.fontSize(28).fillColor(purple).text(certificateData.certificateTitle, 0, 180, {
      align: 'center',
      underline: true,
    });

    // Recipient Name
    doc.fontSize(18).fillColor(purple).text(certificateData.recipientName, 0, 240, {
      align: 'center',
      underline: true,
    });

    // Course Name and Date
    doc.fontSize(14).fillColor('black').text(certificateData.courseName, 0, 280, { align: 'center' });
    doc.text(`Awarded On: ${certificateData.awardedOn}`, 0, 320, { align: 'center' });

    // Authorized Signature
    if (signatureBuffer) {
      doc.image(signatureBuffer, 150, 400, { width: 100 });
    }

    doc.fontSize(12).fillColor('black').text(`Authorized By: ${certificateData.authorizedHeadName}`, 0, 520, {
      align: 'center',
    });

    doc.end(); // End the PDF stream
  });
};




// import PDFDocument from "pdfkit";
// import axios from "axios";


// export const generateCertificatePDF = async (certificateData: any): Promise<Buffer> => {
//   const doc = new PDFDocument({ size: 'A4', margin: 50 });
//   const chunks: any[] = [];

//   // Preload the logo and signature if provided
//   let logoBuffer: Buffer | undefined;
//   let signatureBuffer: Buffer | undefined;

//   if (certificateData.organizationLogo) {
//     try {
//       const response = await axios.get(certificateData.organizationLogo, {
//         responseType: 'arraybuffer',
//       });
//       logoBuffer = Buffer.from(response.data, 'binary');
//     } catch (error: any) {
//       console.error('Error fetching organization logo:', error.message);
//     }
//   }

//   if (certificateData.authorizedSignature) {
//     try {
//       const response = await axios.get(certificateData.authorizedSignature, {
//         responseType: 'arraybuffer',
//       });
//       signatureBuffer = Buffer.from(response.data, 'binary');
//     } catch (error: any) {
//       console.error('Error fetching authorized signature:', error.message);
//     }
//   }

//   // Create and return the PDF in a Promise
//   return new Promise((resolve, reject) => {
//     doc.on('data', (chunk) => chunks.push(chunk));
//     doc.on('end', () => resolve(Buffer.concat(chunks)));
//     doc.on('error', (error) => reject(error));

//     // Colors
//     const purple = '#572E7F';
//     const gold = '#EAAB40';

//     // Add organization logo
//     if (logoBuffer) {
//       doc.image(logoBuffer, 50, 50, { width: 100 });
//     }

//     // Organization Name
//     doc.fontSize(20).fillColor(purple).text(certificateData.organizationName, 200, 50, { align: 'center' });

//     // Certificate Title
//     doc.moveDown(2).fontSize(28).fillColor(gold).text(certificateData.certificateTitle, {
//       align: 'center',
//       underline: true,
//     });

//     // Body: Contents and Recipient Name
//     doc.moveDown(2).fontSize(14).fillColor('black');
//     doc.text(certificateData.contentsBeforeRecipient, { align: 'center' });
//     doc.moveDown(1).fontSize(18).fillColor(purple).text(certificateData.recipientName, {
//       align: 'center',
//       underline: true,
//     });
//     doc.moveDown(1).fontSize(14).fillColor('black').text(certificateData.contentsAfterRecipient, { align: 'center' });

//     // Footer: Dates and Authorization
//     doc.moveDown(2);
//     doc.text(`Awarded On: ${certificateData.awardedOn}`, { align: 'left' });
//     doc.text(`Date Issued: ${certificateData.dateIssued}`, { align: 'left' });
//     doc.text(`Expiry Date: ${certificateData.expiryDate}`, { align: 'left' });

//     if (signatureBuffer) {
//       doc.image(signatureBuffer, 50, 550, { width: 100 });
//     }

//     doc.text(`Authorized By: ${certificateData.authorizedHeadName}`, 200, 550, { align: 'left' });

//     doc.end(); // End the PDF stream
//   });
// };
