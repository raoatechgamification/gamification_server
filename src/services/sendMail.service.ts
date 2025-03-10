import {
  BookingVariablesInterface,
  forgotPasswordInterface,
  OrganizationOnboardingVariablesInterface,
  sendEmail,
  VariablesInterface,
} from "../utils/email.util";

import axios from "axios";
export async function sendLoginEmail(mailPayload: VariablesInterface) {
  try {
    await sendEmail({
      service: process.env.EMAIL_SERVICE!,
      templateName: "loginEmail.html",
      variables: mailPayload,
    });
    console.log("The handler got here");
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function sendOrganizationOnboardingMail(
  mailPayload: OrganizationOnboardingVariablesInterface
) {
  try {
    await sendEmail({
      service: process.env.EMAIL_SERVICE!,
      templateName: "organizationLogin.html",
      variables: mailPayload,
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function sendSubadminMail(
  mailPayload: OrganizationOnboardingVariablesInterface
) {
  try {
    await sendEmail({
      service: process.env.EMAIL_SERVICE!,
      templateName: "subAdminMail.html",
      variables: mailPayload,
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function sendBookingNotification(
  mailPayload: BookingVariablesInterface
) {
  try {
    await sendEmail({
      service: process.env.EMAIL_SERVICE!,
      templateName: "bookingNotification.html",
      variables: mailPayload,
    });
    console.log("The handler got here");
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function sendPasswordResetEmail(
  mailPayload: forgotPasswordInterface
) {
  try {
    await sendEmail({
      service: process.env.EMAIL_SERVICE!,
      templateName: "resetPasswordMail.html",
      variables: mailPayload,
    });
    console.log("The handler got here");
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function sendMessage(data: any) {
  return axios.post(
    `https://graph.facebook.com/${process.env.VERSION}/${process.env.PHONE_NUMBER_ID}/messages`,
    data,
    {
      headers: {
        Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );
}

export function getTextMessageInput(
  recipient: string | undefined,
  text: string
) {
  if (!recipient) {
    throw new Error("Recipient is undefined or empty");
  }

  return JSON.stringify({
    // Ensure it's a JSON object
    messaging_product: "whatsapp",
    preview_url: false,
    recipient_type: "individual",
    to: recipient,
    type: "text",
    text: {
      body: text,
    },
  });
}
