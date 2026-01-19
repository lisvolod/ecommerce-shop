import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import HomePage from '../pages/HomePage';
import ProductPage from '../pages/ProductPage';
import CartPage from '../pages/CartPage';
import WishlistPage from '../pages/WishlistPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import CheckoutPage from '../pages/CheckoutPage';
import OrderSuccessPage from '../pages/OrderSuccessPage';
import ProfilePage from '../pages/ProfilePage';
import AdminLayout from '../pages/admin/AdminLayout';
import CategoriesPage from '../pages/admin/CategoriesPage';
import ProductsPage from '../pages/admin/ProductsPage';
import OrdersPage from '../pages/admin/OrdersPage';

function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return <div>Завантаження...</div>;
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppRouter() {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/" element={<Layout key={user?._id || 'guest'} />}>
        <Route index element={<HomePage />} />
        <Route path="products/:id" element={<ProductPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="wishlist" element={<WishlistPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="order-success/:orderId" element={<OrderSuccessPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        
        <Route path="profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        
        <Route path="admin" element={
          <ProtectedRoute adminOnly>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/admin/categories" replace />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="orders" element={<OrdersPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default AppRouter;