import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, ChevronLeft, Minus, Plus } from 'lucide-react';
import { useProduct } from '../hooks/useProducts';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './ProductPage.scss';

function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: product, isLoading, error } = useProduct(id);
  const { addItem } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (isLoading) {
    return (
      <div className="product-page">
        <div className="container">
          <div className="loading">Завантаження...</div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-page">
        <div className="container">
          <div className="error-state">
            <h2>Товар не знайдено</h2>
            <p>Можливо товар був видалений або посилання неправильне</p>
            <button className="btn-primary" onClick={() => navigate('/')}>
              На головну
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stock === 0;
  const hasDiscount = product.discount > 0;
  const inWishlist = isInWishlist(product._id);
  const finalPrice = hasDiscount
    ? Math.round(product.price * (1 - product.discount / 100))
    : product.price;

  // Всі зображення: головне + додаткові
  const allImages = [product.image, ...(product.images || [])].filter(Boolean);

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    addItem(product, quantity);
  };

  const handleToggleWishlist = () => {
    if (!isAuthenticated) {
      toast.error('Увійдіть, щоб додати в список бажань');
      return;
    }
    toggleItem(product);
  };

  return (
    <div className="product-page">
      <div className="container">
        {/* Back button */}
        <button className="btn-back" onClick={() => navigate(-1)}>
          <ChevronLeft size={20} />
          Назад
        </button>

        <div className="product-layout">
          {/* Gallery */}
          <div className="product-gallery">
            {/* Main Image */}
            <div className="main-image">
              <img src={allImages[selectedImage]} alt={product.name} />
              
              {/* Badges */}
              {hasDiscount && !isOutOfStock && (
                <div className="discount-badge">-{product.discount}%</div>
              )}
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="thumbnails">
                {allImages.map((img, index) => (
                  <button
                    key={index}
                    className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img src={img} alt={`${product.name} ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="product-info">
            {/* Category */}
            <div className="product-category">{product.category?.name}</div>

            {/* Title */}
            <h1 className="product-title">{product.name}</h1>

            {/* Price */}
            <div className="product-pricing">
              {hasDiscount ? (
                <>
                  <div className="price-original">{product.price} грн</div>
                  <div className="price-final">{finalPrice} грн</div>
                  <div className="discount-amount">
                    Ви економите {product.price - finalPrice} грн
                  </div>
                </>
              ) : (
                <div className="price-final">{product.price} грн</div>
              )}
            </div>

            {/* Stock */}
            <div className="product-stock">
              {isOutOfStock ? (
                <span className="stock-out">Немає в наявності</span>
              ) : (
                <span className="stock-in">
                  Є в наявності ({product.stock} шт)
                </span>
              )}
            </div>

            {/* Quantity selector */}
            {!isOutOfStock && (
              <div className="quantity-selector">
                <label>Кількість:</label>
                <div className="quantity-controls">
                  <button 
                    className="btn-quantity"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                  >
                    <Minus size={16} />
                  </button>
                  <input 
                    type="number" 
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      if (val >= 1 && val <= product.stock) {
                        setQuantity(val);
                      }
                    }}
                    min="1"
                    max={product.stock}
                  />
                  <button 
                    className="btn-quantity"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stock}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="product-actions">
              <button 
                className="btn-add-to-cart"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
              >
                <ShoppingCart size={20} />
                {isOutOfStock ? 'Немає в наявності' : 'Додати в кошик'}
              </button>

              <button 
                className={`btn-wishlist-page ${inWishlist ? 'active' : ''}`}
                onClick={handleToggleWishlist}
                title={inWishlist ? 'Видалити зі списку бажань' : 'Додати в список бажань'}
              >
                <Heart size={20} fill={inWishlist ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Description */}
            <div className="product-description">
              <h3>Опис</h3>
              <p>{product.description}</p>
            </div>

            {/* Specifications */}
            <div className="product-specs">
              <h3>Характеристики</h3>
              <div className="specs-grid">
                <div className="spec-row">
                  <span className="spec-label">Категорія:</span>
                  <span className="spec-value">{product.category?.name}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Наявність:</span>
                  <span className="spec-value">
                    {isOutOfStock ? 'Немає' : `${product.stock} шт`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductPage;