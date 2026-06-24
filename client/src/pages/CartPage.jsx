import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { useCart } from '../hooks/useCart';
import { CartItem } from '../components/cart/CartItem';
import { CartSummary } from '../components/cart/CartSummary';
import { EmptyState } from '../components/common/EmptyState';

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem, clearCart } = useCart();
  const navigate = useNavigate();

  if (!items.length) {
    return (
      <section className="page">
        <EmptyState
          title="Your cart is empty"
          description="Add a few dishes from the menu to continue to checkout."
          actionLabel="Browse menu"
          onAction={() => navigate(ROUTES.MENU)}
        />
      </section>
    );
  }

  return (
    <section className="page checkout-grid">
      <div className="panel">
        <h1 className="section-title">Cart</h1>
        {items.map((item) => (
          <CartItem
            key={(item.food?._id ?? item.food).toString()}
            item={item}
            onIncrease={(foodId, quantity) => updateQuantity(foodId, quantity)}
            onDecrease={(foodId, quantity) => (quantity > 0 ? updateQuantity(foodId, quantity) : removeItem(foodId))}
            onRemove={removeItem}
          />
        ))}
      </div>
      <CartSummary subtotal={subtotal} onCheckout={() => navigate(ROUTES.CHECKOUT)} onClear={clearCart} />
    </section>
  );
}