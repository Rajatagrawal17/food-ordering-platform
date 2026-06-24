import mongoose from 'mongoose';

const paymentTransactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    cart: { type: mongoose.Schema.Types.Mixed, required: true },
    address: { type: mongoose.Schema.Types.Mixed, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true, default: 'INR' },
    razorpayOrderId: { type: String, required: true, unique: true, index: true },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    status: { type: String, enum: ['initiated', 'successful', 'failed'], default: 'initiated', index: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    couponCode: { type: String },
    discount: { type: Number },
    failureReason: { type: String },
  },
  { timestamps: true }
);

export const PaymentTransaction = mongoose.model('PaymentTransaction', paymentTransactionSchema);