-- Create the uuid-ossp extension if it doesn't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the application_logs table if it doesn't exist
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
CREATE INDEX IF NOT EXISTS idx_logs_level ON application_logs(level);
CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON application_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_logs_context ON application_logs(context);

-- Keep only 30 days of logs by default
CREATE OR REPLACE FUNCTION prune_old_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM application_logs
  WHERE timestamp < (NOW() - INTERVAL '30 days');
END;
$$ LANGUAGE plpgsql;

-- Check if pg_cron extension exists before trying to schedule
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
  ) THEN
    -- Create a scheduled job to run the pruning function
    PERFORM cron.schedule(
      'prune-logs',
      '0 3 * * *',  -- Run at 3 AM every day
      $$SELECT prune_old_logs()$$
    );
  ELSE
    RAISE NOTICE 'pg_cron extension not available. Scheduled pruning not set up.';
  END IF;
END
$$;
