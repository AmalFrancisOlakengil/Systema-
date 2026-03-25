import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppStore } from '@/hooks/use-app-store';
import { GeminiService } from '@/services/gemini';

export default function OnboardingScreen() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [bio, setBio] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');
  
  const { completeOnboarding } = useAppStore();
  const router = useRouter();

  const handleNext = async () => {
    if (step === 1) {
      if (!name) return setError('Please enter your name');
      setStep(2);
      setError('');
    } else if (step === 2) {
      if (!apiKey) return setError('Please enter your Gemini API Key');
      setIsValidating(true);
      setError('');
      const gemini = new GeminiService(apiKey);
      const isValid = await gemini.validateApiKey();
      setIsValidating(false);
      if (isValid) {
        setStep(3);
      } else {
        setError('Invalid API Key. Please check and try again.');
      }
    } else if (step === 3) {
      if (!bio) return setError('Please enter a brief introduction');
      await completeOnboarding(name, bio, apiKey);
      router.replace('/(tabs)');
    }
  };

  const openGeminiLink = () => {
    Linking.openURL('https://aistudio.google.com/app/apikey');
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText type="title" style={styles.title}>Welcome!</ThemedText>
        <ThemedText style={styles.subtitle}>Let's set up your personalized productivity assistant.</ThemedText>

        {step === 1 && (
          <View style={styles.stepContainer}>
            <ThemedText type="defaultSemiBold">What's your name?</ThemedText>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor="#888"
            />
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContainer}>
            <ThemedText type="defaultSemiBold">Gemini API Key</ThemedText>
            <ThemedText style={styles.description}>
              The app uses Gemini AI to analyze your work and suggest tasks. 
              You can get a free API key from Google AI Studio.
            </ThemedText>
            <TouchableOpacity onPress={openGeminiLink}>
              <ThemedText style={styles.link}>Get API Key Here</ThemedText>
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              value={apiKey}
              onChangeText={setApiKey}
              placeholder="Enter API Key"
              placeholderTextColor="#888"
              secureTextEntry
            />
          </View>
        )}

        {step === 3 && (
          <View style={styles.stepContainer}>
            <ThemedText type="defaultSemiBold">Tell us about yourself</ThemedText>
            <ThemedText style={styles.description}>
              A brief introduction helps Gemini personalize your daily tasks.
            </ThemedText>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={bio}
              onChangeText={setBio}
              placeholder="e.g. I am a software engineer who loves running and learning new languages."
              placeholderTextColor="#888"
              multiline
              numberOfLines={4}
            />
          </View>
        )}

        {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}

        <TouchableOpacity 
          style={[styles.button, isValidating && styles.buttonDisabled]} 
          onPress={handleNext}
          disabled={isValidating}
        >
          <ThemedText style={styles.buttonText}>
            {isValidating ? 'Validating...' : step === 3 ? 'Get Started' : 'Next'}
          </ThemedText>
        </TouchableOpacity>
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
    paddingTop: 80,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 32,
    opacity: 0.7,
  },
  stepContainer: {
    gap: 12,
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000', // Need to handle dark mode properly later
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  description: {
    fontSize: 14,
    opacity: 0.8,
  },
  link: {
    color: '#007AFF',
    textDecorationLine: 'underline',
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
    fontSize: 16,
  },
  error: {
    color: '#FF3B30',
    marginBottom: 12,
  },
});
