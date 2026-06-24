import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { Button } from '../components/common/Button';
import { TextField } from '../components/forms/TextField';
import { checkoutSchema } from '../validations/orderValidation';
import { useCart } from '../hooks/useCart';
import { paymentService } from '../services/paymentService';
import { couponService } from '../services/couponService';
import { loadScript } from '../utils/loadScript';

const initialState = { street: '', city: '', state: '', postalCode: '', country: 'India' };

export default function CheckoutPage() {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState(null);
  const [couponSuccess, setCouponSuccess] = useState(null);
  const { subtotal, clearCart } = useCart();
  const navigate = useNavigate();

  const handleApplyCoupon = async (event) => {
    event.preventDefault();
    setCouponError(null);
    setCouponSuccess(null);
    if (!couponCode.trim()) return;

    try {
      const result = await couponService.validate({ code: couponCode, amount: subtotal });
      setAppliedCoupon(result.data);
      setCouponSuccess(`Coupon "${result.data.code}" applied! Save ₹${result.data.discount}`);
    } catch (err) {
      setAppliedCoupon(null);
      setCouponError(err.response?.data?.message || 'Invalid coupon code');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = checkoutSchema.safeParse(form);

    if (!result.success) {
      const nextErrors = {};
      result.error.issues.forEach((issue) => {
        nextErrors[issue.path[0]] = issue.message;
      });
      setErrors(nextErrors);
      return;
    }

    try {
      const paymentIntent = await paymentService.createIntent({
        address: form,
        couponCode: appliedCoupon ? appliedCoupon.code : undefined,
      });
      const loaded = await loadScript('https://checkout.razorpay.com/v1/checkout.js');

      if (!loaded || !window.Razorpay) {
        setSubmitError('Payment gateway could not be loaded.');
        return;
      }

      const razorpay = new window.Razorpay({
        key: paymentIntent.keyId,
        amount: paymentIntent.amount * 100,
        currency: paymentIntent.currency,
        name: paymentIntent.name,
        description: paymentIntent.description,
        order_id: paymentIntent.razorpayOrderId,
        handler: async (response) => {
          const order = await paymentService.verify({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });

          await clearCart();
          navigate(`${ROUTES.ORDERS}/${order._id}`, { replace: true });
        },
        modal: {
          ondismiss: async () => {
            await paymentService.failure({
              razorpayOrderId: paymentIntent.razorpayOrderId,
              failureReason: 'Checkout dismissed',
            });
          },
        },
        theme: {
          color: '#ff7f32',
        },
      });

      razorpay.open();
    } catch {
      setSubmitError('Unable to place the order.');
    }
  };

  return (
    <section className="page checkout-grid">
      <div className="form-card">
        <div>
          <span className="page__eyebrow">Finalize your order</span>
          <h1 className="section-title">Checkout</h1>
          <p className="section-copy">Confirm the delivery details and place the order securely.</p>
        </div>
        <form className="form-stack" onSubmit={handleSubmit}>
          <TextField label="Street" value={form.street} onChange={(event) => setForm({ ...form, street: event.target.value })} error={errors.street} />
          <TextField label="City" value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} error={errors.city} />
          <TextField label="State" value={form.state} onChange={(event) => setForm({ ...form, state: event.target.value })} error={errors.state} />
          <TextField label="Postal code" value={form.postalCode} onChange={(event) => setForm({ ...form, postalCode: event.target.value })} error={errors.postalCode} />
          <TextField label="Country" value={form.country} onChange={(event) => setForm({ ...form, country: event.target.value })} error={errors.country} />
          {submitError ? <div className="field__error">{submitError}</div> : null}
          <div className="form-actions">
            <Button type="submit">Place order</Button>
          </div>
        </form>
      </div>
      <aside className="cart-summary">
        <h3>Payment preview</h3>
        <p className="muted">Delivery fee and taxes are calculated before placing the order.</p>
        <div className="coupon-section" style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
          <TextField
            label="Promo Code"
            placeholder="Enter coupon code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            disabled={!!appliedCoupon}
          />
          <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
            {!appliedCoupon ? (
              <Button type="button" onClick={handleApplyCoupon}>
                Apply Coupon
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => {
                  setAppliedCoupon(null);
                  setCouponCode('');
                  setCouponSuccess(null);
                }}
              >
                Remove
              </Button>
            )}
          </div>
          {couponError && <div className="field__error" style={{ marginTop: '0.5rem' }}>{couponError}</div>}
          {couponSuccess && <div className="field__success" style={{ marginTop: '0.5rem', color: '#10b981' }}>{couponSuccess}</div>}
        </div>
        <strong>
          {subtotal > 0 ? (
            (() => {
              const discountedSubtotal = appliedCoupon ? subtotal - appliedCoupon.discount : subtotal;
              const tax = Math.round(discountedSubtotal * 0.05);
              const total = discountedSubtotal + tax + 49;
              return `Estimated total: ₹${total}`;
            })()
          ) : (
            'No items in cart'
          )}
        </strong>
      </aside>
    </section>
  );
}