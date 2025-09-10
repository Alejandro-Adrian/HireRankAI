-- Update WebRTC signaling table to support additional signal types
ALTER TABLE webrtc_signaling 
DROP CONSTRAINT IF EXISTS webrtc_signaling_signal_type_check;

-- Add new constraint with additional signal types
ALTER TABLE webrtc_signaling 
ADD CONSTRAINT webrtc_signaling_signal_type_check 
CHECK (signal_type IN ('offer', 'answer', 'ice-candidate', 'join-request', 'join-response'));

-- Add comment explaining the table purpose
COMMENT ON TABLE webrtc_signaling IS 'Stores WebRTC signaling data for video calls - now supports WebSocket-based real-time signaling';
