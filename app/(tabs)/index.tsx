import { Category, categoryService } from '@/lib/api-services';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { ArrowRight, Package, ShoppingBag, TrendingUp } from 'lucide-react-native';
import React from 'react';
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function HomeScreen() {
  const router = useRouter();

  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: categoryService.getAllCategories,
  });

  const quickActions = [
    {
      id: 'products',
      title: 'Browse Products',
      description: 'Explore our wide range of products',
      icon: Package,
      color: 'bg-blue-500',
      route: '/(tabs)/products',
    },
    {
      id: 'orders',
      title: 'My Orders',
      description: 'Track your order status',
      icon: ShoppingBag,
      color: 'bg-green-500',
      route: '/(tabs)/orders',
    },
  ];

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-blue-600 px-4 pt-12 pb-8">
        <Text className="text-white text-2xl font-bold mb-1">
          Welcome to E-Commerce
        </Text>
        <Text className="text-blue-100">
          Your one-stop shop for wholesale products
        </Text>
      </View>

      {/* Quick Actions */}
      <View className="p-4 -mt-4">
        <View className="flex-row gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <TouchableOpacity
                key={action.id}
                className="flex-1 bg-white rounded-xl p-4 shadow-sm"
                onPress={() => router.push(action.route as any)}
              >
                <View className={`${action.color} w-12 h-12 rounded-full items-center justify-center mb-3`}>
                  <Icon size={24} color="white" />
                </View>
                <Text className="text-gray-900 font-semibold mb-1">
                  {action.title}
                </Text>
                <Text className="text-gray-500 text-xs">
                  {action.description}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Categories */}
      <View className="p-4">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-gray-900 font-bold text-lg">
            Categories
          </Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/products' as any)}>
            <Text className="text-blue-600 text-sm font-medium">
              View All
            </Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View className="h-32 items-center justify-center">
            <Text className="text-gray-500">Loading categories...</Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row"
          >
            {categories?.map((category) => (
              <TouchableOpacity
                key={category.id}
                className="bg-white rounded-xl p-4 mr-3 shadow-sm items-center"
                style={{ width: 100 }}
                onPress={() => router.push('/(tabs)/products' as any)}
              >
                <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-2">
                  {category.image_url ? (
                    <Image
                      source={{ uri: category.image_url }}
                      className="w-16 h-16 rounded-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <Package size={24} color="#6b7280" />
                  )}
                </View>
                <Text className="text-gray-900 text-xs font-medium text-center" numberOfLines={2}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Features */}
      <View className="p-4">
        <Text className="text-gray-900 font-bold text-lg mb-4">
          Why Choose Us?
        </Text>
        <View className="space-y-3">
          <View className="bg-white rounded-xl p-4 shadow-sm flex-row items-center">
            <View className="bg-blue-100 w-12 h-12 rounded-full items-center justify-center mr-4">
              <TrendingUp size={24} color="#3b82f6" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 font-semibold mb-1">
                Best Prices
              </Text>
              <Text className="text-gray-500 text-xs">
                Competitive wholesale prices for all products
              </Text>
            </View>
          </View>

          <View className="bg-white rounded-xl p-4 shadow-sm flex-row items-center">
            <View className="bg-green-100 w-12 h-12 rounded-full items-center justify-center mr-4">
              <Package size={24} color="#10b981" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 font-semibold mb-1">
                Fast Delivery
              </Text>
              <Text className="text-gray-500 text-xs">
                Quick and reliable delivery to your shop
              </Text>
            </View>
          </View>

          <View className="bg-white rounded-xl p-4 shadow-sm flex-row items-center">
            <View className="bg-purple-100 w-12 h-12 rounded-full items-center justify-center mr-4">
              <ShoppingBag size={24} color="#8b5cf6" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 font-semibold mb-1">
                Wide Selection
              </Text>
              <Text className="text-gray-500 text-xs">
                Thousands of products across multiple categories
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* CTA */}
      <View className="p-4 mb-6">
        <TouchableOpacity
          className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6"
          onPress={() => router.push('/(tabs)/products' as any)}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-white font-bold text-lg mb-1">
                Start Shopping Now
              </Text>
              <Text className="text-blue-100 text-sm">
                Browse our catalog and place your first order
              </Text>
            </View>
            <View className="bg-white/20 rounded-full p-3">
              <ArrowRight size={24} color="white" />
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
