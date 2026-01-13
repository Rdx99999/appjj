import { Category, categoryService, Product, productService } from '@/lib/api-services';
import { useCartStore } from '@/store/use-cart-store';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Filter, Minus, Plus, Search, ShoppingCart } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ProductsScreen() {
  const router = useRouter();
  const { addItem, items } = useCartStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['products', selectedCategory],
    queryFn: () => productService.getAllProducts(selectedCategory || undefined),
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: categoryService.getAllCategories,
  });

  const getCartItem = (productId: string) => {
    return items.find((item) => item.product.id === productId);
  };

  const filteredProducts = products?.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleAddToCart = (product: Product) => {
    addItem(product);
  };

  const handleIncreaseQuantity = (productId: string) => {
    const cartItem = getCartItem(productId);
    if (cartItem) {
      const { updateQuantity } = useCartStore.getState();
      updateQuantity(productId, cartItem.quantity + 1);
    }
  };

  const handleDecreaseQuantity = (productId: string) => {
    const cartItem = getCartItem(productId);
    if (cartItem) {
      const { updateQuantity } = useCartStore.getState();
      updateQuantity(productId, cartItem.quantity - 1);
    }
  };

  const getTotalItems = () => {
    return useCartStore.getState().getTotalItems();
  };

  const getDiscountedPrice = (price: number, discount: number) => {
    return price * (1 - discount / 100);
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 pt-12 pb-4 border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900 mb-3">
          Products
        </Text>
        
        {/* Search Bar */}
        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
          <Search size={20} color="#6b7280" />
          <TextInput
            className="flex-1 ml-3 text-gray-900"
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
            <Filter size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Category Filter */}
        {showFilters && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-3"
          >
            <TouchableOpacity
              className={`px-4 py-2 rounded-full mr-2 ${
                selectedCategory === '' ? 'bg-blue-600' : 'bg-gray-200'
              }`}
              onPress={() => setSelectedCategory('')}
            >
              <Text
                className={`font-medium ${
                  selectedCategory === '' ? 'text-white' : 'text-gray-700'
                }`}
              >
                All
              </Text>
            </TouchableOpacity>
            {categories?.map((category) => (
              <TouchableOpacity
                key={category.id}
                className={`px-4 py-2 rounded-full mr-2 ${
                  selectedCategory === category.id ? 'bg-blue-600' : 'bg-gray-200'
                }`}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text
                  className={`font-medium ${
                    selectedCategory === category.id ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Products List */}
      {productsLoading || categoriesLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : (
        <ScrollView className="flex-1 p-4">
          {filteredProducts.length === 0 ? (
            <View className="flex-1 justify-center items-center py-20">
              <Text className="text-gray-500 text-lg">No products found</Text>
            </View>
          ) : (
            <View className="flex-row flex-wrap justify-between">
              {filteredProducts.map((product) => {
                const cartItem = getCartItem(product.id);
                const discountedPrice = getDiscountedPrice(
                  product.price,
                  product.discount
                );

                return (
                  <View
                    key={product.id}
                    className="bg-white rounded-xl shadow-sm mb-4"
                    style={{ width: '48%' }}
                  >
                    <TouchableOpacity
                      onPress={() => router.push('/product-list' as any)}
                    >
                      <View className="h-32 bg-gray-100 rounded-t-xl overflow-hidden">
                        {product.image_url ? (
                          <Image
                            source={{ uri: product.image_url }}
                            className="w-full h-full"
                            resizeMode="cover"
                          />
                        ) : (
                          <View className="w-full h-full flex items-center justify-center">
                            <Text className="text-gray-400 text-xs">No Image</Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>

                    <View className="p-3">
                      <Text
                        className="font-semibold text-gray-900 text-sm mb-1"
                        numberOfLines={1}
                      >
                        {product.name}
                      </Text>
                      <Text
                        className="text-gray-500 text-xs mb-2"
                        numberOfLines={2}
                      >
                        {product.description}
                      </Text>

                      <View className="flex-row items-center justify-between">
                        <View>
                          <Text className="font-bold text-blue-600 text-sm">
                            ₹{discountedPrice.toFixed(2)}
                          </Text>
                          {product.discount > 0 && (
                            <Text className="text-gray-400 text-xs line-through">
                              ₹{product.price.toFixed(2)}
                            </Text>
                          )}
                        </View>
                        <Text className="text-gray-500 text-xs">
                          / {product.unit}
                        </Text>
                      </View>

                      {cartItem ? (
                        <View className="flex-row items-center justify-between mt-3 bg-blue-50 rounded-lg p-2">
                          <TouchableOpacity
                            onPress={() => handleDecreaseQuantity(product.id)}
                            className="bg-white rounded-full p-1"
                          >
                            <Minus size={16} color="#3b82f6" />
                          </TouchableOpacity>
                          <Text className="font-semibold text-blue-600">
                            {cartItem.quantity}
                          </Text>
                          <TouchableOpacity
                            onPress={() => handleIncreaseQuantity(product.id)}
                            className="bg-white rounded-full p-1"
                          >
                            <Plus size={16} color="#3b82f6" />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity
                          className="bg-blue-600 rounded-lg py-2 mt-3 flex-row items-center justify-center"
                          onPress={() => handleAddToCart(product)}
                        >
                          <ShoppingCart size={16} color="white" />
                          <Text className="text-white font-medium text-sm ml-1">
                            Add
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}

      {/* Cart Button */}
      {getTotalItems() > 0 && (
        <TouchableOpacity
          className="absolute bottom-6 right-6 bg-blue-600 rounded-full p-4 shadow-lg"
          onPress={() => router.push('/product-list' as any)}
        >
          <ShoppingCart size={24} color="white" />
          <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-6 h-6 items-center justify-center">
            <Text className="text-white text-xs font-bold">
              {getTotalItems()}
            </Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}