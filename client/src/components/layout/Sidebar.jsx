import { NavLink } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../hooks/useAuth';
import { useUI } from '../../hooks/useUI';

const items = [
  { label: 'Discover', to: ROUTES.HOME },
  { label: 'Browse Menu', to: ROUTES.MENU },
  { label: 'My Orders', to: ROUTES.ORDERS },
  { label: 'Checkout', to: ROUTES.CHECKOUT },
];

export const Sidebar = () => {
  const { isMenuOpen, closeMenu } = useUI();
  const { isAdmin } = useAuth();

  return (
    <aside className={`sidebar ${isMenuOpen ? 'is-open' : ''}`.trim()}>
      <div className="sidebar__panel">
        <button type="button" className="sidebar__close" onClick={closeMenu}>
          Close
        </button>
        <div className="sidebar__section">
          <span className="sidebar__eyebrow">Navigation</span>
          {items.map((item) => (
            <NavLink key={item.to} to={item.to} className="sidebar__link" onClick={closeMenu}>
              {item.label}
            </NavLink>
          ))}
        </div>
        {isAdmin ? (
          <div className="sidebar__section">
            <span className="sidebar__eyebrow">Admin</span>
            <NavLink to={ROUTES.ADMIN} className="sidebar__link" onClick={closeMenu}>
              Dashboard
            </NavLink>
          </div>
        ) : null}
      </div>
    </aside>
  );
};