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
        confirmPassword: '',
        fullName: '',
        phone: '',
        address: ''
    });

    const [errors, setErrors] = useState({});

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
            newErrors.confirmPassword = 'Паролі не співпадають';
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
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Перевіряємо валідацію перед відправкою
        if (!validateForm()) {
            toast.error('Будь ласка, виправте помилки у формі');
            return;
        }

        setLoading(true);

        try {
            // Відправляємо дані без confirmPassword
            const { confirmPassword, ...registerData } = formData;
            await register(registerData);
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
                            className={errors.email ? 'error' : ''}
                        />
                        {errors.email && <span className="error-message">{errors.email}</span>}
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
                            className={errors.password ? 'error' : ''}
                        />
                        {errors.password && <span className="error-message">{errors.password}</span>}
                    </div>

                    {/* Confirm Password */}
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Підтвердження пароля *</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Повторіть пароль"
                            className={errors.confirmPassword ? 'error' : ''}
                        />
                        {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
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
                            className={errors.fullName ? 'error' : ''}
                        />
                        {errors.fullName && <span className="error-message">{errors.fullName}</span>}
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
                            className={errors.phone ? 'error' : ''}
                        />
                        {errors.phone && <span className="error-message">{errors.phone}</span>}
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
                            className={errors.address ? 'error' : ''}
                        />
                        {errors.address && <span className="error-message">{errors.address}</span>}
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