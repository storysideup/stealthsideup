// Server-side password hashing and verification for corporate accounts.
// Runs bcrypt here (not in the browser) so the work factor and comparison
// never depend on client-side code, and so a stolen hash is expensive to
// brute-force even if it's ever exposed, unlike the old SHA-256 scheme.
//
// Backward compatibility: existing accounts were hashed with SHA-256 + a
// single hardcoded salt ('ssu_salt_2026'). Those hashes are 64 hex chars.
// New bcrypt hashes always start with '$2'. On verify, if we detect an old
// hash and it matches, we report needsRehash so the client can immediately
// save a fresh bcrypt hash for that account — a one-time, per-account
// migration that happens the next time each person logs in.

import bcrypt from 'bcryptjs'
import crypto from 'crypto'

function legacySha256(password) {
  return crypto.createHash('sha256').update(password + 'ssu_salt_2026').digest('hex')
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { action, password, hash } = req.body || {}
  if (!password) return res.status(400).json({ error: 'password is required' })

  try {
    if (action === 'hash') {
      const newHash = await bcrypt.hash(password, 12)
      return res.status(200).json({ hash: newHash })
    }

    if (action === 'verify') {
      if (!hash) return res.status(400).json({ error: 'hash is required for verify' })

      const isBcrypt = hash.startsWith('$2')
      if (isBcrypt) {
        const valid = await bcrypt.compare(password, hash)
        return res.status(200).json({ valid, needsRehash: false })
      }

      // Legacy SHA-256 path — for accounts not yet migrated
      const valid = legacySha256(password) === hash
      if (valid) {
        const newHash = await bcrypt.hash(password, 12)
        return res.status(200).json({ valid: true, needsRehash: true, newHash })
      }
      return res.status(200).json({ valid: false, needsRehash: false })
    }

    return res.status(400).json({ error: 'action must be "hash" or "verify"' })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Password operation failed' })
  }
}
