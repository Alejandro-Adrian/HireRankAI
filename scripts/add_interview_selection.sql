-- Add interview selection functionality to applications table
ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS selected_for_interview BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS interview_invitation_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS interview_notes TEXT;

-- Create index for faster queries on selected candidates
CREATE INDEX IF NOT EXISTS idx_applications_selected_for_interview 
ON applications(selected_for_interview, ranking_id);

-- Add comments for documentation
COMMENT ON COLUMN applications.selected_for_interview IS 'Whether the candidate has been selected for interview';
COMMENT ON COLUMN applications.interview_invitation_sent_at IS 'When the interview invitation email was sent';
COMMENT ON COLUMN applications.interview_notes IS 'HR notes about the candidate selection';
