import { neon } from "@neondatabase/serverless"

const NEON_URL = process.env.NEON_POSTGRES_URL || process.env.NEON_NEON_NEON_DATABASE_URL || process.env.POSTGRES_URL

if (!NEON_URL) {
  throw new Error("❌  Neon connection string not found.  Please set NEON_POSTGRES_URL.")
}

export const sql = neon(NEON_URL)

// ---------- automatic one-time schema bootstrap ----------
let schemaReady: Promise<void> | null = null

export function ensureSchema() {
  if (schemaReady) return schemaReady
  schemaReady = (async () => {
    /* Create tables only if they don't exist.
       These statements are idempotent and safe to run on every cold-start. */
    await sql`
      CREATE TABLE IF NOT EXISTS cases (
        id            BIGSERIAL PRIMARY KEY,
        title         VARCHAR(100) NOT NULL,
        description   TEXT NOT NULL,
        tone          VARCHAR(20) NOT NULL CHECK (tone IN ('serious','satirical','unhinged')),
        evidence_urls TEXT[] DEFAULT '{}',
        plaintiff_votes  INTEGER DEFAULT 0,
        defendant_votes  INTEGER DEFAULT 0,
        split_votes      INTEGER DEFAULT 0,
        verdict_unlocked BOOLEAN  DEFAULT FALSE,
        verdict_text     TEXT,
        ip_address       INET,
        created_at       TIMESTAMPTZ DEFAULT NOW(),
        updated_at       TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS votes (
        id         BIGSERIAL PRIMARY KEY,
        case_id    BIGINT REFERENCES cases(id) ON DELETE CASCADE,
        vote_type  VARCHAR(20) NOT NULL CHECK (vote_type IN ('plaintiff','defendant','split')),
        ip_address INET NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE (case_id, ip_address)
      );

      CREATE TABLE IF NOT EXISTS comments (
        id         BIGSERIAL PRIMARY KEY,
        case_id    BIGINT REFERENCES cases(id) ON DELETE CASCADE,
        content    TEXT NOT NULL,
        vote_type  VARCHAR(20) NOT NULL CHECK (vote_type IN ('plaintiff','defendant','split')),
        likes      INTEGER DEFAULT 0,
        ip_address INET,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      /* Indexes for performance (IF NOT EXISTS keeps them idempotent) */
      CREATE INDEX IF NOT EXISTS idx_cases_created_at
        ON cases (created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_cases_total_votes
        ON cases ((plaintiff_votes + defendant_votes + split_votes) DESC);
      CREATE INDEX IF NOT EXISTS idx_votes_case_id
        ON votes (case_id);
      CREATE INDEX IF NOT EXISTS idx_comments_case_id
        ON comments (case_id);
    `
  })()
  return schemaReady
}
