-- Add metadata and version fields to audios table
ALTER TABLE public.audios
  ADD COLUMN IF NOT EXISTS version TEXT,
  ADD COLUMN IF NOT EXISTS duration_seconds INTEGER,
  ADD COLUMN IF NOT EXISTS format TEXT,
  ADD COLUMN IF NOT EXISTS bitrate INTEGER,
  ADD COLUMN IF NOT EXISTS sample_rate INTEGER,
  ADD COLUMN IF NOT EXISTS file_size_bytes BIGINT;

-- Create index for version
CREATE INDEX IF NOT EXISTS idx_audios_version ON public.audios(version);
CREATE INDEX IF NOT EXISTS idx_audios_track_id_version ON public.audios(track_id, version);

