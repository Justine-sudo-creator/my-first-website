-- Create cases table
CREATE TABLE cases (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  tone VARCHAR(20) NOT NULL CHECK (tone IN ('serious', 'satirical', 'unhinged')),
  evidence_urls TEXT[] DEFAULT '{}',
  plaintiff_votes INTEGER DEFAULT 0,
  defendant_votes INTEGER DEFAULT 0,
  split_votes INTEGER DEFAULT 0,
  verdict_unlocked BOOLEAN DEFAULT FALSE,
  verdict_text TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create votes table
CREATE TABLE votes (
  id BIGSERIAL PRIMARY KEY,
  case_id BIGINT REFERENCES cases(id) ON DELETE CASCADE,
  vote_type VARCHAR(20) NOT NULL CHECK (vote_type IN ('plaintiff', 'defendant', 'split')),
  ip_address INET NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(case_id, ip_address)
);

-- Create comments table
CREATE TABLE comments (
  id BIGSERIAL PRIMARY KEY,
  case_id BIGINT REFERENCES cases(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  vote_type VARCHAR(20) NOT NULL CHECK (vote_type IN ('plaintiff', 'defendant', 'split')),
  likes INTEGER DEFAULT 0,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_cases_created_at ON cases(created_at DESC);
CREATE INDEX idx_cases_total_votes ON cases((plaintiff_votes + defendant_votes + split_votes) DESC);
CREATE INDEX idx_votes_case_id ON votes(case_id);
CREATE INDEX idx_comments_case_id ON comments(case_id);

-- Create function to update vote counts
CREATE OR REPLACE FUNCTION update_case_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE cases 
    SET 
      plaintiff_votes = CASE WHEN NEW.vote_type = 'plaintiff' THEN plaintiff_votes + 1 ELSE plaintiff_votes END,
      defendant_votes = CASE WHEN NEW.vote_type = 'defendant' THEN defendant_votes + 1 ELSE defendant_votes END,
      split_votes = CASE WHEN NEW.vote_type = 'split' THEN split_votes + 1 ELSE split_votes END,
      updated_at = NOW()
    WHERE id = NEW.case_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update vote counts
CREATE TRIGGER trigger_update_vote_counts
  AFTER INSERT ON votes
  FOR EACH ROW
  EXECUTE FUNCTION update_case_vote_counts();
