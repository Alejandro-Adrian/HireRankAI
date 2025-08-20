-- Add interview scheduling columns to applications table
ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS interview_scheduled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS interview_meeting_url TEXT,
ADD COLUMN IF NOT EXISTS interview_meeting_id TEXT,
ADD COLUMN IF NOT EXISTS interview_access_token TEXT;

-- Create interview_sessions table for managing video calls
CREATE TABLE IF NOT EXISTS interview_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  meeting_id TEXT UNIQUE NOT NULL,
  meeting_url TEXT NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  hr_access_token TEXT NOT NULL,
  applicant_access_token TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_interview_sessions_meeting_id ON interview_sessions(meeting_id);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_application_id ON interview_sessions(application_id);
