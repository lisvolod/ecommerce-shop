import { verifyAccessToken } from '../utils/jwt.js';
import User from '../models/User.js';

/**
 * Middleware для перевірки авторизації користувача
 * - Перевіряє наявність токена у заголовку Authorization
 * - Валідує токен
 * - Додає користувача до req.user для подальшої обробки
 */
export const protect = async (req, res, next) => {
    try {
        // Дістаємо заголовок Authorization
        const authHeader = req.headers.authorization;

        // Перевірка: заголовок відсутній або не починається з "Bearer "
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Немає токену авторизації' });
        }

        // Витягуємо токен із рядка "Bearer <token>"
        const token = authHeader.split(' ')[1];

        // Верифікуємо токен (підпис і термін дії)
        const decoded = verifyAccessToken(token);

        if (!decoded) {
            return res.status(401).json({ error: 'Невалідний токен' });
        }

        // Шукаємо користувача в БД за ID з токена
        // Видаляємо password та refreshToken з результату
        const user = await User.findById(decoded.id).select('-password -refreshToken');

        if (!user) {
            return res.status(401).json({ error: 'Користувача не знайдено' });
        }

        // Додаємо обʼєкт користувача до запиту для наступних middleware/контролерів
        req.user = user;

        // Передаємо контроль далі
        next();
    } catch (error) {
        // Загальна обробка помилок авторизації
        res.status(401).json({ error: 'Помилка авторизації' });
    }
};

/**
 * Middleware для перевірки ролі Admin
 * - Використовується після protect
 * - Дозволяє доступ тільки адміністраторам
 */
export const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next(); // роль admin → доступ дозволено
    } else {
        res.status(403).json({ error: 'Доступ заборонено. Тільки для адміністраторів' });
    }
};

/**
 * Middleware для перевірки ролі Customer або Admin
 * - Використовується після protect
 * - Дозволяє доступ для звичайних користувачів і адміністраторів
 */
export const customerOrAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'customer' || req.user.role === 'admin')) {
        next(); // роль customer або admin → доступ дозволено
    } else {
        res.status(403).json({ error: 'Доступ заборонено' });
    }
};
