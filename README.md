# Kiran Reads

A digital companion to *Teach Your Child to Read in 100 Easy Lessons* (DISTAR phonics method), built for Kiran.

Parent-led sessions, shared progress between two parents, hosted on Railway.

## Structure

```
kiran-reads/
├── server/          # Node.js + Express API with PostgreSQL
└── mobile/          # React Native via Expo (iPad + iPhone)
```

## Server Setup

```bash
cd server
cp .env.example .env   # fill in DATABASE_URL, JWT_SECRET
npm install
npm start              # runs on port 3001
```

Run `schema.sql` against your Postgres database, then seed:
```bash
npm run seed
```

## Mobile Setup

```bash
cd mobile
npm install
npx expo start
```

## Default Credentials (after seeding)

- `madhu@example.com` / `kiranreads2025`
- `wife@example.com` / `kiranreads2025`
