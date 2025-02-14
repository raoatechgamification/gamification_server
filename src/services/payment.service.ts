import axios from "axios";

interface PaymentData {
  reference: string;
  userId: string;
  billId: string;
  email: string;
  amount: number;
}

class PaymentService {
  private flutterwaveBaseUrl = "https://api.flutterwave.com/v3";
  private flutterwaveSecretKey = process.env.FLUTTERWAVE_SECRET_KEY;

  async processPayment(data: PaymentData) {
    console.log(data)
    const paymentPayload = {
      tx_ref: data.reference,
      amount: `${data.amount}`,
      currency: "NGN",
      redirect_url:
        `${process.env.FRONTEND_URL}/user/courses/course-details/verify-payment?reference=${data.reference}&courseId=` +
        data.billId,
      customer: {
        id: data.userId,
        email: data.email,
      },
      customizations: {
        billId: data.billId,
        title: "Gamification Due Bill Payment",
      },
    };

    try {
      const response = await axios.post(
        `${this.flutterwaveBaseUrl}/payments`,
        paymentPayload,
        {
          headers: {
            Authorization: `Bearer ${this.flutterwaveSecretKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error(error.response?.data || error.message);
      throw new Error("Payment processing failed");
    }
  }

  async verifyPayment(paymentId: string) {
    try {
      const response = await axios.get(
        `${this.flutterwaveBaseUrl}/transactions/${paymentId}/verify`,
        {
          headers: {
            Authorization: `Bearer ${this.flutterwaveSecretKey}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error("Error details:", error.response?.data || error.message);
      throw new Error("Payment verification failed");
    }
  }
}

export default new PaymentService();
