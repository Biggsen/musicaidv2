// Types for audio files
export interface AudioFile {
  id: string
  name: string
  slug: string
  file_url: string | null
  dropbox_url: string | null
  track_id: string
  mixdown_date: string | null
  description: string | null
  created_at: string
  updated_at: string
  created_by: string | null
  updated_by: string | null
}

export interface AudioFileInsert {
  name: string
  slug: string
  file_url?: string | null
  dropbox_url?: string | null
  track_id: string
  mixdown_date?: string | null
  description?: string | null
  created_by?: string | null
}

export interface AudioFileUpdate {
  name?: string
  slug?: string
  file_url?: string | null
  dropbox_url?: string | null
  mixdown_date?: string | null
  description?: string | null
  updated_by?: string | null
}

export const useAudio = () => {
  const supabase = useSupabase()

  // Get all audio files for a track
  const getAudioFiles = async (trackId: string): Promise<AudioFile[]> => {
    const { data, error } = await supabase
      .from('audios')
      .select('*')
      .eq('track_id', trackId)
      .order('created_at', { ascending: false })

    if (error) {
      // If table doesn't exist yet, return empty array
      if (error.code === '42P01') {
        return []
      }
      throw error
    }

    return data || []
  }

  // Get a single audio file by ID
  const getAudioFile = async (id: string): Promise<AudioFile | null> => {
    const { data, error } = await supabase.from('audios').select('*').eq('id', id).single()

    if (error) {
      throw error
    }

    return data
  }

  // Create a new audio file
  const createAudioFile = async (audio: AudioFileInsert): Promise<AudioFile> => {
    const { data, error } = await supabase.from('audios').insert(audio).select().single()

    if (error) {
      throw error
    }

    return data
  }

  // Update an audio file
  const updateAudioFile = async (id: string, updates: AudioFileUpdate): Promise<AudioFile> => {
    const { data, error } = await supabase
      .from('audios')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  }

  // Delete an audio file
  const deleteAudioFile = async (id: string): Promise<void> => {
    const { error } = await supabase.from('audios').delete().eq('id', id)

    if (error) {
      throw error
    }
  }

  return {
    getAudioFiles,
    getAudioFile,
    createAudioFile,
    updateAudioFile,
    deleteAudioFile,
  }
}

