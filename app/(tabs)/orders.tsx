import { Order, orderService } from '@/lib/api-services';
import { useAuthStore } from '@/store/use-auth-store';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Calendar, CheckCircle, Clock, Package, Truck, XCircle } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function OrdersScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  const { data: orders, isLoading, error } = useQuery<Order[]>({
    queryKey: ['orders', selectedStatus],
    queryFn: () => orderService.getUserOrders(user?.id || '', selectedStatus || undefined),
    enabled: !!user?.id,
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} color="#f59e0b" />;
      case 'shipped':
        return <Truck size={16} color="#3b82f6" />;
      case 'delivered':
        return <CheckCircle size={16} color="#10b981" />;
      case 'cancelled':
        return <XCircle size={16} color="#ef4444" />;
      default:
        return <Clock size={16} color="#6b7280" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const statusFilters = [
    { id: '', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'shipped', label: 'Shipped' },
    { id: 'delivered', label: 'Delivered' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center p-6">
        <Text className="text-red-500 text-lg mb-4">Error loading orders</Text>
        <TouchableOpacity
          className="bg-blue-600 rounded-xl py-3 px-6"
          onPress={() => router.replace('/(tabs)' as any)}
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 pt-12 pb-4 border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900 mb-3">
          My Orders
        </Text>

        {/* Status Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row"
        >
          {statusFilters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              className={`px-4 py-2 rounded-full mr-2 ${
                selectedStatus === filter.id ? 'bg-blue-600' : 'bg-gray-200'
              }`}
              onPress={() => setSelectedStatus(filter.id)}
            >
              <Text
                className={`font-medium ${
                  selectedStatus === filter.id ? 'text-white' : 'text-gray-700'
                }`}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Orders List */}
      <ScrollView className="flex-1 p-4">
        {!orders || orders.length === 0 ? (
          <View className="flex-1 justify-center items-center py-20">
            <Package size={64} color="#d1d5db" />
            <Text className="text-gray-500 text-lg mt-4 mb-2">No orders found</Text>
            <Text className="text-gray-400 text-sm mb-6">
              Start shopping to see your orders here
            </Text>
            <TouchableOpacity
              className="bg-blue-600 rounded-xl py-3 px-6"
              onPress={() => router.replace('/(tabs)' as any)}
            >
              <Text className="text-white font-semibold">Browse Products</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="space-y-4">
            {orders.map((order) => (
              <TouchableOpacity
                key={order.id}
                className="bg-white rounded-xl p-4 shadow-sm"
                onPress={() => router.push('/product-list' as any)}
              >
                {/* Order Header */}
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center">
                    <Text className="font-semibold text-gray-900 mr-2">
                      #{order.id.slice(0, 8)}
                    </Text>
                    <View className={`px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                      <View className="flex-row items-center">
                        {getStatusIcon(order.status)}
                        <Text className="text-xs font-medium ml-1">
                          {getStatusText(order.status)}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View className="flex-row items-center text-gray-500">
                    <Calendar size={14} color="#6b7280" />
                    <Text className="text-xs ml-1">
                      {formatDate(order.created_at || '')}
                    </Text>
                  </View>
                </View>

                {/* Order Items Preview */}
                <View className="flex-row items-center mb-3">
                  <View className="flex-1">
                    <Text className="text-gray-600 text-sm">
                      {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                    </Text>
                    {order.items && order.items.length > 0 && (
                      <Text className="text-gray-500 text-xs mt-1" numberOfLines={1}>
                        {order.items[0].product_name}
                        {order.items.length > 1 && ` +${order.items.length - 1} more`}
                      </Text>
                    )}
                  </View>
                  <View className="text-right">
                    <Text className="font-bold text-blue-600 text-lg">
                      ₹{order.total_amount.toFixed(2)}
                    </Text>
                  </View>
                </View>

                {/* View Details Button */}
                <View className="border-t border-gray-100 pt-3">
                  <Text className="text-blue-600 text-sm font-medium text-center">
                    View Details →
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}