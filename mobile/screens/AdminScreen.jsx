import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import lessons from '../data/lessons.json';
import api from '../utils/api';

const SEGMENT_TYPE_LABELS = {
  sound_practice: 'Sound',
  word_reading: 'Word',
  story: 'Story',
  review: 'Review',
};

const SEGMENT_TYPE_COLORS = {
  sound_practice: '#E8F5E9',
  word_reading: '#E3F2FD',
  story: '#FFF3E0',
  review: '#F3E5F5',
};

export default function AdminScreen({ progress, onBack }) {
  const [tab, setTab] = useState('past');
  const [allNotes, setAllNotes] = useState({});
  const [notesLoading, setNotesLoading] = useState(false);
  const [expandedLesson, setExpandedLesson] = useState(null);

  const currentLesson = progress?.currentLesson || 1;
  const completedLessons = progress?.completedLessons || [];

  // Group completed lessons by lesson number (may have repeats)
  const completedByLesson = {};
  completedLessons.forEach((cl) => {
    if (!completedByLesson[cl.lessonNumber]) {
      completedByLesson[cl.lessonNumber] = [];
    }
    completedByLesson[cl.lessonNumber].push(cl);
  });

  const completedLessonNumbers = Object.keys(completedByLesson)
    .map(Number)
    .sort((a, b) => a - b);

  const upcomingLessons = lessons.filter(
    (l) => l.lessonNumber >= currentLesson
  );

  useEffect(() => {
    if (tab === 'past') {
      loadAllNotes();
    }
  }, [tab]);

  const loadAllNotes = async () => {
    setNotesLoading(true);
    try {
      const res = await api.get('/notes');
      const grouped = {};
      (res.data.notes || []).forEach((n) => {
        if (!grouped[n.lessonNumber]) grouped[n.lessonNumber] = [];
        grouped[n.lessonNumber].push(n);
      });
      setAllNotes(grouped);
    } catch {
      setAllNotes({});
    } finally {
      setNotesLoading(false);
    }
  };

  const toggleExpand = (lessonNumber) => {
    setExpandedLesson(expandedLesson === lessonNumber ? null : lessonNumber);
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDuration = (secs) => {
    if (!secs) return '-';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const renderSegmentPreview = (segment, index) => (
    <View
      key={index}
      style={[
        styles.segmentRow,
        { backgroundColor: SEGMENT_TYPE_COLORS[segment.type] || '#F5F5F5' },
      ]}
    >
      <View style={styles.segmentHeader}>
        <Text style={styles.segmentBadge}>
          {SEGMENT_TYPE_LABELS[segment.type] || segment.type}
        </Text>
        <Text style={styles.segmentDisplay}>{segment.displayText}</Text>
      </View>
      <Text style={styles.segmentCue}>{segment.parentCue}</Text>
    </View>
  );

  const renderPastLesson = (lessonNumber) => {
    const sessions = completedByLesson[lessonNumber];
    const lesson = lessons.find((l) => l.lessonNumber === lessonNumber);
    const notes = allNotes[lessonNumber] || [];
    const isExpanded = expandedLesson === lessonNumber;

    return (
      <View key={lessonNumber} style={styles.lessonCard}>
        <TouchableOpacity
          style={styles.lessonCardHeader}
          onPress={() => toggleExpand(lessonNumber)}
        >
          <View>
            <Text style={styles.lessonTitle}>Lesson {lessonNumber}</Text>
            <Text style={styles.lessonMeta}>
              {sessions.length} session{sessions.length > 1 ? 's' : ''} completed
            </Text>
          </View>
          <Text style={styles.expandIcon}>{isExpanded ? '−' : '+'}</Text>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.lessonCardBody}>
            {/* Session history */}
            <Text style={styles.sectionLabel}>Sessions</Text>
            {sessions.map((s, i) => (
              <View key={i} style={styles.sessionRow}>
                <Text style={styles.sessionText}>
                  {formatDate(s.completedAt)} — {s.completedBy} — {formatDuration(s.durationSecs)}
                </Text>
              </View>
            ))}

            {/* Notes */}
            {notes.length > 0 && (
              <>
                <Text style={[styles.sectionLabel, { marginTop: 12 }]}>Notes</Text>
                {notes.map((n) => (
                  <View key={n.id} style={styles.noteRow}>
                    <Text style={styles.noteText}>"{n.noteText}"</Text>
                    <Text style={styles.noteMeta}>
                      — {n.createdBy}, {formatDate(n.createdAt)}
                    </Text>
                  </View>
                ))}
              </>
            )}

            {/* Lesson content preview */}
            {lesson && (
              <>
                <Text style={[styles.sectionLabel, { marginTop: 12 }]}>
                  Lesson Content ({lesson.segments.length} segments)
                </Text>
                {lesson.segments.map(renderSegmentPreview)}
              </>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderUpcomingLesson = (lesson) => {
    const isExpanded = expandedLesson === lesson.lessonNumber;

    return (
      <View key={lesson.lessonNumber} style={styles.lessonCard}>
        <TouchableOpacity
          style={styles.lessonCardHeader}
          onPress={() => toggleExpand(lesson.lessonNumber)}
        >
          <View>
            <Text style={styles.lessonTitle}>Lesson {lesson.lessonNumber}</Text>
            <Text style={styles.lessonMeta}>
              {lesson.segments.length} segments —{' '}
              {lesson.segments.map((s) => SEGMENT_TYPE_LABELS[s.type] || s.type).join(', ')}
            </Text>
          </View>
          <Text style={styles.expandIcon}>{isExpanded ? '−' : '+'}</Text>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.lessonCardBody}>
            {lesson.segments.map(renderSegmentPreview)}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, tab === 'past' && styles.tabActive]}
          onPress={() => setTab('past')}
        >
          <Text style={[styles.tabText, tab === 'past' && styles.tabTextActive]}>
            Past Lessons ({completedLessonNumbers.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'upcoming' && styles.tabActive]}
          onPress={() => { setTab('upcoming'); setExpandedLesson(null); }}
        >
          <Text style={[styles.tabText, tab === 'upcoming' && styles.tabTextActive]}>
            Upcoming ({upcomingLessons.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        {tab === 'past' ? (
          notesLoading ? (
            <ActivityIndicator style={{ marginTop: 40 }} color="#2E7D32" />
          ) : completedLessonNumbers.length === 0 ? (
            <Text style={styles.emptyText}>No lessons completed yet.</Text>
          ) : (
            completedLessonNumbers.map(renderPastLesson)
          )
        ) : upcomingLessons.length === 0 ? (
          <Text style={styles.emptyText}>All lessons completed!</Text>
        ) : (
          upcomingLessons.map(renderUpcomingLesson)
        )}
      </ScrollView>
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
    paddingTop: 56,
    paddingBottom: 12,
  },
  backText: {
    fontSize: 16,
    color: '#2E7D32',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: '#EEEEEE',
    borderRadius: 10,
    padding: 3,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#888',
  },
  tabTextActive: {
    color: '#2E7D32',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentInner: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  lessonCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  lessonCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  lessonTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
  },
  lessonMeta: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  expandIcon: {
    fontSize: 22,
    color: '#AAA',
    fontWeight: '300',
  },
  lessonCardBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  sessionRow: {
    paddingVertical: 6,
  },
  sessionText: {
    fontSize: 14,
    color: '#555',
  },
  noteRow: {
    backgroundColor: '#FFFDE7',
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
  },
  noteText: {
    fontSize: 14,
    color: '#555',
    fontStyle: 'italic',
  },
  noteMeta: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  segmentRow: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  segmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  segmentBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginRight: 10,
    backgroundColor: 'rgba(255,255,255,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  segmentDisplay: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  segmentCue: {
    fontSize: 13,
    color: '#666',
    lineHeight: 19,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 40,
  },
});
