// src/lib/database.ts
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'ctf.db');
const db = new Database(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    address TEXT PRIMARY KEY,
    siwe_nonce TEXT,
    session_token TEXT,
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
  );

  CREATE TABLE IF NOT EXISTS completions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    address TEXT NOT NULL,
    phase INTEGER NOT NULL,
    verified_at INTEGER DEFAULT (strftime('%s', 'now')),
    tx_hash TEXT,
    contract_address TEXT,
    UNIQUE(address, phase)
  );

  CREATE INDEX IF NOT EXISTS idx_completions_address ON completions(address);
`);

// User operations
export const userOps = {
  createOrUpdateNonce: (address: string, nonce: string) => {
    const stmt = db.prepare(`
      INSERT INTO users (address, siwe_nonce) 
      VALUES (?, ?)
      ON CONFLICT(address) DO UPDATE SET siwe_nonce = ?
    `);
    return stmt.run(address, nonce, nonce);
  },

  getNonce: (address: string) => {
    const stmt = db.prepare('SELECT siwe_nonce FROM users WHERE address = ?');
    return stmt.get(address) as { siwe_nonce: string } | undefined;
  },

  setSessionToken: (address: string, token: string) => {
    const stmt = db.prepare(`
      UPDATE users SET session_token = ? WHERE address = ?
    `);
    return stmt.run(token, address);
  },

  getBySessionToken: (token: string) => {
    const stmt = db.prepare('SELECT address FROM users WHERE session_token = ?');
    return stmt.get(token) as { address: string } | undefined;
  },
};

// Completion operations
export const completionOps = {
  recordPhase1: (address: string) => {
    const stmt = db.prepare(`
      INSERT INTO completions (address, phase) 
      VALUES (?, 1)
      ON CONFLICT(address, phase) DO NOTHING
    `);
    return stmt.run(address);
  },

  recordPhase2: (address: string, txHash: string, contractAddress: string) => {
    const stmt = db.prepare(`
      INSERT INTO completions (address, phase, tx_hash, contract_address) 
      VALUES (?, 2, ?, ?)
      ON CONFLICT(address, phase) DO NOTHING
    `);
    return stmt.run(address, txHash, contractAddress);
  },

  getPhaseStatus: (address: string, phase: number) => {
    const stmt = db.prepare(`
      SELECT * FROM completions WHERE address = ? AND phase = ?
    `);
    return stmt.get(address, phase) as any | undefined;
  },

  getAllCompletions: (address: string) => {
    const stmt = db.prepare(`
      SELECT phase, verified_at, tx_hash, contract_address 
      FROM completions 
      WHERE address = ? 
      ORDER BY phase
    `);
    return stmt.all(address);
  },

  hasBothPhases: (address: string) => {
    const stmt = db.prepare(`
      SELECT COUNT(*) as count FROM completions WHERE address = ?
    `);
    const result = stmt.get(address) as { count: number };
    return result.count === 2;
  },
};

export default db;