import { useState, useCallback } from 'react';
import api from '../utils/api';

export function useProgress() {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchProgress = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/progress');
      setProgress(res.data);
    } catch (err) {
      console.error('Failed to fetch progress:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const completeLesson = useCallback(async (lessonNumber, durationSecs) => {
    const res = await api.post('/progress/complete', { lessonNumber, durationSecs });
    return res.data;
  }, []);

  const fetchNotes = useCallback(async (lessonNumber) => {
    const res = await api.get(`/notes/${lessonNumber}`);
    return res.data;
  }, []);

  const addNote = useCallback(async (lessonNumber, noteText) => {
    const res = await api.post(`/notes/${lessonNumber}`, { noteText });
    return res.data;
  }, []);

  return { progress, loading, fetchProgress, completeLesson, fetchNotes, addNote };
}
