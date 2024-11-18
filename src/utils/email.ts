// import { config } from "dotenv";
import { ObjectId } from "mongoose";
import * as postmark from "postmark";

// config();

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
    organizationName: string;
  }



  const postmarkClient = new postmark.ServerClient(
    process.env.POSTMARK_API_TOKEN!
  );

export const verifyEmailTemplate = (emailVariables: VariablesInterface) => {

  return postmarkClient.sendEmail({
    From: "finkia@raoatech.com",
    To: `${emailVariables.email}`,
    Subject: "We are thrilled to have you",
    HtmlBody: `<html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Document</title>
      <style>
        @import url("https://fonts.googleapis.com/css2?family=Bai+Jamjuree:wght@600;700&display=swap");
        @import url("https://fonts.googleapis.com/css2?family=Nunito+Sans:opsz,wght@6..12,400;6..12,600&display=swap");
        table,
        td,
        div,
        body {
        font-family: "Roboto", Arial, sans-serif;
        background-color: #f4f4f9;
        margin: 0;
        padding: 0;
        font-size: 14px; /* Reduced font size */
      }
      .email-container {
        width: 100%;
        max-width: 600px;
        background-color: #ffffff;
        overflow: hidden;
        margin: 20px auto;
        padding: 20px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      }
      .header {
        text-align: center;
        margin-bottom: 20px;
      }
      .header img {
        max-width: 600px;
        height: auto;
      }
      .border-container {
        border: 1px solid #e5e3e3;
        border-radius: 16px;
      }
      .content {
        color: #333333;
        margin-bottom: 20px;
        padding: 0 20px;
      }
      .content h1 {
        font-size: 16px; /* Reduced font size */
        color: #161F33;
        margin-bottom: 10px;
      }
      .content p {
        font-size: 14px; /* Reduced font size */
        line-height: 1.6;
      }
      .highlight-box {
        background-color: #572E7F;
        color: #ffffff;
        padding: 20px;
        border-radius: 8px;
        text-align: left;
        margin: 0 20px 20px; /* Aligns with content section */
      }
      .highlight-box p {
        margin: 0 0 10px;
        font-size: 13px; /* Slightly smaller font size */
      }
      .highlight-box a {
        color: #2b80d5; /* Standard blue link color */
        text-decoration: none;
      }
      .social-icons {
        text-align: left; /* Left-justified social icons */
        margin-top: 15px;
      }
      .social-icons img {
        width: 24px;
        height: 24px;
        margin: 0 5px 0 0;
        vertical-align: middle;
      }
      .footer-text {
        font-size: 12px;
        color: #ffffff;
        text-align: left;
        margin-top: 15px;
        line-height: 1.5;
      }
      .footer-text a {
        color: #2b80d5; /* Standard blue link color */
        /* text-decoration: underline; */
      }
      </style>
    </head>
    <body>
    <div class="email-container">
      <!-- Header with Logo -->
      <div class="header">
        <img
          src="https://res.cloudinary.com/dldchwdkn/image/upload/v1730464458/gamai-logo_gzmck8.png"
          alt="RAOATECH IT-ELECTROMECH LIMITED Logo"
        />
      </div>

      <div class="border-container">
        <!-- Main Content -->
        <div class="content">
          <h1>Welcome!</h1>
          <p>Dear {{firstName}},</p>
          <p>
            Congratulations! You have been on-boarded successfully by
            ${emailVariables.organizationName} on Gamai.
          </p>
          <p>Your details are given below:</p>
          <br/>
          <p>Username: {{email}}</p>
          <p>Password (temporary): {{password}}</p>
        </div>

        <!-- Purple Box with Thank You Message and Footer Links -->
        <div class="highlight-box">
          <p>Thank you,</p>
          <p>Gamai Team</p>
          <p>1A, Hughes Avenue, Sabo, Yaba, Lagos State.</p>

          <div class="social-icons">
            <a href="https://www.google.com"
              ><img
                src="https://res.cloudinary.com/dldchwdkn/image/upload/v1731890144/x_mrq9z8.png"
                alt="Twitter"
            /></a>
            <a href="https://www.google.com"
              ><img
                src="https://res.cloudinary.com/dldchwdkn/image/upload/v1731890064/facebook_biquuh.png"
                alt="Facebook"
            /></a>
            <a href="https://www.google.com"
              ><img
                src="https://res.cloudinary.com/dldchwdkn/image/upload/v1731890210/linkedin_lbrumy.png"
                alt="LinkedIn"
            /></a>
          </div>

          <div class="footer-text">
            <p>
              This email was sent to
              <a href="mailto:olanrewaju@gmail.com">olanrewaju@gmail.com</a>. If
              you’d rather not receive this kind of email, you can
              <a href="#">unsubscribe or manage your email preferences</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  </body>
  </html>
  
            `,
  });
};