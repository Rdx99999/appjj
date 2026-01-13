import { authService } from '@/lib/api-services';
import { useAuthStore } from '@/store/use-auth-store';
import { useRouter } from 'expo-router';
import { ArrowRight, Lock, Mail } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Invalid email format';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await authService.login(email, password);
      
      if (response.user.role !== 'seller') {
        Alert.alert(
          'Access Denied',
          'This app is for sellers only. Please use the admin panel for admin access.'
        );
        return;
      }

      login(response.user, response.token);
      
      // Check if user is verified
      if (response.user.status === 'pending') {
        Alert.alert(
          'Account Pending',
          'Your account is pending verification. Please upload your KYC documents.',
          [
            {
              text: 'Upload Documents',
              onPress: () => router.replace('/kyc-upload' as any),
            },
          ]
        );
      } else if (response.user.status === 'rejected') {
        Alert.alert(
          'Account Rejected',
          'Your account has been rejected. Please contact support for more information.'
        );
      } else {
        router.replace('/(tabs)' as any);
      }
    } catch (error: any) {
      Alert.alert(
        'Login Failed',
        error.response?.data?.error || 'Invalid email or password'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gray-50"
    >
      <View className="flex-1 justify-center p-6">
        <View className="mb-10">
          <Text className="text-4xl font-bold text-gray-900 mb-2">
            Welcome Back
          </Text>
          <Text className="text-gray-600 text-lg">
            Sign in to your seller account
          </Text>
        </View>

        <View className="space-y-5">
          {/* Email */}
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Email Address
            </Text>
            <View className="flex-row items-center bg-white border border-gray-300 rounded-xl px-4">
              <Mail size={20} color="#6b7280" />
              <TextInput
                className="flex-1 ml-3 py-4 text-gray-900"
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
            {errors.email && (
              <Text className="text-red-500 text-xs mt-1">{errors.email}</Text>
            )}
          </View>

          {/* Password */}
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Password
            </Text>
            <View className="flex-row items-center bg-white border border-gray-300 rounded-xl px-4">
              <Lock size={20} color="#6b7280" />
              <TextInput
                className="flex-1 ml-3 py-4 text-gray-900"
                placeholder="Enter your password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>
          </View>

          {/* Forgot Password */}
          <TouchableOpacity className="self-end">
            <Text className="text-blue-600 text-sm font-medium">
              Forgot Password?
            </Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            className="bg-blue-600 rounded-xl py-4 mt-4 flex-row items-center justify-center"
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text className="text-white font-semibold text-lg mr-2">
                  Sign In
                </Text>
                <ArrowRight size={20} color="white" />
              </>
            )}
          </TouchableOpacity>

          {/* Register Link */}
          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-600">Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/register' as any)}>
              <Text className="text-blue-600 font-semibold">Register</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Demo Info */}
        <View className="mt-10 p-4 bg-blue-50 rounded-xl">
          <Text className="text-blue-900 font-semibold text-sm mb-1">
            Demo Account
          </Text>
          <Text className="text-blue-700 text-xs">
            Use any email to register as a new seller
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}