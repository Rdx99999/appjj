import { orderService } from '@/lib/api-services';
import { useAuthStore } from '@/store/use-auth-store';
import { CartItem, useCartStore } from '@/store/use-cart-store';
import { useRouter } from 'expo-router';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function CartScreen() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice } = useCartStore();
  const { user } = useAuthStore();
  const [placingOrder, setPlacingOrder] = useState(false);

  const handleIncreaseQuantity = (productId: string) => {
    const cartItem = items.find((item) => item.product.id === productId);
    if (cartItem) {
      updateQuantity(productId, cartItem.quantity + 1);
    }
  };

  const handleDecreaseQuantity = (productId: string) => {
    const cartItem = items.find((item) => item.product.id === productId);
    if (cartItem) {
      if (cartItem.quantity > 1) {
        updateQuantity(productId, cartItem.quantity - 1);
      } else {
        removeItem(productId);
      }
    }
  };

  const handleRemoveItem = (productId: string) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeItem(productId) },
      ]
    );
  };

  const handlePlaceOrder = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'Please login to place an order');
      router.push('/login' as any);
      return;
    }

    if (user.status !== 'verified') {
      Alert.alert(
        'Account Not Verified',
        'Your account is not verified yet. Please complete KYC verification to place orders.'
      );
      return;
    }

    setPlacingOrder(true);
    try {
      const orderItems = items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));

      const response = await orderService.createOrder(user.id, orderItems);

      clearCart();
      Alert.alert(
        'Order Placed Successfully!',
        `Your order #${response.id.slice(0, 8)} has been placed successfully.`,
        [
          {
            text: 'View Orders',
            onPress: () => router.replace('/(tabs)' as any),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Order Failed',
        error.response?.data?.error || 'Failed to place order. Please try again.'
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  const getDiscountedPrice = (price: number, discount: number) => {
    return price * (1 - discount / 100);
  };

  const getItemTotal = (item: CartItem) => {
    const price = getDiscountedPrice(item.product.price, item.product.discount);
    return price * item.quantity;
  };

  if (items.length === 0) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center p-6">
        <ShoppingBag size={64} color="#d1d5db" />
        <Text className="text-gray-500 text-lg mt-4 mb-2">Your cart is empty</Text>
        <Text className="text-gray-400 text-sm mb-6">
          Add products to get started
        </Text>
        <TouchableOpacity
          className="bg-blue-600 rounded-xl py-3 px-6"
          onPress={() => router.back()}
        >
          <Text className="text-white font-semibold">Browse Products</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 pt-12 pb-4 border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900">
          Shopping Cart ({items.length})
        </Text>
      </View>

      {/* Cart Items */}
      <ScrollView className="flex-1 p-4">
        <View className="space-y-4">
          {items.map((item) => {
            const discountedPrice = getDiscountedPrice(
              item.product.price,
              item.product.discount
            );

            return (
              <View
                key={item.product.id}
                className="bg-white rounded-xl p-4 shadow-sm flex-row"
              >
                <View className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden mr-4">
                  {item.product.image_url ? (
                    <Image
                      source={{ uri: item.product.image_url }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-full h-full items-center justify-center">
                      <Text className="text-gray-400 text-xs">No Image</Text>
                    </View>
                  )}
                </View>

                <View className="flex-1">
                  <Text className="font-semibold text-gray-900 mb-1" numberOfLines={1}>
                    {item.product.name}
                  </Text>
                  <Text className="text-gray-500 text-xs mb-2" numberOfLines={2}>
                    {item.product.description}
                  </Text>

                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text className="font-bold text-blue-600">
                        ₹{discountedPrice.toFixed(2)}
                      </Text>
                      {item.product.discount > 0 && (
                        <Text className="text-gray-400 text-xs line-through">
                          ₹{item.product.price.toFixed(2)}
                        </Text>
                      )}
                    </View>
                    <Text className="text-gray-500 text-xs">
                      / {item.product.unit}
                    </Text>
                  </View>

                  <View className="flex-row items-center justify-between mt-3">
                    <View className="flex-row items-center bg-gray-100 rounded-lg">
                      <TouchableOpacity
                        onPress={() => handleDecreaseQuantity(item.product.id)}
                        className="p-2"
                      >
                        <Minus size={16} color="#6b7280" />
                      </TouchableOpacity>
                      <Text className="font-semibold text-gray-900 mx-3">
                        {item.quantity}
                      </Text>
                      <TouchableOpacity
                        onPress={() => handleIncreaseQuantity(item.product.id)}
                        className="p-2"
                      >
                        <Plus size={16} color="#6b7280" />
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      onPress={() => handleRemoveItem(item.product.id)}
                      className="p-2"
                    >
                      <Trash2 size={18} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Order Summary */}
      <View className="bg-white border-t border-gray-200 p-4">
        <View className="space-y-2 mb-4">
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Subtotal</Text>
            <Text className="text-gray-900 font-medium">
              ₹{getTotalPrice().toFixed(2)}
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Delivery</Text>
            <Text className="text-green-600 font-medium">Free</Text>
          </View>
          <View className="border-t border-gray-200 pt-2 mt-2">
            <View className="flex-row justify-between">
              <Text className="text-gray-900 font-bold text-lg">Total</Text>
              <Text className="text-blue-600 font-bold text-lg">
                ₹{getTotalPrice().toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          className="bg-blue-600 rounded-xl py-4 flex-row items-center justify-center"
          onPress={handlePlaceOrder}
          disabled={placingOrder}
        >
          {placingOrder ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text className="text-white font-semibold text-lg mr-2">
                Place Order
              </Text>
              <ArrowRight size={20} color="white" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}