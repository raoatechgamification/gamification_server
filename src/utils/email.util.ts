import * as postmark from "postmark";
import fs from "fs";
import path from "path";
import { emailTransport } from "../config/email.config";

export interface VariablesInterface {
  firstName: string;
  email: string;
  password: string;
  subject: string;
  organizationName: string;
}

const postmarkClient = new postmark.ServerClient(
  process.env.POSTMARK_API_TOKEN!
);

function getEmailTemplate(templateName: string, variables: VariablesInterface) {
  const templatePath = path.join(__dirname, "../templates", templateName);
  let template = fs.readFileSync(templatePath, "utf-8");

  return Object.entries(variables).reduce((acc, [key, value]) => {
    const placeholder = new RegExp(`{{${key}}}`, "g");
    return acc.replace(placeholder, value);
  }, template);
}

export async function sendEmail(templateName: string, variables: VariablesInterface) {
  if (!process.env.POSTMARK_API_TOKEN) {
    throw new Error("Postmark API token is missing");
  }

  const emailTemplate = getEmailTemplate(templateName, variables);

  await postmarkClient.sendEmail({
    From: `Gamai Support <${process.env.EMAIL_USER}>`,
    To: variables.email,
    Subject: variables.subject,
    HtmlBody: emailTemplate,
  });
}

export async function sendEmaill(
  templateName: string,
  variables: VariablesInterface
) {
  const emailTemplate = getEmailTemplate(templateName, variables);

  const mailOptions = {
    from: `Gamai Support <${process.env.EMAIL_USER}>`,
    to: variables.email,
    subject: variables.subject,
    html: emailTemplate,
  };
  try {
    await emailTransport.sendMail(mailOptions);
  } catch (error: any) {
    console.log(error.message, error);
    throw error;
  }
}
