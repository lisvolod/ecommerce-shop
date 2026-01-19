# 🛍️ E-Commerce Backend API

Express.js + MongoDB backend з JWT авторизацією

## 🚀 Швидкий старт

```bash
# 1. Встановити залежності
npm install

# 2. Створити .env файл (скопіювати з .env.example)
cp .env.example .env

# 3. Налаштувати MongoDB URI в .env

# 4. Запустити seed даних
npm run seed

# 5. Запустити сервер
npm run dev
```

## 📋 API Endpoints

### Auth
- POST `/api/auth/register` - Реєстрація
- POST `/api/auth/login` - Вхід
- POST `/api/auth/refresh` - Оновлення токену
- POST `/api/auth/logout` - Вихід
- GET `/api/auth/me` - Поточний користувач

### Categories
- GET `/api/categories` - Всі категорії
- POST `/api/categories` - Створити (Admin)
- PATCH `/api/categories/:id` - Оновити (Admin)
- DELETE `/api/categories/:id` - Видалити (Admin)

### Products
- GET `/api/products` - Всі товари (з фільтрами)
- GET `/api/products/:id` - Товар за ID
- POST `/api/products` - Створити (Admin)
- PATCH `/api/products/:id` - Оновити (Admin)
- DELETE `/api/products/:id` - Видалити (Admin)

### Orders
- POST `/api/orders` - Створити замовлення
- GET `/api/orders` - Мої замовлення
- PATCH `/api/orders/:id/status` - Оновити статус (Admin)

### Cart
- GET `/api/cart` - Мій кошик
- POST `/api/cart/items` - Додати товар
- PATCH `/api/cart/items/:productId` - Оновити кількість
- DELETE `/api/cart/items/:productId` - Видалити товар

## 🔑 Тестові користувачі

- admin@shop.com / admin123
- customer@shop.com / customer123
