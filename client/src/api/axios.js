import axios from 'axios';

// Базовий URL бекенду:
// береться з env-змінної Vite або використовується localhost для dev
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Створюємо окремий інстанс axios
// Усі запити через нього будуть мати:
//  - baseURL = {API_URL}/api
//  - заголовок Content-Type: application/json
const api = axios.create({
    baseURL: `${API_URL}/api`,
    headers: { 'Content-Type': 'application/json' },
});

// REQUEST INTERCEPTOR
// Виконується ПЕРЕД кожним HTTP-запитом
api.interceptors.request.use((config) => {
    // Дістаємо access token з localStorage
    const token = localStorage.getItem('accessToken');

    // Якщо токен існує — додаємо його в заголовок Authorization
    // Формат "Bearer <token>" — стандарт для JWT
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // Обовʼязково повертаємо config, інакше запит не піде
    return config;
});

// RESPONSE INTERCEPTOR
// Перший колбек — для успішних відповідей
// Другий — для помилок
api.interceptors.response.use(
    (response) => {
        // Якщо помилок немає — просто повертаємо відповідь
        return response;
    },
    async (error) => {
        // Оригінальний запит, який викликав помилку
        const originalRequest = error.config;

        // Перевіряємо:
        // 1) сервер відповів 401 (access token прострочений або невалідний)
        // 2) цей запит ще не намагалися повторити (захист від нескінченного циклу)
        if (error.response?.status === 401 && !originalRequest._retry) {
            // Позначаємо, що retry вже був
            originalRequest._retry = true;

            try {
                // Дістаємо refresh token
                const refreshToken = localStorage.getItem('refreshToken');

                // Відправляємо запит на оновлення токенів
                // Використовуємо звичайний axios, щоб не потрапити в цей же interceptor
                const { data } = await axios.post(
                    `${API_URL}/api/auth/refresh`,
                    { refreshToken }
                );

                // Зберігаємо нові токени
                localStorage.setItem('accessToken', data.accessToken);
                localStorage.setItem('refreshToken', data.refreshToken);

                // Підміняємо access token у заголовках оригінального запиту
                originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

                // Повторюємо оригінальний запит з новим access token
                return api(originalRequest);
            } catch {
                // Якщо refresh token невалідний або прострочений:
                //  - очищаємо localStorage
                //  - перенаправляємо користувача на сторінку логіну
                localStorage.clear();
                window.location.href = '/login';
            }
        }

        // Якщо це не 401 або refresh не допоміг — передаємо помилку далі
        return Promise.reject(error);
    }
);

// Експортуємо готовий API-клієнт
// Його використовують у всьому застосунку замість "axios"
export default api;
