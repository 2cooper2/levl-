CREATE TABLE IF NOT EXISTS application_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  level TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  context TEXT NOT NULL,
  user_agent TEXT,
  url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indices for faster querying
CREATE INDEX idx_logs_level ON application_logs(level);
CREATE INDEX idx_logs_timestamp ON application_logs(timestamp);
CREATE INDEX idx_logs_context ON application_logs(context);

-- Keep only 30 days of logs by default
CREATE OR REPLACE FUNCTION prune_old_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM application_logs
  WHERE timestamp < (NOW() - INTERVAL '30 days');
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to run the pruning function
SELECT cron.schedule(
  'prune-logs',
  '0 3 * * *',  -- Run at 3 AM every day
  $$SELECT prune_old_logs()$$
);
