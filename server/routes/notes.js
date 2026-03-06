const express = require('express');
const pool = require('../db/client');

const router = express.Router();

// Get all notes grouped by lesson
router.get('/', async (req, res) => {
  try {
    const childResult = await pool.query('SELECT id FROM children LIMIT 1');
    if (childResult.rows.length === 0) {
      return res.status(404).json({ error: 'No child profile found' });
    }
    const childId = childResult.rows[0].id;

    const notesResult = await pool.query(
      `SELECT ln.id, ln.lesson_number, ln.note_text, u.name AS created_by, ln.created_at
       FROM lesson_notes ln
       JOIN users u ON u.id = ln.created_by
       WHERE ln.child_id = $1
       ORDER BY ln.lesson_number ASC, ln.created_at ASC`,
      [childId]
    );

    res.json({
      notes: notesResult.rows.map((r) => ({
        id: r.id,
        lessonNumber: r.lesson_number,
        noteText: r.note_text,
        createdBy: r.created_by,
        createdAt: r.created_at,
      })),
    });
  } catch (err) {
    console.error('All notes fetch error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:lessonId', async (req, res) => {
  const lessonNumber = parseInt(req.params.lessonId, 10);
  if (isNaN(lessonNumber)) {
    return res.status(400).json({ error: 'Invalid lesson number' });
  }

  try {
    const childResult = await pool.query('SELECT id FROM children LIMIT 1');
    if (childResult.rows.length === 0) {
      return res.status(404).json({ error: 'No child profile found' });
    }
    const childId = childResult.rows[0].id;

    const notesResult = await pool.query(
      `SELECT ln.id, ln.note_text, u.name AS created_by, ln.created_at
       FROM lesson_notes ln
       JOIN users u ON u.id = ln.created_by
       WHERE ln.child_id = $1 AND ln.lesson_number = $2
       ORDER BY ln.created_at ASC`,
      [childId, lessonNumber]
    );

    res.json({
      lessonNumber,
      notes: notesResult.rows.map((r) => ({
        id: r.id,
        noteText: r.note_text,
        createdBy: r.created_by,
        createdAt: r.created_at,
      })),
    });
  } catch (err) {
    console.error('Notes fetch error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:lessonId', async (req, res) => {
  const lessonNumber = parseInt(req.params.lessonId, 10);
  if (isNaN(lessonNumber)) {
    return res.status(400).json({ error: 'Invalid lesson number' });
  }

  const { noteText } = req.body;
  if (!noteText || !noteText.trim()) {
    return res.status(400).json({ error: 'noteText is required' });
  }

  try {
    const childResult = await pool.query('SELECT id FROM children LIMIT 1');
    if (childResult.rows.length === 0) {
      return res.status(404).json({ error: 'No child profile found' });
    }
    const childId = childResult.rows[0].id;

    const insertResult = await pool.query(
      `INSERT INTO lesson_notes (child_id, lesson_number, note_text, created_by)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [childId, lessonNumber, noteText.trim(), req.user.userId]
    );

    res.status(201).json({ ok: true, noteId: insertResult.rows[0].id });
  } catch (err) {
    console.error('Note create error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
