import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Pagination.scss';

function Pagination({ currentPage, totalPages, onPageChange }) {
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  const handlePrevious = () => {
    if (hasPrev) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      onPageChange(currentPage + 1);
    }
  };

  // Якщо тільки 1 сторінка - не показуємо пагінацію
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="pagination">
      <button 
        className="pagination-btn"
        onClick={handlePrevious}
        disabled={!hasPrev}
      >
        <ChevronLeft size={18} />
        Попередня
      </button>

      <span className="pagination-info">
        Сторінка {currentPage} з {totalPages}
      </span>

      <button 
        className="pagination-btn"
        onClick={handleNext}
        disabled={!hasNext}
      >
        Наступна
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

export default Pagination;