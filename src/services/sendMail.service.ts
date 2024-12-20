import { VariablesInterface, OrganizationOnboardingVariablesInterface, sendEmail } from "../utils/email.util"

export async function sendLoginEmail (mailPayload: VariablesInterface) {
  try {
    await sendEmail(
      "loginEmail.html", 
      mailPayload
    )
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function sendOrganizationOnboardingMail (mailPayload: OrganizationOnboardingVariablesInterface) {
  try {
    await sendEmail(
      "organizationLogin.html", 
      mailPayload
    )
  } catch (error) {
    console.log(error)
    throw error
  }
}