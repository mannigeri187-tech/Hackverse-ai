import Razorpay from 'razorpay';

let client: Razorpay | null = null;

export function getRazorpayClient(): Razorpay {
  if (client) return client;
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw { status: 500, message: 'Razorpay credentials missing' } as any;
  }
  client = new Razorpay({ key_id: keyId, key_secret: keySecret });
  return client;
}
