import Razorpay from 'razorpay';

let razorpayClient = null;

export const getRazorpayClient = () => {
  if (razorpayClient) {
    return razorpayClient;
  }

  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    return null;
  }

  razorpayClient = new Razorpay({ key_id, key_secret });
  return razorpayClient;
};