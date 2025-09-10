-- Create table for WebRTC signaling data
CREATE TABLE IF NOT EXISTS webrtc_signaling (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id TEXT NOT NULL,
  peer_id TEXT NOT NULL,
  peer_type TEXT NOT NULL CHECK (peer_type IN ('host', 'participant')),
  signal_type TEXT NOT NULL CHECK (signal_type IN ('offer', 'answer', 'ice-candidate')),
  signal_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  consumed BOOLEAN DEFAULT FALSE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_webrtc_signaling_meeting_id ON webrtc_signaling(meeting_id);
CREATE INDEX IF NOT EXISTS idx_webrtc_signaling_peer_id ON webrtc_signaling(peer_id);
CREATE INDEX IF NOT EXISTS idx_webrtc_signaling_consumed ON webrtc_signaling(consumed);

-- Enable RLS
ALTER TABLE webrtc_signaling ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (since this is for video calling)
CREATE POLICY "Allow all operations on webrtc_signaling" ON webrtc_signaling
FOR ALL USING (true);
