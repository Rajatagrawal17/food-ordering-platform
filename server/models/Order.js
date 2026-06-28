import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    food: { type: mongoose.Schema.Types.ObjectId, ref: 'Food', required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: [orderItemSchema],
    amount: { type: Number, required: true, min: 0 },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending', index: true },
    orderStatus: { type: String, enum: ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'], default: 'placed', index: true },
    paymentMethod: { type: String, enum: ['razorpay', 'dummy_upi'], default: 'razorpay' },
    paymentTransaction: { type: mongoose.Schema.Types.ObjectId, ref: 'PaymentTransaction' },
    estimatedDeliveryTime: { type: Date },
    address: {
      label: { type: String, trim: true },
      street: { type: String, trim: true, required: true },
      city: { type: String, trim: true, required: true },
      state: { type: String, trim: true, required: true },
      postalCode: { type: String, trim: true, required: true },
      country: { type: String, trim: true, default: 'India' },
    },
    trackingEvents: [
      {
        status: { type: String, required: true },
        note: { type: String, trim: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1, paymentStatus: 1, createdAt: -1 });

export const Order = mongoose.model('Order', orderSchema);