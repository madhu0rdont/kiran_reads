import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function LessonNote({ note }) {
  const date = new Date(note.createdAt).toLocaleDateString();
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{note.noteText}</Text>
      <Text style={styles.meta}>
        {note.createdBy} - {date}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFDE7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  text: {
    fontSize: 15,
    color: '#333',
    marginBottom: 4,
  },
  meta: {
    fontSize: 12,
    color: '#888',
  },
});
