require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../db/client');

async function seed() {
  const SALT_ROUNDS = 10;

  const madhuHash = await bcrypt.hash('kiranreads2025', SALT_ROUNDS);
  const wifeHash = await bcrypt.hash('kiranreads2025', SALT_ROUNDS);

  try {
    // Create users
    const madhu = await pool.query(
      `INSERT INTO users (email, name, password_hash)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      ['madhu@example.com', 'Madhu', madhuHash]
    );

    const wife = await pool.query(
      `INSERT INTO users (email, name, password_hash)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      ['wife@example.com', 'Wife', wifeHash]
    );

    const madhuId = madhu.rows[0]?.id;
    if (madhuId) {
      // Create child profile
      await pool.query(
        `INSERT INTO children (name, date_of_birth, created_by)
         VALUES ($1, $2, $3)`,
        ['Kiran', '2023-06-01', madhuId]
      );
      console.log('Seed complete: 2 users + Kiran created');
    } else {
      console.log('Users already exist, skipping seed');
    }
  } catch (err) {
    console.error('Seed error:', err);
  } finally {
    await pool.end();
  }
}

seed();
