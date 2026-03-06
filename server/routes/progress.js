const express = require('express');
const pool = require('../db/client');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    // Get Kiran's child record
    const childResult = await pool.query('SELECT id, name FROM children LIMIT 1');
    if (childResult.rows.length === 0) {
      return res.status(404).json({ error: 'No child profile found' });
    }
    const child = childResult.rows[0];

    // Get all completed lessons
    const progressResult = await pool.query(
      `SELECT lp.lesson_number, lp.completed_at, lp.duration_secs, u.name AS completed_by
       FROM lesson_progress lp
       JOIN users u ON u.id = lp.completed_by
       WHERE lp.child_id = $1
       ORDER BY lp.completed_at ASC`,
      [child.id]
    );

    // Current lesson = max completed + 1, or 1 if none
    const maxResult = await pool.query(
      'SELECT COALESCE(MAX(lesson_number), 0) AS max_lesson FROM lesson_progress WHERE child_id = $1',
      [child.id]
    );
    const currentLesson = Math.min(maxResult.rows[0].max_lesson + 1, 100);
    const totalCompleted = progressResult.rows.length;

    res.json({
      childId: child.id,
      childName: child.name,
      currentLesson,
      totalCompleted,
      completedLessons: progressResult.rows.map((r) => ({
        lessonNumber: r.lesson_number,
        completedAt: r.completed_at,
        completedBy: r.completed_by,
        durationSecs: r.duration_secs,
      })),
    });
  } catch (err) {
    console.error('Progress fetch error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/complete', async (req, res) => {
  const { lessonNumber, durationSecs } = req.body;
  if (!lessonNumber || lessonNumber < 1 || lessonNumber > 100) {
    return res.status(400).json({ error: 'Valid lessonNumber (1-100) is required' });
  }

  try {
    const childResult = await pool.query('SELECT id FROM children LIMIT 1');
    if (childResult.rows.length === 0) {
      return res.status(404).json({ error: 'No child profile found' });
    }
    const childId = childResult.rows[0].id;

    await pool.query(
      `INSERT INTO lesson_progress (child_id, lesson_number, completed_by, duration_secs)
       VALUES ($1, $2, $3, $4)`,
      [childId, lessonNumber, req.user.userId, durationSecs || null]
    );

    const currentLesson = Math.min(lessonNumber + 1, 100);
    res.status(201).json({ ok: true, currentLesson });
  } catch (err) {
    console.error('Progress complete error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
