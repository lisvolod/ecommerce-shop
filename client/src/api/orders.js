import api from './axios';

export const ordersAPI = {
  // Створити замовлення
  createOrder: (data) => api.post('/orders', data),

  // Отримати замовлення користувача
  getOrders: (status) => api.get('/orders', { params: { status } }),

  // Отримати замовлення за ID
  getOrderById: (id) => api.get(`/orders/${id}`),

  // Оновити статус (admin)
  updateOrderStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),

  // Видалити замовлення (admin)
  deleteOrder: (id) => api.delete(`/orders/${id}`),
};