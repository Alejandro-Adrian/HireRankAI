-- Create interview_invitations table for managing participant access
CREATE TABLE IF NOT EXISTS interview_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id TEXT NOT NULL,
  application_id UUID NOT NULL,
  candidate_name TEXT NOT NULL,
  candidate_email TEXT NOT NULL,
  access_token TEXT NOT NULL UNIQUE,
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'joined', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_interview_invitations_meeting_id ON interview_invitations(meeting_id);
CREATE INDEX IF NOT EXISTS idx_interview_invitations_access_token ON interview_invitations(access_token);
CREATE INDEX IF NOT EXISTS idx_interview_invitations_application_id ON interview_invitations(application_id);
