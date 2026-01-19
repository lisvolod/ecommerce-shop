import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useCategories } from '../hooks/useCategories';
import './ConfirmModal.scss';
import './ProductModal.scss';

function ProductModal({ isOpen, onClose, onSubmit, product, loading }) {
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discount: '',
    stock: '',
    category: '',
    image: '',
    images: []
  });

  const [errors, setErrors] = useState({});
  const [imageInputs, setImageInputs] = useState(['']); // Масив URL для inputs

  // Заповнюємо форму при редагуванні
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        discount: product.discount || '',
        stock: product.stock || '',
        category: product.category?._id || product.category || '',
        image: product.image || '',
        images: product.images || []
      });
      
      // Ініціалізуємо inputs для зображень
      const allImages = [product.image || '', ...(product.images || [])];
      setImageInputs(allImages.length > 0 ? allImages : ['']);
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        discount: '',
        stock: '',
        category: '',
        image: '',
        images: []
      });
      setImageInputs(['']);
    }
    setErrors({});
  }, [product, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Назва обов\'язкова';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Назва повинна містити мінімум 2 символи';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Назва повинна містити максимум 100 символів';
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = 'Опис обов\'язковий';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Опис повинен містити мінімум 10 символів';
    } else if (formData.description.trim().length > 500) {
      newErrors.description = 'Опис повинен містити максимум 500 символів';
    }

    // Price validation
    if (!formData.price) {
      newErrors.price = 'Ціна обов\'язкова';
    } else if (isNaN(formData.price) || Number(formData.price) < 0) {
      newErrors.price = 'Ціна повинна бути числом >= 0';
    }

    // Stock validation
    if (!formData.stock && formData.stock !== 0) {
      newErrors.stock = 'Кількість на складі обов\'язкова';
    } else if (isNaN(formData.stock) || Number(formData.stock) < 0) {
      newErrors.stock = 'Кількість повинна бути числом >= 0';
    }

    // Discount validation
    if (formData.discount !== '' && formData.discount !== undefined) {
      if (isNaN(formData.discount) || Number(formData.discount) < 0 || Number(formData.discount) > 100) {
        newErrors.discount = 'Знижка повинна бути від 0 до 100';
      }
    }

    // Category validation
    if (!formData.category) {
      newErrors.category = 'Категорія обов\'язкова';
    }

    // Images validation - хоча б одне зображення
    const validImages = imageInputs.filter(img => img.trim() !== '');
    if (validImages.length === 0) {
      newErrors.image = 'Потрібно хоча б одне зображення';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Очищаємо помилку при зміні
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageChange = (index, value) => {
    const newImages = [...imageInputs];
    newImages[index] = value;
    setImageInputs(newImages);
    
    // Очищаємо помилку зображень
    if (errors.image) {
      setErrors(prev => ({ ...prev, image: '' }));
    }
  };

  const handleAddImage = () => {
    if (imageInputs.length < 5) {
      setImageInputs([...imageInputs, '']);
    }
  };

  const handleRemoveImage = (index) => {
    const newImages = imageInputs.filter((_, i) => i !== index);
    setImageInputs(newImages.length > 0 ? newImages : ['']);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      // Фільтруємо валідні зображення
      const validImages = imageInputs.filter(img => img.trim() !== '');
      const [mainImage, ...additionalImages] = validImages;

      const submitData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        discount: formData.discount ? Number(formData.discount) : 0,
        stock: Number(formData.stock),
        category: formData.category,
        image: mainImage,
        images: additionalImages
      };

      onSubmit(submitData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content product-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h3>{product ? 'Редагувати товар' : 'Додати товар'}</h3>
          <button className="modal-close" onClick={onClose} disabled={loading}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Name field */}
            <div className="form-group">
              <label htmlFor="name">Назва товару *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Наприклад: Ноутбук ASUS ROG"
                className={errors.name ? 'error' : ''}
                disabled={loading}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            {/* Description field */}
            <div className="form-group">
              <label htmlFor="description">Опис *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Детальний опис товару"
                rows={4}
                className={errors.description ? 'error' : ''}
                disabled={loading}
              />
              {errors.description && <span className="error-message">{errors.description}</span>}
            </div>

            {/* Category field */}
            <div className="form-group">
              <label htmlFor="category">Категорія *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={errors.category ? 'error' : ''}
                disabled={loading || categoriesLoading}
              >
                <option value="">Оберіть категорію</option>
                {categories?.map(cat => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.category && <span className="error-message">{errors.category}</span>}
            </div>

            {/* Price and Discount */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price">Ціна (грн) *</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className={errors.price ? 'error' : ''}
                  disabled={loading}
                />
                {errors.price && <span className="error-message">{errors.price}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="discount">Знижка (%)</label>
                <input
                  type="number"
                  id="discount"
                  name="discount"
                  value={formData.discount}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  max="100"
                  className={errors.discount ? 'error' : ''}
                  disabled={loading}
                />
                {errors.discount && <span className="error-message">{errors.discount}</span>}
              </div>
            </div>

            {/* Stock field */}
            <div className="form-group">
              <label htmlFor="stock">Кількість на складі *</label>
              <input
                type="number"
                id="stock"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                placeholder="0"
                min="0"
                className={errors.stock ? 'error' : ''}
                disabled={loading}
              />
              {errors.stock && <span className="error-message">{errors.stock}</span>}
            </div>

            {/* Images field */}
            <div className="form-group">
              <label>Зображення * (перше - головне)</label>
              {imageInputs.map((image, index) => (
                <div key={index} className="image-input-row">
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => handleImageChange(index, e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className={errors.image && index === 0 ? 'error' : ''}
                    disabled={loading}
                  />
                  {imageInputs.length > 1 && (
                    <button
                      type="button"
                      className="btn-icon btn-delete-small"
                      onClick={() => handleRemoveImage(index)}
                      disabled={loading}
                      title="Видалити"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                  {/* Preview */}
                  {image && (
                    <div className="image-preview">
                      <img 
                        src={image} 
                        alt={`Preview ${index + 1}`}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                        onLoad={(e) => {
                          e.target.style.display = 'block';
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
              
              {imageInputs.length < 5 && (
                <button
                  type="button"
                  className="btn-secondary btn-add-image"
                  onClick={handleAddImage}
                  disabled={loading}
                >
                  <Plus size={16} />
                  Додати інше зображення
                </button>
              )}
              
              {errors.image && <span className="error-message">{errors.image}</span>}
              <small className="form-hint">Максимум 5 зображень</small>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={onClose}
              disabled={loading}
            >
              Скасувати
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Збереження...
                </>
              ) : (
                product ? 'Зберегти' : 'Створити'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductModal;