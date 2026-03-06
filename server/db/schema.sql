-- Parents who can log in
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Child profile (one row: Kiran)
CREATE TABLE children (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  date_of_birth DATE,
  created_by    INTEGER REFERENCES users(id),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Append-only lesson completion log
CREATE TABLE lesson_progress (
  id             SERIAL PRIMARY KEY,
  child_id       INTEGER REFERENCES children(id),
  lesson_number  INTEGER NOT NULL CHECK (lesson_number BETWEEN 1 AND 100),
  completed_at   TIMESTAMPTZ DEFAULT NOW(),
  completed_by   INTEGER REFERENCES users(id),
  duration_secs  INTEGER
);

-- Optional per-lesson journal notes
CREATE TABLE lesson_notes (
  id             SERIAL PRIMARY KEY,
  child_id       INTEGER REFERENCES children(id),
  lesson_number  INTEGER NOT NULL,
  note_text      TEXT NOT NULL,
  created_by     INTEGER REFERENCES users(id),
  created_at     TIMESTAMPTZ DEFAULT NOW()
);
