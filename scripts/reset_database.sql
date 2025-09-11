-- Database Reset Script for HireRankerAI
-- This script clears all data from the database while preserving the table structure
-- Use this when you want to deploy the system as new with clean data

-- Disable foreign key checks temporarily
SET session_replication_role = replica;

-- Clear all data from tables (in correct order to respect foreign keys)
TRUNCATE TABLE application_files CASCADE;
TRUNCATE TABLE applications CASCADE;
TRUNCATE TABLE webrtc_signaling CASCADE;
TRUNCATE TABLE video_sessions CASCADE;
TRUNCATE TABLE criteria CASCADE;
TRUNCATE TABLE rankings CASCADE;
TRUNCATE TABLE users CASCADE;

-- Re-enable foreign key checks
SET session_replication_role = DEFAULT;

-- Reset sequences (if any auto-increment columns exist)
-- Note: UUID columns don't need sequence resets

-- Re-insert default criteria
INSERT INTO criteria (name, description) VALUES
    ('Technical Skills', 'Assessment of technical competencies and expertise'),
    ('Communication', 'Evaluation of verbal and written communication abilities'),
    ('Problem Solving', 'Ability to analyze and solve complex problems'),
    ('Experience', 'Relevant work experience and background'),
    ('Cultural Fit', 'Alignment with company values and culture');

-- Optional: Create a default admin user (uncomment if needed)
-- INSERT INTO users (email, password_hash, firstname, lastname, is_verified) VALUES
-- ('admin@example.com', '$2b$10$example_hash_here', 'Admin', 'User', true);

COMMIT;
