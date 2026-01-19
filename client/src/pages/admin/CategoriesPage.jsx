import { useState } from 'react';
import { Edit2, Trash2, FolderOpen } from 'lucide-react';
import { useCategories, useCategoryMutations } from '../../hooks/useCategories.js';
import CategoryModal from '../../components/CategoryModal';
import ConfirmModal from '../../components/ConfirmModal';
import TableSkeleton from '../../components/TableSkeleton';
import './CategoriesPage.scss';

function CategoriesPage() {
  // Custom hooks
  const { data: categories, isLoading } = useCategories();
  const { createCategory, updateCategory, deleteCategory } = useCategoryMutations();
  
  // Modals state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // Handlers
  const handleCreate = () => {
    setSelectedCategory(null);
    setIsCategoryModalOpen(true);
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setIsCategoryModalOpen(true);
  };

  const handleDelete = (category) => {
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  };

  const handleCategorySubmit = (formData) => {
    if (selectedCategory) {
      // Update
      updateCategory.mutate(
        { id: selectedCategory._id, data: formData },
        {
          onSuccess: () => {
            setIsCategoryModalOpen(false);
            setSelectedCategory(null);
          }
        }
      );
    } else {
      // Create
      createCategory.mutate(formData, {
        onSuccess: () => {
          setIsCategoryModalOpen(false);
        }
      });
    }
  };

  const handleConfirmDelete = () => {
    if (categoryToDelete) {
      deleteCategory.mutate(categoryToDelete._id, {
        onSuccess: () => {
          setIsDeleteModalOpen(false);
          setCategoryToDelete(null);
        },
        onError: () => {
          setIsDeleteModalOpen(false);
          setCategoryToDelete(null);
        }
      });
    }
  };

  const handleCloseCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setSelectedCategory(null);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setCategoryToDelete(null);
  };

  // Sort categories by name
  const sortedCategories = categories?.sort((a, b) => 
    a.name.localeCompare(b.name, 'uk')
  );

  return (
    <div className="admin-page categories-page">
      {/* Page Header */}
      <div className="page-header">
        <h1>Категорії</h1>
        <div className="header-actions">
          <button className="btn-primary" onClick={handleCreate}>
            + Додати категорію
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && <TableSkeleton rows={5} columns={4} />}

      {/* Empty State */}
      {!isLoading && (!sortedCategories || sortedCategories.length === 0) && (
        <div className="empty-state">
          <FolderOpen size={64} className="empty-icon" />
          <h3>Категорій ще немає</h3>
          <p>Створіть першу категорію для вашого магазину</p>
          <button className="btn-primary" onClick={handleCreate}>
            + Додати категорію
          </button>
        </div>
      )}

      {/* Table */}
      {!isLoading && sortedCategories && sortedCategories.length > 0 && (
        <div className="table-container">
          <table className="categories-table">
            <thead>
              <tr>
                <th>Назва</th>
                <th>Опис</th>
                <th>Товарів</th>
                <th>Дії</th>
              </tr>
            </thead>
            <tbody>
              {sortedCategories.map((category) => (
                <tr key={category._id}>
                  <td className="category-name">
                    <FolderOpen size={18} />
                    <span>{category.name}</span>
                  </td>
                  <td className="category-description">
                    {category.description || '—'}
                  </td>
                  <td className="category-count">
                    {category.productCount || 0}
                  </td>
                  <td className="category-actions">
                    <button
                      className="btn-icon btn-edit"
                      onClick={() => handleEdit(category)}
                      title="Редагувати"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      className="btn-icon btn-delete"
                      onClick={() => handleDelete(category)}
                      title="Видалити"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Category Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={handleCloseCategoryModal}
        onSubmit={handleCategorySubmit}
        category={selectedCategory}
        loading={createCategory.isPending || updateCategory.isPending}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Видалити категорію?"
        message={`Ви впевнені, що хочете видалити категорію "${categoryToDelete?.name}"? ${
          categoryToDelete?.productCount > 0 
            ? `\n\nУ цій категорії є ${categoryToDelete.productCount} товар(ів). Спочатку видаліть усі товари з цієї категорії.`
            : ''
        }`}
        confirmText="Видалити"
        cancelText="Скасувати"
        variant="danger"
        loading={deleteCategory.isPending}
      />
    </div>
  );
}

export default CategoriesPage;