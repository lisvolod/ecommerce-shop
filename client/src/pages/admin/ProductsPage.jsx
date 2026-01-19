import { useState, useMemo } from 'react';
import { Edit2, Trash2, Package, Search } from 'lucide-react';
import { useProducts, useProductMutations } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import ProductModal from '../../components/ProductModal';
import ConfirmModal from '../../components/ConfirmModal';
import TableSkeleton from '../../components/TableSkeleton';
import './ProductsPage.scss';

function ProductsPage() {
  const [filters, setFilters] = useState({
    category: '',
    status: 'all',
    search: ''
  });
  
  const [sortConfig, setSortConfig] = useState({
    field: 'createdAt',
    direction: 'desc' // newest first
  });

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);

  // Fetch data
  const { data: products, isLoading } = useProducts({ admin: true });
  const { data: categories } = useCategories();
  const { createProduct, updateProduct, deleteProduct } = useProductMutations();

  // Фільтрація та сортування
  const filteredAndSortedProducts = useMemo(() => {
    if (!products) return [];

    let filtered = [...products];

    // Фільтр по категорії
    if (filters.category) {
      filtered = filtered.filter(p => {
        const productCategoryId = p.category?._id || p.category;
        const filterCategoryId = filters.category;
        
        // Порівнюємо обидва як строки (для надійності)
        return String(productCategoryId) === String(filterCategoryId);
      });
    }

    // Фільтр по статусу
    if (filters.status === 'in-stock') {
      filtered = filtered.filter(p => p.stock > 0);
    } else if (filters.status === 'out-of-stock') {
      filtered = filtered.filter(p => p.stock === 0);
    }

    // Пошук по назві (case-insensitive, часткове співпадіння)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchLower)
      );
    }

    // Сортування
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortConfig.field) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'stock':
          aValue = a.stock;
          bValue = b.stock;
          break;
        case 'createdAt':
        default:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [products, filters, sortConfig]);

  // Handlers
  const handleCreate = () => {
    // Перевірка чи є категорії
    if (!categories || categories.length === 0) {
      return; // Empty state покаже повідомлення
    }
    setSelectedProduct(null);
    setIsProductModalOpen(true);
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const handleDelete = (product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const handleProductSubmit = (formData) => {
    if (selectedProduct) {
      // Update
      updateProduct.mutate(
        { id: selectedProduct._id, data: formData },
        {
          onSuccess: () => {
            setIsProductModalOpen(false);
            setSelectedProduct(null);
          }
        }
      );
    } else {
      // Create
      createProduct.mutate(formData, {
        onSuccess: () => {
          setIsProductModalOpen(false);
        }
      });
    }
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      deleteProduct.mutate(productToDelete._id, {
        onSuccess: () => {
          setIsDeleteModalOpen(false);
          setProductToDelete(null);
        },
        onError: () => {
          setIsDeleteModalOpen(false);
          setProductToDelete(null);
        }
      });
    }
  };

  const handleSort = (field) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (field) => {
    if (sortConfig.field !== field) return '↕';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  const calculateFinalPrice = (price, discount) => {
    if (discount > 0) {
      return Math.round(price * (1 - discount / 100));
    }
    return price;
  };

  // Empty state - немає категорій
  if (!isLoading && (!categories || categories.length === 0)) {
    return (
      <div className="admin-page products-page">
        <div className="page-header">
          <h1>Товари</h1>
        </div>

        <div className="empty-state">
          <Package size={64} className="empty-icon" />
          <h3>Спочатку створіть категорію</h3>
          <p>Для додавання товарів необхідно мати хоча б одну категорію</p>
          <a href="/admin/categories" className="btn-primary">
            Перейти до категорій
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page products-page">
      {/* Page Header */}
      <div className="page-header">
        <h1>Товари</h1>
        <div className="header-actions">
          <button className="btn-primary" onClick={handleCreate}>
            + Додати товар
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        {/* Category filter */}
        <select
          value={filters.category}
          onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
          className="filter-select"
        >
          <option value="">Всі категорії</option>
          {categories?.map(cat => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>

        {/* Status filter */}
        <select
          value={filters.status}
          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          className="filter-select"
        >
          <option value="all">Всі статуси</option>
          <option value="in-stock">В наявності</option>
          <option value="out-of-stock">Немає на складі</option>
        </select>

        {/* Search */}
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Пошук за назвою..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && <TableSkeleton rows={5} columns={7} />}

      {/* Empty State - немає товарів взагалі */}
      {!isLoading && (!products || products.length === 0) && (
        <div className="empty-state">
          <Package size={64} className="empty-icon" />
          <h3>Товарів ще немає</h3>
          <p>Створіть перший товар для вашого магазину</p>
          <button className="btn-primary" onClick={handleCreate}>
            + Додати товар
          </button>
        </div>
      )}

      {/* Empty State - фільтр нічого не знайшов */}
      {!isLoading && products && products.length > 0 && filteredAndSortedProducts.length === 0 && (
        <div className="empty-state">
          <Package size={64} className="empty-icon" />
          <h3>Товарів не знайдено</h3>
          <p>Спробуйте змінити параметри фільтрації</p>
          <button 
            className="btn-secondary" 
            onClick={() => setFilters({ category: '', status: 'all', search: '' })}
          >
            Скинути фільтри
          </button>
        </div>
      )}

      {/* Table */}
      {!isLoading && filteredAndSortedProducts.length > 0 && (
        <div className="table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th>Фото</th>
                <th className="sortable" onClick={() => handleSort('name')}>
                  Назва {getSortIcon('name')}
                </th>
                <th>Категорія</th>
                <th className="sortable" onClick={() => handleSort('price')}>
                  Ціна {getSortIcon('price')}
                </th>
                <th>Знижка</th>
                <th className="sortable" onClick={() => handleSort('stock')}>
                  Склад {getSortIcon('stock')}
                </th>
                <th>Статус</th>
                <th>Дії</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedProducts.map((product) => {
                const finalPrice = calculateFinalPrice(product.price, product.discount);
                const hasDiscount = product.discount > 0;

                return (
                  <tr key={product._id}>
                    <td className="product-image">
                      <img src={product.image} alt={product.name} />
                    </td>
                    
                    <td className="product-name">
                      <span>{product.name}</span>
                    </td>
                    
                    <td className="product-category">
                      {product.category?.name || '—'}
                    </td>
                    
                    <td className="product-price">
                      {hasDiscount ? (
                        <>
                          <span className="original-price">{product.price} грн</span>
                          <span className="final-price">{finalPrice} грн</span>
                        </>
                      ) : (
                        <span>{product.price} грн</span>
                      )}
                    </td>
                    
                    <td className="product-discount">
                      {product.discount > 0 ? (
                        <span className="discount-badge">-{product.discount}%</span>
                      ) : (
                        '—'
                      )}
                    </td>
                    
                    <td className="product-stock">
                      {product.stock}
                    </td>
                    
                    <td className="product-status">
                      {product.stock > 0 ? (
                        <span className="status-badge in-stock">В наявності</span>
                      ) : (
                        <span className="status-badge out-of-stock">Немає на складі</span>
                      )}
                    </td>
                    
                    <td className="product-actions">
                      <button
                        className="btn-icon btn-edit"
                        onClick={() => handleEdit(product)}
                        title="Редагувати"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => handleDelete(product)}
                        title="Видалити"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Product Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setSelectedProduct(null);
        }}
        onSubmit={handleProductSubmit}
        product={selectedProduct}
        loading={createProduct.isPending || updateProduct.isPending}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setProductToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Видалити товар?"
        message={`Ви впевнені, що хочете видалити товар "${productToDelete?.name}"?`}
        confirmText="Видалити"
        cancelText="Скасувати"
        variant="danger"
        loading={deleteProduct.isPending}
      />
    </div>
  );
}

export default ProductsPage;