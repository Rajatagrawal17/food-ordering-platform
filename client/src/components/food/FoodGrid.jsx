import { FoodCard } from './FoodCard';
import { EmptyState } from '../common/EmptyState';

export const FoodGrid = ({ foods, onAdd }) => {
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
      {foods.map((food) => (
        <FoodCard key={food._id} food={food} onAdd={onAdd} />
      ))}
    </div>
  );
};