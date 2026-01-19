import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import TableSkeleton from '../components/TableSkeleton';
import './HomePage.scss';

function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Читаємо параметри з URL
  const page = Number(searchParams.get('page')) || 1;
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '-createdAt';
  const search = searchParams.get('search') || '';

  // Локальний state для пошуку (щоб не оновлювати URL при кожному символі)
  const [searchInput, setSearchInput] = useState(search);

  // Fetch data
  const { data, isLoading } = useProducts({ page, category, sort, search, admin: false });
  const { data: categories } = useCategories();

  const products = data?.products || [];
  const pagination = data?.pagination || {};

  // Оновлюємо searchInput коли змінюється URL параметр search
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // Handlers
  const handleFilterChange = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    
    // При зміні фільтрів скидаємо на 1 сторінку
    if (key !== 'page') {
      newParams.set('page', '1');
    }
    
    setSearchParams(newParams);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    handleFilterChange('search', searchInput);
  };

  const handlePageChange = (newPage) => {
    handleFilterChange('page', newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetFilters = () => {
    setSearchParams({});
    setSearchInput('');
  };

  // Sort options
  const sortOptions = [
    { value: '-createdAt', label: 'Новинки' },
    { value: 'price', label: 'Від дешевих' },
    { value: '-price', label: 'Від дорогих' },
    { value: 'name', label: 'За назвою (A-Z)' },
    { value: '-name', label: 'За назвою (Z-A)' },
  ];

  return (
    <div className="home-page">
      <div className="container">
        {/* Filters Bar */}
        <div className="filters-bar">
          {/* Category filter */}
          <select
            value={category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="filter-select"
          >
            <option value="">Всі категорії</option>
            {categories?.map(cat => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Sort filter */}
          <select
            value={sort}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            className="filter-select"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Search */}
          <form className="search-box" onSubmit={handleSearch}>
            <Search size={18} />
            <input
              type="text"
              placeholder="Пошук товарів..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button type="submit" className="btn-search">
              Шукати
            </button>
          </form>
        </div>

        {/* Active filters info */}
        {(category || search) && (
          <div className="active-filters">
            <span>Активні фільтри:</span>
            {category && (
              <span className="filter-tag">
                Категорія: {categories?.find(c => c._id === category)?.name}
              </span>
            )}
            {search && (
              <span className="filter-tag">
                Пошук: "{search}"
              </span>
            )}
            <button className="btn-reset" onClick={handleResetFilters}>
              Скинути всі
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="products-loading">
            <TableSkeleton rows={3} columns={4} />
          </div>
        )}

        {/* Empty State - немає товарів */}
        {!isLoading && products.length === 0 && !search && !category && (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>Товарів поки немає</h3>
            <p>Зачекайте, незабаром з'являться нові товари</p>
          </div>
        )}

        {/* Empty State - пошук не знайшов */}
        {!isLoading && products.length === 0 && (search || category) && (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>Нічого не знайдено</h3>
            <p>Спробуйте змінити параметри пошуку</p>
            <button className="btn-primary" onClick={handleResetFilters}>
              Скинути фільтри
            </button>
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && products.length > 0 && (
          <>
            <div className="products-grid">
              {products.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={pagination.page || 1}
              totalPages={pagination.pages || 1}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default HomePage;