import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, Heart, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import './Layout.scss';

function Layout() {
  const { isAuthenticated, user, logout } = useAuth();
  const { totalItems } = useCart();
  const { items: wishlistItems } = useWishlist();

  return (
    <div className="layout">
      <header className="header">
        <div className="container">
          <Link to="/" className="logo">Tech Shop</Link>
          <nav>
            <Link to="/">Каталог</Link>
            {isAuthenticated ? (
              <>
                <Link to="/profile"><User size={20} /> <span className="nav-text">Профіль</span></Link>
                {user?.role === 'admin' && <Link to="/admin"><LayoutDashboard size={20} /> <span className="nav-text">Адмін</span></Link>}
                <Link to="/wishlist" className="icon-link">
                  <Heart size={20} />
                  {wishlistItems.length > 0 && <span className="badge">{wishlistItems.length}</span>}
                </Link>
                <Link to="/cart" className="icon-link">
                  <ShoppingCart size={20} />
                  {totalItems > 0 && <span className="badge">{totalItems}</span>}
                </Link>
                <button onClick={logout}><LogOut size={20} /> <span className="nav-text">Вихід</span></button>
              </>
            ) : (
              <>
                <Link to="/cart" className="icon-link">
                  <ShoppingCart size={20} />
                  {totalItems > 0 && <span className="badge">{totalItems}</span>}
                </Link>
                <Link to="/login">Вхід</Link>
                <Link to="/register">Реєстрація</Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main><Outlet /></main>
    </div>
  );
}

export default Layout;