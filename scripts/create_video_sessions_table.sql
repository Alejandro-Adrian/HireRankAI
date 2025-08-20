-- Create video_sessions table for managing video call sessions
CREATE TABLE IF NOT EXISTS video_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  meeting_url TEXT NOT NULL,
  meeting_id TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'completed')),
  participants_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_video_sessions_status ON video_sessions(status);
CREATE INDEX IF NOT EXISTS idx_video_sessions_scheduled_at ON video_sessions(scheduled_at);
