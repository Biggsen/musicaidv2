// Types for notes
export interface Note {
  id: string
  note: string
  track_id: string
  step_id: string | null
  track_status_id: string | null
  done: boolean
  created_at: string
  updated_at: string
  created_by: string | null
  updated_by: string | null
}

export interface NoteInsert {
  note: string
  track_id: string
  step_id?: string | null
  track_status_id?: string | null
  done?: boolean
  created_by?: string | null
}

export interface NoteUpdate {
  note?: string
  step_id?: string | null
  track_status_id?: string | null
  done?: boolean
  updated_by?: string | null
}

export const useNotes = () => {
  const supabase = useSupabase()

  // Get all notes for a track
  const getNotes = async (trackId: string): Promise<Note[]> => {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('track_id', trackId)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return data || []
  }

  // Get a single note by ID
  const getNote = async (id: string): Promise<Note | null> => {
    const { data, error } = await supabase.from('notes').select('*').eq('id', id).single()

    if (error) {
      throw error
    }

    return data
  }

  // Create a new note
  const createNote = async (note: NoteInsert): Promise<Note> => {
    const { data, error } = await supabase.from('notes').insert(note).select().single()

    if (error) {
      throw error
    }

    return data
  }

  // Update a note
  const updateNote = async (id: string, updates: NoteUpdate): Promise<Note> => {
    const { data, error } = await supabase
      .from('notes')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  }

  // Delete a note
  const deleteNote = async (id: string): Promise<void> => {
    const { error } = await supabase.from('notes').delete().eq('id', id)

    if (error) {
      throw error
    }
  }

  return {
    getNotes,
    getNote,
    createNote,
    updateNote,
    deleteNote,
  }
}

