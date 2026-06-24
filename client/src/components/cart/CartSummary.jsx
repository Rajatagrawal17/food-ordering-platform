import { formatCurrency } from '../../utils/formatCurrency';
import { Button } from '../common/Button';

export const CartSummary = ({ subtotal, onCheckout, onClear }) => {
  const tax = Math.round(subtotal * 0.05);
  const delivery = subtotal > 0 ? 49 : 0;
  const total = subtotal + tax + delivery;

  return (
    <aside className="cart-summary">
      <h3>Order summary</h3>
      <div className="summary-row">
        <span>Subtotal</span>
        <strong>{formatCurrency(subtotal)}</strong>
      </div>
      <div className="summary-row">
        <span>Tax</span>
        <strong>{formatCurrency(tax)}</strong>
      </div>
      <div className="summary-row">
        <span>Delivery</span>
        <strong>{formatCurrency(delivery)}</strong>
      </div>
      <div className="summary-row">
        <span>Total</span>
        <strong>{formatCurrency(total)}</strong>
      </div>
      <div className="summary-actions">
        <Button onClick={onCheckout}>Proceed to checkout</Button>
        <Button variant="secondary" onClick={onClear}>
          Clear cart
        </Button>
      </div>
    </aside>
  );
};