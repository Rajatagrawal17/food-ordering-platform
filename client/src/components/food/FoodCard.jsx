import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { formatCurrency } from '../../utils/formatCurrency';
import { Button } from '../common/Button';

export const FoodCard = ({ food, onAdd }) => {
  const ratingText = food.rating ? `⭐ ${food.rating.toFixed(1)}` : '⭐ 0.0';
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.article
      className="card"
      whileHover={shouldReduceMotion ? {} : { y: -4, boxShadow: '0 12px 36px rgba(138,128,116,0.18)' }}
      transition={{ duration: 0.2 }}
    >
      <div className="card__media">
        <img src={food.image} alt={food.name} loading="lazy" />
      </div>
      <div className="card__meta">
        <span className="badge">{food.category}</span>
        <span className="badge badge--good">{ratingText}</span>
      </div>
      <div className="card__info">
        <h3 className="card__title">{food.name}</h3>
        <p className="muted" style={{ fontSize: '0.85rem', margin: '4px 0 0 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {food.description}
        </p>
      </div>
      <div className="card__actions" style={{ marginTop: '12px', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong style={{ fontSize: '1.2rem', color: 'var(--text)', fontFamily: 'Outfit, sans-serif' }}>
          {formatCurrency(food.price)}
        </strong>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link to={`/menu?food=${food._id}`} className="button button--ghost" style={{ padding: '8px 14px', borderRadius: '12px', fontSize: '0.85rem' }}>
            Details
          </Link>
          <Button onClick={() => onAdd(food)} style={{ padding: '8px 16px', borderRadius: '12px', fontSize: '0.85rem' }}>
            Add +
          </Button>
        </div>
      </div>
    </motion.article>
  );
};