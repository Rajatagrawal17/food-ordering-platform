import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ROUTES } from '../constants/routes';
import { FoodGrid } from '../components/food/FoodGrid';
import { useCart } from '../hooks/useCart';
import { reviewService } from '../services/reviewService';
import { ReviewCard } from '../components/common/ReviewCard';

const featuredFoods = [
  {
    _id: '1',
    name: 'Smoked Tandoori Bowl',
    description: 'Charred paneer, saffron rice, herbs, and a bright citrus finish.',
    category: 'Biryani',
    image: 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d6e?auto=format&fit=crop&w=900&q=80',
    price: 320,
    rating: 4.8,
  },
  {
    _id: '2',
    name: 'Coal Fired Supreme Pizza',
    description: 'Hand-stretched dough, slow-cooked sauce, and rich mozzarella layers.',
    category: 'Pizza',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80',
    price: 460,
    rating: 4.7,
  },
  {
    _id: '3',
    name: 'Spicy Stack Burger',
    description: 'Crispy chicken, soft bun, garlic aioli, and house slaw.',
    category: 'Burger',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80',
    price: 290,
    rating: 4.9,
  },
];

const heroVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.35, ease: 'easeOut' },
  }),
};

const imageVariants = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.45, ease: 'easeOut', delay: 0.2 } },
};

export default function HomePage() {
  const { addItem } = useCart();
  const [reviews, setReviews] = useState([]);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const loadReviews = async () => {
      const response = await reviewService.featured();
      setReviews(response ?? []);
    };

    loadReviews();
  }, []);

  const animate = shouldReduceMotion ? 'visible' : undefined;

  return (
    <section className="page" style={{ gap: '48px' }}>
      {/* Hero Section */}
      <div className="page__hero hero-grid">
        <div className="hero-panel">
          <motion.span
            className="page__eyebrow"
            custom={0}
            variants={heroVariants}
            initial="hidden"
            animate={animate ?? 'visible'}
          >
            Hungry? We've got you covered
          </motion.span>
          <motion.h1
            className="hero-title"
            style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', fontWeight: 800 }}
            custom={1}
            variants={heroVariants}
            initial="hidden"
            animate={animate ?? 'visible'}
          >
            Fresh, delicious meals delivered straight to your door.
          </motion.h1>
          <motion.p
            className="hero-copy"
            style={{ fontSize: '1.05rem', marginTop: '8px' }}
            custom={2}
            variants={heroVariants}
            initial="hidden"
            animate={animate ?? 'visible'}
          >
            Browse our curated catalog of hand-crafted dishes, slow-cooked biryanis, wood-fired pizzas, and gourmet burgers. Order now for lightning-fast delivery and real-time tracking.
          </motion.p>
          <motion.div
            className="hero-actions"
            style={{ marginTop: '16px' }}
            custom={3}
            variants={heroVariants}
            initial="hidden"
            animate={animate ?? 'visible'}
          >
            <Link to={ROUTES.MENU} className="button button--primary" style={{ padding: '14px 28px', fontSize: '1.05rem' }}>
              Explore Menu
            </Link>
            <Link to={ROUTES.ORDERS} className="button button--secondary" style={{ padding: '14px 28px', fontSize: '1.05rem' }}>
              Track Order
            </Link>
          </motion.div>
          <motion.div
            className="hero-badges"
            style={{ marginTop: '24px' }}
            custom={4}
            variants={heroVariants}
            initial="hidden"
            animate={animate ?? 'visible'}
          >
            <span className="badge badge--good">⚡ Instant Order</span>
            <span className="badge badge--warning">🛵 Fast Delivery</span>
            <span className="badge">🌱 Fresh Ingredients</span>
            <span className="badge badge--good">⭐ Premium Taste</span>
          </motion.div>
        </div>
        <motion.div
          className="hero-image-panel"
          style={{ borderRadius: '22px', overflow: 'hidden', aspectRatio: '4/3', boxShadow: 'var(--shadow)' }}
          variants={imageVariants}
          initial="hidden"
          animate={animate ?? 'visible'}
        >
          <img
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=80"
            alt="Delicious gourmet table layout"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </motion.div>
      </div>

      {/* Featured Section */}
      <div className="featured-section" style={{ display: 'grid', gap: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span className="kicker">Chef's Recommendations</span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, fontFamily: 'Outfit, sans-serif' }}>Featured Dishes</h2>
        </div>
        <FoodGrid foods={featuredFoods} onAdd={addItem} />
      </div>

      {/* Reviews Section */}
      {reviews.length > 0 && (
        <div className="reviews-section" style={{ display: 'grid', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span className="kicker">Word of Mouth</span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, fontFamily: 'Outfit, sans-serif' }}>What Our Customers Say</h2>
          </div>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {reviews.slice(0, 3).map((review) => (
              <ReviewCard key={review._id} review={review} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}