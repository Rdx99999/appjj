import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    CheckCircle,
    Clock,
    Eye,
    Package,
    Search,
    Truck,
    X,
    XCircle
} from 'lucide-react';
import React, { useState } from 'react';
import { Order, orderService } from '../api/services';

const Orders: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const queryClient = useQueryClient();

  const { data: orders, isLoading, error } = useQuery<Order[]>({
    queryKey: ['orders', statusFilter],
    queryFn: () => orderService.getAllOrders(undefined, statusFilter || undefined),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      orderService.updateOrderStatus(orderId as any, status as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const handleStatusChange = (orderId: string, newStatus: string) => {
    updateStatusMutation.mutate({ orderId, status: newStatus });
  };

  const handleViewDetails = async (order: Order) => {
    try {
      const orderDetails = await orderService.getOrder(order.id);
      setSelectedOrder(orderDetails);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  const filteredOrders = orders?.filter(order =>
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.shop_name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: Clock,
      shipped: Truck,
      delivered: CheckCircle,
      cancelled: XCircle,
    };
    const Icon = icons[status as keyof typeof icons] || Clock;
    return <Icon size={16} />;
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'status-badge-pending',
      shipped: 'status-badge-shipped',
      delivered: 'status-badge-delivered',
      cancelled: 'status-badge-cancelled',
    };
    return (
      <span className={`status-badge ${styles[status as keyof typeof styles]}`}>
        {getStatusIcon(status)}
        {status}
      </span>
    );
  };

  const getNextStatus = (currentStatus: string) => {
    const statusFlow: Record<string, string[]> = {
      pending: ['shipped', 'cancelled'],
      shipped: ['delivered', 'cancelled'],
      delivered: [],
      cancelled: [],
    };
    return statusFlow[currentStatus] || [];
  };

  if (isLoading) {
    return (
      <div className="page">
        <div className="page-header">
          <h1>Orders</h1>
        </div>
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="page-header">
          <h1>Orders</h1>
        </div>
        <div className="error">Error loading orders</div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Orders</h1>
        <p>Manage and track customer orders</p>
      </div>

      <div className="page-actions">
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Shop</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="no-data">
                  No orders found
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td className="font-medium">#{order.id.slice(0, 8)}</td>
                  <td>{order.user_name || '-'}</td>
                  <td>{order.shop_name || '-'}</td>
                  <td>{order.items?.length || 0} items</td>
                  <td className="font-medium">₹{order.total_amount.toFixed(2)}</td>
                  <td>{getStatusBadge(order.status)}</td>
                  <td>{new Date(order.created_at || '').toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-icon"
                        onClick={() => handleViewDetails(order)}
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      {getNextStatus(order.status).map((nextStatus) => (
                        <button
                          key={nextStatus}
                          className={`btn-icon btn-${nextStatus === 'cancelled' ? 'danger' : 'success'}`}
                          onClick={() => handleStatusChange(order.id, nextStatus)}
                          title={`Mark as ${nextStatus}`}
                          disabled={updateStatusMutation.isPending}
                        >
                          {nextStatus === 'shipped' && <Truck size={18} />}
                          {nextStatus === 'delivered' && <CheckCircle size={18} />}
                          {nextStatus === 'cancelled' && <XCircle size={18} />}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order Details</h2>
              <button className="modal-close" onClick={() => setShowDetailsModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="order-details">
                <div className="order-info-grid">
                  <div className="order-info-item">
                    <span className="info-label">Order ID:</span>
                    <span className="info-value">#{selectedOrder.id}</span>
                  </div>
                  <div className="order-info-item">
                    <span className="info-label">Status:</span>
                    <span className="info-value">{getStatusBadge(selectedOrder.status)}</span>
                  </div>
                  <div className="order-info-item">
                    <span className="info-label">Customer:</span>
                    <span className="info-value">{selectedOrder.user_name || '-'}</span>
                  </div>
                  <div className="order-info-item">
                    <span className="info-label">Shop:</span>
                    <span className="info-value">{selectedOrder.shop_name || '-'}</span>
                  </div>
                  <div className="order-info-item">
                    <span className="info-label">Order Date:</span>
                    <span className="info-value">
                      {new Date(selectedOrder.created_at || '').toLocaleString()}
                    </span>
                  </div>
                  <div className="order-info-item">
                    <span className="info-label">Total Amount:</span>
                    <span className="info-value font-medium">
                      ₹{selectedOrder.total_amount.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="order-items-section">
                  <h3>Order Items</h3>
                  <div className="order-items-list">
                    {selectedOrder.items?.map((item) => (
                      <div key={item.id} className="order-item-card">
                        <div className="order-item-image">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.product_name} />
                          ) : (
                            <div className="order-item-image-placeholder">
                              <Package size={32} />
                            </div>
                          )}
                        </div>
                        <div className="order-item-info">
                          <h4>{item.product_name || 'Unknown Product'}</h4>
                          <p>Quantity: {item.quantity}</p>
                          <p className="order-item-price">
                            ₹{item.price.toFixed(2)} × {item.quantity} = ₹{(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="order-actions-section">
                  <h3>Update Status</h3>
                  <div className="status-actions">
                    {getNextStatus(selectedOrder.status).map((nextStatus) => (
                      <button
                        key={nextStatus}
                        className={`btn btn-${nextStatus === 'cancelled' ? 'danger' : 'success'}`}
                        onClick={() => {
                          handleStatusChange(selectedOrder.id, nextStatus);
                          setShowDetailsModal(false);
                        }}
                        disabled={updateStatusMutation.isPending}
                      >
                        {nextStatus === 'shipped' && <Truck size={18} />}
                        {nextStatus === 'delivered' && <CheckCircle size={18} />}
                        {nextStatus === 'cancelled' && <XCircle size={18} />}
                        Mark as {nextStatus}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDetailsModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;