# Реалізація LoginPage

## Мета етапу

Створити функціональну форму входу з:
- Полями email та password
- Валідацією форми
- Викликом API логіну
- Обробкою помилок через toast
- Редиректом після успіху
- Loading стейтом

**Час виконання:** 15-20 хвилин

---

## Різниця між LoginPage і RegisterPage

LoginPage **простіше** ніж RegisterPage:
- Менше полів (тільки email і password)
- Схожа структура коду
- Ті самі стилі (`auth.scss`)
- Той самий принцип роботи

---

## Крок 1: Аналіз API

### Endpoint: POST /auth/login

**Request Body:**
```json
{
  "email": "admin@shop.com",
  "password": "admin123"
}
```

**Response (успіх - 200):**
```json
{
  "user": {
    "_id": "676123...",
    "email": "admin@shop.com",
    "fullName": "Admin User",
    "role": "admin"
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

**Response (помилка - 401):**
```json
{
  "error": "Невірний email або пароль"
}
```

### Тестові акаунти:

```
Admin:
  email: admin@shop.com
  password: admin123

Customer:
  email: customer@shop.com
  password: customer123
```

---

## Крок 2: Структура файлу

Створюємо файл `client/src/pages/auth/LoginPage.jsx`

### Імпорти

```jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './auth.scss';
```

**Те саме що і в RegisterPage!**

---

## Крок 3: State менеджмент

```jsx
function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();  // ← login замість register
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: ''  // ← Тільки 2 поля!
  });
  
  // ...
}
```

### Відмінності від RegisterPage:

1. **`login`** замість `register` з useAuth
2. **`formData`** має тільки 2 поля (email, password)
3. Все інше **ідентично**!

---

## Крок 4: Обробники подій

### handleChange - ІДЕНТИЧНИЙ RegisterPage

```jsx
const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({
    ...prev,
    [name]: value
  }));
};
```

**Немає змін!** Працює так само.

---

## Крок 5: handleSubmit

```jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  
  try {
    await login(formData);  // ← login замість register
    toast.success('Успішний вхід!');
    navigate('/');
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Помилка входу';
    toast.error(errorMessage);
  } finally {
    setLoading(false);
  }
};
```

### Відмінності від RegisterPage:

1. **`login(formData)`** замість `register(formData)`
2. **Повідомлення:** "Успішний вхід!" замість "Реєстрацію успішно завершено!"
3. **Повідомлення помилки:** "Помилка входу" замість "Помилка реєстрації"

**Структура коду ідентична!**

---

## Крок 6: JSX розмітка

### Заголовок

```jsx
<div className="auth-header">
  <h1>Вхід</h1>
  <p>Увійдіть в свій акаунт</p>
</div>
```

### Форма з полями

```jsx
<form onSubmit={handleSubmit} className="auth-form">
  {/* Email */}
  <div className="form-group">
    <label htmlFor="email">Email</label>
    <input
      type="email"
      id="email"
      name="email"
      value={formData.email}
      onChange={handleChange}
      placeholder="your@email.com"
      required
      autoComplete="email"
    />
  </div>

  {/* Password */}
  <div className="form-group">
    <label htmlFor="password">Пароль</label>
    <input
      type="password"
      id="password"
      name="password"
      value={formData.password}
      onChange={handleChange}
      placeholder="Введіть пароль"
      required
      autoComplete="current-password"
    />
  </div>

  {/* Submit button */}
  <button 
    type="submit" 
    className="submit-button"
    disabled={loading}
  >
    {loading ? (
      <>
        <span className="loading-spinner"></span>
        Вхід...
      </>
    ) : (
      'Увійти'
    )}
  </button>
</form>
```

### Footer (посилання на Register)

```jsx
<div className="auth-footer">
  Немає акаунта? <Link to="/register">Зареєструватися</Link>
</div>
```

---

## Крок 7: Повний код LoginPage

```jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './auth.scss';

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await login(formData);
      toast.success('Успішний вхід!');
      navigate('/');
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Помилка входу';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>Вхід</h1>
          <p>Увійдіть в свій акаунт</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Введіть пароль"
              required
              autoComplete="current-password"
            />
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Вхід...
              </>
            ) : (
              'Увійти'
            )}
          </button>
        </form>

        <div className="auth-footer">
          Немає акаунта? <Link to="/register">Зареєструватися</Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
```

---

## Контрольні питання

1. Яка різниця між `login()` і `register()` функціями?
2. Чому LoginPage простіше за RegisterPage?
3. Що таке `autoComplete="current-password"`?
4. Як перевірити чи користувач admin?
5. Що відбувається з токенами при logout?

---

**Чудова робота!**
