import { useState, useEffect } from 'react';
import { Package, Eye, Trash2 } from 'lucide-react';
import { ordersAPI } from '../../api/orders';
import ConfirmModal from '../../components/ConfirmModal';
import OrderDetailsModal from '../../components/OrderDetailsModal.jsx';
import toast from 'react-hot-toast';
import './OrdersPage.scss';

function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [orderToDelete, setOrderToDelete] = useState(null);
    const [orderToView, setOrderToView] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, [statusFilter]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await ordersAPI.getOrders(statusFilter || undefined);
            setOrders(response.data);
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('Помилка завантаження замовлень');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await ordersAPI.updateOrderStatus(orderId, newStatus);
            toast.success('Статус оновлено');
            fetchOrders();
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Помилка оновлення статусу');
        }
    };

    const handleDeleteClick = (order) => {
        setOrderToDelete(order);
    };

    const handleConfirmDelete = async () => {
        if (!orderToDelete) return;

        try {
            await ordersAPI.deleteOrder(orderToDelete._id);
            toast.success('Замовлення видалено');
            setOrderToDelete(null);
            fetchOrders();
        } catch (error) {
            console.error('Error deleting order:', error);
            toast.error('Помилка видалення замовлення');
        }
    };

    const handleViewClick = (order) => {
        setOrderToView(order);
    };

    const statusLabels = {
        new: 'Нове',
        confirmed: 'Підтверджено',
        assembled: 'Зібрано',
        shipped: 'Відправлено',
        delivered: 'Доставлено',
        cancelled: 'Скасовано',
    };

    if (loading) {
        return (
            <div className="orders-page-admin">
                <div className="loading">Завантаження...</div>
            </div>
        );
    }

    return (
        <div className="orders-page-admin">
            <div className="page-header">
                <h1>Управління замовленнями</h1>

                <div className="filters">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="status-filter"
                    >
                        <option value="">Всі статуси</option>
                        <option value="new">Нові</option>
                        <option value="confirmed">Підтверджені</option>
                        <option value="assembled">Зібрані</option>
                        <option value="shipped">Відправлені</option>
                        <option value="delivered">Доставлені</option>
                        <option value="cancelled">Скасовані</option>
                    </select>
                </div>
            </div>

            {orders.length === 0 ? (
                <div className="empty-state">
                    <Package size={64} />
                    <h2>Немає замовлень</h2>
                    <p>Замовлення з'являться тут після оформлення покупцями</p>
                </div>
            ) : (
                <div className="orders-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Номер</th>
                                <th>Дата</th>
                                <th>Клієнт</th>
                                <th>Товарів</th>
                                <th>Сума</th>
                                <th>Статус</th>
                                <th>Дії</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order._id}>
                                    <td className="order-id">#{order._id.slice(-8)}</td>

                                    <td className="order-date">
                                        {new Date(order.createdAt).toLocaleString('uk-UA', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </td>

                                    <td className="order-customer">
                                        {order.user ? (
                                            <>
                                                <div className="customer-name">{order.user.fullName}</div>
                                                <div className="customer-email">{order.user.email}</div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="customer-name">{order.guestInfo?.fullName || 'Гість'}</div>
                                                <div className="customer-email">{order.guestInfo?.email || '—'}</div>
                                            </>
                                        )}
                                    </td>

                                    <td className="order-items">{order.items.length}</td>

                                    <td className="order-total">{order.totalAmount} грн</td>

                                    <td className="order-status">
                                        <select
                                            value={order.status}
                                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                            className={`status-select status-${order.status}`}
                                        >
                                            <option value="new">Нове</option>
                                            <option value="confirmed">Підтверджено</option>
                                            <option value="assembled">Зібрано</option>
                                            <option value="shipped">Відправлено</option>
                                            <option value="delivered">Доставлено</option>
                                            <option value="cancelled">Скасовано</option>
                                        </select>
                                    </td>

                                    <td className="order-actions">
                                        <button
                                            className="btn-action btn-view"
                                            onClick={() => handleViewClick(order)}
                                            title="Переглянути"
                                        >
                                            <Eye size={18} />
                                        </button>
                                        <button
                                            className="btn-action btn-delete"
                                            onClick={() => handleDeleteClick(order)}
                                            title="Видалити"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={!!orderToDelete}
                onClose={() => setOrderToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Видалити замовлення?"
                message={`Ви впевнені, що хочете видалити замовлення #${orderToDelete?._id.slice(-8)}? Ця дія незворотна.`}
                confirmText="Видалити"
                cancelText="Скасувати"
                variant="danger"
            />

            {/* Order Details Modal */}
            {orderToView && (
                <OrderDetailsModal
                    order={orderToView}
                    onClose={() => setOrderToView(null)}
                />
            )}
        </div>
    );
}

export default OrdersPage;