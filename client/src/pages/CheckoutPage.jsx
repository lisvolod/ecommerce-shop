import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../api/orders';
import toast from 'react-hot-toast';
import './CheckoutPage.scss';

function CheckoutPage() {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    comment: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Очистити помилку при зміні
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!isAuthenticated) {
      // Для гостей всі поля обов'язкові
      if (!formData.fullName.trim()) {
        newErrors.fullName = "Ім'я обов'язкове";
      }
      if (!formData.email.trim()) {
        newErrors.email = 'Email обов\'язковий';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Невалідний email';
      }
      if (!formData.phone.trim()) {
        newErrors.phone = 'Телефон обов\'язковий';
      }
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Адреса обов\'язкова';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error('Кошик порожній');
      return;
    }

    if (!validateForm()) {
      toast.error('Заповніть всі обов\'язкові поля');
      return;
    }

    setIsSubmitting(true);

    try {
      // Підготувати товари з фінальними цінами
      const orderItems = items.map(item => {
        const price = item.product.discount > 0
          ? Math.round(item.product.price * (1 - item.product.discount / 100))
          : item.product.price;

        return {
          product: item.product._id,
          quantity: item.quantity,
          price,
        };
      });

      const orderData = {
        items: orderItems,
        comment: formData.comment,
      };

      // Для гостей додати guestInfo
      if (!isAuthenticated) {
        orderData.guestInfo = {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
        };
      } else {
        // Для авторизованих - адресу можна передати в коментарі
        // або створити окреме поле deliveryAddress
        orderData.comment = `Адреса: ${formData.address}\n${formData.comment}`.trim();
      }

      const response = await ordersAPI.createOrder(orderData);

      // Очистити кошик
      await clearCart();

      // Очистити localStorage для гостей
      if (!isAuthenticated) {
        localStorage.removeItem('cart');
      }

      toast.success('Замовлення успішно оформлено!');

      // Перенаправити на сторінку успіху
      navigate(`/order-success/${response.data._id}`);
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error(error.response?.data?.error || 'Помилка оформлення замовлення');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="empty-checkout">
            <h2>Кошик порожній</h2>
            <p>Додайте товари перед оформленням замовлення</p>
            <button onClick={() => navigate('/')} className="btn-primary">
              До каталогу
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <h1>Оформлення замовлення</h1>

        <div className="checkout-layout">
          {/* Форма */}
          <div className="checkout-form">
            <form onSubmit={handleSubmit}>
              <h2>Контактні дані</h2>

              {!isAuthenticated && (
                <>
                  <div className="form-group">
                    <label htmlFor="fullName">
                      Повне ім'я <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className={errors.fullName ? 'error' : ''}
                      placeholder="Іван Іваненко"
                    />
                    {errors.fullName && <span className="error-message">{errors.fullName}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">
                      Email <span className="required">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={errors.email ? 'error' : ''}
                      placeholder="email@example.com"
                    />
                    {errors.email && <span className="error-message">{errors.email}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">
                      Телефон <span className="required">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={errors.phone ? 'error' : ''}
                      placeholder="+380 XX XXX XX XX"
                    />
                    {errors.phone && <span className="error-message">{errors.phone}</span>}
                  </div>
                </>
              )}

              {isAuthenticated && (
                <div className="user-info">
                  <p><strong>Ім'я:</strong> {user.fullName}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                </div>
              )}

              <h2>Доставка</h2>

              <div className="form-group">
                <label htmlFor="address">
                  Адреса доставки <span className="required">*</span>
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={errors.address ? 'error' : ''}
                  placeholder="Місто, вулиця, будинок, квартира"
                  rows="3"
                />
                {errors.address && <span className="error-message">{errors.address}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="comment">Коментар (необов'язково)</label>
                <textarea
                  id="comment"
                  name="comment"
                  value={formData.comment}
                  onChange={handleChange}
                  placeholder="Додаткова інформація до замовлення"
                  rows="3"
                />
              </div>

              <button
                type="submit"
                className="btn-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Оформлення...' : 'Оформити замовлення'}
              </button>
            </form>
          </div>

          {/* Підсумок */}
          <div className="checkout-summary">
            <h2>Ваше замовлення</h2>

            <div className="summary-items">
              {items.map((item) => {
                const finalPrice = item.product.discount > 0
                  ? Math.round(item.product.price * (1 - item.product.discount / 100))
                  : item.product.price;

                return (
                  <div key={item.product._id} className="summary-item">
                    <img src={item.product.image} alt={item.product.name} />
                    <div className="item-details">
                      <p className="item-name">{item.product.name}</p>
                      <p className="item-quantity">{item.quantity} шт × {finalPrice} грн</p>
                    </div>
                    <p className="item-total">{finalPrice * item.quantity} грн</p>
                  </div>
                );
              })}
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row">
              <span>Товарів:</span>
              <span>{items.length}</span>
            </div>

            <div className="summary-row">
              <span>Кількість:</span>
              <span>{items.reduce((sum, item) => sum + item.quantity, 0)} шт</span>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-total">
              <span>До сплати:</span>
              <span>{totalPrice} грн</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;