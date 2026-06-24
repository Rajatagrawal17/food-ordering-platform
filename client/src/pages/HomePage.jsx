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
    <section className="page">
      <div className="page__hero hero-grid">
        <div className="hero-panel">
          <span className="page__eyebrow">Fast ordering, real delivery, clean operations</span>
          <h1 className="hero-title">A food ordering platform built to feel premium and run reliably.</h1>
          <p className="hero-copy">
            Discover curated dishes, save your favorites, and move from browse to checkout without friction. The
            architecture supports auth, cart persistence, orders, and admin operations from day one.
          </p>
          <div className="hero-actions">
            <Link to={ROUTES.MENU} className="button button--primary">
              Explore menu
            </Link>
            <Link to={ROUTES.CHECKOUT} className="button button--secondary">
              Checkout flow
            </Link>
          </div>
          <div className="hero-badges">
            <span className="badge badge--good">JWT Auth</span>
            <span className="badge badge--warning">Cart persistence</span>
            <span className="badge badge--good">Admin controls</span>
            <span className="badge badge--warning">Mobile-first UI</span>
          </div>
        </div>
        <div className="panel">
          <div className="info-card">
            <span className="kicker">Featured dishes</span>
            <FoodGrid foods={featuredFoods} onAdd={addItem} />
            <div className="grid" style={{ marginTop: '18px' }}>
              {reviews.slice(0, 3).map((review) => (
                <ReviewCard key={review._id} review={review} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}