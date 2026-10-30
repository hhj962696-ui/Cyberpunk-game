-- One row per player per country; only the best score is kept
CREATE TABLE IF NOT EXISTS scores (
  country TEXT NOT NULL,
  pid TEXT NOT NULL,
  name TEXT NOT NULL,
  score INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (country, pid)
);

CREATE INDEX IF NOT EXISTS scores_by_country ON scores (country, score DESC);
