import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import ConfirmModal from '../components/ConfirmModal';
import toast from 'react-hot-toast';
import './CartPage.scss';

function CartPage() {
  const navigate = useNavigate();
  const { items, totalPrice, updateQuantity, removeItem, clearCart } = useCart();

  const [itemToRemove, setItemToRemove] = useState(null);
  const [showClearModal, setShowClearModal] = useState(false);

  const isEmpty = items.length === 0;

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const calculateItemPrice = (item) => {
    const price = item.product.discount > 0
      ? Math.round(item.product.price * (1 - item.product.discount / 100))
      : item.product.price;
    return price * item.quantity;
  };

  const handleRemoveClick = (item) => {
    setItemToRemove(item);
  };

  const handleDecreaseQuantity = (item) => {
    if (item.quantity === 1) {
      // Якщо кількість = 1, показуємо модалку підтвердження видалення
      setItemToRemove(item);
    } else {
      // Інакше просто зменшуємо кількість
      updateQuantity(item.product._id, item.quantity - 1);
    }
  };

  const handleConfirmRemove = () => {
    if (itemToRemove) {
      removeItem(itemToRemove.product._id);
      toast.success('Товар видалено з кошика');
      setItemToRemove(null);
    }
  };

  const handleClearClick = () => {
    setShowClearModal(true);
  };

  const handleConfirmClear = () => {
    clearCart();
    toast.success('Кошик очищено');
    setShowClearModal(false);
  };

  if (isEmpty) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="empty-cart">
            <ShoppingBag size={64} className="empty-icon" />
            <h2>Ваш кошик порожній</h2>
            <p>Додайте товари з каталогу</p>
            <Link to="/" className="btn-primary">
              Перейти до покупок
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        {/* Header */}
        <div className="cart-header">
          <h1>Кошик ({items.length} {items.length === 1 ? 'товар' : 'товари'})</h1>
          <button className="btn-clear" onClick={handleClearClick}>
            <Trash2 size={18} />
            Очистити кошик
          </button>
        </div>

        <div className="cart-layout">
          {/* Items */}
          <div className="cart-items">
            {items.map((item) => {
              const isOutOfStock = item.product.stock === 0;
              const finalPrice = item.product.discount > 0
                ? Math.round(item.product.price * (1 - item.product.discount / 100))
                : item.product.price;

              return (
                <div key={item.product._id} className={`cart-item ${isOutOfStock ? 'out-of-stock' : ''}`}>
                  {/* Image */}
                  <Link to={`/products/${item.product._id}`} className="item-image">
                    <img src={item.product.image} alt={item.product.name} />
                  </Link>

                  {/* Info */}
                  <div className="item-info">
                    <Link to={`/products/${item.product._id}`} className="item-name">
                      {item.product.name}
                    </Link>
                    <p className="item-category">{item.product.category?.name}</p>

                    {isOutOfStock && (
                      <span className="badge-out-of-stock">Немає в наявності</span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="item-price">
                    {item.product.discount > 0 ? (
                      <>
                        <span className="price-original">{item.product.price} грн</span>
                        <span className="price-final">{finalPrice} грн</span>
                      </>
                    ) : (
                      <span className="price-final">{item.product.price} грн</span>
                    )}
                  </div>

                  {/* Quantity */}
                  <div className="item-quantity">
                    <button
                      className="btn-quantity"
                      onClick={() => handleDecreaseQuantity(item)}
                      disabled={isOutOfStock}
                    >
                      <Minus size={16} />
                    </button>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        updateQuantity(item.product._id, val);
                      }}
                      min="1"
                      max={item.product.stock}
                      disabled={isOutOfStock}
                    />
                    <button
                      className="btn-quantity"
                      onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                      disabled={isOutOfStock || item.quantity >= item.product.stock}
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  {/* Total */}
                  <div className="item-total">
                    {calculateItemPrice(item)} грн
                  </div>

                  {/* Remove */}
                  <button
                    className="btn-remove"
                    onClick={() => handleRemoveClick(item)}
                    title="Видалити"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="cart-summary">
            <h3>Разом</h3>
            
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

            <button className="btn-checkout" onClick={handleCheckout}>
              Оформити замовлення
            </button>

            <Link to="/" className="btn-continue">
              <ArrowLeft size={18} />
              Продовжити покупки
            </Link>
          </div>
        </div>
      </div>

      {/* Confirm Remove Item Modal */}
      <ConfirmModal
        isOpen={!!itemToRemove}
        onClose={() => setItemToRemove(null)}
        onConfirm={handleConfirmRemove}
        title="Видалити товар?"
        message={`Ви впевнені, що хочете видалити "${itemToRemove?.product.name}" з кошика?`}
        confirmText="Видалити"
        cancelText="Скасувати"
        variant="danger"
      />

      {/* Confirm Clear Cart Modal */}
      <ConfirmModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={handleConfirmClear}
        title="Очистити кошик?"
        message={`Ви впевнені, що хочете видалити всі товари (${items.length}) з кошика?`}
        confirmText="Очистити"
        cancelText="Скасувати"
        variant="danger"
      />
    </div>
  );
}

export default CartPage;