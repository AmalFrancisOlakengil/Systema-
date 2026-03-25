import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppStore } from '@/hooks/use-app-store';
import { GeminiService } from '@/services/gemini';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const { apiKey, updateApiKey } = useAppStore();
  const [newKey, setNewKey] = useState(apiKey || '');
  const [isValidating, setIsValidating] = useState(false);
  const router = useRouter();

  const handleUpdate = async () => {
    if (!newKey) return Alert.alert('Error', 'Please enter an API Key');
    
    setIsValidating(true);
    const gemini = new GeminiService(newKey);
    const isValid = await gemini.validateApiKey();
    setIsValidating(false);

    if (isValid) {
      await updateApiKey(newKey);
      Alert.alert('Success', 'API Key updated successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } else {
      Alert.alert('Error', 'Invalid API Key. Please check and try again.');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.section}>
        <ThemedText type="defaultSemiBold">Gemini API Key</ThemedText>
        <ThemedText style={styles.description}>
          Update your Gemini API key here. Make sure it's a valid key from Google AI Studio.
        </ThemedText>
        <TextInput
          style={styles.input}
          value={newKey}
          onChangeText={setNewKey}
          placeholder="Enter API Key"
          placeholderTextColor="#888"
          secureTextEntry
        />
        
        <TouchableOpacity 
          style={[styles.button, isValidating && styles.buttonDisabled]} 
          onPress={handleUpdate}
          disabled={isValidating}
        >
          <ThemedText style={styles.buttonText}>
            {isValidating ? 'Validating...' : 'Update API Key'}
          </ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <ThemedText style={styles.version}>App Version 1.0.0</ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  section: {
    gap: 12,
    marginTop: 20,
  },
  description: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 20,
  },
  version: {
    fontSize: 12,
    opacity: 0.4,
  },
});
