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

CREATE INDEX idx_performance_metrics_metric_id ON performance_metrics(metric_id);
CREATE INDEX idx_performance_metrics_timestamp ON performance_metrics(timestamp);
