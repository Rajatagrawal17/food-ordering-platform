import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Spinner } from '../components/common/Spinner';
import { EmptyState } from '../components/common/EmptyState';
import { orderService } from '../services/orderService';
import { StatusBadge } from '../components/common/StatusBadge';

import { motion, useReducedMotion } from 'framer-motion';
import { cardVariants } from '../utils/motionVariants';

export default function OrdersPage() {
  const shouldReduceMotion = useReducedMotion();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const response = await orderService.list();
        setOrders(response.orders ?? []);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  if (loading) {
    return <Spinner label="Loading orders" />;
  }

  if (!orders.length) {
    return <EmptyState title="No orders yet" description="Your order history will appear here after checkout." />;
  }

  return (
    <section className="page">
      <div className="page__hero">
        <span className="page__eyebrow">History</span>
        <h1 className="page__title">My orders</h1>
        <p className="page__subtitle">Review order status, payment state, and reorder details from one place.</p>
      </div>
      <div className="orders-grid">
        {orders.map((order, i) => {
          const isPending = order.orderStatus === 'placed' || order.orderStatus === 'confirmed' || order.orderStatus === 'preparing' || order.orderStatus === 'out_for_delivery';
          
          return (
            <motion.article 
              className="order-card-next" 
              key={order._id}
              custom={i}
              variants={shouldReduceMotion ? {} : cardVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="order-header">
                <div className="order-header-left">
                  <h3>Order #{order._id.slice(-6)}</h3>
                  <p>{new Date(order.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div className="order-badges">
                  <StatusBadge value={order.orderStatus} />
                  <StatusBadge value={order.paymentStatus} />
                </div>
              </div>

              {order.estimatedDeliveryTime && isPending && (
                <div className="order-eta-box">
                  <span className="eta-label">Estimated Delivery</span>
                  <span className="eta-time">{new Date(order.estimatedDeliveryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              )}

              <div className="order-items-preview">
                {order.items.slice(0, 3).map(item => (
                  <div key={item._id || item.food} className="order-item-line">
                    <span><span className="qty">{item.quantity}x</span> {item.name}</span>
                  </div>
                ))}
                {order.items.length > 3 && (
                  <div className="order-item-line" style={{ marginTop: '0.25rem', fontStyle: 'italic' }}>
                    <span>+ {order.items.length - 3} more items</span>
                  </div>
                )}
              </div>

              <div className="order-footer-next">
                <div className="total-amount">
                  <span>Total Amount</span>
                  <strong>₹{order.amount}</strong>
                </div>
                <Link to={`/orders/${order._id}`} className="view-btn">
                  View details
                </Link>
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}