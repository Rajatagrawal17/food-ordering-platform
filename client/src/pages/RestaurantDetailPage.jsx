import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Spinner } from '../components/common/Spinner';
import { FoodGrid } from '../components/food/FoodGrid';
import { restaurantService } from '../services/restaurantService';
import { useCart } from '../hooks/useCart';

export default function RestaurantDetailPage() {
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
        <img 
          src={restaurant.image} 
          alt={restaurant.name} 
          style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0, zIndex: 1, filter: 'brightness(0.5)' }} 
        />
        <div style={{ position: 'relative', zIndex: 2, padding: '32px', display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
          <span className="page__eyebrow" style={{ color: 'var(--accent)' }}>Restaurant Menu</span>
          <h1 className="page__title" style={{ color: '#fff', fontSize: '2.5rem', fontWeight: 800, margin: 0 }}>{restaurant.name}</h1>
          <p style={{ margin: 0, fontSize: '1.05rem', opacity: 0.9 }}>{restaurant.description}</p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '8px' }}>
            <span className="badge badge--good">⭐ {restaurant.rating ? restaurant.rating.toFixed(1) : '0.0'}</span>
            <span className="badge badge--warning">🛵 {restaurant.avgPrepTime} mins delivery</span>
            <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff' }}>
              {restaurant.cuisines.join(', ')}
            </span>
            <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff' }}>
              📍 {restaurant.address.area}, {restaurant.address.city}
            </span>
          </div>
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
