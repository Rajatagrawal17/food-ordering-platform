import { Link, NavLink } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { useUI } from '../../hooks/useUI';
import { useState } from 'react';
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
        {(() => {
          const { notifications, unreadCount, markAsRead } = useNotifications();
          const [showNotif, setShowNotif] = useState(false);

          return isAuthenticated ? (
            <>
              <Link to={ROUTES.WISHLIST} className="pill-link">
                Favorites
              </Link>
              <Link to={ROUTES.PROFILE} className="pill-link">
                Profile
              </Link>
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setShowNotif(!showNotif)}
                  className="pill-link"
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Alerts {unreadCount > 0 && <span className="badge badge--warning">{unreadCount}</span>}
                </button>
                {showNotif && (
                  <div
                    className="panel"
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      minWidth: '280px',
                      zIndex: 1000,
                      marginTop: '8px',
                      padding: '12px',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                      textAlign: 'left'
                    }}
                  >
                    <h4 style={{ margin: '0 0 10px 0', borderBottom: '1px solid #eee', paddingBottom: '6px' }}>Notifications</h4>
                    {notifications.length === 0 ? (
                      <p className="muted" style={{ fontSize: '12px', margin: 0 }}>No notifications yet.</p>
                    ) : (
                      <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {notifications.slice(0, 5).map((n) => (
                          <div
                            key={n._id}
                            onClick={() => {
                              markAsRead(n._id);
                              setShowNotif(false);
                            }}
                            style={{
                              padding: '8px 0',
                              borderBottom: '1px solid #f5f5f5',
                              cursor: 'pointer',
                              opacity: n.isRead ? 0.6 : 1
                            }}
                          >
                            <strong style={{ fontSize: '12px', display: 'block' }}>{n.title}</strong>
                            <span style={{ fontSize: '11px', color: '#666' }}>{n.message}</span>
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
          ) : (
            <Link to={ROUTES.LOGIN} className="pill-link">
              Sign in
            </Link>
          );
        })()}
      </div>
    </header>
  );
};