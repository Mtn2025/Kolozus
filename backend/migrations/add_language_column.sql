-- Add language column to fragments table
ALTER TABLE fragments ADD COLUMN language VARCHAR(2) DEFAULT 'es';

-- Add language column to ideas table (if exists)
ALTER TABLE ideas ADD COLUMN language VARCHAR(2) DEFAULT 'es';

-- Add index for efficient language-based queries
CREATE INDEX idx_fragments_language ON fragments(language);
CREATE INDEX idx_ideas_language ON ideas(language);

-- Optional: Update existing rows to set language based on detection or default
-- UPDATE fragments SET language = 'es' WHERE language IS NULL;
-- UPDATE ideas SET language = 'es' WHERE language IS NULL;
