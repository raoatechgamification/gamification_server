import * as postmark from "postmark";
import fs from "fs";
import path from "path";
import { emailTransport } from "../config/email.config";
import MailjetService from "../services/mailjetMail.service";

const mailjetService = new MailjetService();
const postmarkClient = new postmark.ServerClient(
  process.env.POSTMARK_API_TOKEN!
);


export interface VariablesInterface {
  firstName: string;
  email: string;
  password: string;
  subject: string;
  organizationName: string;
}

export interface OrganizationOnboardingVariablesInterface {
  email: string;
  password: string;
  subject: string;
  name: string;
}

function getEmailTemplate(templateName: string, variables: VariablesInterface) {
  // let templatePath;

  // if (process.env.NODE_ENV === "production" || process.env.NODE_ENV === "staging") {
  //   templatePath = path.join(process.cwd(), "dist/templates", templateName);
  // } else {
  //   templatePath = path.join(__dirname, "../templates", templateName);
  // }

  const templatePath = path.join(__dirname, "../templates", templateName);

  if (!fs.existsSync(templatePath)) {
    throw new Error(`Email template not found at ${templatePath}`);
  }

  let template = fs.readFileSync(templatePath, "utf-8");

  return Object.entries(variables).reduce((acc, [key, value]) => {
    const placeholder = new RegExp(`{{${key}}}`, "g");
    return acc.replace(placeholder, value);
  }, template);
}

// export async function sendEmail(templateName: string, variables: any) {
//   if (!process.env.POSTMARK_API_TOKEN) {
//     throw new Error("Postmark API token is missing");
//   }

//   const emailTemplate = getEmailTemplate(templateName, variables);

//   await postmarkClient.sendEmail({
//     From: `Gamai Support <${process.env.EMAIL_USER}>`,
//     To: variables.email,
//     Subject: variables.subject,
//     HtmlBody: emailTemplate,
//   });
// }

// "postmark" | "mailjet" | "nodemailer"

export async function sendEmail({
  service,
  templateName,
  variables,
}: {
  service: string;
  templateName: string;
  variables: any;
}) {
  const emailTemplate = getEmailTemplate(templateName, variables);
  const senderEmail = `Gamai Support <${process.env.EMAIL_USER}>`;

  try {
    if (service === "postmark") {
      await postmarkClient.sendEmail({
        From: senderEmail,
        To: variables.email,
        Subject: variables.subject,
        HtmlBody: emailTemplate,
      });
    } else if (service === "mailjet") {
      await mailjetService.sendEmail(
        process.env.EMAIL_USER!,
        variables.email,
        variables.name,
        variables.subject,
        emailTemplate,
        senderEmail
      );
    } else if (service === "nodemailer") {
      const mailOptions = {
        from: senderEmail,
        to: variables.email,
        subject: variables.subject,
        html: emailTemplate,
      };
      await emailTransport.sendMail(mailOptions);
    }
    console.log(`Email sent successfully via ${service}`);
  } catch (error) {
    console.error(`Failed to send email via ${service}:`, error);
    throw error;
  }
}


// export async function sendEmaiil(templateName: string, variables: any) {
//   try {
//     const emailTemplate = getEmailTemplate(templateName, variables);

//     await mailjetService.sendEmail(
//       process.env.EMAIL_USER,
//       `Gamai Support <${process.env.EMAIL_USER}>`, 
//       variables.email,
//       variables.name,

//     )
//   } catch (error: any) {
//     console.log(error.message, error);
//     throw error;
//   }
// }

// export async function sendEmaill(
//   templateName: string,
//   variables: VariablesInterface
// ) {
//   const emailTemplate = getEmailTemplate(templateName, variables);

//   const mailOptions = {
//     from: `Gamai Support <${process.env.EMAIL_USER}>`,
//     to: variables.email,
//     subject: variables.subject,
//     html: emailTemplate,
//   };
//   try {
//     await emailTransport.sendMail(mailOptions);
//   } catch (error: any) {
//     console.log(error.message, error);
//     throw error;
//   }
// }
