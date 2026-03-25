import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppStore } from '@/hooks/use-app-store';
import { HelloWave } from '@/components/hello-wave';

export default function AddWorkScreen() {
  const [work, setWork] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [success, setSuccess] = useState(false);
  const { addWork, profile } = useAppStore();

  const handleAddWork = async () => {
    if (!work || isAnalyzing) return;

    setIsAnalyzing(true);
    setSuccess(false);
    await addWork(work);
    setIsAnalyzing(false);
    setSuccess(true);
    setWork('');
    
    // Clear success message after 3 seconds
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <ThemedText type="title">Add Your Work</ThemedText>
          <HelloWave />
        </View>
        
        <ThemedText style={styles.subtitle}>
          Tell Gemini what you've done today, and it will analyze your EXP gains.
        </ThemedText>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={work}
            onChangeText={setWork}
            placeholder="e.g. Spent 2 hours coding a new feature, or Jogged 5km."
            placeholderTextColor="#888"
            multiline
            numberOfLines={4}
          />
          
          <TouchableOpacity 
            style={[styles.button, (!work || isAnalyzing) && styles.buttonDisabled]} 
            onPress={handleAddWork}
            disabled={!work || isAnalyzing}
          >
            {isAnalyzing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.buttonText}>Analyze & Add EXP</ThemedText>
            )}
          </TouchableOpacity>
        </View>

        {success && (
          <View style={styles.successMessage}>
            <ThemedText style={styles.successText}>Work added! Your stats have been updated.</ThemedText>
          </View>
        )}

        <View style={styles.recentActivity}>
          <ThemedText type="defaultSemiBold">Tips</ThemedText>
          <ThemedText style={styles.tipText}>
            • Be specific: "Ran 5km in 25 mins" is better than "Ran".
            • Combine tasks: "Studied math and then went for a swim".
            • Don't forget mental work: learning, meditating, or social interactions.
          </ThemedText>
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
    paddingTop: 80,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 32,
    opacity: 0.7,
  },
  inputContainer: {
    gap: 16,
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    height: 120,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  successMessage: {
    backgroundColor: '#4CD964',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  successText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  recentActivity: {
    marginTop: 20,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    gap: 8,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
});
