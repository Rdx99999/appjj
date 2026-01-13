import { useAuthStore } from '@/store/use-auth-store';
import { useRouter } from 'expo-router';
import { FileText, LogOut, MapPin, Shield, Store, User } from 'lucide-react-native';
import React from 'react';
import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/login' as any);
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (!user) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center p-6">
        <Text className="text-gray-500 text-lg mb-4">Please login to view profile</Text>
        <TouchableOpacity
          className="bg-blue-600 rounded-xl py-3 px-6"
          onPress={() => router.replace('/login' as any)}
        >
          <Text className="text-white font-semibold">Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-blue-600 px-4 pt-12 pb-8">
        <View className="items-center">
          <View className="w-24 h-24 bg-white rounded-full items-center justify-center mb-4">
            <User size={48} color="#3b82f6" />
          </View>
          <Text className="text-white text-2xl font-bold mb-1">
            {user.name}
          </Text>
          <Text className="text-blue-100">{user.email}</Text>
          <View className={`mt-3 px-3 py-1 rounded-full ${getStatusColor(user.status)}`}>
            <Text className="text-xs font-semibold">
              {getStatusText(user.status)}
            </Text>
          </View>
        </View>
      </View>

      {/* Profile Info */}
      <View className="p-4 -mt-4">
        <View className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <Text className="text-gray-900 font-semibold text-lg mb-4">
            Shop Information
          </Text>

          <View className="space-y-4">
            <View className="flex-row items-start">
              <Store size={20} color="#6b7280" className="mt-1 mr-3" />
              <View className="flex-1">
                <Text className="text-gray-500 text-xs mb-1">Shop Name</Text>
                <Text className="text-gray-900 font-medium">
                  {user.shop_name || 'Not provided'}
                </Text>
              </View>
            </View>

            {user.gst_no && (
              <View className="flex-row items-start">
                <FileText size={20} color="#6b7280" className="mt-1 mr-3" />
                <View className="flex-1">
                  <Text className="text-gray-500 text-xs mb-1">GST Number</Text>
                  <Text className="text-gray-900 font-medium">
                    {user.gst_no}
                  </Text>
                </View>
              </View>
            )}

            <View className="flex-row items-start">
              <MapPin size={20} color="#6b7280" className="mt-1 mr-3" />
              <View className="flex-1">
                <Text className="text-gray-500 text-xs mb-1">Address</Text>
                <Text className="text-gray-900 font-medium">
                  {user.address || 'Not provided'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Account Actions */}
        <View className="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
          <TouchableOpacity
            className="flex-row items-center p-4 border-b border-gray-100"
            onPress={() => router.push('/kyc-upload' as any)}
          >
            <Shield size={20} color="#3b82f6" className="mr-3" />
            <View className="flex-1">
              <Text className="text-gray-900 font-medium">KYC Documents</Text>
              <Text className="text-gray-500 text-xs">
                Manage your verification documents
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center p-4"
            onPress={() => router.replace('/(tabs)' as any)}
          >
            <FileText size={20} color="#3b82f6" className="mr-3" />
            <View className="flex-1">
              <Text className="text-gray-900 font-medium">Order History</Text>
              <Text className="text-gray-500 text-xs">
                View your past orders
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          className="bg-white rounded-xl shadow-sm p-4 flex-row items-center justify-center"
          onPress={handleLogout}
        >
          <LogOut size={20} color="#ef4444" />
          <Text className="text-red-500 font-semibold ml-2">Logout</Text>
        </TouchableOpacity>

        {/* App Info */}
        <View className="mt-6 text-center">
          <Text className="text-gray-400 text-xs">E-Commerce Seller App</Text>
          <Text className="text-gray-400 text-xs">Version 1.0.0</Text>
        </View>
      </View>
    </ScrollView>
  );
}