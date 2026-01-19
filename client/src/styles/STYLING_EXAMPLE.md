# Приклад використання стилізації

## Структура файлів після додавання стилів

```
client/src/
├── styles/
│   ├── _variables.scss       
│   ├── global.scss           
│
├── components/
│   ├── Layout.jsx            
│   └── Layout.scss            
│
└── pages/
    └── auth/
        ├── LoginPage.jsx      
        ├── RegisterPage.jsx   
        └── auth.scss          (спільний для обох сторінок)
```

## Як підключати стилі до компонентів

### Варіант 1: Окремий файл стилів (рекомендовано)

**ProductCard.jsx:**
```jsx
import './ProductCard.scss';

function ProductCard({ product }) {
  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} className="image" />
      <div className="content">
        <h3 className="title">{product.name}</h3>
        <p className="price">{product.price} ₴</p>
      </div>
    </div>
  );
}
```

**ProductCard.scss:**
```scss
@use '../styles/variables' as *;

.product-card {
  background: $surface;
  border-radius: $radius-lg;
  
  .image {
    width: 100%;
  }
  
  .content {
    padding: $spacing-md;
  }
  
  .title {
    color: $text-primary;
  }
  
  .price {
    color: $primary;
  }
}
```

### Варіант 2: Спільний файл для схожих сторінок

**Структура:**
```
pages/
└── auth/
    ├── LoginPage.jsx
    ├── RegisterPage.jsx
    └── auth.scss          # Спільний файл стилів
```

**LoginPage.jsx:**
```jsx
import './auth.scss';  // Відносний шлях - файл в тій самій папці

function LoginPage() {
  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* ... */}
      </div>
    </div>
  );
}
```

**RegisterPage.jsx:**
```jsx
import './auth.scss';  // Той самий файл стилів

function RegisterPage() {
  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* ... */}
      </div>
    </div>
  );
}
```

**Переваги цього підходу:**
- ✅ Немає дублювання стилів
- ✅ Легко підтримувати консистентність дизайну
- ✅ Зміни в одному файлі відразу застосовуються до обох сторінок

Обидві сторінки використовують один файл `auth.scss`, оскільки мають схожу структуру форм.

## Візуальний приклад Layout

```
┌──────────────────────────────────────────────────────────────┐
│  Header (sticky)                                              │
│  ┌──────────┐                              ┌───────────────┐ │
│  │Tech Shop │  Каталог  👤Профіль  🛒  🚪│                │ │
│  └──────────┘                              └───────────────┘ │
└──────────────────────────────────────────────────────────────┘
│                                                                │
│  Main Content (flex: 1)                                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                                                        │   │
│  │  < Тут рендериться Outlet />                         │   │
│  │                                                        │   │
│  │  (HomePage, ProductPage, LoginPage тощо)             │   │
│  │                                                        │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

## Кольорова схема

### Основна палітра
- **Primary (Синій)**: `#2563eb` - кнопки, лінки, акценти
- **Success (Зелений)**: `#10b981` - успішні повідомлення
- **Error (Червоний)**: `#ef4444` - помилки, видалення
- **Warning (Жовтий)**: `#f59e0b` - попередження

### Нейтральні кольори
- **Text Primary**: `#0f172a` - основний текст
- **Text Secondary**: `#64748b` - вторинний текст
- **Border**: `#e2e8f0` - межі, роздільники
- **Background**: `#ffffff` - основний фон
- **Background Secondary**: `#f8fafc` - альтернативний фон

## Приклад адаптивності Header

```scss
// Desktop (1024px+)
┌────────────────────────────────────────────────────┐
│ Tech Shop    Каталог  👤 Профіль  📦 Адмін  🛒  🚪  │
└────────────────────────────────────────────────────┘

// Tablet (768px - 1024px)
┌────────────────────────────────────────────────────┐
│ Tech Shop    Каталог  👤 Профіль  🛒  🚪            │
└────────────────────────────────────────────────────┘

// Mobile (< 640px)
┌────────────────────────────────────────────────────┐
│ Tech Shop          Каталог  👤  🛒  🚪              │
└────────────────────────────────────────────────────┘
(текст ховається, залишаються тільки іконки)
```

## Тестування стилів

1. Відкрийте проект: `npm run dev`
2. Перейдіть на головну сторінку
3. Header має бути зверху з тінню
4. При скролі header залишається fixed
5. При hover на кнопки - зміна кольору
6. На мобільних текст в кнопках ховається

