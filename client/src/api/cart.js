import api from './axios';

export const cartAPI = {
  // Отримати кошик користувача
  getCart: () => api.get('/cart'),

  // Додати товар
  addItem: (productId, quantity = 1) => 
    api.post('/cart/items', { productId, quantity }),

  // Оновити кількість
  updateItem: (productId, quantity) => 
    api.patch(`/cart/items/${productId}`, { quantity }),

  // Видалити товар
  removeItem: (productId) => 
    api.delete(`/cart/items/${productId}`),

  // Очистити кошик
  clearCart: () => 
    api.delete('/cart'),

  // Синхронізувати з localStorage (мердж)
  syncCart: (items) => 
    api.post('/cart/sync', { items }),
};