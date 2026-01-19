import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { cartAPI } from '../api/cart';
import toast from 'react-hot-toast';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const [items, setItems] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Завантажити кошик при ініціалізації
  useEffect(() => {
    const initCart = async () => {
      if (isAuthenticated) {
        // Авторизований - завантажуємо з сервера
        try {
          // Перевірити чи є щось в localStorage (гостьовий кошик)
          const localCart = localStorage.getItem('cart');
          let hasGuestCart = false;
          let localItems = [];

          if (localCart) {
            try {
              localItems = JSON.parse(localCart);
              hasGuestCart = Array.isArray(localItems) && localItems.length > 0;
            } catch (e) {
              console.error('Error parsing localStorage cart:', e);
            }
          }

          // Завантажити серверний кошик
          const response = await cartAPI.getCart();
          const serverCart = response.data;

          if (hasGuestCart) {
            // Є гостьовий кошик - мерджимо ТІЛЬКИ ОДИН РАЗ
            setIsSyncing(true);
            const syncResponse = await cartAPI.syncCart(localItems);
            setItems(syncResponse.data.items);
            toast.success('Кошики об\'єднано');
            setIsSyncing(false);
          } else {
            // Немає гостьового - просто серверний
            setItems(serverCart.items || []);
          }

          // ЗАВЖДИ очищаємо localStorage після логіну
          localStorage.removeItem('cart');
        } catch (error) {
          console.error('Error loading cart from server:', error);
          // Fallback на localStorage
          loadFromLocalStorage();
        }
      } else {
        // Гість - завантажуємо з localStorage
        loadFromLocalStorage();
      }
      
      setIsInitialized(true);
    };

    initCart();
  }, [isAuthenticated, user?._id]);

  // Функція завантаження з localStorage
  const loadFromLocalStorage = () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        } else {
          console.error('Invalid cart data in localStorage');
          localStorage.removeItem('cart');
        }
      } catch (error) {
        console.error('Error loading cart:', error);
        localStorage.removeItem('cart');
      }
    }
  };

  // Зберігати в localStorage тільки для гостей (тільки після ініціалізації)
  useEffect(() => {
    if (isInitialized && !isAuthenticated && !isSyncing) {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }, [items, isInitialized, isAuthenticated, isSyncing]);

  // Слухати зміни localStorage
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'cart' && !isAuthenticated) {
        if (e.newValue === null) {
          setItems([]);
        } else {
          try {
            const parsed = JSON.parse(e.newValue);
            if (Array.isArray(parsed)) {
              setItems(parsed);
            }
          } catch (error) {
            console.error('Error parsing cart from storage event:', error);
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [isAuthenticated]);

  // Обчислити загальну кількість товарів
  const totalItems = useMemo(() => {
    if (!Array.isArray(items)) return 0;
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  // Обчислити загальну вартість
  const totalPrice = useMemo(() => {
    if (!Array.isArray(items)) return 0;
    return items.reduce((sum, item) => {
      const price = item.product.discount > 0
        ? Math.round(item.product.price * (1 - item.product.discount / 100))
        : item.product.price;
      return sum + (price * item.quantity);
    }, 0);
  }, [items]);

  // Додати товар в кошик
  const addItem = async (product, quantity = 1) => {
    if (product.stock === 0) {
      toast.error('Товару немає в наявності');
      return;
    }

    if (isAuthenticated) {
      // Авторизований - додаємо на сервер
      try {
        const response = await cartAPI.addItem(product._id, quantity);
        setItems(response.data.items);
        
        const existingItem = items.find(item => 
          (item.product._id || item.product) === product._id
        );
        
        if (existingItem) {
          toast.success('Кількість оновлено');
        } else {
          toast.success('Товар додано в кошик');
        }
      } catch (error) {
        console.error('Error adding to cart:', error);
        toast.error(error.response?.data?.error || 'Помилка додавання товару');
      }
    } else {
      // Гість - додаємо локально
      const existingItem = items.find(item => item.product._id === product._id);

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        
        if (newQuantity > product.stock) {
          setItems(prevItems =>
            prevItems.map(item =>
              item.product._id === product._id
                ? { ...item, quantity: product.stock }
                : item
            )
          );
          toast.error(`Максимальна доступна кількість: ${product.stock} шт`);
          return;
        }

        setItems(prevItems =>
          prevItems.map(item =>
            item.product._id === product._id
              ? { ...item, quantity: newQuantity }
              : item
          )
        );
        toast.success('Кількість оновлено');
      } else {
        const addQuantity = Math.min(quantity, product.stock);
        
        setItems(prevItems => [...prevItems, { product, quantity: addQuantity }]);
        
        if (addQuantity < quantity) {
          toast.success(`Додано максимальну доступну кількість (${addQuantity} шт)`);
        } else {
          toast.success('Товар додано в кошик');
        }
      }
    }
  };

  // Видалити товар з кошика
  const removeItem = async (productId) => {
    if (isAuthenticated) {
      try {
        const response = await cartAPI.removeItem(productId);
        setItems(response.data.items);
      } catch (error) {
        console.error('Error removing from cart:', error);
        toast.error('Помилка видалення товару');
      }
    } else {
      setItems(prevItems => prevItems.filter(item => item.product._id !== productId));
    }
  };

  // Оновити кількість товару
  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) {
      return;
    }

    if (isAuthenticated) {
      try {
        const response = await cartAPI.updateItem(productId, quantity);
        setItems(response.data.items);
      } catch (error) {
        console.error('Error updating cart:', error);
        const errorMsg = error.response?.data?.error || 'Помилка оновлення';
        toast.error(errorMsg);
      }
    } else {
      const item = items.find(item => item.product._id === productId);
      if (!item) return;

      const maxQuantity = item.product.stock;
      const newQuantity = Math.min(quantity, maxQuantity);

      setItems(prevItems =>
        prevItems.map(item => {
          if (item.product._id === productId) {
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
      );

      if (newQuantity < quantity) {
        toast.error(`Максимальна доступна кількість: ${maxQuantity} шт`);
      }
    }
  };

  // Очистити кошик
  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        await cartAPI.clearCart();
        setItems([]);
      } catch (error) {
        console.error('Error clearing cart:', error);
        toast.error('Помилка очищення кошика');
      }
    } else {
      setItems([]);
    }
  };

  // Перевірити чи товар в кошику
  const isInCart = (productId) => {
    return items.some(item => 
      (item.product._id || item.product) === productId
    );
  };

  // Отримати кількість товару в кошику
  const getItemQuantity = (productId) => {
    const item = items.find(item => 
      (item.product._id || item.product) === productId
    );
    return item ? item.quantity : 0;
  };

  const value = {
    items,
    totalItems,
    totalPrice,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    isInCart,
    getItemQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}