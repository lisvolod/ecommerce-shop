# Етап 3: Реалізація RegisterPage ✍️

## Мета етапу

Створити функціональну форму реєстрації з:
- ✅ Полями для введення даних
- ✅ Валідацією форми
- ✅ Викликом API реєстрації
- ✅ Обробкою помилок через toast
- ✅ Редиректом після успіху
- ✅ Loading стейтом

**Час виконання:** 20-25 хвилин

---

## Крок 1: Аналіз API

### Endpoint: POST /auth/register

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "Іван Іванович",
  "phone": "+380501234567",
  "address": "Київ, вул. Хрещатик, 1"
}
```

**Response (успіх - 200):**
```json
{
  "user": {
    "_id": "676123...",
    "email": "user@example.com",
    "fullName": "Іван Іванович",
    "role": "customer"
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

**Response (помилка - 400):**
```json
{
  "error": "Користувач з таким email вже існує"
}
```

---

## Крок 2: Структура файлу

Створюємо файл `client/src/pages/auth/RegisterPage.jsx`

### Імпорти

```jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './auth.scss';
```

**Пояснення:**
- `useState` - для стану форми та loading
- `useNavigate` - для редиректу після реєстрації
- `Link` - для переходу на LoginPage
- `useAuth` - для виклику функції register
- `toast` - для показу повідомлень користувачу
- `./auth.scss` - стилі (створені раніше)

---

## Крок 3: State менеджмент

```jsx
function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',  // ← Нове поле
    fullName: '',
    phone: '',
    address: ''
  });

  const [errors, setErrors] = useState({});  // ← Стейт для помилок валідації
  
  // ...
}
```

### Пояснення стейту:

1. **`loading`** - показує чи відбувається запит на сервер
   - `false` - форма активна
   - `true` - кнопка disabled, показуємо спінер

2. **`formData`** - об'єкт з даними форми
   - Кожен ключ відповідає полю input
   - **Додано `confirmPassword`** для підтвердження пароля
   - Початкові значення - пусті строки

3. **`errors`** - об'єкт з помилками валідації
   - Ключі відповідають полям форми
   - Значення - текст помилки
   - Приклад: `{ password: 'Пароль повинен містити мінімум 6 символів' }`

---

## Крок 4: Обробники подій

### handleChange - оновлення полів + очищення помилок

```jsx
const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({
    ...prev,
    [name]: value
  }));
  
  // Очищаємо помилку при зміні поля
  if (errors[name]) {
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  }
};
```

**Що змінилось:**
- Додано очищення помилки коли користувач починає виправляти поле
- UX покращення: помилка зникає відразу при редагуванні

---

## Крок 4.5: Функція валідації

```jsx
const validateForm = () => {
  const newErrors = {};

  // Валідація email
  if (!formData.email) {
    newErrors.email = 'Email обов\'язковий';
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    newErrors.email = 'Невірний формат email';
  }

  // Валідація пароля
  if (!formData.password) {
    newErrors.password = 'Пароль обов\'язковий';
  } else if (formData.password.length < 6) {
    newErrors.password = 'Пароль повинен містити мінімум 6 символів';
  }

  // Валідація підтвердження пароля
  if (!formData.confirmPassword) {
    newErrors.confirmPassword = 'Підтвердіть пароль';
  } else if (formData.password !== formData.confirmPassword) {
    newErrors.confirmPassword = 'Паролі не співпадають';  // ← Головна перевірка!
  }

  // Валідація ПІБ
  if (!formData.fullName) {
    newErrors.fullName = 'ПІБ обов\'язкове';
  } else if (formData.fullName.length < 2) {
    newErrors.fullName = 'ПІБ повинно містити мінімум 2 символи';
  }

  // Валідація телефону
  if (!formData.phone) {
    newErrors.phone = 'Телефон обов\'язковий';
  } else if (!/^\+?3?8?(0\d{9})$/.test(formData.phone.replace(/\s/g, ''))) {
    newErrors.phone = 'Невірний формат телефону';
  }

  // Валідація адреси
  if (!formData.address) {
    newErrors.address = 'Адреса обов\'язкова';
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;  // true якщо немає помилок
};
```

**Пояснення валідації:**

1. **Email:** 
   - Перевірка на пустоту
   - Перевірка формату через regex `/\S+@\S+\.\S+/`

2. **Password:**
   - Перевірка на пустоту
   - Мінімум 6 символів

3. **Confirm Password:** ⭐ **НАЙВАЖЛИВІШЕ**
   - Перевірка на пустоту
   - **Порівняння з password:** `formData.password !== formData.confirmPassword`

4. **FullName:**
   - Перевірка на пустоту
   - Мінімум 2 символи

5. **Phone:**
   - Перевірка на пустоту
   - Regex для українського формату: `+380501234567` або `0501234567`

6. **Address:**
   - Перевірка на пустоту

**Повертає:**
- `true` - якщо форма валідна (немає помилок)
- `false` - якщо є помилки

---

## Крок 5: handleSubmit - відправка форми з валідацією

```jsx
const handleSubmit = async (e) => {
  e.preventDefault();  // 1. Запобігаємо перезавантаженню сторінки
  
  // 2. Перевіряємо валідацію перед відправкою
  if (!validateForm()) {
    toast.error('Будь ласка, виправте помилки у формі');
    return;  // Зупиняємо виконання якщо є помилки
  }

  setLoading(true);  // 3. Показуємо loading стан
  
  try {
    // 4. Відправляємо дані БЕЗ confirmPassword
    const { confirmPassword, ...registerData } = formData;
    await register(registerData);
    
    // 5. Якщо успішно - показуємо повідомлення
    toast.success('Реєстрацію успішно завершено!');
    
    // 6. Перенаправляємо на головну
    navigate('/');
    
  } catch (error) {
    // 7. Якщо помилка - показуємо її користувачу
    const errorMessage = error.response?.data?.error || 'Помилка реєстрації';
    toast.error(errorMessage);
    
  } finally {
    // 8. В будь-якому випадку прибираємо loading
    setLoading(false);
  }
};
```

### Потік виконання:

```
1. Користувач натискає "Зареєструватися"
        ↓
2. e.preventDefault() - форма не перезавантажує сторінку
        ↓
3. validateForm() викликається
        ↓
4a. Якщо є помилки (наприклад, паролі не співпадають):
    - setErrors({confirmPassword: 'Паролі не співпадають'})
    - toast.error показує повідомлення
    - return - зупиняємо виконання
        ↓
4b. Якщо помилок немає:
    - setLoading(true)
    - Видаляємо confirmPassword з даних
    - register(registerData) - AuthContext викликає API
        ↓
5a. УСПІХ:
    - Токени зберігаються в localStorage (AuthContext)
    - user стан оновлюється (AuthContext)
    - toast.success показує зелене повідомлення
    - navigate('/') перенаправляє на головну
        ↓
5b. ПОМИЛКА (наприклад, email вже існує):
    - catch ловить помилку
    - Витягуємо текст помилки з відповіді сервера
    - toast.error показує червоне повідомлення
        ↓
6. finally блок завжди виконується
    - setLoading(false) - прибираємо loading
```

### Важливо: Видалення confirmPassword

```jsx
const { confirmPassword, ...registerData } = formData;
```

**Чому?**
- Backend не очікує поле `confirmPassword`
- Це поле потрібне тільки для валідації на клієнті
- Використовуємо деструктуризацію для створення нового об'єкта без confirmPassword

**До:**
```js
formData = {
  email: 'test@mail.com',
  password: '123456',
  confirmPassword: '123456',  ← Backend не знає про це поле
  fullName: 'Іван',
  phone: '+380501234567',
  address: 'Київ'
}
```

**Після:**
```js
registerData = {
  email: 'test@mail.com',
  password: '123456',
  fullName: 'Іван',
  phone: '+380501234567',
  address: 'Київ'
}
```

---

## Крок 6: JSX розмітка форми

### Повна структура:

```jsx
return (
  <div className="auth-page">
    <div className="auth-container">
      {/* Заголовок */}
      <div className="auth-header">
        <h1>Реєстрація</h1>
        <p>Створіть новий акаунт</p>
      </div>

      {/* Форма */}
      <form onSubmit={handleSubmit} className="auth-form">
        {/* Поля форми тут */}
      </form>

      {/* Посилання на логін */}
      <div className="auth-footer">
        Вже є акаунт? <Link to="/login">Увійти</Link>
      </div>
    </div>
  </div>
);
```

### Структура одного поля:

```jsx
<div className="form-group">
  <label htmlFor="email">Email *</label>
  <input
    type="email"
    id="email"
    name="email"
    value={formData.email}
    onChange={handleChange}
    placeholder="your@email.com"
    required
  />
</div>
```

**Важливі атрибути:**

1. **`id`** і **`htmlFor`** - зв'язок label з input
   - Клік на label = фокус на input

2. **`name`** - ОБОВ'ЯЗКОВО!
   - Повинен відповідати ключу в `formData`
   - Використовується в `handleChange`

3. **`value`** - контрольований input
   - React контролює значення
   - Дані завжди синхронізовані зі стейтом

4. **`onChange`** - оновлення стейту
   - Викликається при кожній зміні

5. **`required`** - HTML5 валідація
   - Браузер не дасть відправити пусту форму

---

## Крок 7: Всі поля форми

```jsx
<form onSubmit={handleSubmit} className="auth-form">
  {/* Email */}
  <div className="form-group">
    <label htmlFor="email">Email *</label>
    <input
      type="email"
      id="email"
      name="email"
      value={formData.email}
      onChange={handleChange}
      placeholder="your@email.com"
      required
    />
  </div>

  {/* Password */}
  <div className="form-group">
    <label htmlFor="password">Пароль *</label>
    <input
      type="password"
      id="password"
      name="password"
      value={formData.password}
      onChange={handleChange}
      placeholder="Мінімум 6 символів"
      required
      minLength={6}
    />
  </div>

  {/* Full Name */}
  <div className="form-group">
    <label htmlFor="fullName">ПІБ *</label>
    <input
      type="text"
      id="fullName"
      name="fullName"
      value={formData.fullName}
      onChange={handleChange}
      placeholder="Іван Іванович Іваненко"
      required
    />
  </div>

  {/* Phone */}
  <div className="form-group">
    <label htmlFor="phone">Телефон *</label>
    <input
      type="tel"
      id="phone"
      name="phone"
      value={formData.phone}
      onChange={handleChange}
      placeholder="+380501234567"
      required
    />
  </div>

  {/* Address */}
  <div className="form-group">
    <label htmlFor="address">Адреса доставки *</label>
    <input
      type="text"
      id="address"
      name="address"
      value={formData.address}
      onChange={handleChange}
      placeholder="Київ, вул. Хрещатик, 1"
      required
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
        Реєстрація...
      </>
    ) : (
      'Зареєструватися'
    )}
  </button>
</form>
```

---

## Крок 8: Кнопка Submit з loading

```jsx
<button 
  type="submit" 
  className="submit-button"
  disabled={loading}
>
  {loading ? (
    <>
      <span className="loading-spinner"></span>
      Реєстрація...
    </>
  ) : (
    'Зареєструватися'
  )}
</button>
```

### Логіка:

```
loading === false
  ↓
Показуємо: "Зареєструватися"
Кнопка активна (disabled=false)

loading === true
  ↓
Показуємо: <spinner> + "Реєстрація..."
Кнопка неактивна (disabled=true)
```

**Спінер** - CSS анімація (створена в `auth.scss`):
```scss
.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
```

---

## Крок 9: Повний код RegisterPage

```jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './auth.scss';

function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    address: ''
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
      await register(formData);
      toast.success('Реєстрацію успішно завершено!');
      navigate('/');
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Помилка реєстрації';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>Реєстрація</h1>
          <p>Створіть новий акаунт</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Пароль *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Мінімум 6 символів"
              required
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label htmlFor="fullName">ПІБ *</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Іван Іванович Іваненко"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Телефон *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+380501234567"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">Адреса доставки *</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Київ, вул. Хрещатик, 1"
              required
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
                Реєстрація...
              </>
            ) : (
              'Зареєструватися'
            )}
          </button>
        </form>

        <div className="auth-footer">
          Вже є акаунт? <Link to="/login">Увійти</Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
```

---

## Крок 10: Тестування

### 1. Запустіть проект
```bash
npm run dev
```

### 2. Перейдіть на /register

### 3. Спробуйте сценарії:

#### ✅ Успішна реєстрація
1. Заповніть всі поля валідними даними
2. Натисніть "Зареєструватися"
3. Очікуємо:
   - Спінер з'являється
   - Зелене toast повідомлення
   - Редирект на головну
   - Токени в localStorage
   - User стан оновлений

#### ❌ Валідація форми
1. Спробуйте відправити порожню форму
   - Браузер покаже "Заповніть це поле"
   
2. Введіть невалідний email
   - Браузер покаже "Введіть email адресу"
   
3. Введіть пароль < 6 символів
   - Браузер покаже помилку minLength

#### ❌ Email вже існує
1. Спробуйте зареєструватись з email який вже є
2. Очікуємо:
   - Червоне toast: "Користувач з таким email вже існує"
   - Форма активна, можна виправити

---

## Крок 11: Перевірка в DevTools

### Application Tab
```
Local Storage → http://localhost:5173
├── accessToken: "eyJhbGc..."
├── refreshToken: "eyJhbGc..."
└── user: {"_id":"...","email":"...","fullName":"...","role":"customer"}
```

### Network Tab
```
POST /api/auth/register
Status: 200 OK
Response: {
  user: {...},
  accessToken: "...",
  refreshToken: "..."
}
```

### React DevTools
```
Components → AuthProvider
State:
  user: {email: "...", fullName: "...", role: "customer"}
  loading: false
  isAuthenticated: true
```

---

## Типові помилки та їх вирішення

### 1. "Cannot read property 'register' of undefined"
**Причина:** AuthProvider не обгортає компонент
**Рішення:** Перевірте що в `main.jsx` є `<AuthProvider>`

### 2. Форма перезавантажує сторінку
**Причина:** Немає `e.preventDefault()`
**Рішення:** Додайте в `handleSubmit`

### 3. handleChange не працює
**Причина:** Немає `name` атрибуту в input
**Рішення:** Додайте `name="email"` тощо

### 4. Дані не відправляються
**Причина:** `formData` не оновлюється
**Рішення:** Перевірте `value={formData.email}` і `onChange={handleChange}`

### 5. Loading не працює
**Причина:** Забули `setLoading(false)` в `finally`
**Рішення:** Додайте finally блок

---

## Контрольні питання

1. Що робить `e.preventDefault()` в handleSubmit?
2. Навіщо потрібен `name` атрибут у input?
3. Що таке контрольований input (controlled input)?
4. Чому важливо ставити `setLoading(false)` у `finally` блок?
5. Як AuthContext зберігає токени?
6. Що повертає функція `register()` з AuthContext?
7. Навіщо `disabled={loading}` на кнопці?

---

## Наступний крок

Тепер переходимо до **Етапу 4** - створення LoginPage.

📄 Посібник: `04_LOGIN_IMPLEMENTATION.md`

---

**Успіхів! 🚀**
