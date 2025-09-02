-- PostgreSQL Migration Script for HireRankerAI Database
-- This script creates the complete database schema in PostgreSQL
-- Compatible with the MS SQL Server database structure

-- ============================================================================
-- STEP 1: RESET DATABASE (Drop all existing tables and data)
-- ============================================================================

-- Drop all tables in correct order to handle foreign key constraints
DROP TABLE IF EXISTS application_files CASCADE;
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS criteria CASCADE;
DROP TABLE IF EXISTS interview_invitations CASCADE;
DROP TABLE IF EXISTS video_sessions CASCADE;
DROP TABLE IF EXISTS rankings CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop any remaining sequences or functions
DROP SEQUENCE IF EXISTS applications_rank_seq CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- ============================================================================
-- STEP 2: CREATE FRESH DATABASE SCHEMA
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================================================
-- USERS TABLE - Authentication and user management
-- ============================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    firstname TEXT,
    lastname TEXT,
    company_name TEXT,
    is_verified BOOLEAN DEFAULT false,
    verification_code VARCHAR(6),
    verification_expires_at TIMESTAMP WITH TIME ZONE,
    reset_code VARCHAR(6),
    reset_expires_at TIMESTAMP WITH TIME ZONE,
    password_change_code TEXT,
    password_change_expires_at TIMESTAMP WITH TIME ZONE,
    account_deletion_code TEXT,
    account_deletion_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- RANKINGS TABLE - Job positions and evaluation criteria
-- ============================================================================
CREATE TABLE rankings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    position VARCHAR(100) NOT NULL CHECK (position IN ('kitchen-helper', 'server/waiter', 'housekeeping', 'cashier', 'barista', 'gardener', 'receptionist')),
    description TEXT,
    area_city VARCHAR(255),
    area_living_preference VARCHAR(255),
    criteria JSONB NOT NULL DEFAULT '{}',
    criteria_weights JSONB NOT NULL DEFAULT '{}',
    show_criteria_to_applicants BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    application_link_id VARCHAR(50) UNIQUE,
    created_by UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- APPLICATIONS TABLE - Candidate submissions and scoring
-- ============================================================================
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ranking_id UUID NOT NULL REFERENCES rankings(id) ON DELETE CASCADE,
    applicant_name VARCHAR(255) NOT NULL,
    applicant_email VARCHAR(255) NOT NULL,
    applicant_phone VARCHAR(50),
    applicant_city VARCHAR(255),
    key_skills TEXT,
    experience_years INTEGER DEFAULT 0,
    education_level TEXT,
    certifications TEXT,
    resume_summary TEXT,
    ocr_transcript TEXT,
    scores JSONB DEFAULT '{}',
    score_breakdown JSONB DEFAULT '{}',
    scoring_summary TEXT,
    total_score NUMERIC(5,2) DEFAULT 0,
    rank_position INTEGER,
    status VARCHAR(50) DEFAULT 'pending',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    scored_at TIMESTAMP WITH TIME ZONE,
    reviewed_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- APPLICATION FILES TABLE - Document storage references
-- ============================================================================
CREATE TABLE application_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(100),
    file_category VARCHAR(100) CHECK (file_category IN ('resume', 'certificate', 'portfolio', 'other')),
    file_size INTEGER,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- VIDEO SESSIONS TABLE - Video call management
-- ============================================================================
CREATE TABLE video_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    meeting_id VARCHAR(255) UNIQUE NOT NULL,
    host_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'completed', 'cancelled')),
    scheduled_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INTERVIEW INVITATIONS TABLE - Participant access management
-- ============================================================================
CREATE TABLE interview_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id VARCHAR(255) NOT NULL,
    participant_email VARCHAR(255) NOT NULL,
    access_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- CRITERIA TABLE - Evaluation criteria definitions
-- ============================================================================
CREATE TABLE criteria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES - Performance optimization
-- ============================================================================
CREATE INDEX idx_applications_ranking_id ON applications(ranking_id);
CREATE INDEX idx_applications_total_score ON applications(total_score DESC);
CREATE INDEX idx_applications_submitted_at ON applications(submitted_at DESC);
CREATE INDEX idx_application_files_application_id ON application_files(application_id);
CREATE INDEX idx_rankings_position ON rankings(position);
CREATE INDEX idx_rankings_is_active ON rankings(is_active);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_rankings_application_link_id ON rankings(application_link_id);
CREATE INDEX idx_video_sessions_meeting_id ON video_sessions(meeting_id);
CREATE INDEX idx_interview_invitations_access_token ON interview_invitations(access_token);
CREATE INDEX idx_interview_invitations_meeting_id ON interview_invitations(meeting_id);

-- ============================================================================
-- TRIGGERS - Automatic timestamp updates
-- ============================================================================
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rankings_updated_at BEFORE UPDATE ON rankings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_video_sessions_updated_at BEFORE UPDATE ON video_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- DEFAULT DATA - Essential criteria and configuration
-- ============================================================================
INSERT INTO criteria (name, description) VALUES
('skill', 'Technical and job-specific skills relevant to the position'),
('experience', 'Years of relevant work experience in the field'),
('education', 'Educational background and qualifications'),
('training', 'Professional training, courses, and certifications'),
('personality', 'Soft skills and personality traits suitable for the role'),
('certification', 'Industry certifications and professional credentials'),
('location', 'Geographic location and availability');

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================
-- PostgreSQL Database setup completed successfully!
-- All tables, indexes, triggers, and default data have been created.
-- This schema is compatible with the MS SQL Server version.
