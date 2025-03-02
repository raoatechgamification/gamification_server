import * as Mailjet from "node-mailjet";

class MailjetService {
  private mailjet: Mailjet.Client;
  private senderName: string;

  constructor() {
    // Fetch Mailjet API credentials and sender name from environment variables
    const apiKey = process.env.MAILJET_API_KEY!;
    const secretKey = process.env.MAILJET_SECRET_KEY!;
    this.senderName = process.env.EMAIL_USER!;

    if (!apiKey || !secretKey || !this.senderName) {
      throw new Error(
        "Mailjet configuration is incomplete in environment variables."
      );
    }

    this.mailjet = new Mailjet.Client({ apiKey, apiSecret: secretKey });
  }

  async sendEmail(
    senderEmail: string,
    recipientEmail: string,
    recipientName: string,
    subject: string,
    htmlContent: string,
    plainTextContent?: string
  ): Promise<void> {
    // console.log(recipientEmail, recipientName, subject, plainTextContent);
    try {
      const request = this.mailjet.post("send", { version: "v3.1" }).request({
        Messages: [
          {
            From: {
              Email: senderEmail,
              Name: this.senderName,
            },
            To: [
              {
                Email: recipientEmail,
                Name: recipientName,
              },
            ],
            Subject: subject,
            TextPart: plainTextContent,
            HTMLPart: htmlContent,
          },
        ],
      });

      const response = await request;
      console.log("Email sent successfully:", response);
    } catch (error) {
      console.error("Failed to send email:", error);
      throw new Error("Email sending failed");
    }
  }
}

export default MailjetService;
