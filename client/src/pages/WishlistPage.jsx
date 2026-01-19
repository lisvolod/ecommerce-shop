import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import ConfirmModal from '../components/ConfirmModal';
import { useState } from 'react';
import './WishlistPage.scss';

function WishlistPage() {
  const navigate = useNavigate();
  const { items, removeItem, clearWishlist } = useWishlist();
  const { addItem: addToCart } = useCart();
  const [showClearModal, setShowClearModal] = useState(false);

  const handleAddToCart = (product) => {
    addToCart(product, 1);
  };

  const handleRemove = (productId) => {
    removeItem(productId);
  };

  const handleClearAll = () => {
    clearWishlist();
    setShowClearModal(false);
  };

  if (items.length === 0) {
    return (
      <div className="wishlist-page">
        <div className="container">
          <div className="empty-wishlist">
            <Heart size={64} />
            <h2>Ваш список бажань порожній</h2>
            <p>Додайте товари, які вам сподобались</p>
            <button onClick={() => navigate('/')} className="btn-primary">
              До каталогу
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <div className="container">
        <div className="page-header">
          <h1>Список бажань ({items.length})</h1>
          <button 
            className="btn-clear-all"
            onClick={() => setShowClearModal(true)}
          >
            Очистити все
          </button>
        </div>

        <div className="wishlist-grid">
          {items.map((product) => {
            const finalPrice = product.discount > 0
              ? Math.round(product.price * (1 - product.discount / 100))
              : product.price;

            const isAvailable = product.stock > 0;

            return (
              <div key={product._id} className="wishlist-card">
                <div className="card-image" onClick={() => navigate(`/products/${product._id}`)}>
                  <img src={product.image} alt={product.name} />
                  {product.discount > 0 && (
                    <div className="discount-badge">-{product.discount}%</div>
                  )}
                  {!isAvailable && (
                    <div className="out-of-stock-overlay">Немає в наявності</div>
                  )}
                </div>

                <div className="card-content">
                  <h3 
                    className="card-title"
                    onClick={() => navigate(`/products/${product._id}`)}
                  >
                    {product.name}
                  </h3>

                  <p className="card-category">{product.category?.name}</p>

                  <div className="card-footer">
                    <div className="price-block">
                      {product.discount > 0 ? (
                        <>
                          <span className="price-old">{product.price} грн</span>
                          <span className="price-current">{finalPrice} грн</span>
                        </>
                      ) : (
                        <span className="price-current">{product.price} грн</span>
                      )}
                    </div>

                    <div className="card-actions">
                      <button
                        className="btn-cart"
                        onClick={() => handleAddToCart(product)}
                        disabled={!isAvailable}
                        title={isAvailable ? 'Додати в кошик' : 'Немає в наявності'}
                      >
                        <ShoppingCart size={18} />
                      </button>
                      <button
                        className="btn-remove"
                        onClick={() => handleRemove(product._id)}
                        title="Видалити зі списку"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <ConfirmModal
          isOpen={showClearModal}
          onClose={() => setShowClearModal(false)}
          onConfirm={handleClearAll}
          title="Очистити список бажань?"
          message={`Ви впевнені, що хочете видалити всі товари (${items.length} шт) зі списку бажань?`}
          confirmText="Очистити"
          cancelText="Скасувати"
          variant="danger"
        />
      </div>
    </div>
  );
}

export default WishlistPage;