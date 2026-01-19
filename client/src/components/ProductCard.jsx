import { Link } from 'react-router-dom';
import { ShoppingCart, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './ProductCard.scss';

function ProductCard({ product }) {
  const { addItem } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  
  const isOutOfStock = product.stock === 0;
  const hasDiscount = product.discount > 0;
  const inWishlist = isInWishlist(product._id);
  
  const finalPrice = hasDiscount
    ? Math.round(product.price * (1 - product.discount / 100))
    : product.price;

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!isOutOfStock) {
      addItem(product, 1);
    }
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Увійдіть, щоб додати в список бажань');
      return;
    }

    toggleItem(product);
  };

  return (
    <div className={`product-card ${isOutOfStock ? 'out-of-stock' : ''}`}>
      <Link to={`/products/${product._id}`} className="product-link">
        {/* Image */}
        <div className="product-image">
          <img src={product.image} alt={product.name} />
          
          {/* Badges */}
          <div className="product-badges">
            {isOutOfStock && (
              <span className="badge badge-out-of-stock">Немає в наявності</span>
            )}
            {hasDiscount && !isOutOfStock && (
              <span className="badge badge-discount">-{product.discount}%</span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>
          <p className="product-category">{product.category?.name}</p>
          
          {/* Price */}
          <div className="product-price">
            {hasDiscount ? (
              <>
                <span className="price-original">{product.price} грн</span>
                <span className="price-final">{finalPrice} грн</span>
              </>
            ) : (
              <span className="price-final">{product.price} грн</span>
            )}
          </div>
        </div>
      </Link>

      {/* Actions */}
      <div className="product-actions">
        <button 
          className="btn-cart"
          disabled={isOutOfStock}
          onClick={handleAddToCart}
        >
          <ShoppingCart size={18} />
          В кошик
        </button>
        
        <button 
          className={`btn-wishlist-card ${inWishlist ? 'active' : ''}`}
          onClick={handleToggleWishlist}
          title={inWishlist ? 'Видалити зі списку бажань' : 'Додати в список бажань'}
        >
          <Heart size={20} fill={inWishlist ? 'currentColor' : 'none'} />
        </button>
      </div>
    </div>
  );
}

export default ProductCard;