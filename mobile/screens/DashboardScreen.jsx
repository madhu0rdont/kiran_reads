import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  RefreshControl,
  Modal,
  ActivityIndicator,
} from 'react-native';
import ProgressRing from '../components/ProgressRing';
import LessonNote from '../components/LessonNote';

export default function DashboardScreen({
  user,
  onLogout,
  onStartLesson,
  progress: progressData,
  loading,
  onRefresh,
  fetchNotes,
  onAdmin,
}) {
  const [notesModal, setNotesModal] = useState(null);
  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);

  const currentLesson = progressData?.currentLesson || 1;
  const totalCompleted = progressData?.totalCompleted || 0;
  const completedLessons = progressData?.completedLessons || [];

  const openNotes = useCallback(async (lessonNumber) => {
    setNotesModal(lessonNumber);
    setNotesLoading(true);
    try {
      const data = await fetchNotes(lessonNumber);
      setNotes(data.notes || []);
    } catch {
      setNotes([]);
    } finally {
      setNotesLoading(false);
    }
  }, [fetchNotes]);

  const formatDuration = (secs) => {
    if (!secs) return '';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const renderCompletedLesson = ({ item }) => {
    const date = new Date(item.completedAt).toLocaleDateString();
    return (
      <TouchableOpacity
        style={styles.lessonRow}
        onPress={() => openNotes(item.lessonNumber)}
      >
        <Text style={styles.lessonRowText}>
          Lesson {item.lessonNumber} — {date} — {item.completedBy}
          {item.durationSecs ? ` — ${formatDuration(item.durationSecs)}` : ''}
        </Text>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hi {user?.name} 👋</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={onAdmin} style={styles.adminButton}>
            <Text style={styles.adminText}>Admin</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={[...completedLessons].reverse()}
        keyExtractor={(item, index) => `${item.lessonNumber}-${index}`}
        renderItem={renderCompletedLesson}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <View style={styles.heroSection}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Kiran is on</Text>
              <Text style={styles.lessonNumber}>Lesson {currentLesson}</Text>
            </View>

            <ProgressRing current={totalCompleted} total={100} />

            <TouchableOpacity
              style={styles.startButton}
              onPress={() => onStartLesson(currentLesson)}
            >
              <Text style={styles.startButtonText}>
                Start Lesson {currentLesson}
              </Text>
            </TouchableOpacity>

            {completedLessons.length > 0 && (
              <Text style={styles.historyTitle}>Completed Lessons</Text>
            )}
          </View>
        }
        ListEmptyComponent={
          !loading && (
            <Text style={styles.emptyText}>
              No lessons completed yet. Let's start!
            </Text>
          )
        }
        contentContainerStyle={styles.listContent}
      />

      <Modal visible={notesModal !== null} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Lesson {notesModal} Notes
            </Text>
            {notesLoading ? (
              <ActivityIndicator style={{ marginTop: 20 }} />
            ) : notes.length > 0 ? (
              notes.map((note) => <LessonNote key={note.id} note={note} />)
            ) : (
              <Text style={styles.emptyNotes}>No notes yet</Text>
            )}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setNotesModal(null)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 12,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  adminButton: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  adminText: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '600',
  },
  logoutText: {
    fontSize: 16,
    color: '#888',
  },
  listContent: {
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 4,
  },
  lessonNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2E7D32',
  },
  startButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 48,
    marginTop: 24,
    marginBottom: 32,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#555',
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  lessonRow: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lessonRowText: {
    fontSize: 15,
    color: '#444',
    flex: 1,
  },
  chevron: {
    fontSize: 20,
    color: '#CCC',
    marginLeft: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    minHeight: 300,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    color: '#333',
  },
  emptyNotes: {
    color: '#999',
    fontSize: 15,
    marginTop: 12,
  },
  closeButton: {
    marginTop: 20,
    alignItems: 'center',
    padding: 12,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#2E7D32',
    fontWeight: '600',
  },
});
