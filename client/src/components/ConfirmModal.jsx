import { X } from 'lucide-react';
import './ConfirmModal.scss';

function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Підтвердити',
  cancelText = 'Скасувати',
  variant = 'danger', // 'danger' | 'primary' | 'warning'
  loading = false
}) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <p>{message}</p>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button 
            className="btn-secondary" 
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button 
            className={`btn-${variant}`}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Завантаження...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;