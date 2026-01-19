import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../api/orders';
import './ProfilePage.scss';

function ProfilePage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getOrders(statusFilter || undefined);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusLabels = {
    new: 'Нове',
    confirmed: 'Підтверджено',
    assembled: 'Зібрано',
    shipped: 'Відправлено',
    delivered: 'Доставлено',
    cancelled: 'Скасовано',
  };

  const statusIcons = {
    new: <Clock size={18} />,
    confirmed: <CheckCircle size={18} />,
    assembled: <Package size={18} />,
    shipped: <Truck size={18} />,
    delivered: <CheckCircle size={18} />,
    cancelled: <XCircle size={18} />,
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="container">
          <div className="loading">Завантаження...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="container">
        <h1>Мій профіль</h1>

        {/* User Info */}
        <div className="profile-info">
          <h2>Інформація</h2>
          <div className="info-row">
            <span>Ім'я:</span>
            <span>{user.fullName}</span>
          </div>
          <div className="info-row">
            <span>Email:</span>
            <span>{user.email}</span>
          </div>
          <div className="info-row">
            <span>Роль:</span>
            <span className={`role role-${user.role}`}>
              {user.role === 'admin' ? 'Адміністратор' : 'Користувач'}
            </span>
          </div>
        </div>

        {/* Orders */}
        <div className="profile-orders">
          <div className="orders-header">
            <h2>Мої замовлення ({orders.length})</h2>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="status-filter"
            >
              <option value="">Всі статуси</option>
              <option value="new">Нові</option>
              <option value="confirmed">Підтверджені</option>
              <option value="assembled">Зібрані</option>
              <option value="shipped">Відправлені</option>
              <option value="delivered">Доставлені</option>
              <option value="cancelled">Скасовані</option>
            </select>
          </div>

          {orders.length === 0 ? (
            <div className="empty-orders">
              <Package size={48} />
              <p>У вас поки немає замовлень</p>
              <Link to="/" className="btn-primary">До каталогу</Link>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map((order) => (
                <div key={order._id} className="order-card">
                  <div className="order-header">
                    <div className="order-number">
                      Замовлення #{order._id.slice(-8)}
                    </div>
                    <div className={`order-status status-${order.status}`}>
                      {statusIcons[order.status]}
                      <span>{statusLabels[order.status]}</span>
                    </div>
                  </div>

                  <div className="order-info">
                    <div className="info-item">
                      <span className="label">Дата:</span>
                      <span>{new Date(order.createdAt).toLocaleDateString('uk-UA')}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Товарів:</span>
                      <span>{order.items.length}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Сума:</span>
                      <span className="price">{order.totalAmount} грн</span>
                    </div>
                  </div>

                  <div className="order-items-preview">
                    {order.items.slice(0, 3).map((item) => (
                      <div key={item._id} className="item-preview">
                        <img src={item.product.image} alt={item.product.name} />
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="items-more">+{order.items.length - 3}</div>
                    )}
                  </div>

                  <Link
                    to={`/order-success/${order._id}`}
                    className="btn-view-order"
                  >
                    Переглянути деталі
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;