import axios from 'axios';

class PaymentService {
  private flutterwaveBaseUrl = 'https://api.flutterwave.com/v3';
  private flutterwaveSecretKey = process.env.FLUTTERWAVE_SECRET_KEY;

  async processPayment(
    userId: string,
    cardToken: string,
    amount: number,
    courseId: string
  ) {
    const paymentPayload = {
      tx_ref: `TX-${Date.now()}`,
      amount,
      currency: "USD",
      redirect_url: "https://your-frontend-url.com/payment-redirect",
      payment_type: "card",
      card: {
        token: cardToken,
      },
      customer: {
        id: userId,
      },
    };

    try {
      const response = await axios.post(
        "https://api.flutterwave.com/v3/payments",
        paymentPayload,
        {
          headers: {
            Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      throw new Error("Payment processing failed");
    }
  }

  async verifyPayment(paymentId: string) {
    try {
      const response = await axios.get(
        `https://api.flutterwave.com/v3/transactions/${paymentId}/verify`,
        {
          headers: {
            Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      throw new Error("Payment verification failed");
    }
  }

  async chargeCard(data: any) {
    const url = `${this.flutterwaveBaseUrl}/charges?type=card`;
    const config = {
      headers: {
        Authorization: `Bearer ${this.flutterwaveSecretKey}`,
      },
    };
    const response = await axios.post(url, data, config);
    return response.data;
  }

  async saveCard(data: any) {
    const url = `${this.flutterwaveBaseUrl}/tokens`;
    const config = {
      headers: {
        Authorization: `Bearer ${this.flutterwaveSecretKey}`,
      },
    };
    const response = await axios.post(url, data, config);
    return response.data;
  }

  async deleteCard(cardToken: string) {
    const url = `${this.flutterwaveBaseUrl}/tokens/${cardToken}`;
    const config = {
      headers: {
        Authorization: `Bearer ${this.flutterwaveSecretKey}`,
      },
    };
    const response = await axios.delete(url, config);
    return response.data;
  }
}

export default new PaymentService();



  

