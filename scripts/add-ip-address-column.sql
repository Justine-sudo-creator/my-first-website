-- Add ip_address column to cases table if it doesn't exist
ALTER TABLE cases ADD COLUMN IF NOT EXISTS ip_address INET;

-- Create index for IP-based rate limiting
CREATE INDEX IF NOT EXISTS idx_cases_ip_created ON cases(ip_address, created_at);
