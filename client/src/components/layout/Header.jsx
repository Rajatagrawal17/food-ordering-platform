import { Link, NavLink } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { useUI } from '../../hooks/useUI';
import { useState, useRef, useEffect } from 'react';
import { Button } from '../common/Button';
import { useNotifications } from '../../context/NotificationContext';

const navItems = [
  { label: 'Home', to: ROUTES.HOME },
  { label: 'Menu', to: ROUTES.MENU },
  { label: 'Orders', to: ROUTES.ORDERS },
  { label: 'Cart', to: ROUTES.CART },
];

export const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const { toggleMenu } = useUI();

  return (
    <header className="topbar">
      <div className="topbar__brand">
        <button className="icon-button topbar__menu-button" onClick={toggleMenu} type="button">
          Menu
        </button>
        <Link to={ROUTES.HOME} className="topbar__logo">
          Ember Bites
        </Link>
      </div>
      <nav className="topbar__nav">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => `topbar__link ${isActive ? 'is-active' : ''}`.trim()}>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="topbar__actions">
        <Link to={ROUTES.CART} className="pill-link">
          Cart <span>{itemCount}</span>
        </Link>
        {isAuthenticated ? (
          <UserMenu user={user} logout={logout} />
        ) : (
          <Link to={ROUTES.LOGIN} className="pill-link">
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
};

const UserMenu = ({ user, logout }) => {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [showNotif, setShowNotif] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotif(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <Link to={ROUTES.WISHLIST} className="pill-link">
        Favorites
      </Link>
      <Link to={ROUTES.PROFILE} className="pill-link">
        Profile
      </Link>
      <div className="notification-wrapper" ref={dropdownRef} style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => setShowNotif(!showNotif)}
          className="button button--ghost"
        >
          Alerts {unreadCount > 0 && <span className="badge badge--warning">{unreadCount}</span>}
        </button>
        {showNotif && (
          <div 
            className="panel notification-dropdown" 
            style={{ 
              position: 'absolute', 
              top: '100%', 
              right: 0, 
              minWidth: '320px', 
              zIndex: 1000, 
              marginTop: '12px',
              padding: '16px',
              textAlign: 'left'
            }}
          >
            <h4 style={{ margin: '0 0 12px 0', paddingBottom: '8px', borderBottom: '1px solid var(--line)' }}>
              Notifications
            </h4>
            {notifications.length === 0 ? (
              <p className="muted" style={{ fontSize: '0.85rem', margin: 0, padding: '8px 0' }}>
                No notifications yet.
              </p>
            ) : (
              <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                {notifications.slice(0, 5).map((n) => (
                  <div
                    key={n._id}
                    onClick={() => {
                      markAsRead(n._id);
                      setShowNotif(false);
                    }}
                    style={{
                      padding: '10px 0',
                      borderBottom: '1px solid var(--line)',
                      cursor: 'pointer',
                      opacity: n.isRead ? 0.6 : 1
                    }}
                  >
                    <strong style={{ fontSize: '0.9rem', display: 'block', marginBottom: '2px' }}>{n.title}</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{n.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <span className="topbar__user">{user?.name}</span>
      <Button variant="secondary" onClick={logout}>
        Logout
      </Button>
    </>
  );
};