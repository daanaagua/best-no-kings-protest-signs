CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  slogan TEXT NOT NULL,
  slug_candidate TEXT NOT NULL,
  selected_template TEXT NOT NULL,
  primary_category TEXT NOT NULL,
  categories_json TEXT NOT NULL,
  submitter_name TEXT,
  submitter_email TEXT,
  selected_text_color TEXT,
  text_rotation REAL NOT NULL DEFAULT 0,
  text_offset_y REAL NOT NULL DEFAULT 0,
  text_scale REAL NOT NULL DEFAULT 1,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  approved_at TEXT,
  moderator_note TEXT
);

CREATE INDEX IF NOT EXISTS idx_submissions_status_created_at
  ON submissions (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_submissions_status_approved_at
  ON submissions (status, approved_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_submissions_approved_slug_candidate
  ON submissions (slug_candidate)
  WHERE status = 'approved';

CREATE TABLE IF NOT EXISTS votes (
  slug TEXT PRIMARY KEY,
  vote_count INTEGER NOT NULL DEFAULT 0
);
