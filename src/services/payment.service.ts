import axios from 'axios';

class PaymentService {
  private flutterwaveBaseUrl = 'https://api.flutterwave.com/v3';
  private flutterwaveSecretKey = process.env.FLUTTERWAVE_SECRET_KEY;

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
