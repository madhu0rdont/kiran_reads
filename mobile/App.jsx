import React, { useState, useEffect, useCallback } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import LessonScreen from './screens/LessonScreen';
import CelebrationScreen from './screens/CelebrationScreen';
import AdminScreen from './screens/AdminScreen';
import { useAuth } from './hooks/useAuth';
import { useProgress } from './hooks/useProgress';

export default function App() {
  const { user, loading: authLoading, login, logout } = useAuth();
  const {
    progress,
    loading: progressLoading,
    fetchProgress,
    completeLesson,
    fetchNotes,
    addNote,
  } = useProgress();

  const [screen, setScreen] = useState('dashboard');
  const [activeLessonNumber, setActiveLessonNumber] = useState(null);
  const [completedLessonNumber, setCompletedLessonNumber] = useState(null);

  useEffect(() => {
    if (user) {
      fetchProgress();
    }
  }, [user]);

  const handleStartLesson = useCallback((lessonNumber) => {
    setActiveLessonNumber(lessonNumber);
    setScreen('lesson');
  }, []);

  const handleLessonComplete = useCallback(
    async (lessonNumber, durationSecs) => {
      try {
        await completeLesson(lessonNumber, durationSecs);
      } catch (err) {
        console.error('Failed to save progress:', err);
      }
      setCompletedLessonNumber(lessonNumber);
      setScreen('celebration');
    },
    [completeLesson]
  );

  const handleCelebrationSave = useCallback(
    async (noteText) => {
      await addNote(completedLessonNumber, noteText);
      setScreen('dashboard');
      setCompletedLessonNumber(null);
      setActiveLessonNumber(null);
      fetchProgress();
    },
    [completedLessonNumber, addNote, fetchProgress]
  );

  const handleCelebrationSkip = useCallback(() => {
    setScreen('dashboard');
    setCompletedLessonNumber(null);
    setActiveLessonNumber(null);
    fetchProgress();
  }, [fetchProgress]);

  const handleLessonExit = useCallback(() => {
    setScreen('dashboard');
    setActiveLessonNumber(null);
  }, []);

  if (authLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  if (!user) {
    return <LoginScreen onLogin={login} />;
  }

  if (screen === 'lesson' && activeLessonNumber) {
    return (
      <LessonScreen
        lessonNumber={activeLessonNumber}
        onComplete={handleLessonComplete}
        onExit={handleLessonExit}
      />
    );
  }

  if (screen === 'admin') {
    return (
      <AdminScreen
        progress={progress}
        onBack={() => setScreen('dashboard')}
      />
    );
  }

  if (screen === 'celebration' && completedLessonNumber) {
    return (
      <CelebrationScreen
        lessonNumber={completedLessonNumber}
        onSave={handleCelebrationSave}
        onSkip={handleCelebrationSkip}
      />
    );
  }

  return (
    <DashboardScreen
      user={user}
      onLogout={logout}
      onStartLesson={handleStartLesson}
      progress={progress}
      loading={progressLoading}
      onRefresh={fetchProgress}
      fetchNotes={fetchNotes}
      onAdmin={() => setScreen('admin')}
    />
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAF5',
  },
});
