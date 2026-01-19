# E-Commerce Shop - Tech Shop

Повнофункціональний інтернет-магазин електроніки з адміністративною панеллю, кошиком, списком бажань та системою замовлень.

## Технології

### Frontend
- **React 18** - UI бібліотека
- **React Router DOM** - маршрутизація
- **TanStack Query (React Query)** - управління серверним станом
- **Axios** - HTTP клієнт
- **Sass** - препроцесор CSS
- **Lucide React** - іконки
- **React Hot Toast** - сповіщення

### Backend
- **Node.js** - серверне середовище
- **Express** - веб-фреймворк
- **MongoDB** - база даних
- **Mongoose** - ODM для MongoDB
- **JWT** - автентифікація
- **bcryptjs** - хешування паролів
- **multer** - завантаження файлів
- **express-validator** - валідація

## Функціональність

### Для користувачів
- Перегляд каталогу товарів з фільтрацією та сортуванням
- Пошук товарів
- Детальна інформація про товар
- Кошик з збереженням у localStorage та синхронізацією з сервером
- Список бажань (wishlist) з підтримкою гостьових користувачів
- Оформлення замовлень (з авторизацією та без)
- Профіль користувача з історією замовлень
- Реєстрація та авторизація

### Для адміністраторів
- CRUD операції з товарами
- CRUD операції з категоріями
- Управління замовленнями (зміна статусу, перегляд деталей)
- Перегляд списку всіх замовлень

## Структура проекту

```
├── client/                 # Frontend
│   ├── src/
│   │   ├── api/           # API запити
│   │   ├── components/    # Переважно використовувані компоненти
│   │   ├── context/       # React Context (Auth, Cart, Wishlist)
│   │   ├── hooks/         # Custom hooks
│   │   ├── pages/         # Сторінки додатку
│   │   ├── router/        # Налаштування маршрутизації
│   │   └── styles/        # Глобальні стилі та змінні
│   └── package.json
│
├── server/                # Backend
│   ├── controllers/       # Контролери
│   ├── middleware/        # Middleware (auth, validation)
│   ├── models/            # Mongoose моделі
│   ├── routes/            # API роути
│   ├── uploads/           # Завантажені файли
│   └── server.js          # Точка входу
│
└── README.md
```

## Встановлення та запуск

### Вимоги
- Node.js >= 14
- MongoDB >= 4.4

### Backend

1. Перейдіть до директорії сервера:
```bash
cd server
```

2. Встановіть залежності:
```bash
npm install
```

3. Створіть файл `.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

4. Запустіть сервер:
```bash
npm start
```

Сервер буде доступний на `http://localhost:5000`

### Frontend

1. Перейдіть до директорії клієнта:
```bash
cd client
```

2. Встановіть залежності:
```bash
npm install
```

3. Створіть файл `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

4. Запустіть додаток:
```bash
npm run dev
```

Додаток буде доступний на `http://localhost:5173`

## API Endpoints

### Автентифікація
- `POST /api/auth/register` - реєстрація
- `POST /api/auth/login` - вхід
- `GET /api/auth/me` - отримати поточного користувача

### Товари
- `GET /api/products` - список товарів (публічний)
- `GET /api/products/:id` - деталі товару (публічний)
- `POST /api/products` - створити товар (admin)
- `PUT /api/products/:id` - оновити товар (admin)
- `DELETE /api/products/:id` - видалити товар (admin)

### Категорії
- `GET /api/categories` - список категорій (публічний)
- `POST /api/categories` - створити категорію (admin)
- `PUT /api/categories/:id` - оновити категорію (admin)
- `DELETE /api/categories/:id` - видалити категорію (admin)

### Кошик
- `GET /api/cart` - отримати кошик
- `POST /api/cart/items` - додати товар
- `PUT /api/cart/items/:productId` - оновити кількість
- `DELETE /api/cart/items/:productId` - видалити товар
- `DELETE /api/cart` - очистити кошик
- `POST /api/cart/sync` - синхронізувати з localStorage

### Список бажань
- `GET /api/wishlist` - отримати wishlist
- `POST /api/wishlist/items` - додати товар
- `POST /api/wishlist/toggle` - toggle товар
- `DELETE /api/wishlist/items/:productId` - видалити товар
- `DELETE /api/wishlist` - очистити wishlist

### Замовлення
- `GET /api/orders` - список замовлень (admin - всі, user - свої)
- `GET /api/orders/:id` - деталі замовлення
- `POST /api/orders` - створити замовлення
- `PUT /api/orders/:id/status` - оновити статус (admin)
- `DELETE /api/orders/:id` - видалити замовлення (admin)

## Особливості реалізації

### Кошик
- Зберігається в localStorage для гостьових користувачів
- Автоматична синхронізація з сервером при авторизації
- Merge логіка: товари з localStorage додаються до серверного кошика

### Wishlist
- Для авторизованих користувачів зберігається на сервері
- Для гостей зберігається в localStorage
- Toggle функціонал для швидкого додавання/видалення

### Замовлення
- Можливість оформлення без реєстрації (гостьові замовлення)
- Гості можуть переглянути деталі свого замовлення за прямим посиланням
- Адміністратор може змінювати статуси замовлень

### Авторизація
- JWT токени з терміном дії 30 днів
- Middleware для захисту роутів
- Розділення доступу: admin/user

## Статуси замовлень

- `new` - Нове
- `confirmed` - Підтверджено
- `assembled` - Зібрано
- `shipped` - Відправлено
- `delivered` - Доставлено
- `cancelled` - Скасовано

## Ролі користувачів

- `user` - звичайний користувач
- `admin` - адміністратор

## Розробка

### Додавання нового функціоналу

1. **Backend:**
   - Створіть модель у `server/models/`
   - Додайте контролер у `server/controllers/`
   - Налаштуйте роути у `server/routes/`
   - Додайте middleware якщо потрібно

2. **Frontend:**
   - Створіть API функції у `client/src/api/`
   - Додайте custom hook у `client/src/hooks/`
   - Створіть компонент/сторінку
   - Додайте роут у `client/src/router/`

### Стилізація

Проект використовує Sass з модульною архітектурою:
- Глобальні змінні у `client/src/styles/_variables.scss`
- Кожен компонент має свій `.scss` файл
- Використовується BEM naming convention

## Тестування

### Backend
```bash
cd server
npm test
```

### Frontend
```bash
cd client
npm test
```

## Production Build

### Frontend
```bash
cd client
npm run build
```

Готовий білд буде у `client/dist/`

### Backend
Налаштуйте змінні оточення для production:
```env
NODE_ENV=production
MONGO_URI=your_production_mongodb_uri
JWT_SECRET=your_production_secret
```

## Ліцензія

MIT

## Автор

Створено як навчальний проект для курсу React/Node.js

