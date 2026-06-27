import { lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { AppLayout } from '../components/layout/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';

const HomePage = lazy(() => import('../pages/HomePage'));
const MenuPage = lazy(() => import('../pages/MenuPage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const RegisterPage = lazy(() => import('../pages/RegisterPage'));
const CartPage = lazy(() => import('../pages/CartPage'));
const CheckoutPage = lazy(() => import('../pages/CheckoutPage'));
const OrdersPage = lazy(() => import('../pages/OrdersPage'));
const OrderDetailsPage = lazy(() => import('../pages/OrderDetailsPage'));
const AdminDashboardPage = lazy(() => import('../pages/AdminDashboardPage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const WishlistPage = lazy(() => import('../pages/WishlistPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));
const RestaurantsPage = lazy(() => import('../pages/RestaurantsPage'));
const RestaurantDetailPage = lazy(() => import('../pages/RestaurantDetailPage'));

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path={ROUTES.MENU.slice(1)} element={<MenuPage />} />
          <Route path={ROUTES.LOGIN.slice(1)} element={<LoginPage />} />
          <Route path={ROUTES.REGISTER.slice(1)} element={<RegisterPage />} />
          <Route path={ROUTES.CART.slice(1)} element={<CartPage />} />
          <Route
            path={ROUTES.CHECKOUT.slice(1)}
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.ORDERS.slice(1)}
            element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="orders/:orderId"
            element={
              <ProtectedRoute>
                <OrderDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.PROFILE.slice(1)}
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.WISHLIST.slice(1)}
            element={
              <ProtectedRoute>
                <WishlistPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.ADMIN.slice(1)}
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['admin']}>
                  <AdminDashboardPage />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route path={ROUTES.RESTAURANTS.slice(1)} element={<RestaurantsPage />} />
          <Route path={ROUTES.RESTAURANT_DETAILS.slice(1)} element={<RestaurantDetailPage />} />
          <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
        </Route>
        <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
      </Routes>
    </BrowserRouter>
  );
}