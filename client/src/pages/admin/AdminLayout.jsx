import { Outlet, NavLink } from 'react-router-dom';
import { FolderOpen, Package, ShoppingBag } from 'lucide-react';
import './AdminLayout.scss';

function AdminLayout() {
  return (
    <div className="admin-layout">
      {/* Admin Navigation Tabs */}
      <nav className="admin-nav">
        <div className="admin-nav-container">
          <NavLink to="/admin/categories" className="admin-tab">
            <FolderOpen size={20} />
            <span>Категорії</span>
          </NavLink>

          <NavLink to="/admin/products" className="admin-tab">
            <Package size={20} />
            <span>Товари</span>
          </NavLink>

          <NavLink to="/admin/orders" className="admin-tab">
            <ShoppingBag size={20} />
            <span>Замовлення</span>
          </NavLink>
        </div>
      </nav>

      {/* Main Content */}
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;