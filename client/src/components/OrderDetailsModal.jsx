import { X } from 'lucide-react';
import './OrderDetailsModal.scss';

function OrderDetailsModal({ order, onClose }) {
  if (!order) return null;

  const statusLabels = {
    new: 'Нове',
    confirmed: 'Підтверджено',
    assembled: 'Зібрано',
    shipped: 'Відправлено',
    delivered: 'Доставлено',
    cancelled: 'Скасовано',
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content order-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Деталі замовлення #{order._id.slice(-8)}</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          {/* Order Info */}
          <div className="section">
            <h3>Інформація про замовлення</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Номер:</span>
                <span className="value">#{order._id}</span>
              </div>
              <div className="info-item">
                <span className="label">Дата:</span>
                <span className="value">
                  {new Date(order.createdAt).toLocaleString('uk-UA')}
                </span>
              </div>
              <div className="info-item">
                <span className="label">Статус:</span>
                <span className={`status status-${order.status}`}>
                  {statusLabels[order.status]}
                </span>
              </div>
              <div className="info-item">
                <span className="label">Сума:</span>
                <span className="value total">{order.totalAmount} грн</span>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="section">
            <h3>Клієнт</h3>
            {order.user ? (
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">Ім'я:</span>
                  <span className="value">{order.user.fullName}</span>
                </div>
                <div className="info-item">
                  <span className="label">Email:</span>
                  <span className="value">{order.user.email}</span>
                </div>
              </div>
            ) : (
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">Ім'я:</span>
                  <span className="value">{order.guestInfo?.fullName || '—'}</span>
                </div>
                <div className="info-item">
                  <span className="label">Email:</span>
                  <span className="value">{order.guestInfo?.email || '—'}</span>
                </div>
                <div className="info-item">
                  <span className="label">Телефон:</span>
                  <span className="value">{order.guestInfo?.phone || '—'}</span>
                </div>
                <div className="info-item">
                  <span className="label">Адреса:</span>
                  <span className="value">{order.guestInfo?.address || '—'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Comment */}
          {order.comment && (
            <div className="section">
              <h3>Коментар</h3>
              <div className="comment">{order.comment}</div>
            </div>
          )}

          {/* Items */}
          <div className="section">
            <h3>Товари ({order.items.length})</h3>
            <div className="items-list">
              {order.items.map((item) => (
                <div key={item._id} className="order-item">
                  <img src={item.product.image} alt={item.product.name} />
                  <div className="item-details">
                    <div className="item-name">{item.product.name}</div>
                    <div className="item-meta">
                      {item.quantity} шт × {item.price} грн
                    </div>
                  </div>
                  <div className="item-total">
                    {item.price * item.quantity} грн
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-close" onClick={onClose}>
            Закрити
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderDetailsModal;