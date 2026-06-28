import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Spinner } from '../components/common/Spinner';
import { orderService } from '../services/orderService';
import { reviewService } from '../services/reviewService';
import { paymentService } from '../services/paymentService';
import { formatCurrency } from '../utils/formatCurrency';
import { StatusBadge } from '../components/common/StatusBadge';
import { useAuth } from '../hooks/useAuth';
import { connectSocket, disconnectSocket, onSocketEvent } from '../services/socketService';
import { loadScript } from '../utils/loadScript';

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { fadeVariants } from '../utils/motionVariants';

export default function OrderDetailsPage() {
  const shouldReduceMotion = useReducedMotion();
  const { orderId } = useParams();
  const { token } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activeReviewFoodId, setActiveReviewFoodId] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(null);
  const [reviewError, setReviewError] = useState(null);
  const [reviewedItems, setReviewedItems] = useState({});
  const [retryError, setRetryError] = useState(null);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const response = await orderService.getById(orderId);
        setOrder(response);
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId]);

  useEffect(() => {
    const socket = connectSocket(token);
    const unsubscribe = onSocketEvent('order:status', (payload) => {
      if (payload._id === orderId) {
        setOrder(payload);
      }
    });

    return () => {
      unsubscribe();
      if (socket) {
        disconnectSocket();
      }
    };
  }, [orderId, token]);

  const handleReviewSubmit = async (event, foodId) => {
    event.preventDefault();
    setReviewError(null);
    setReviewSuccess(null);

    try {
      await reviewService.create({
        foodId,
        rating: reviewRating,
        comment: reviewComment,
      });
      setReviewSuccess('Review submitted successfully!');
      setReviewedItems((prev) => ({ ...prev, [foodId]: true }));
      setActiveReviewFoodId(null);
      setReviewComment('');
      setReviewRating(5);
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review');
    }
  };

  const handleRetryPayment = async () => {
    setRetryError(null);
    if (!order?.paymentTransaction) {
      setRetryError('No payment transaction associated with this order.');
      return;
    }

    try {
      const loaded = await loadScript('https://checkout.razorpay.com/v1/checkout.js');

      if (!loaded || !window.Razorpay) {
        setRetryError('Payment gateway could not be loaded.');
        return;
      }

      const tx = order.paymentTransaction;
      const razorpay = new window.Razorpay({
        key: tx.keyId,
        amount: tx.amount * 100,
        currency: tx.currency,
        name: 'Ember Bites',
        description: 'Retry food order payment',
        order_id: tx.razorpayOrderId,
        handler: async (response) => {
          const updatedOrder = await paymentService.verify({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
          setOrder(updatedOrder);
        },
        modal: {
          ondismiss: async () => {
            await paymentService.failure({
              razorpayOrderId: tx.razorpayOrderId,
              failureReason: 'Retry dismissed',
            });
          },
        },
        theme: {
          color: '#ff7f32',
        },
      });

      razorpay.open();
    } catch {
      setRetryError('Unable to process payment retry.');
    }
  };

  if (loading) {
    return <Spinner label="Loading order details" />;
  }

  if (!order) {
    return (
      <div className="empty-state">
        <h3>Order not found</h3>
      </div>
    );
  }

  return (
    <section className="page" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <div className="page__hero" style={{ marginBottom: '2rem' }}>
        <span className="page__eyebrow">Order details</span>
        <h1 className="page__title" style={{ margin: '0.5rem 0' }}>Order #{order._id.slice(-6)}</h1>
        <div className="badge-row" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <AnimatePresence mode="wait">
            <motion.div key={order.orderStatus} variants={shouldReduceMotion ? {} : fadeVariants} initial="hidden" animate="visible" exit="exit">
              <StatusBadge value={order.orderStatus} />
            </motion.div>
          </AnimatePresence>
          <AnimatePresence mode="wait">
            <motion.div key={order.paymentStatus} variants={shouldReduceMotion ? {} : fadeVariants} initial="hidden" animate="visible" exit="exit">
              <StatusBadge value={order.paymentStatus} />
            </motion.div>
          </AnimatePresence>
        </div>
        {order.paymentStatus === 'pending' && (
          <div style={{ marginTop: '1rem' }}>
            <button className="button" onClick={handleRetryPayment}>
              Retry Payment
            </button>
            {retryError && <div className="field__error" style={{ marginTop: '0.5rem' }}>{retryError}</div>}
          </div>
        )}
      </div>

      <div className="panel" style={{ background: '#ffffff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        {order.items.map((item) => {
          const foodId = item.food._id ?? item.food;
          const isReviewed = reviewedItems[foodId];
          return (
            <div key={foodId} style={{ borderBottom: '1px solid #f3f4f6', padding: '1rem 0' }}>
              <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{item.name}</span>
                <strong>
                  {item.quantity} x {formatCurrency(item.price)}
                </strong>
              </div>

              {order.orderStatus === 'delivered' && !isReviewed && (
                <div style={{ marginTop: '0.75rem' }}>
                  {activeReviewFoodId !== foodId ? (
                    <button
                      className="button button--secondary button--small"
                      onClick={() => {
                        setActiveReviewFoodId(foodId);
                        setReviewSuccess(null);
                        setReviewError(null);
                      }}
                      style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                    >
                      Review Item
                    </button>
                  ) : (
                    <form onSubmit={(e) => handleReviewSubmit(e, foodId)} style={{ marginTop: '0.75rem', background: '#f9fafb', padding: '0.75rem', borderRadius: '6px' }}>
                      <div style={{ marginBottom: '0.5rem' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 500, marginRight: '0.5rem' }}>Rating:</label>
                        <select
                          value={reviewRating}
                          onChange={(e) => setReviewRating(Number(e.target.value))}
                          style={{ padding: '0.2rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
                        >
                          {[5, 4, 3, 2, 1].map((r) => (
                            <option key={r} value={r}>
                              {r} Stars
                            </option>
                          ))}
                        </select>
                      </div>
                      <div style={{ marginBottom: '0.5rem' }}>
                        <textarea
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="Write your review here..."
                          required
                          style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '0.85rem' }}
                        />
                      </div>
                      {reviewError && <div className="field__error" style={{ marginBottom: '0.5rem', fontSize: '0.8rem' }}>{reviewError}</div>}
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button type="submit" className="button button--small" style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}>
                          Submit
                        </button>
                        <button
                          type="button"
                          className="button button--secondary button--small"
                          onClick={() => setActiveReviewFoodId(null)}
                          style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
              {isReviewed && (
                <div style={{ color: '#10b981', fontSize: '0.85rem', marginTop: '0.5rem' }}>✓ Review submitted</div>
              )}
            </div>
          );
        })}

        {reviewSuccess && (
          <div style={{ color: '#10b981', fontSize: '0.9rem', marginTop: '1rem', fontWeight: 500 }}>
            {reviewSuccess}
          </div>
        )}

        <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '2px solid #e5e7eb', fontWeight: 600 }}>
          <span>Total</span>
          <strong>{formatCurrency(order.amount)}</strong>
        </div>
      </div>
    </section>
  );
}