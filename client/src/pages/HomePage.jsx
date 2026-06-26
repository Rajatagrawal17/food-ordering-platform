import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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

export default function HomePage() {
  const { addItem } = useCart();
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const loadReviews = async () => {
      const response = await reviewService.featured();
      setReviews(response ?? []);
    };

    loadReviews();
  }, []);

  return (
    <section className="page" style={{ gap: '48px' }}>
      {/* Hero Section */}
      <div className="page__hero hero-grid">
        <div className="hero-panel">
          <span className="page__eyebrow">Hungry? We've got you covered</span>
          <h1 className="hero-title" style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', fontWeight: 800 }}>
            Fresh, delicious meals delivered straight to your door.
          </h1>
          <p className="hero-copy" style={{ fontSize: '1.05rem', marginTop: '8px' }}>
            Browse our curated catalog of hand-crafted dishes, slow-cooked biryanis, wood-fired pizzas, and gourmet burgers. Order now for lightning-fast delivery and real-time tracking.
          </p>
          <div className="hero-actions" style={{ marginTop: '16px' }}>
            <Link to={ROUTES.MENU} className="button button--primary" style={{ padding: '14px 28px', fontSize: '1.05rem' }}>
              Explore Menu
            </Link>
            <Link to={ROUTES.ORDERS} className="button button--secondary" style={{ padding: '14px 28px', fontSize: '1.05rem' }}>
              Track Order
            </Link>
          </div>
          <div className="hero-badges" style={{ marginTop: '24px' }}>
            <span className="badge badge--good">⚡ Instant Order</span>
            <span className="badge badge--warning">🛵 Fast Delivery</span>
            <span className="badge">🌱 Fresh Ingredients</span>
            <span className="badge badge--good">⭐ Premium Taste</span>
          </div>
        </div>
        <div className="hero-image-panel" style={{ borderRadius: '22px', overflow: 'hidden', aspectRatio: '4/3', boxShadow: 'var(--shadow)' }}>
          <img 
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=80" 
            alt="Delicious gourmet table layout" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
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