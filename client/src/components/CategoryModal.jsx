import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import './ConfirmModal.scss';

function CategoryModal({ isOpen, onClose, onSubmit, category, loading }) {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const [errors, setErrors] = useState({});

  // Заповнюємо форму при редагуванні
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || ''
      });
    } else {
      setFormData({ name: '', description: '' });
    }
    setErrors({});
  }, [category, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Назва обов\'язкова';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Назва повинна містити мінімум 2 символи';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Назва повинна містити максимум 50 символів';
    }

    // Description validation
    if (formData.description && formData.description.length > 200) {
      newErrors.description = 'Опис повинен містити максимум 200 символів';
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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit({
        name: formData.name.trim(),
        description: formData.description.trim()
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h3>{category ? 'Редагувати категорію' : 'Додати категорію'}</h3>
          <button className="modal-close" onClick={onClose} disabled={loading}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Name field */}
            <div className="form-group">
              <label htmlFor="name">Назва категорії *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Наприклад: Процесори"
                className={errors.name ? 'error' : ''}
                disabled={loading}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            {/* Description field */}
            <div className="form-group">
              <label htmlFor="description">Опис</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Опис категорії (опціонально)"
                rows={4}
                className={errors.description ? 'error' : ''}
                disabled={loading}
              />
              {errors.description && <span className="error-message">{errors.description}</span>}
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
                category ? 'Зберегти' : 'Створити'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CategoryModal;