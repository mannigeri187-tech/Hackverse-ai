import express, { Request, Response } from 'express';
import { authenticateToken } from '../security';
import { createSubscription } from '../services/subscriptionService';

const router = express.Router();

router.post('/create-subscription', authenticateToken, async (req: Request, res: Response) => {
  try {
    // req.user is added by authenticateToken middleware
    const user = (req as any).user;
    if (!user || !user.userId) {
      return res.status(401).json({ success: false, error: 'UNAUTHENTICATED', message: 'User not authenticated' });
    }
    const result = await createSubscription(user.userId);
    const sub = result.subscription;
    return res.json({
      success: true,
      subscription: {
        id: sub.id,
        razorpay_subscription_id: sub.razorpay_subscription_id,
        razorpay_plan_id: sub.razorpay_plan_id,
        status: sub.status,
      },
      razorpay_key_id: result.razorpayKeyId,
    });
  } catch (err: any) {
    const status = err.status || 500;
    const message = err.message || 'Internal server error';
    return res.status(status).json({ success: false, error: message, details: err.details });
  }
});

export default router;
