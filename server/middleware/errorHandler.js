/**
 * Централізована обробка помилок
 */
export const errorHandler = (err, req, res, next) => {
	// Логування помилки
	console.error('❌ Error:', err.message);

	// Mongoose validation error
	if (err.name === 'ValidationError') {
		const errors = Object.values(err.errors).map(e => e.message);
		return res.status(400).json({ error: errors.join(', ') });
	}

	// Mongoose duplicate key error
	if (err.code === 11000) {
		const field = Object.keys(err.keyPattern)[0];
		return res.status(400).json({
			error: `${field === 'email' ? 'Email' : 'Значення'} вже існує`
		});
	}

	// Mongoose cast error (невалідний ObjectId)
	if (err.name === 'CastError') {
		return res.status(400).json({ error: 'Невалідний ID' });
	}

	// JWT errors
	if (err.name === 'JsonWebTokenError') {
		return res.status(401).json({ error: 'Невалідний токен' });
	}

	if (err.name === 'TokenExpiredError') {
		return res.status(401).json({ error: 'Токен прострочений' });
	}

	// Default error
	const statusCode = err.statusCode || 500;
	const message = err.message || 'Внутрішня помилка сервера';

	res.status(statusCode).json({
		error: message,
		...(process.env.NODE_ENV === 'development' && { stack: err.stack })
	});
};

/**
 * Handler для 404 (не знайдений route)
 */
export const notFound = (req, res) => {
	res.status(404).json({
		error: `Route ${req.originalUrl} не знайдено`
	});
};
