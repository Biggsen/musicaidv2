import { generateSlug, generateUniqueSlug } from './useSlug'

// Types for albums
export interface Album {
  id: string
  name: string
  slug: string
  description: string | null
  artist_id: string
  release_date: string | null
  image_url: string | null
  created_at: string
  updated_at: string
}

export interface AlbumInsert {
  name: string
  slug?: string
  description?: string | null
  artist_id: string
  release_date?: string | null
  image_url?: string | null
}

export interface AlbumUpdate {
  name?: string
  slug?: string
  description?: string | null
  release_date?: string | null
  image_url?: string | null
}

export const useAlbums = () => {
  const supabase = useSupabase()

  // Get all albums for an artist
  const getAlbums = async (artistId?: string): Promise<Album[]> => {
    let query = supabase.from('albums').select('*').order('created_at', { ascending: false })

    if (artistId) {
      query = query.eq('artist_id', artistId)
    }

    const { data, error } = await query

    if (error) {
      // If table doesn't exist yet, return empty array
      if (error.code === '42P01') {
        return []
      }
      throw error
    }

    return data || []
  }

  // Get a single album by ID
  const getAlbum = async (id: string): Promise<Album | null> => {
    const { data, error } = await supabase.from('albums').select('*').eq('id', id).single()

    if (error) {
      // If table doesn't exist yet, return null
      if (error.code === '42P01') {
        return null
      }
      throw error
    }

    return data
  }

  // Get album with tracks
  const getAlbumWithTracks = async (id: string) => {
    const { data, error } = await supabase
      .from('albums')
      .select(
        `
        *,
        tracks:tracks(
          id,
          name,
          key,
          album_order,
          tempo,
          live_ready,
          created_at
        )
      `
      )
      .eq('id', id)
      .single()

    if (error) {
      // If table doesn't exist yet, return null
      if (error.code === '42P01') {
        return null
      }
      throw error
    }

    if (!data) return null

    // Sort tracks by album_order
    const tracks = (data.tracks || []).sort((a: any, b: any) => {
      if (a.album_order === null && b.album_order === null) return 0
      if (a.album_order === null) return 1
      if (b.album_order === null) return -1
      return a.album_order - b.album_order
    })

    return {
      ...data,
      tracks,
    }
  }

  // Create a new album
  const createAlbum = async (album: AlbumInsert): Promise<Album> => {
    // Auto-generate slug if not provided
    let finalSlug = album.slug
    if (!finalSlug) {
      const baseSlug = generateSlug(album.name)
      
      // Check if slug exists and generate unique one
      finalSlug = await generateUniqueSlug(baseSlug, async (slug) => {
        const { data, error } = await supabase.from('albums').select('id').eq('slug', slug).maybeSingle()
        return !!data && !error
      })
    }

    // Create the album with generated slug
    const albumData = { ...album, slug: finalSlug }
    const { data, error } = await supabase.from('albums').insert(albumData).select().single()

    if (error) {
      throw error
    }

    return data
  }

  // Update an album
  const updateAlbum = async (id: string, updates: AlbumUpdate): Promise<Album> => {
    const { data, error } = await supabase
      .from('albums')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  }

  // Delete an album
  const deleteAlbum = async (id: string): Promise<void> => {
    const { error } = await supabase.from('albums').delete().eq('id', id)

    if (error) {
      throw error
    }
  }

  return {
    getAlbums,
    getAlbum,
    getAlbumWithTracks,
    createAlbum,
    updateAlbum,
    deleteAlbum,
  }
}

