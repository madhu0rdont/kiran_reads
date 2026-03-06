import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const VOWELS = new Set(['a', 'e', 'i', 'o', 'u']);
const LONG_VOWEL_COLOR = '#2E7D32';
const SHORT_VOWEL_COLOR = '#1565C0';
const CONSONANT_COLOR = '#212121';
const SILENT_COLOR = '#9E9E9E';

function getCharColor(char) {
  if (VOWELS.has(char.toLowerCase())) {
    return SHORT_VOWEL_COLOR;
  }
  return CONSONANT_COLOR;
}

function ColoredText({ text, style }) {
  return (
    <Text style={style}>
      {text.split('').map((char, i) => (
        <Text key={i} style={{ color: char === ' ' ? undefined : getCharColor(char) }}>
          {char}
        </Text>
      ))}
    </Text>
  );
}

export default function SegmentCard({ segment }) {
  const { displayText, displayStyle } = segment;

  const textStyle =
    displayStyle === 'large_letter'
      ? styles.largeLetter
      : displayStyle === 'word'
        ? styles.word
        : styles.sentence;

  return (
    <View style={styles.container}>
      <ColoredText text={displayText} style={textStyle} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  largeLetter: {
    fontSize: 200,
    fontWeight: '700',
    textAlign: 'center',
  },
  word: {
    fontSize: 120,
    fontWeight: '600',
    textAlign: 'center',
  },
  sentence: {
    fontSize: 48,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 64,
  },
});
