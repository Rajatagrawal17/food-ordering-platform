import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { FoodCard } from './FoodCard';
import { EmptyState } from '../common/EmptyState';

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.3, ease: 'easeOut' },
  }),
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.15 } },
};

export const FoodGrid = ({ foods, onAdd }) => {
  const shouldReduceMotion = useReducedMotion();

  if (!foods?.length) {
    return (
      <EmptyState
        title="No dishes found"
        description="Try adjusting the category or search term to explore more items."
      />
    );
  }

  return (
    <div className="food-grid">
      <AnimatePresence mode="popLayout">
        {foods.map((food, i) => (
          <motion.div
            key={food._id}
            layout
            custom={i}
            variants={shouldReduceMotion ? {} : cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <FoodCard food={food} onAdd={onAdd} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};