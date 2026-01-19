import api from './axios';

export const wishlistAPI = {
  // Отримати wishlist користувача
  getWishlist: () => api.get('/wishlist'),

  // Додати товар
  addItem: (productId) => 
    api.post('/wishlist/items', { productId }),

  // Toggle товар (додати/видалити)
  toggleItem: (productId) => 
    api.post('/wishlist/toggle', { productId }),

  // Видалити товар
  removeItem: (productId) => 
    api.delete(`/wishlist/items/${productId}`),

  // Очистити wishlist
  clearWishlist: () => 
    api.delete('/wishlist'),
};