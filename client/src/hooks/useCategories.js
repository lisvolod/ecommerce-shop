import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesAPI } from '../api/categories';
import toast from 'react-hot-toast';

/**
 * Hook для отримання списку категорій
 * Використовується в:
 * - CategoriesPage (admin)
 * - ProductsPage (admin) - для select категорій
 * - HomePage (public) - для фільтрів
 */
export function useCategories() {
    return useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const response = await categoriesAPI.getAll();
            return response.data;
        },
        staleTime: 5 * 60 * 1000, // 5 хвилин - категорії не часто змінюються
    });
}

/**
 * Hook для отримання однієї категорії по ID
 */
export function useCategory(id) {
    return useQuery({
        queryKey: ['category', id],
        queryFn: async () => {
            const response = await categoriesAPI.getById(id);
            return response.data;
        },
        enabled: !!id, // Виконувати тільки якщо є id
    });
}

/**
 * Hook для CRUD операцій з категоріями
 * Використовується в CategoriesPage
 */
export function useCategoryMutations() {
    const queryClient = useQueryClient();

    // Create
    const createMutation = useMutation({
        mutationFn: categoriesAPI.create,
        onSuccess: () => {
            queryClient.invalidateQueries(['categories']);
            toast.success('Категорію створено!');
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || 'Помилка створення категорії');
        },
    });

    // Update
    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => categoriesAPI.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['categories']);
            toast.success('Категорію оновлено!');
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || 'Помилка оновлення категорії');
        },
    });

    // Delete
    const deleteMutation = useMutation({
        mutationFn: categoriesAPI.delete,
        onSuccess: () => {
            queryClient.invalidateQueries(['categories']);
            toast.success('Категорію видалено!');
        },
        onError: (error) => {
            const errorMessage = error.response?.data?.error || 'Помилка видалення категорії';
            toast.error(errorMessage);
        },
    });

    return {
        createCategory: createMutation,
        updateCategory: updateMutation,
        deleteCategory: deleteMutation,
    };
}