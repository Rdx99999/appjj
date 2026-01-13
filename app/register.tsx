import { authService } from '@/lib/api-services';
import { useAuthStore } from '@/store/use-auth-store';
import { useRouter } from 'expo-router';
import { FileText, Mail, MapPin, Phone, Store, User } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function RegisterScreen() {
  const router = useRouter();
  const { login } = useAuthStore();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gstNo: '',
    shopName: '',
    address: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.shopName.trim()) {
      newErrors.shopName = 'Shop name is required';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await authService.register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        gstNo: formData.gstNo,
        shopName: formData.shopName,
        address: formData.address,
      });

      // Auto-login after registration
      const loginResponse = await authService.login(formData.email, '');
      
      login(loginResponse.user, loginResponse.token);
      
      Alert.alert(
        'Registration Successful',
        'Your account has been created. Please upload your KYC documents to complete verification.',
        [
          {
            text: 'OK',
            onPress: () => router.push('/kyc-upload' as any),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Registration Failed',
        error.response?.data?.error || 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-6 pt-12">
        <View className="mb-8">
          <Text className="text-3xl font-bold text-gray-900 mb-2">
            Create Account
          </Text>
          <Text className="text-gray-600">
            Register as a seller to start ordering products
          </Text>
        </View>

        <View className="space-y-4">
          {/* Name */}
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </Text>
            <View className="flex-row items-center bg-white border border-gray-300 rounded-lg px-4">
              <User size={20} color="#6b7280" />
              <TextInput
                className="flex-1 ml-3 py-3 text-gray-900"
                placeholder="Enter your full name"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />
            </View>
            {errors.name && (
              <Text className="text-red-500 text-xs mt-1">{errors.name}</Text>
            )}
          </View>

          {/* Email */}
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </Text>
            <View className="flex-row items-center bg-white border border-gray-300 rounded-lg px-4">
              <Mail size={20} color="#6b7280" />
              <TextInput
                className="flex-1 ml-3 py-3 text-gray-900"
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
              />
            </View>
            {errors.email && (
              <Text className="text-red-500 text-xs mt-1">{errors.email}</Text>
            )}
          </View>

          {/* Phone */}
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </Text>
            <View className="flex-row items-center bg-white border border-gray-300 rounded-lg px-4">
              <Phone size={20} color="#6b7280" />
              <TextInput
                className="flex-1 ml-3 py-3 text-gray-900"
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
              />
            </View>
          </View>

          {/* GST Number */}
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">
              GST Number (Optional)
            </Text>
            <View className="flex-row items-center bg-white border border-gray-300 rounded-lg px-4">
              <FileText size={20} color="#6b7280" />
              <TextInput
                className="flex-1 ml-3 py-3 text-gray-900"
                placeholder="Enter GST number if available"
                autoCapitalize="characters"
                value={formData.gstNo}
                onChangeText={(text) => setFormData({ ...formData, gstNo: text.toUpperCase() })}
              />
            </View>
            <Text className="text-gray-500 text-xs mt-1">
              Leave blank if you don't have a GST number
            </Text>
          </View>

          {/* Shop Name */}
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Shop Name *
            </Text>
            <View className="flex-row items-center bg-white border border-gray-300 rounded-lg px-4">
              <Store size={20} color="#6b7280" />
              <TextInput
                className="flex-1 ml-3 py-3 text-gray-900"
                placeholder="Enter your shop name"
                value={formData.shopName}
                onChangeText={(text) => setFormData({ ...formData, shopName: text })}
              />
            </View>
            {errors.shopName && (
              <Text className="text-red-500 text-xs mt-1">{errors.shopName}</Text>
            )}
          </View>

          {/* Address */}
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Shop Address *
            </Text>
            <View className="bg-white border border-gray-300 rounded-lg px-4">
              <View className="flex-row items-start pt-3">
                <MapPin size={20} color="#6b7280" />
                <TextInput
                  className="flex-1 ml-3 py-3 text-gray-900"
                  placeholder="Enter your shop address"
                  multiline
                  numberOfLines={3}
                  value={formData.address}
                  onChangeText={(text) => setFormData({ ...formData, address: text })}
                />
              </View>
            </View>
            {errors.address && (
              <Text className="text-red-500 text-xs mt-1">{errors.address}</Text>
            )}
          </View>

          {/* Register Button */}
          <TouchableOpacity
            className="bg-blue-600 rounded-lg py-4 mt-6"
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold text-center text-lg">
                Register
              </Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View className="flex-row justify-center mt-4">
            <Text className="text-gray-600">Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/login' as any)}>
              <Text className="text-blue-600 font-semibold">Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}