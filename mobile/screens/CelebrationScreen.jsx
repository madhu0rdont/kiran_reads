import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { Audio } from 'expo-av';

export default function CelebrationScreen({ lessonNumber, onSave, onSkip }) {
  const [noteText, setNoteText] = useState('');
  const [saving, setSaving] = useState(false);
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Bounce animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -20,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Play celebration sound (if available)
    (async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require('../assets/celebration.mp3')
        );
        await sound.playAsync();
      } catch {
        // Sound file not available, skip silently
      }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (noteText.trim()) {
        await onSave(noteText.trim());
      } else {
        onSkip();
      }
    } catch {
      onSkip();
    }
  };

  return (
    <View style={styles.container}>
      <Animated.Text
        style={[styles.star, { transform: [{ translateY: bounceAnim }] }]}
      >
        🌟
      </Animated.Text>

      <Text style={styles.title}>Lesson {lessonNumber} complete!</Text>
      <Text style={styles.subtitle}>Kiran is amazing.</Text>

      <View style={styles.noteContainer}>
        <Text style={styles.noteLabel}>Add a memory from today's lesson</Text>
        <TextInput
          style={styles.noteInput}
          placeholder="e.g. He loved the cat story!"
          value={noteText}
          onChangeText={setNoteText}
          multiline
          maxLength={500}
        />
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.buttonText}>
          {saving ? 'Saving...' : 'Save & Go Home'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F8E9',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  star: {
    fontSize: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#558B2F',
    marginBottom: 40,
  },
  noteContainer: {
    width: '100%',
    marginBottom: 24,
  },
  noteLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  noteInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#C8E6C9',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 48,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
