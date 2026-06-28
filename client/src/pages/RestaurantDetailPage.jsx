import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Spinner } from '../components/common/Spinner';
import { FoodGrid } from '../components/food/FoodGrid';
import { restaurantService } from '../services/restaurantService';
import { useCart } from '../hooks/useCart';

import { motion, useReducedMotion } from 'framer-motion';
import { scaleFadeVariants, staggerFadeUpVariants } from '../utils/motionVariants';

export default function RestaurantDetailPage() {
  const shouldReduceMotion = useReducedMotion();
  const animate = shouldReduceMotion ? 'visible' : undefined;
  const { id } = useParams();
  const { addItem } = useCart();
  const [restaurant, setRestaurant] = useState(null);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRestaurantDetail = async () => {
      try {
        setLoading(true);
        const data = await restaurantService.getById(id);
        setRestaurant(data.restaurant);
        setFoods(data.foods ?? []);
      } catch {
        setError('Unable to load restaurant details.');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantDetail();
  }, [id]);

  if (loading) return <Spinner label="Loading menu" />;
  if (error || !restaurant) return <div className="empty-state"><h3>{error || 'Restaurant not found'}</h3></div>;

  return (
    <section className="page" style={{ gap: '32px' }}>
      {/* Restaurant Header Banner */}
      <div className="page__hero" style={{ padding: 0, overflow: 'hidden', borderRadius: '24px', position: 'relative', minHeight: '260px', color: '#fff', display: 'flex', alignItems: 'flex-end' }}>
        <motion.img 
          src={restaurant.image} 
          alt={restaurant.name} 
          style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0, zIndex: 1, filter: 'brightness(0.5)' }} 
          variants={scaleFadeVariants}
          initial="hidden"
          animate={animate ?? 'visible'}
        />
        <div style={{ position: 'relative', zIndex: 2, padding: '32px', display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
          <motion.span custom={0} variants={staggerFadeUpVariants} initial="hidden" animate={animate ?? 'visible'} className="page__eyebrow" style={{ color: 'var(--accent)' }}>Restaurant Menu</motion.span>
          <motion.h1 custom={1} variants={staggerFadeUpVariants} initial="hidden" animate={animate ?? 'visible'} className="page__title" style={{ color: '#fff', fontSize: '2.5rem', fontWeight: 800, margin: 0 }}>{restaurant.name}</motion.h1>
          <motion.p custom={2} variants={staggerFadeUpVariants} initial="hidden" animate={animate ?? 'visible'} style={{ margin: 0, fontSize: '1.05rem', opacity: 0.9 }}>{restaurant.description}</motion.p>
          <motion.div custom={3} variants={staggerFadeUpVariants} initial="hidden" animate={animate ?? 'visible'} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '8px' }}>
            <span className="badge badge--good">⭐ {restaurant.rating ? restaurant.rating.toFixed(1) : '0.0'}</span>
            <span className="badge badge--warning">🛵 {restaurant.avgPrepTime} mins delivery</span>
            <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff' }}>
              {restaurant.cuisines.join(', ')}
            </span>
            <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff' }}>
              📍 {restaurant.address.area}, {restaurant.address.city}
            </span>
          </motion.div>
        </div>
      </div>

      {/* Menu / Food Grid Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, fontFamily: 'Outfit, sans-serif' }}>Available Dishes</h2>
          <Link to="/restaurants" className="button button--secondary" style={{ borderRadius: '12px', fontSize: '0.9rem' }}>
            Back to Restaurants
          </Link>
        </div>
        <FoodGrid foods={foods} onAdd={addItem} />
      </div>
    </section>
  );
}
