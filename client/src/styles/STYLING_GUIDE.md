# 🎨 Гайд по стилізації проекту

## Структура стилів

```
client/src/
├── styles/
│   ├── _variables.scss    # Змінні (кольори, відступи, шрифти)
│   └── global.scss         # Глобальні стилі (reset + базові стилі)
├── components/
│   ├── Layout.jsx
│   └── Layout.scss         # Стилі для Layout компонента
└── pages/
    ├── auth/
    │   ├── LoginPage.jsx
    │   ├── RegisterPage.jsx
    │   └── auth.scss       # Спільні стилі для LoginPage та RegisterPage
    └── ...
```

## Принципи стилізації

### 1. Один компонент = один файл стилів
Кожен компонент має свій `.scss` файл поруч з `.jsx` файлом.

**Приклад:**
```
ProductCard.jsx
ProductCard.scss
```

### 2. Використання змінних через @use

**❌ Не робіть так (старий синтаксис):**
```scss
@import '../styles/variables';
```

**✅ Робіть так (новий синтаксис):**
```scss
@use '../styles/variables' as *;

.button {
  color: $primary; // Використовуємо змінну
}
```

### 3. BEM methodology (рекомендовано, але не обов'язково)

```scss
.product-card {
  // Блок
  
  &__image {
    // Елемент
  }
  
  &--featured {
    // Модифікатор
  }
}
```

Або просто вкладені класи:

```scss
.product-card {
  .image { }
  .title { }
  .price { }
}
```

---

## Доступні змінні

### Кольори

```scss
// Основні
$primary: #2563eb;         // Синій
$primary-dark: #1d4ed8;
$primary-light: #3b82f6;

$secondary: #64748b;       // Сірий
$success: #10b981;         // Зелений
$error: #ef4444;           // Червоний
$warning: #f59e0b;         // Жовтий

// Фон і межі
$background: #ffffff;
$background-secondary: #f8fafc;
$border: #e2e8f0;

// Текст
$text-primary: #0f172a;    // Основний текст
$text-secondary: #64748b;  // Вторинний текст
$text-muted: #94a3b8;      // Блідий текст
```

### Відступи

```scss
$spacing-xs: 0.25rem;   // 4px
$spacing-sm: 0.5rem;    // 8px
$spacing: 1rem;         // 16px
$spacing-md: 1.5rem;    // 24px
$spacing-lg: 2rem;      // 32px
$spacing-xl: 3rem;      // 48px
$spacing-2xl: 4rem;     // 64px
```

### Радіуси

```scss
$radius-sm: 0.25rem;    // 4px
$radius: 0.375rem;      // 6px
$radius-md: 0.5rem;     // 8px
$radius-lg: 0.75rem;    // 12px
$radius-full: 9999px;   // Повний круг
```

### Тіні

```scss
$shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
$shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
$shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
$shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
```

### Шрифти

```scss
$text-xs: 0.75rem;      // 12px
$text-sm: 0.875rem;     // 14px
$text-base: 1rem;       // 16px
$text-lg: 1.125rem;     // 18px
$text-xl: 1.25rem;      // 20px
$text-2xl: 1.5rem;      // 24px

$font-normal: 400;
$font-medium: 500;
$font-semibold: 600;
$font-bold: 700;
```

### Transitions

```scss
$transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
$transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
$transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);
```

### Breakpoints

```scss
$breakpoint-sm: 640px;
$breakpoint-md: 768px;
$breakpoint-lg: 1024px;
$breakpoint-xl: 1280px;
```

---

## Приклади використання

### Кнопка

```scss
@use '../styles/variables' as *;

.button {
  padding: $spacing-sm $spacing-lg;
  border-radius: $radius-md;
  font-weight: $font-medium;
  transition: all $transition-fast;
  
  &.primary {
    background-color: $primary;
    color: $text-inverse;
    
    &:hover {
      background-color: $primary-dark;
    }
  }
  
  &.secondary {
    background-color: transparent;
    color: $text-secondary;
    border: 1px solid $border;
    
    &:hover {
      background-color: $background-secondary;
    }
  }
}
```

### Картка товару

```scss
@use '../styles/variables' as *;

.product-card {
  background: $surface;
  border-radius: $radius-lg;
  box-shadow: $shadow;
  overflow: hidden;
  transition: transform $transition-base;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: $shadow-lg;
  }
  
  .image {
    width: 100%;
    aspect-ratio: 1;
    object-fit: cover;
  }
  
  .content {
    padding: $spacing-md;
  }
  
  .title {
    font-size: $text-lg;
    font-weight: $font-semibold;
    color: $text-primary;
    margin-bottom: $spacing-sm;
  }
  
  .price {
    font-size: $text-xl;
    font-weight: $font-bold;
    color: $primary;
  }
}
```

### Форма

```scss
@use '../styles/variables' as *;

.form {
  max-width: 400px;
  margin: 0 auto;
  
  .form-group {
    margin-bottom: $spacing-md;
  }
  
  label {
    display: block;
    font-size: $text-sm;
    font-weight: $font-medium;
    color: $text-secondary;
    margin-bottom: $spacing-sm;
  }
  
  input, textarea {
    width: 100%;
    padding: $spacing-sm $spacing;
    border: 1px solid $border;
    border-radius: $radius-md;
    font-size: $text-base;
    transition: border-color $transition-fast;
    
    &:focus {
      outline: none;
      border-color: $primary;
    }
    
    &::placeholder {
      color: $text-muted;
    }
  }
  
  button[type="submit"] {
    width: 100%;
    padding: $spacing $spacing-lg;
    background-color: $primary;
    color: $text-inverse;
    border-radius: $radius-md;
    font-weight: $font-medium;
    transition: background-color $transition-fast;
    
    &:hover {
      background-color: $primary-dark;
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}
```

### Responsive дизайн

```scss
@use '../styles/variables' as *;

.products-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $spacing-lg;
  
  @media (max-width: $breakpoint-lg) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @media (max-width: $breakpoint-md) {
    grid-template-columns: repeat(2, 1fr);
    gap: $spacing;
  }
  
  @media (max-width: $breakpoint-sm) {
    grid-template-columns: 1fr;
  }
}
```

---

## Корисні міксини (опціонально)

Можна створити файл `_mixins.scss`:

```scss
// Truncate text
@mixin truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// Flexbox center
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

// Використання:
.title {
  @include truncate;
  max-width: 200px;
}
```

---

## Поради

### 1. Використовуйте змінні
❌ `color: #2563eb;`
✅ `color: $primary;`

### 2. Дотримуйтесь відступів
❌ `padding: 12px;`
✅ `padding: $spacing-sm;`

### 3. Використовуйте transition
```scss
.button {
  transition: all $transition-fast;
  
  &:hover {
    background-color: $primary-dark;
  }
}
```

### 4. Responsive mobile-first
```scss
// Mobile за замовчуванням
.element {
  padding: $spacing;
}

// Більші екрани
@media (min-width: $breakpoint-md) {
  .element {
    padding: $spacing-lg;
  }
}
```

### 5. Не дублюйте стилі
Якщо декілька компонентів мають схожі стилі - винесіть в окремий клас або компонент.

---

## Чек-лист перед комітом

- [ ] Всі змінні використані через `@use`
- [ ] Немає захардкоджених кольорів (крім градієнтів)
- [ ] Всі відступи через змінні
- [ ] Є hover стани для інтерактивних елементів
- [ ] Responsive дизайн працює на мобільних
- [ ] Використані transitions для плавних анімацій

---

**Успішної стилізації! 🎨**
