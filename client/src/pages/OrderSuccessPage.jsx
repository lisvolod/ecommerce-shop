import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { ordersAPI } from '../api/orders';
import './OrderSuccessPage.scss';

function OrderSuccessPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await ordersAPI.getOrderById(orderId);
        setOrder(response.data);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Не вдалося завантажити інформацію про замовлення');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="order-success-page">
        <div className="container">
          <div className="loading">Завантаження...</div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="order-success-page">
        <div className="container">
          <div className="error-state">
            <h2>Помилка</h2>
            <p>{error || 'Замовлення не знайдено'}</p>
            <Link to="/" className="btn-primary">До каталогу</Link>
          </div>
        </div>
      </div>
    );
  }

  const statusLabels = {
    new: 'Нове',
    confirmed: 'Підтверджено',
    assembled: 'Зібрано',
    shipped: 'Відправлено',
    delivered: 'Доставлено',
    cancelled: 'Скасовано',
  };

  return (
    <div className="order-success-page">
      <div className="container">
        <div className="success-card">
          <div className="success-icon">
            <CheckCircle size={64} />
          </div>

          <h1>Замовлення успішно оформлено!</h1>
          <p className="order-number">Номер замовлення: <strong>#{order._id}</strong></p>

          <div className="order-info">
            <h2>Інформація про замовлення</h2>

            <div className="info-row">
              <span>Статус:</span>
              <span className={`status status-${order.status}`}>
                {statusLabels[order.status]}
              </span>
            </div>

            <div className="info-row">
              <span>Дата:</span>
              <span>{new Date(order.createdAt).toLocaleString('uk-UA')}</span>
            </div>

            <div className="info-row">
              <span>Сума:</span>
              <span className="total">{order.totalAmount} грн</span>
            </div>

            {order.guestInfo && (
              <>
                <h3>Контактні дані</h3>
                <div className="info-row">
                  <span>Ім'я:</span>
                  <span>{order.guestInfo.fullName}</span>
                </div>
                <div className="info-row">
                  <span>Email:</span>
                  <span>{order.guestInfo.email}</span>
                </div>
                <div className="info-row">
                  <span>Телефон:</span>
                  <span>{order.guestInfo.phone}</span>
                </div>
                <div className="info-row">
                  <span>Адреса:</span>
                  <span>{order.guestInfo.address}</span>
                </div>
              </>
            )}

            {order.comment && (
              <>
                <h3>Коментар</h3>
                <p className="comment">{order.comment}</p>
              </>
            )}
          </div>

          <div className="order-items">
            <h2>Товари</h2>
            {order.items.map((item) => (
              <div key={item._id} className="order-item">
                <img src={item.product.image} alt={item.product.name} />
                <div className="item-details">
                  <p className="item-name">{item.product.name}</p>
                  <p className="item-quantity">
                    {item.quantity} шт × {item.price} грн
                  </p>
                </div>
                <p className="item-total">{item.price * item.quantity} грн</p>
              </div>
            ))}
          </div>

          <div className="actions">
            <Link to="/" className="btn-primary">До каталогу</Link>
            <Link to="/profile" className="btn-secondary">Мої замовлення</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccessPage;