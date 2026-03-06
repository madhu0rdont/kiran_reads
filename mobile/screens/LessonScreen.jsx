import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  Platform,
} from 'react-native';
import lessons from '../data/lessons.json';
import SegmentCard from '../components/SegmentCard';
import ParentCue from '../components/ParentCue';

export default function LessonScreen({ lessonNumber, onComplete, onExit, preview }) {
  const lesson = lessons.find((l) => l.lessonNumber === lessonNumber);
  const [segmentIndex, setSegmentIndex] = useState(0);
  const startTime = useRef(Date.now());
  const fadeAnim = useRef(new Animated.Value(1)).current;

  if (!lesson) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Lesson {lessonNumber} not available yet
        </Text>
        <TouchableOpacity style={styles.exitButton} onPress={onExit}>
          <Text style={styles.exitText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const segments = lesson.segments;
  const segment = segments[segmentIndex];
  const isLast = segmentIndex === segments.length - 1;
  const progressPercent = ((segmentIndex + 1) / segments.length) * 100;

  const animateTransition = (callback) => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 120,
        useNativeDriver: false,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 120,
        useNativeDriver: false,
      }),
    ]).start();
    setTimeout(callback, 120);
  };

  const handleNext = () => {
    if (isLast) {
      if (preview) {
        onExit();
      } else {
        const durationSecs = Math.round((Date.now() - startTime.current) / 1000);
        onComplete(lessonNumber, durationSecs);
      }
    } else {
      animateTransition(() => setSegmentIndex((i) => i + 1));
    }
  };

  const handleExit = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('End Session? Progress for this lesson won\'t be saved.')) {
        onExit();
      }
    } else {
      Alert.alert(
        'End Session?',
        'Progress for this lesson won\'t be saved.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'End Session', style: 'destructive', onPress: onExit },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={styles.topBarText}>
          {preview && <Text style={styles.previewBadge}>PREVIEW  </Text>}
          Lesson {lessonNumber} — Segment {segmentIndex + 1} of{' '}
          {segments.length}
        </Text>
      </View>
      <View style={styles.progressBarBg}>
        <View
          style={[styles.progressBarFill, { width: `${progressPercent}%` }]}
        />
      </View>

      {/* Main content */}
      <Animated.View style={[styles.mainContent, { opacity: fadeAnim }]}>
        <View style={styles.cardArea}>
          <SegmentCard segment={segment} />
        </View>
        <View style={styles.cueArea}>
          <ParentCue text={segment.parentCue} />
        </View>
      </Animated.View>

      {/* Bottom controls */}
      <View style={styles.bottomBar}>
        <TouchableOpacity onPress={handleExit}>
          <Text style={styles.endSessionText}>End Session</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {isLast ? 'Finish' : 'Next →'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF5',
  },
  topBar: {
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  topBarText: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
  },
  previewBadge: {
    color: '#E65100',
    fontWeight: '700',
    fontSize: 12,
  },
  progressBarBg: {
    height: 3,
    backgroundColor: '#E8E8E8',
  },
  progressBarFill: {
    height: 3,
    backgroundColor: '#2E7D32',
  },
  mainContent: {
    flex: 1,
  },
  cardArea: {
    flex: 3,
  },
  cueArea: {
    flex: 2,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 12,
  },
  endSessionText: {
    fontSize: 14,
    color: '#999',
  },
  nextButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 40,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 100,
  },
  exitButton: {
    marginTop: 20,
    alignSelf: 'center',
  },
  exitText: {
    color: '#2E7D32',
    fontSize: 16,
    fontWeight: '600',
  },
});
