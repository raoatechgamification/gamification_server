import {
  VariablesInterface,
  OrganizationOnboardingVariablesInterface,
  sendEmail,
} from "../utils/email.util";

export async function sendLoginEmail(mailPayload: VariablesInterface) {
  try {
    await sendEmail({
      service: process.env.EMAIL_SERVICE!,
      templateName: "loginEmail.html",
      variables: mailPayload,
    });
    console.log("The handler got here")
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
