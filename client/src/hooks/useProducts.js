import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsAPI } from '../api/products';
import toast from 'react-hot-toast';

/**
 * Hook для отримання списку товарів з фільтрами
 * @param {Object} options - Параметри запиту
 * @param {boolean} options.admin - Режим адмінки (всі товари без пагінації)
 * @param {number} options.page - Номер сторінки (для публічної частини)
 * @param {number} options.limit - Кількість товарів на сторінці
 * @param {string} options.category - ID категорії для фільтрації
 * @param {string} options.search - Текст пошуку
 * @param {string} options.sort - Сортування
 */
export function useProducts(options = {}) {
  const { admin = false, ...filters } = options;
  
  // Для адмінки - всі товари, для публічної - пагінація
  const queryParams = admin 
    ? { ...filters, limit: 1000, page: 1 }
    : { limit: 12, page: 1, ...filters };

  return useQuery({
    queryKey: ['products', queryParams],
    queryFn: async () => {
      const response = await productsAPI.getAll(queryParams);
      
      // Для публічної частини повертаємо і products і pagination
      if (!admin) {
        return {
          products: response.data.products || response.data,
          pagination: response.data.pagination || {}
        };
      }
      
      // Для адмінки тільки products
      return response.data.products || response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 хвилини
  });
}

/**
 * Hook для отримання одного товару по ID
 */
export function useProduct(id) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await productsAPI.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
}

/**
 * Hook для CRUD операцій з товарами
 */
export function useProductMutations() {
  const queryClient = useQueryClient();

  // Create
  const createMutation = useMutation({
    mutationFn: productsAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      queryClient.invalidateQueries(['categories']); // Оновити productCount
      toast.success('Товар створено!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Помилка створення товару');
    },
  });

  // Update
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => productsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      queryClient.invalidateQueries(['categories']); // Оновити productCount
      toast.success('Товар оновлено!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Помилка оновлення товару');
    },
  });

  // Delete
  const deleteMutation = useMutation({
    mutationFn: productsAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      queryClient.invalidateQueries(['categories']); // Оновити productCount
      toast.success('Товар видалено!');
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.error || 'Помилка видалення товару';
      toast.error(errorMessage);
    },
  });

  return {
    createProduct: createMutation,
    updateProduct: updateMutation,
    deleteProduct: deleteMutation,
  };
}