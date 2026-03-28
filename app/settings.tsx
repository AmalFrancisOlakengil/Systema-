import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppStore } from '@/hooks/use-app-store';
import { GeminiService } from '@/services/gemini';
import { useRouter } from 'expo-router';
import { useDynamicTheme } from '@/hooks/use-dynamic-theme';

export default function SettingsScreen() {
  const { apiKey, updateApiKey, profile, updateBio } = useAppStore();
  const [newKey, setNewKey] = useState(apiKey || '');
  const [newBio, setNewBio] = useState(profile?.bio || '');
  const [isValidating, setIsValidating] = useState(false);
  const router = useRouter();
  const theme = useDynamicTheme();

  const handleUpdateKey = async () => {
    if (!newKey) return Alert.alert('Error', 'Please enter an API Key');
    
    setIsValidating(true);
    const gemini = new GeminiService(newKey);
    const isValid = await gemini.validateApiKey();
    setIsValidating(false);

    if (isValid) {
      await updateApiKey(newKey);
      Alert.alert('Success', 'API Key updated successfully');
    } else {
      Alert.alert('Error', 'Invalid API Key. Please check and try again.');
    }
  };

  const handleUpdateBio = async () => {
    if (!newBio) return Alert.alert('Error', 'Bio cannot be empty');
    await updateBio(newBio);
    Alert.alert('Success', 'Bio updated successfully');
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <ThemedText type="defaultSemiBold">Gemini API Key</ThemedText>
          <ThemedText style={styles.description}>
            Update your Gemini API key here. Make sure it's a valid key from Google AI Studio.
          </ThemedText>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.icon, backgroundColor: 'rgba(255,255,255,0.05)' }]}
            value={newKey}
            onChangeText={setNewKey}
            placeholder="Enter API Key"
            placeholderTextColor={theme.icon}
            secureTextEntry
          />
          
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: theme.tint }, isValidating && styles.buttonDisabled]} 
            onPress={handleUpdateKey}
            disabled={isValidating}
          >
            <ThemedText style={styles.buttonText}>
              {isValidating ? 'Validating...' : 'Update API Key'}
            </ThemedText>
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { marginTop: 40 }]}>
          <ThemedText type="defaultSemiBold">Edit Bio</ThemedText>
          <ThemedText style={styles.description}>
            Your bio helps Gemini personalize your daily tasks.
          </ThemedText>
          <TextInput
            style={[styles.input, styles.bioInput, { color: theme.text, borderColor: theme.icon, backgroundColor: 'rgba(255,255,255,0.05)' }]}
            value={newBio}
            onChangeText={setNewBio}
            placeholder="Tell Gemini about yourself..."
            placeholderTextColor={theme.icon}
            multiline
          />
          
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: theme.tint }]} 
            onPress={handleUpdateBio}
          >
            <ThemedText style={styles.buttonText}>Update Bio</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <ThemedText style={styles.version}>App Version 1.1.0</ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
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
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
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
    marginTop: 60,
    alignItems: 'center',
  },
  version: {
    fontSize: 12,
    opacity: 0.4,
  },
});
