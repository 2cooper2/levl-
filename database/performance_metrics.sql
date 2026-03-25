-- Create the uuid-ossp extension if it doesn't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the performance_metrics table if it doesn't exist
CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_id TEXT NOT NULL,
  name TEXT NOT NULL,
  value FLOAT NOT NULL,
  unit TEXT NOT NULL,
  url TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indices for faster querying
CREATE INDEX IF NOT EXISTS idx_performance_metrics_metric_id ON performance_metrics(metric_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON performance_metrics(timestamp);

-- Create a function to prune old metrics
CREATE OR REPLACE FUNCTION prune_old_metrics()
RETURNS void AS $$
BEGIN
  DELETE FROM performance_metrics
  WHERE timestamp < (NOW() - INTERVAL '90 days');
END;
$$ LANGUAGE plpgsql;
