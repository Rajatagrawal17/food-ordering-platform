import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Spinner } from '../components/common/Spinner';
import { restaurantService } from '../services/restaurantService';

const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.3, ease: 'easeOut' },
  }),
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.15 } },
};

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const data = await restaurantService.list({});
        setRestaurants(data.restaurants ?? []);
      } catch {
        setError('Unable to load restaurants right now.');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  return (
    <section className="page">
      <div className="page__hero">
        <span className="page__eyebrow">Local Favorites</span>
        <h1 className="page__title">Restaurants</h1>
        <p className="page__subtitle">
          Order from the best local restaurants in your area, delivered straight to your door.
        </p>
      </div>

      {loading && <Spinner label="Loading restaurants" />}
      {error && <div className="empty-state"><h3>{error}</h3></div>}

      {!loading && !error && (
        <div className="checkout-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', width: '100%', gap: '24px' }}>
          <AnimatePresence mode="popLayout">
            {restaurants.map((restaurant, i) => (
              <motion.article
                className="card"
                key={restaurant._id}
                layout
                custom={i}
                variants={shouldReduceMotion ? {} : cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                whileHover={shouldReduceMotion ? {} : { y: -4, transition: { duration: 0.2 } }}
                style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
              >
                <div className="card__media">
                  <img src={restaurant.image} alt={restaurant.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div className="card__meta">
                  <span className="badge badge--good">⭐ {restaurant.rating ? restaurant.rating.toFixed(1) : '0.0'}</span>
                  <span className="badge badge--warning">🛵 {restaurant.avgPrepTime} mins</span>
                </div>
                <div className="card__info" style={{ flexGrow: 1 }}>
                  <h3 className="card__title">{restaurant.name}</h3>
                  <p className="muted" style={{ fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                    {restaurant.cuisines.join(', ')}
                  </p>
                  <p className="muted" style={{ fontSize: '0.75rem', marginTop: '4px' }}>
                    📍 {restaurant.address.area}, {restaurant.address.city}
                  </p>
                </div>
                <div className="card__actions" style={{ marginTop: '12px', padding: '0 16px 16px 16px' }}>
                  <Link
                    to={`/restaurants/${restaurant._id}`}
                    className="button button--primary"
                    style={{ width: '100%', textAlign: 'center', display: 'block', padding: '10px 0', borderRadius: '12px' }}
                  >
                    View Menu
                  </Link>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}
