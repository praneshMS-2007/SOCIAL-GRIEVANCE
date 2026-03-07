-- ===========================================
-- SC-02: AI Grievance Router Database Schema
-- Run this in Supabase SQL Editor
-- ===========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Grievances table
CREATE TABLE IF NOT EXISTS grievances (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tracking_id TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    urgency TEXT NOT NULL DEFAULT 'medium',
    sentiment_score FLOAT DEFAULT 0.5,
    status TEXT NOT NULL DEFAULT 'open',
    language TEXT DEFAULT 'en',
    location TEXT,
    district TEXT DEFAULT 'Unknown',
    is_anonymous BOOLEAN DEFAULT FALSE,
    is_whistleblower BOOLEAN DEFAULT FALSE,
    citizen_name TEXT,
    citizen_contact TEXT,
    sla_deadline TIMESTAMPTZ,
    escalation_level INTEGER DEFAULT 0,
    resolution_notes TEXT,
    quality_rating INTEGER,
    summary_en TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Escalation log
CREATE TABLE IF NOT EXISTS escalation_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    grievance_id UUID REFERENCES grievances(id) ON DELETE CASCADE,
    escalated_at TIMESTAMPTZ DEFAULT NOW(),
    escalation_level INTEGER NOT NULL,
    reason TEXT,
    auto_triggered BOOLEAN DEFAULT TRUE
);

-- 3. Clusters table
CREATE TABLE IF NOT EXISTS clusters (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    category TEXT NOT NULL,
    district TEXT NOT NULL,
    description TEXT,
    grievance_count INTEGER DEFAULT 0,
    is_systemic BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Cluster members
CREATE TABLE IF NOT EXISTS cluster_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    cluster_id UUID REFERENCES clusters(id) ON DELETE CASCADE,
    grievance_id UUID REFERENCES grievances(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_grievances_status ON grievances(status);
CREATE INDEX IF NOT EXISTS idx_grievances_category ON grievances(category);
CREATE INDEX IF NOT EXISTS idx_grievances_district ON grievances(district);
CREATE INDEX IF NOT EXISTS idx_grievances_tracking ON grievances(tracking_id);
CREATE INDEX IF NOT EXISTS idx_grievances_sla ON grievances(sla_deadline);
CREATE INDEX IF NOT EXISTS idx_grievances_whistleblower ON grievances(is_whistleblower);
CREATE INDEX IF NOT EXISTS idx_escalation_grievance ON escalation_log(grievance_id);
CREATE INDEX IF NOT EXISTS idx_clusters_systemic ON clusters(is_systemic);

-- Enable Row Level Security
ALTER TABLE grievances ENABLE ROW LEVEL SECURITY;
ALTER TABLE escalation_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE cluster_members ENABLE ROW LEVEL SECURITY;

-- Policies: allow all operations for anon key (for hackathon simplicity)
CREATE POLICY "Allow all for grievances" ON grievances FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for escalation_log" ON escalation_log FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for clusters" ON clusters FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for cluster_members" ON cluster_members FOR ALL USING (true) WITH CHECK (true);
