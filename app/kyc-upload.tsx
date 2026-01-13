import { kycService } from '@/lib/api-services';
import { useAuthStore } from '@/store/use-auth-store';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { AlertCircle, CheckCircle, FileText, Upload } from 'lucide-react-native';
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

interface DocumentType {
  id: string;
  name: string;
  description: string;
  required: boolean;
}

const DOCUMENT_TYPES: DocumentType[] = [
  {
    id: 'gst',
    name: 'GST Certificate',
    description: 'Upload your GST registration certificate',
    required: false,
  },
  {
    id: 'shop_license',
    name: 'Shop License',
    description: 'Upload your shop establishment license',
    required: true,
  },
  {
    id: 'aadhaar',
    name: 'Aadhaar Card',
    description: 'Upload your Aadhaar card (front side)',
    required: true,
  },
  {
    id: 'pan',
    name: 'PAN Card',
    description: 'Upload your PAN card',
    required: true,
  },
];

export default function KYCUploadScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [uploadedDocuments, setUploadedDocuments] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);

  const pickImage = async (documentType: string) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadDocument(documentType, result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadDocument = async (documentType: string, asset: any) => {
    if (!user?.id) {
      Alert.alert('Error', 'User not found');
      return;
    }

    setUploading((prev) => ({ ...prev, [documentType]: true }));

    try {
      const response = await kycService.uploadDocument(
        user.id,
        documentType,
        asset
      );

      setUploadedDocuments((prev) => ({
        ...prev,
        [documentType]: response.documentUrl,
      }));

      Alert.alert('Success', 'Document uploaded successfully');
    } catch (error: any) {
      Alert.alert(
        'Upload Failed',
        error.response?.data?.error || 'Failed to upload document'
      );
    } finally {
      setUploading((prev) => ({ ...prev, [documentType]: false }));
    }
  };

  const handleSubmit = () => {
    const requiredDocs = DOCUMENT_TYPES.filter((doc) => doc.required);
    const missingDocs = requiredDocs.filter(
      (doc) => !uploadedDocuments[doc.id]
    );

    if (missingDocs.length > 0) {
      Alert.alert(
        'Missing Documents',
        `Please upload all required documents: ${missingDocs.map((d) => d.name).join(', ')}`
      );
      return;
    }

    Alert.alert(
      'Documents Submitted',
      'Your KYC documents have been submitted for verification. You will be notified once verified.',
      [
        {
          text: 'OK',
          onPress: () => router.replace('/(tabs)' as any),
        },
      ]
    );
  };

  const getRequiredCount = () => {
    return DOCUMENT_TYPES.filter((doc) => doc.required).length;
  };

  const getUploadedCount = () => {
    return DOCUMENT_TYPES.filter(
      (doc) => doc.required && uploadedDocuments[doc.id]
    ).length;
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-6 pt-12">
        <View className="mb-6">
          <Text className="text-3xl font-bold text-gray-900 mb-2">
            KYC Verification
          </Text>
          <Text className="text-gray-600">
            Upload your documents to complete verification
          </Text>
        </View>

        {/* Progress */}
        <View className="bg-blue-50 rounded-xl p-4 mb-6">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-blue-900 font-semibold">
              Documents Uploaded
            </Text>
            <Text className="text-blue-700 font-bold">
              {getUploadedCount()} / {getRequiredCount()}
            </Text>
          </View>
          <View className="bg-blue-200 rounded-full h-2">
            <View
              className="bg-blue-600 rounded-full h-2"
              style={{
                width: `${(getUploadedCount() / getRequiredCount()) * 100}%`,
              }}
            />
          </View>
        </View>

        {/* Document List */}
        <View className="space-y-4">
          {DOCUMENT_TYPES.map((doc) => {
            const isUploaded = !!uploadedDocuments[doc.id];
            const isUploading = uploading[doc.id];

            return (
              <View
                key={doc.id}
                className="bg-white rounded-xl p-4 border border-gray-200"
              >
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                      <Text className="font-semibold text-gray-900">
                        {doc.name}
                      </Text>
                      {doc.required && (
                        <Text className="text-red-500 text-xs">*</Text>
                      )}
                    </View>
                    <Text className="text-gray-500 text-sm mt-1">
                      {doc.description}
                    </Text>
                  </View>
                  {isUploaded ? (
                    <View className="bg-green-100 p-2 rounded-full">
                      <CheckCircle size={20} color="#10b981" />
                    </View>
                  ) : (
                    <View className="bg-gray-100 p-2 rounded-full">
                      <FileText size={20} color="#6b7280" />
                    </View>
                  )}
                </View>

                {isUploaded && uploadedDocuments[doc.id] && (
                  <View className="mb-3">
                    <Image
                      source={{ uri: uploadedDocuments[doc.id] }}
                      className="w-full h-32 rounded-lg"
                      resizeMode="cover"
                    />
                  </View>
                )}

                <TouchableOpacity
                  className={`flex-row items-center justify-center py-3 rounded-lg ${
                    isUploaded
                      ? 'bg-gray-100'
                      : 'bg-blue-600'
                  }`}
                  onPress={() => pickImage(doc.id)}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <ActivityIndicator color={isUploaded ? '#6b7280' : 'white'} />
                  ) : (
                    <>
                      <Upload
                        size={18}
                        color={isUploaded ? '#6b7280' : 'white'}
                      />
                      <Text
                        className={`ml-2 font-medium ${
                          isUploaded ? 'text-gray-700' : 'text-white'
                        }`}
                      >
                        {isUploaded ? 'Change Document' : 'Upload Document'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {/* Info Box */}
        <View className="bg-yellow-50 rounded-xl p-4 mt-6 flex-row items-start gap-3">
          <AlertCircle size={20} color="#f59e0b" />
          <View className="flex-1">
            <Text className="text-yellow-900 font-semibold text-sm mb-1">
              Verification Process
            </Text>
            <Text className="text-yellow-800 text-xs">
              Your documents will be reviewed by our team. This usually takes 1-2 business days. You will be notified once your account is verified.
            </Text>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          className="bg-blue-600 rounded-xl py-4 mt-6"
          onPress={handleSubmit}
          disabled={submitting || getUploadedCount() < getRequiredCount()}
        >
          {submitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-center text-lg">
              Submit Documents
            </Text>
          )}
        </TouchableOpacity>

        {/* Skip Button */}
        <TouchableOpacity
          className="mt-3"
          onPress={() => router.replace('/(tabs)' as any)}
        >
          <Text className="text-gray-600 text-center">
            Skip for now (you can upload later)
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}