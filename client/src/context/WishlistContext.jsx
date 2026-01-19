import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { wishlistAPI } from '../api/wishlist';
import toast from 'react-hot-toast';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const [items, setItems] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Завантажити wishlist при ініціалізації
  useEffect(() => {
    const initWishlist = async () => {
      if (isAuthenticated) {
        try {
          const response = await wishlistAPI.getWishlist();
          setItems(response.data.items || []);
        } catch (error) {
          console.error('Error loading wishlist:', error);
          setItems([]);
        }
      } else {
        // Гість - завантажуємо з localStorage
        loadFromLocalStorage();
      }
      
      setIsInitialized(true);
    };

    initWishlist();
  }, [isAuthenticated, user?._id]);

  // Функція завантаження з localStorage
  const loadFromLocalStorage = () => {
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      try {
        const parsed = JSON.parse(savedWishlist);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        } else {
          console.error('Invalid wishlist data in localStorage');
          localStorage.removeItem('wishlist');
        }
      } catch (error) {
        console.error('Error loading wishlist:', error);
        localStorage.removeItem('wishlist');
      }
    }
  };

  // Зберігати в localStorage тільки для гостей
  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      localStorage.setItem('wishlist', JSON.stringify(items));
    }
  }, [items, isInitialized, isAuthenticated]);

  // Toggle товар (додати/видалити)
  const toggleItem = async (product) => {
    if (isAuthenticated) {
      // Авторизований - toggle на сервері
      try {
        const response = await wishlistAPI.toggleItem(product._id);
        setItems(response.data.items);
        
        const isAdded = response.data.items.some(
          item => (item._id || item) === product._id
        );
        
        if (isAdded) {
          toast.success('Додано в список бажань');
        } else {
          toast.success('Видалено зі списку бажань');
        }
      } catch (error) {
        console.error('Error toggling wishlist:', error);
        toast.error(error.response?.data?.error || 'Помилка');
      }
    } else {
      // Гість - toggle локально
      const isInWishlist = items.some(item => item._id === product._id);
      
      if (isInWishlist) {
        setItems(prevItems => prevItems.filter(item => item._id !== product._id));
        toast.success('Видалено зі списку бажань');
      } else {
        setItems(prevItems => [...prevItems, product]);
        toast.success('Додано в список бажань');
      }
    }
  };

  // Додати товар
  const addItem = async (product) => {
    if (isInWishlist(product._id)) {
      toast('Товар вже в списку бажань');
      return;
    }

    if (isAuthenticated) {
      try {
        const response = await wishlistAPI.addItem(product._id);
        setItems(response.data.items);
        toast.success('Додано в список бажань');
      } catch (error) {
        console.error('Error adding to wishlist:', error);
        toast.error(error.response?.data?.error || 'Помилка додавання');
      }
    } else {
      setItems(prevItems => [...prevItems, product]);
      toast.success('Додано в список бажань');
    }
  };

  // Видалити товар
  const removeItem = async (productId) => {
    if (isAuthenticated) {
      try {
        const response = await wishlistAPI.removeItem(productId);
        setItems(response.data.items);
      } catch (error) {
        console.error('Error removing from wishlist:', error);
        toast.error('Помилка видалення');
      }
    } else {
      setItems(prevItems => prevItems.filter(item => item._id !== productId));
    }
  };

  // Очистити wishlist
  const clearWishlist = async () => {
    if (isAuthenticated) {
      try {
        await wishlistAPI.clearWishlist();
        setItems([]);
        toast.success('Список бажань очищено');
      } catch (error) {
        console.error('Error clearing wishlist:', error);
        toast.error('Помилка очищення');
      }
    } else {
      setItems([]);
      toast.success('Список бажань очищено');
    }
  };

  // Перевірити чи товар в wishlist
  const isInWishlist = (productId) => {
    return items.some(item => {
      const itemId = item._id || item;
      return itemId === productId;
    });
  };

  const value = {
    items,
    toggleItem,
    addItem,
    removeItem,
    clearWishlist,
    isInWishlist,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
}