import { formatCurrency } from '../../utils/formatCurrency';
import { Button } from '../common/Button';

import { motion, useReducedMotion } from 'framer-motion';
import { pulseVariants } from '../../utils/motionVariants';

export const CartItem = ({ item, onIncrease, onDecrease, onRemove }) => {
  const shouldReduceMotion = useReducedMotion();
  const foodId = item.food?._id ?? item.food;

  return (
    <div className="cart-item">
      <img className="cart-item__image" src={item.image ?? item.food?.image} alt={item.name ?? item.food?.name} />
      <div>
        <h3>{item.name ?? item.food?.name}</h3>
        <p className="muted">{formatCurrency(item.price ?? item.food?.price)}</p>
        <div className="inline-actions">
          <Button variant="secondary" onClick={() => onDecrease(foodId, item.quantity - 1)}>
            -
          </Button>
          <motion.span 
            className="pill-link"
            key={item.quantity}
            variants={shouldReduceMotion ? {} : pulseVariants}
            initial="initial"
            animate="animate"
          >
            {item.quantity}
          </motion.span>
          <Button variant="secondary" onClick={() => onIncrease(foodId, item.quantity + 1)}>
            +
          </Button>
        </div>
      </div>
      <div className="summary-actions">
        <strong>{formatCurrency((item.price ?? item.food?.price) * item.quantity)}</strong>
        <Button variant="ghost" onClick={() => onRemove(foodId)}>
          Remove
        </Button>
      </div>
    </div>
  );
};