import express from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import { optionalAuth } from '../middleware/optionalAuth.js';
import * as authController from '../controllers/authController.js';
import * as categoryController from '../controllers/categoryController.js';
import * as productController from '../controllers/productController.js';
import * as orderController from '../controllers/orderController.js';
import * as cartController from '../controllers/cartController.js';
import * as wishlistController from '../controllers/wishlistController.js';

const router = express.Router();

// AUTH
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/refresh', authController.refresh);
router.post('/auth/logout', protect, authController.logout);
router.get('/auth/me', protect, authController.getMe);

// CATEGORIES
router.get('/categories', categoryController.getCategories);
router.get('/categories/:id', categoryController.getCategoryById);
router.post('/categories', protect, adminOnly, categoryController.createCategory);
router.patch('/categories/:id', protect, adminOnly, categoryController.updateCategory);
router.delete('/categories/:id', protect, adminOnly, categoryController.deleteCategory);

// PRODUCTS
router.get('/products', productController.getProducts);
router.get('/products/:id', productController.getProductById);
router.post('/products', protect, adminOnly, productController.createProduct);
router.patch('/products/:id', protect, adminOnly, productController.updateProduct);
router.delete('/products/:id', protect, adminOnly, productController.deleteProduct);

// ORDERS
router.post('/orders', orderController.createOrder);
router.get('/orders', protect, orderController.getOrders);
router.get('/orders/:id', optionalAuth, orderController.getOrderById);
router.patch('/orders/:id/status', protect, adminOnly, orderController.updateOrderStatus);
router.delete('/orders/:id', protect, adminOnly, orderController.deleteOrder);

// CART
router.get('/cart', protect, cartController.getCart);
router.post('/cart/items', protect, cartController.addToCart);
router.patch('/cart/items/:productId', protect, cartController.updateCartItem);
router.delete('/cart/items/:productId', protect, cartController.removeFromCart);
router.delete('/cart', protect, cartController.clearCart);
router.post('/cart/sync', protect, cartController.syncCart);

// WISHLIST
router.get('/wishlist', protect, wishlistController.getWishlist);
router.post('/wishlist/items', protect, wishlistController.addToWishlist);
router.post('/wishlist/toggle', protect, wishlistController.toggleWishlistItem);
router.delete('/wishlist/items/:productId', protect, wishlistController.removeFromWishlist);
router.delete('/wishlist', protect, wishlistController.clearWishlist);

export default router;