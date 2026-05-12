-- Tour de Wognum Database Schema
-- Run this against your Neon PostgreSQL database

CREATE TYPE IF NOT EXISTS speciality AS ENUM (
  'climber', 'sprinter', 'time_trialist', 'gc_contender', 'domestique', 'puncheur'
);

CREATE TYPE IF NOT EXISTS stage_type AS ENUM (
  'flat', 'hilly', 'mountain', 'time_trial', 'team_time_trial'
);

CREATE TYPE IF NOT EXISTS stage_status AS ENUM (
  'planned', 'active', 'completed'
);

CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  primary_color TEXT NOT NULL,
  secondary_color TEXT NOT NULL,
  description TEXT,
  logo_url TEXT
);

CREATE TABLE IF NOT EXISTS riders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  nationality TEXT NOT NULL,
  team_id UUID REFERENCES teams(id),
  speciality speciality NOT NULL DEFAULT 'domestique',
  bio TEXT,
  bib_number INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_number INTEGER NOT NULL UNIQUE,
  date TEXT NOT NULL,
  start_location TEXT NOT NULL,
  finish_location TEXT NOT NULL,
  type stage_type NOT NULL,
  distance_km INTEGER NOT NULL,
  elevation_meters INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  climbs JSONB DEFAULT '[]',
  is_sprint_stage BOOLEAN NOT NULL DEFAULT false,
  is_mountain_stage BOOLEAN NOT NULL DEFAULT false,
  status stage_status NOT NULL DEFAULT 'planned'
);

CREATE TABLE IF NOT EXISTS participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  date_of_birth TEXT NOT NULL,
  iban TEXT NOT NULL,
  golden_stage_id UUID REFERENCES stages(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS participant_riders (
  participant_id UUID NOT NULL REFERENCES participants(id),
  rider_id UUID NOT NULL REFERENCES riders(id),
  is_captain BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (participant_id, rider_id)
);

CREATE TABLE IF NOT EXISTS participant_gc_prediction (
  participant_id UUID NOT NULL REFERENCES participants(id),
  rider_id UUID NOT NULL REFERENCES riders(id),
  predicted_position INTEGER NOT NULL,
  PRIMARY KEY (participant_id, rider_id)
);

CREATE TABLE IF NOT EXISTS stage_results (
  stage_id UUID NOT NULL REFERENCES stages(id),
  rider_id UUID NOT NULL REFERENCES riders(id),
  position INTEGER NOT NULL,
  time_gap TEXT,
  PRIMARY KEY (stage_id, rider_id)
);

CREATE TABLE IF NOT EXISTS rider_values (
  rider_id UUID PRIMARY KEY REFERENCES riders(id),
  value INTEGER NOT NULL DEFAULT 0,
  times_chosen INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS actual_gc_top5 (
  rider_id UUID PRIMARY KEY REFERENCES riders(id),
  position INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS dnf_riders (
  rider_id UUID PRIMARY KEY REFERENCES riders(id),
  stage_id UUID REFERENCES stages(id),
  dnf_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_riders_team ON riders(team_id);
CREATE INDEX IF NOT EXISTS idx_riders_active ON riders(is_active);
CREATE INDEX IF NOT EXISTS idx_participant_riders_participant ON participant_riders(participant_id);
CREATE INDEX IF NOT EXISTS idx_participant_riders_rider ON participant_riders(rider_id);
CREATE INDEX IF NOT EXISTS idx_stage_results_stage ON stage_results(stage_id);
CREATE INDEX IF NOT EXISTS idx_stage_results_rider ON stage_results(rider_id);
CREATE INDEX IF NOT EXISTS idx_stages_number ON stages(stage_number);
CREATE INDEX IF NOT EXISTS idx_stages_status ON stages(status);
