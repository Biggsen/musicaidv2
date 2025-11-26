-- Seed workflow data: templates, track statuses, and steps
-- This creates a basic "Standard Production" workflow template

-- Insert Track Statuses (global - artist_id is NULL)
INSERT INTO public.track_statuses (id, name, key, title, description, artist_id, non_linear, published)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Writing', 'writing', 'Writing Phase', 'Initial songwriting and composition phase', NULL, false, true),
  ('00000000-0000-0000-0000-000000000002', 'Recording', 'recording', 'Recording Phase', 'Recording instruments and vocals', NULL, false, true),
  ('00000000-0000-0000-0000-000000000003', 'Mixing', 'mixing', 'Mixing Phase', 'Mixing and balancing tracks', NULL, false, true),
  ('00000000-0000-0000-0000-000000000004', 'Mastering', 'mastering', 'Mastering Phase', 'Final mastering and preparation', NULL, false, true)
ON CONFLICT (id) DO NOTHING;

-- Insert Steps (global - artist_id is NULL)
INSERT INTO public.steps (id, name, key, title, description, type, artist_id, published)
VALUES
  -- Writing phase steps
  ('10000000-0000-0000-0000-000000000001', 'Write Lyrics', 'write-lyrics', 'Write Lyrics', 'Create and refine song lyrics', 'TEXT', NULL, true),
  ('10000000-0000-0000-0000-000000000002', 'Write Melody', 'write-melody', 'Write Melody', 'Develop the main melody', 'NORMAL', NULL, true),
  ('10000000-0000-0000-0000-000000000003', 'Create Chord Progression', 'create-chords', 'Create Chord Progression', 'Establish chord structure', 'NORMAL', NULL, true),
  
  -- Recording phase steps
  ('20000000-0000-0000-0000-000000000001', 'Record Vocals', 'record-vocals', 'Record Vocals', 'Record main vocal tracks', 'RECORD', NULL, true),
  ('20000000-0000-0000-0000-000000000002', 'Record Drums', 'record-drums', 'Record Drums', 'Record drum tracks', 'RECORD', NULL, true),
  ('20000000-0000-0000-0000-000000000003', 'Record Bass', 'record-bass', 'Record Bass', 'Record bass tracks', 'RECORD', NULL, true),
  ('20000000-0000-0000-0000-000000000004', 'Record Instruments', 'record-instruments', 'Record Instruments', 'Record additional instruments', 'RECORD', NULL, true),
  
  -- Mixing phase steps
  ('30000000-0000-0000-0000-000000000001', 'Balance Levels', 'balance-levels', 'Balance Levels', 'Balance volume levels of all tracks', 'NORMAL', NULL, true),
  ('30000000-0000-0000-0000-000000000002', 'Apply EQ', 'apply-eq', 'Apply EQ', 'Equalize frequency ranges', 'NORMAL', NULL, true),
  ('30000000-0000-0000-0000-000000000003', 'Add Effects', 'add-effects', 'Add Effects', 'Add reverb, delay, and other effects', 'NORMAL', NULL, true),
  ('30000000-0000-0000-0000-000000000004', 'Final Mix Review', 'final-mix-review', 'Final Mix Review', 'Review and approve final mix', 'NORMAL', NULL, true),
  
  -- Mastering phase steps
  ('40000000-0000-0000-0000-000000000001', 'Master EQ', 'master-eq', 'Master EQ', 'Final EQ adjustments', 'NORMAL', NULL, true),
  ('40000000-0000-0000-0000-000000000002', 'Compression', 'compression', 'Compression', 'Apply mastering compression', 'NORMAL', NULL, true),
  ('40000000-0000-0000-0000-000000000003', 'Loudness', 'loudness', 'Loudness', 'Set final loudness levels', 'NORMAL', NULL, true),
  ('40000000-0000-0000-0000-000000000004', 'Export Final', 'export-final', 'Export Final', 'Export final mastered version', 'NORMAL', NULL, true)
ON CONFLICT (id) DO NOTHING;

-- Insert Template
INSERT INTO public.templates (id, name, description, artist_id, published)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Standard Production', 'Standard music production workflow from writing to mastering', NULL, true)
ON CONFLICT (id) DO NOTHING;

-- Link Statuses to Template (via template_statuses junction table)
INSERT INTO public.template_statuses (template_id, track_status_id, order_index)
VALUES
  ('a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 0), -- Writing
  ('a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 1), -- Recording
  ('a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 2), -- Mixing
  ('a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', 3)  -- Mastering
ON CONFLICT (template_id, track_status_id) DO NOTHING;

-- Link Steps to Track Statuses (via step_track_statuses junction table)
INSERT INTO public.step_track_statuses (track_status_id, step_id, order_index)
VALUES
  -- Writing phase steps
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 0), -- Write Lyrics
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 1), -- Write Melody
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 2), -- Create Chord Progression
  
  -- Recording phase steps
  ('00000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 0), -- Record Vocals
  ('00000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 1), -- Record Drums
  ('00000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000003', 2), -- Record Bass
  ('00000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000004', 3), -- Record Instruments
  
  -- Mixing phase steps
  ('00000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', 0), -- Balance Levels
  ('00000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000002', 1), -- Apply EQ
  ('00000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', 2), -- Add Effects
  ('00000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000004', 3), -- Final Mix Review
  
  -- Mastering phase steps
  ('00000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000001', 0), -- Master EQ
  ('00000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000002', 1), -- Compression
  ('00000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000003', 2), -- Loudness
  ('00000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000004', 3)  -- Export Final
ON CONFLICT (step_id, track_status_id) DO NOTHING;


