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
        {orders.map((order, i) => (
          <motion.article 
            className="order-card" 
            key={order._id}
            custom={i}
            variants={shouldReduceMotion ? {} : cardVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="order-meta">
              <StatusBadge value={order.orderStatus} />
              <StatusBadge value={order.paymentStatus} />
            </div>
            <h3>Order #{order._id.slice(-6)}</h3>
            <p className="muted">{order.items.length} items</p>
            <div className="summary-row">
              <span>Amount</span>
              <strong>₹{order.amount}</strong>
            </div>
            <Link to={`/orders/${order._id}`} className="button button--secondary">
              View details
            </Link>
          </motion.article>
        ))}
      </div>
    </section>
  );
}