require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authMiddleware = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const progressRoutes = require('./routes/progress');
const notesRoutes = require('./routes/notes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Public routes
app.use('/auth', authRoutes);

// Protected routes
app.use('/progress', authMiddleware, progressRoutes);
app.use('/notes', authMiddleware, notesRoutes);

app.listen(PORT, () => {
  console.log(`Kiran Reads API running on port ${PORT}`);
});
