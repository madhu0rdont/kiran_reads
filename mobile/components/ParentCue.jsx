import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ParentCue({ text }) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Parent Script</Text>
      <Text style={styles.cueText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5F5F0',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    padding: 20,
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  cueText: {
    fontSize: 18,
    lineHeight: 26,
    color: '#333',
  },
});
