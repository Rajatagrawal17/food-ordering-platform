import { useState, useEffect } from 'react';
import { wishlistService } from '../services/wishlistService';
import { useCart } from '../hooks/useCart';
import { FoodCard } from '../components/food/FoodCard';
import { Spinner } from '../components/common/Spinner';

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { cardVariants } from '../utils/motionVariants';

export default function WishlistPage() {
  const shouldReduceMotion = useReducedMotion();
  const { addItem } = useCart();
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadWishlist = async () => {
    try {
      const data = await wishlistService.getWishlist();
      setWishlist(data);
    } catch {
      setError('Failed to load wishlist.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const handleRemove = async (foodId) => {
    try {
      const updated = await wishlistService.removeFood(foodId);
      setWishlist(updated);
    } catch {
      console.error('Failed to remove item from wishlist');
    }
  };

  if (loading) {
    return <Spinner label="Loading wishlist..." />;
  }

  if (error) {
    return <div className="empty-state"><h3>{error}</h3></div>;
  }

  const foods = wishlist?.foods ?? [];

  return (
    <section className="page">
      <div className="page__hero">
        <span className="page__eyebrow">Your saved favorites</span>
        <h1 className="page__title">My Wishlist</h1>
      </div>

      <AnimatePresence mode="wait">
        {foods.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="empty-state"
          >
            <h3>Your wishlist is empty</h3>
            <p>Go to the menu page to save your favorite dishes.</p>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            className="food-grid" 
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px', marginTop: '24px' }}
          >
            <AnimatePresence initial={false}>
              {foods.map((food, i) => (
                <motion.div
                  key={food._id}
                  custom={i}
                  variants={shouldReduceMotion ? {} : cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                  style={{ position: 'relative' }}
                >
                  <FoodCard food={food} onAdd={addItem} />
                  <button
                    type="button"
                    onClick={() => handleRemove(food._id)}
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      cursor: 'pointer',
                      color: 'red',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    ✕
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
