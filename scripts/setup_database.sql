-- Complete Database Setup Script for HireRankerAI
-- This script creates all necessary tables and configurations for the authentication system

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    firstname TEXT NOT NULL,
    lastname TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_code VARCHAR(6),
    verification_expires_at TIMESTAMP WITH TIME ZONE,
    reset_code VARCHAR(6),
    reset_expires_at TIMESTAMP WITH TIME ZONE,
    password_change_code TEXT,
    password_change_expires_at TIMESTAMP WITH TIME ZONE,
    account_deletion_code TEXT,
    account_deletion_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rankings table
CREATE TABLE IF NOT EXISTS rankings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    position VARCHAR(255),
    description TEXT,
    area_city VARCHAR(255),
    area_living_preference VARCHAR(255),
    application_link_id VARCHAR(255),
    criteria JSONB,
    criteria_weights JSONB,
    show_criteria_to_applicants BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create criteria table
CREATE TABLE IF NOT EXISTS criteria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create applications table with CASCADE DELETE
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ranking_id UUID REFERENCES rankings(id) ON DELETE CASCADE,
    applicant_name VARCHAR(255),
    applicant_email VARCHAR(255),
    applicant_phone VARCHAR(255),
    applicant_city VARCHAR(255),
    experience_years INTEGER,
    education_level TEXT,
    key_skills TEXT,
    certifications TEXT,
    resume_summary TEXT,
    ocr_transcript TEXT,
    scores JSONB,
    score_breakdown JSONB,
    total_score NUMERIC,
    rank_position INTEGER,
    scoring_summary TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    scored_at TIMESTAMP WITH TIME ZONE,
    reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Create application_files table with CASCADE DELETE
CREATE TABLE IF NOT EXISTS application_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(100),
    file_size INTEGER,
    file_category VARCHAR(100),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create video_sessions table
CREATE TABLE IF NOT EXISTS video_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id TEXT UNIQUE NOT NULL,
    title TEXT,
    meeting_url TEXT,
    status TEXT DEFAULT 'scheduled',
    participants_count INTEGER DEFAULT 0,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create webrtc_signaling table
CREATE TABLE IF NOT EXISTS webrtc_signaling (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id TEXT NOT NULL,
    peer_id TEXT NOT NULL,
    peer_type TEXT NOT NULL,
    signal_type TEXT NOT NULL,
    signal_data JSONB NOT NULL,
    consumed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_verification_code ON users(verification_code);
CREATE INDEX IF NOT EXISTS idx_users_reset_code ON users(reset_code);
CREATE INDEX IF NOT EXISTS idx_applications_ranking_id ON applications(ranking_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_application_files_application_id ON application_files(application_id);
CREATE INDEX IF NOT EXISTS idx_video_sessions_meeting_id ON video_sessions(meeting_id);
CREATE INDEX IF NOT EXISTS idx_webrtc_signaling_meeting_id ON webrtc_signaling(meeting_id);
CREATE INDEX IF NOT EXISTS idx_webrtc_signaling_consumed ON webrtc_signaling(consumed);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_rankings_updated_at ON rankings;
CREATE TRIGGER update_rankings_updated_at
    BEFORE UPDATE ON rankings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_video_sessions_updated_at ON video_sessions;
CREATE TRIGGER update_video_sessions_updated_at
    BEFORE UPDATE ON video_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create stored procedure for safe ranking deletion
CREATE OR REPLACE FUNCTION delete_ranking_with_cascade(
    ranking_id UUID,
    user_id UUID
)
RETURNS TABLE(deleted_id UUID, deleted_title TEXT) 
LANGUAGE plpgsql
AS $$
DECLARE
    ranking_record RECORD;
    applications_count INTEGER;
    files_count INTEGER;
BEGIN
    -- Check if ranking exists and user has permission
    SELECT id, title, created_by INTO ranking_record
    FROM rankings 
    WHERE id = ranking_id AND created_by = user_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Ranking not found or access denied';
    END IF;
    
    -- Get counts for logging
    SELECT COUNT(*) INTO applications_count 
    FROM applications 
    WHERE applications.ranking_id = delete_ranking_with_cascade.ranking_id;
    
    SELECT COUNT(*) INTO files_count 
    FROM application_files af
    JOIN applications a ON af.application_id = a.id
    WHERE a.ranking_id = delete_ranking_with_cascade.ranking_id;
    
    RAISE NOTICE 'Deleting ranking % with % applications and % files', 
        ranking_record.title, applications_count, files_count;
    
    -- Delete the ranking (CASCADE will handle applications and files)
    DELETE FROM rankings 
    WHERE id = ranking_id AND created_by = user_id;
    
    -- Return the deleted ranking info
    RETURN QUERY SELECT ranking_record.id, ranking_record.title;
END;
$$;

-- Insert default criteria
INSERT INTO criteria (name, description) VALUES
    ('Technical Skills', 'Assessment of technical competencies and expertise'),
    ('Communication', 'Evaluation of verbal and written communication abilities'),
    ('Problem Solving', 'Ability to analyze and solve complex problems'),
    ('Experience', 'Relevant work experience and background'),
    ('Cultural Fit', 'Alignment with company values and culture')
ON CONFLICT DO NOTHING;

COMMIT;
