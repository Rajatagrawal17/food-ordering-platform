import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatCurrency';
import { Button } from '../common/Button';

export const FoodCard = ({ food, onAdd }) => {
  return (
    <article className="card">
      <div className="card__media">
        <img src={food.image} alt={food.name} />
      </div>
      <div className="card__meta">
        <span className="badge badge--warning">{food.category}</span>
        <span className="badge">{food.rating?.toFixed?.(1) ?? food.rating ?? 0} rating</span>
      </div>
      <div>
        <h3>{food.name}</h3>
        <p className="muted">{food.description}</p>
      </div>
      <div className="card__actions">
        <strong>{formatCurrency(food.price)}</strong>
        <Button onClick={() => onAdd(food)}>Add to cart</Button>
        <Link to={`/menu?food=${food._id}`} className="button button--ghost">
          Details
        </Link>
      </div>
    </article>
  );
};