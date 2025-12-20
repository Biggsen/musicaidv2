import { generateSlug, generateUniqueSlug } from './useSlug'

// Types for tracks
export interface Track {
  id: string
  name: string
  key: string
  artist_id: string
  template_id: string | null
  track_status_id: string | null
  step_id: string | null
  tempo: number | null
  time_signature_numerator: number | null
  time_signature_denominator: number | null
  time_signature_varied: boolean
  minutes: number | null
  seconds: number | null
  samples: string
  album_id: string | null
  album_order: number | null
  date_created: string | null
  isrc_code: string | null
  live_ready: boolean
  description: string | null
  created_at: string
  updated_at: string
  created_by: string | null
  updated_by: string | null
}

export interface TrackInsert {
  name: string
  key?: string
  artist_id: string
  template_id?: string | null
  track_status_id?: string | null
  step_id?: string | null
  tempo?: number | null
  time_signature_numerator?: number | null
  time_signature_denominator?: number | null
  time_signature_varied?: boolean
  minutes?: number | null
  seconds?: number | null
  samples?: string
  album_id?: string | null
  album_order?: number | null
  date_created?: string | null
  isrc_code?: string | null
  live_ready?: boolean
  description?: string | null
  created_by?: string | null
}

export interface TrackUpdate {
  name?: string
  key?: string
  artist_id?: string
  template_id?: string | null
  track_status_id?: string | null
  step_id?: string | null
  tempo?: number | null
  time_signature_numerator?: number | null
  time_signature_denominator?: number | null
  time_signature_varied?: boolean
  minutes?: number | null
  seconds?: number | null
  samples?: string
  album_id?: string | null
  album_order?: number | null
  date_created?: string | null
  isrc_code?: string | null
  live_ready?: boolean
  description?: string | null
  updated_by?: string | null
}

export const useTracks = () => {
  const supabase = useSupabase()

  // Get all tracks for an artist
  const getTracks = async (artistId: string): Promise<Track[]> => {
    const { data, error } = await supabase
      .from('tracks')
      .select('*')
      .eq('artist_id', artistId)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return data || []
  }

  // Get a single track by ID
  const getTrack = async (id: string): Promise<Track | null> => {
    const { data, error } = await supabase.from('tracks').select('*').eq('id', id).single()

    if (error) {
      throw error
    }

    return data
  }

  // Create a new track
  const createTrack = async (track: TrackInsert): Promise<Track> => {
    // Auto-generate key if not provided
    let finalKey = track.key
    if (!finalKey) {
      const baseKey = generateSlug(track.name)
      
      // Check if key exists and generate unique one
      finalKey = await generateUniqueSlug(baseKey, async (key) => {
        const { data, error } = await supabase.from('tracks').select('id').eq('key', key).maybeSingle()
        return !!data && !error
      })
    }

    // Create the track with generated key
    const trackData = { ...track, key: finalKey }
    const { data, error } = await supabase.from('tracks').insert(trackData).select().single()

    if (error) {
      throw error
    }

    return data
  }

  // Update a track
  const updateTrack = async (id: string, updates: TrackUpdate): Promise<Track> => {
    const { data, error } = await supabase
      .from('tracks')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  }

  // Delete a track
  const deleteTrack = async (id: string): Promise<void> => {
    const { error } = await supabase.from('tracks').delete().eq('id', id)

    if (error) {
      throw error
    }
  }

  return {
    getTracks,
    getTrack,
    createTrack,
    updateTrack,
    deleteTrack,
  }
}
