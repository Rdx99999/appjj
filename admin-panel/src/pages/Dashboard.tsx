import { useQuery } from '@tanstack/react-query';
import {
    Clock,
    DollarSign,
    Package,
    ShoppingCart,
    TrendingUp,
    Users
} from 'lucide-react';
import React from 'react';
import { dashboardService, DashboardStats } from '../api/services';

const Dashboard: React.FC = () => {
  const { data: stats, isLoading, error, refetch } = useQuery<DashboardStats>({
    queryKey: ['dashboard'],
    queryFn: dashboardService.getStats,
  });

  if (isLoading) {
    return (
      <div className="page">
        <div className="page-header">
          <h1>Dashboard</h1>
        </div>
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="page-header">
          <h1>Dashboard</h1>
        </div>
        <div className="error">Error loading dashboard data</div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Sellers',
      value: stats?.totalSellers || 0,
      icon: Users,
      color: 'blue',
      link: '/sellers',
    },
    {
      title: 'Pending Approvals',
      value: stats?.pendingSellers || 0,
      icon: Clock,
      color: 'yellow',
      link: '/sellers',
    },
    {
      title: 'Total Products',
      value: stats?.totalProducts || 0,
      icon: Package,
      color: 'green',
      link: '/products',
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      color: 'purple',
      link: '/orders',
    },
    {
      title: 'Pending Orders',
      value: stats?.pendingOrders || 0,
      icon: Clock,
      color: 'orange',
      link: '/orders',
    },
    {
      title: 'Total Revenue',
      value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'emerald',
      link: '/orders',
    },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Overview of your e-commerce platform</p>
      </div>

      <div className="stats-grid">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className={`stat-card stat-card-${stat.color}`}>
              <div className="stat-icon">
                <Icon size={32} />
              </div>
              <div className="stat-content">
                <h3>{stat.title}</h3>
                <p className="stat-value">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="dashboard-sections">
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Quick Actions</h2>
          </div>
          <div className="quick-actions">
            <a href="/sellers" className="action-card">
              <Users size={24} />
              <span>Manage Sellers</span>
            </a>
            <a href="/products" className="action-card">
              <Package size={24} />
              <span>Add Products</span>
            </a>
            <a href="/orders" className="action-card">
              <ShoppingCart size={24} />
              <span>View Orders</span>
            </a>
            <a href="/kyc" className="action-card">
              <TrendingUp size={24} />
              <span>Verify KYC</span>
            </a>
          </div>
        </div>

        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Activity</h2>
          </div>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon activity-icon-success">
                <Users size={16} />
              </div>
              <div className="activity-content">
                <p>New seller registration pending approval</p>
                <span className="activity-time">2 minutes ago</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon activity-icon-info">
                <ShoppingCart size={16} />
              </div>
              <div className="activity-content">
                <p>New order received</p>
                <span className="activity-time">15 minutes ago</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon activity-icon-warning">
                <Package size={16} />
              </div>
              <div className="activity-content">
                <p>Low stock alert: Product XYZ</p>
                <span className="activity-time">1 hour ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;