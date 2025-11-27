import { generateSlug, generateUniqueSlug } from './useSlug'

// Types for artists
export interface Artist {
  id: string
  name: string
  slug: string
  template_id: string | null
  created_at: string
  updated_at: string
}

export interface ArtistInsert {
  name: string
  slug?: string
  template_id?: string | null
}

export interface ArtistUpdate {
  name?: string
  slug?: string
  template_id?: string | null
}

export const useArtists = () => {
  const supabase = useSupabase()

  // Get all artists for the current user
  const getArtists = async (): Promise<Artist[]> => {
    const { data, error } = await supabase
      .from('artists')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return data || []
  }

  // Get a single artist by ID
  const getArtist = async (id: string): Promise<Artist | null> => {
    const { data, error } = await supabase.from('artists').select('*').eq('id', id).single()

    if (error) {
      throw error
    }

    return data
  }

  // Create a new artist
  const createArtist = async (artist: ArtistInsert): Promise<Artist> => {
    // Check for active session (more reliable than useSupabaseUser)
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !sessionData.session || !sessionData.session.user) {
      throw new Error('No active session. Please log in again.')
    }

    const userId = sessionData.session.user.id

    // Auto-generate slug if not provided
    let finalSlug = artist.slug
    if (!finalSlug) {
      const baseSlug = generateSlug(artist.name)
      
      // Check if slug exists and generate unique one
      finalSlug = await generateUniqueSlug(baseSlug, async (slug) => {
        const { data, error } = await supabase.from('artists').select('id').eq('slug', slug).maybeSingle()
        return !!data && !error
      })
    }

    // Create the artist with generated slug
    const artistData = { ...artist, slug: finalSlug }
    const { data, error } = await supabase.from('artists').insert(artistData).select().single()

    if (error) {
      console.error('Error creating artist:', error)
      throw error
    }

    // Automatically add the creator as an owner in user_artists
    const { error: userArtistError } = await supabase.from('user_artists').insert({
      user_id: userId,
      artist_id: data.id,
      role: 'owner',
    })

    if (userArtistError) {
      // If adding user_artist fails, try to delete the artist we just created
      await supabase.from('artists').delete().eq('id', data.id)
      throw new Error('Failed to associate user with artist: ' + userArtistError.message)
    }

    return data
  }

  // Update an artist
  const updateArtist = async (id: string, updates: ArtistUpdate): Promise<Artist> => {
    const { data, error } = await supabase
      .from('artists')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  }

  // Delete an artist
  const deleteArtist = async (id: string): Promise<void> => {
    const { error } = await supabase.from('artists').delete().eq('id', id)

    if (error) {
      throw error
    }
  }

  return {
    getArtists,
    getArtist,
    createArtist,
    updateArtist,
    deleteArtist,
  }
}
