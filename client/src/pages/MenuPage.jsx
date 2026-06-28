import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { FoodFilters } from '../components/food/FoodFilters';
import { FoodGrid } from '../components/food/FoodGrid';
import { Spinner } from '../components/common/Spinner';
import { foodService } from '../services/foodService';
import { categoryService } from '../services/categoryService';
import { restaurantService } from '../services/restaurantService';
import { useCart } from '../hooks/useCart';

import { motion, useReducedMotion } from 'framer-motion';
import { staggerFadeUpVariants } from '../utils/motionVariants';

export default function MenuPage() {
  const shouldReduceMotion = useReducedMotion();
  const animate = shouldReduceMotion ? 'visible' : undefined;
  const { addItem } = useCart();
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ search: '', category: '', availability: '', restaurant: '', sort: 'newest' });
  const deferredSearch = useDeferredValue(filters.search);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [foodsResponse, categoriesResponse, restaurantsResponse] = await Promise.all([
          foodService.list({
            search: deferredSearch,
            category: filters.category,
            availability: filters.availability,
            restaurant: filters.restaurant,
          }),
          categoryService.list(),
          restaurantService.list(),
        ]);
        setFoods(foodsResponse.foods ?? []);
        setCategories(categoriesResponse ?? []);
        setRestaurants(restaurantsResponse.restaurants ?? []);
      } catch {
        setError('Unable to load menu right now.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [deferredSearch, filters.category, filters.availability, filters.restaurant]);

  const sortedFoods = useMemo(() => {
    const items = [...foods];

    if (filters.sort === 'price_low') {
      return items.sort((left, right) => left.price - right.price);
    }

    if (filters.sort === 'price_high') {
      return items.sort((left, right) => right.price - left.price);
    }

    if (filters.sort === 'popular') {
      return items.sort((left, right) => (right.rating ?? 0) - (left.rating ?? 0));
    }

    return items.sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));
  }, [foods, filters.sort]);

  const handleFilterChange = (partialFilters) => {
    setFilters((currentFilters) => ({ ...currentFilters, ...partialFilters }));
  };

  return (
    <section className="page">
      <div className="page__hero">
        <span className="page__eyebrow">Browse the full catalog</span>
        <h1 className="page__title">Menu</h1>
        <p className="page__subtitle">
          Search by dish, filter by category, and sort by popularity or price without leaving the page.
        </p>
      </div>

      <motion.div
        variants={staggerFadeUpVariants}
        initial="hidden"
        animate={animate ?? 'visible'}
        custom={0}
      >
        <FoodFilters
          search={filters.search}
          category={filters.category}
          availability={filters.availability}
          restaurant={filters.restaurant}
          categories={categories}
          restaurants={restaurants}
          onChange={handleFilterChange}
        />
      </motion.div>

      {loading ? <Spinner label="Loading dishes" /> : null}
      {error ? <div className="empty-state"><h3>{error}</h3></div> : null}
      {!loading && !error ? <FoodGrid foods={sortedFoods} onAdd={addItem} /> : null}
    </section>
  );
}