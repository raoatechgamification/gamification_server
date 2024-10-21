import mongoose from "mongoose";
import axios from 'axios';

interface PaymentData {
  userId: string,
  billId: string,
  email: string,
  amount: number,
}

class PaymentService {
  private flutterwaveBaseUrl = 'https://api.flutterwave.com/v3';
  private flutterwaveSecretKey = process.env.FLUTTERWAVE_SECRET_KEY;

  async processPayment( data: PaymentData ) {
    const paymentPayload = {
      tx_ref: `TX-${Date.now()}`,
      amount: `${data.amount}`,
      currency: "NGN",
      redirect_url: "https://www.google.com",
      customer: {
        id: data.userId,
        email: data.email,
      },
      customizations: {
        title: "Gamification Due Bill Payment"
      }
    };

    try {
      const response = await axios.post( 
        `${this.flutterwaveBaseUrl}/payments`,
        paymentPayload,
        {
          headers: {
            Authorization: `Bearer ${this.flutterwaveSecretKey}`,
            "Content-Type": "application/json"
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
    } catch (error) {
      throw new Error("Payment verification failed");
    }
  }
}

export default new PaymentService();



  

