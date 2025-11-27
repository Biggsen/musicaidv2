import { generateSlug, generateUniqueSlug } from './useSlug'

// Types for workflow system
export interface TrackStatus {
  id: string
  name: string
  key: string
  title: string | null
  description: string | null
  artist_id: string | null
  non_linear: boolean
  published: boolean
  created_at: string
  updated_at: string
}

export interface TrackStatusInsert {
  name: string
  key?: string
  title?: string | null
  description?: string | null
  artist_id?: string | null
  non_linear?: boolean
  published?: boolean
}

export interface TrackStatusUpdate {
  name?: string
  key?: string
  title?: string | null
  description?: string | null
  artist_id?: string | null
  non_linear?: boolean
  published?: boolean
}

export interface Step {
  id: string
  name: string
  key: string
  title: string | null
  description: string | null
  type: 'NORMAL' | 'TEXT' | 'LIST' | 'RECORD'
  artist_id: string | null
  published: boolean
  created_at: string
  updated_at: string
}

export interface StepInsert {
  name: string
  key?: string
  title?: string | null
  description?: string | null
  type?: 'NORMAL' | 'TEXT' | 'LIST' | 'RECORD'
  artist_id?: string | null
  published?: boolean
}

export interface StepUpdate {
  name?: string
  key?: string
  title?: string | null
  description?: string | null
  type?: 'NORMAL' | 'TEXT' | 'LIST' | 'RECORD'
  artist_id?: string | null
  published?: boolean
}

export interface Template {
  id: string
  name: string
  description: string | null
  artist_id: string | null
  published: boolean
  created_at: string
  updated_at: string
}

export interface TemplateInsert {
  name: string
  description?: string | null
  artist_id?: string | null
  published?: boolean
}

export interface TemplateUpdate {
  name?: string
  description?: string | null
  artist_id?: string | null
  published?: boolean
}

// Extended types with relationships
export interface TrackStatusWithSteps extends TrackStatus {
  steps?: Step[]
}

export interface TemplateWithStatuses extends Template {
  statuses?: TrackStatus[]
}

export const useWorkflow = () => {
  const supabase = useSupabase()

  // ==================== Track Statuses ====================

  const getTrackStatuses = async (artistId?: string | null): Promise<TrackStatus[]> => {
    let query = supabase.from('track_statuses').select('*').order('created_at', { ascending: false })

    if (artistId !== undefined) {
      if (artistId === null) {
        query = query.is('artist_id', null)
      } else {
        query = query.eq('artist_id', artistId)
      }
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

  const getTrackStatus = async (id: string): Promise<TrackStatus | null> => {
    const { data, error } = await supabase
      .from('track_statuses')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      throw error
    }

    return data
  }

  const getTrackStatusWithSteps = async (id: string): Promise<TrackStatusWithSteps | null> => {
    const { data, error } = await supabase
      .from('track_statuses')
      .select(
        `
        *,
        step_track_statuses(
          order_index,
          steps(*)
        )
      `
      )
      .eq('id', id)
      .single()

    if (error) {
      throw error
    }

    if (!data) return null

    // Transform the nested data structure
    const status = data as any
    const steps = status.step_track_statuses
      ?.sort((a: any, b: any) => a.order_index - b.order_index)
      .map((sts: any) => sts.steps)
      .filter((step: any) => step !== null) || []

    return {
      ...status,
      steps,
    }
  }

  const createTrackStatus = async (status: TrackStatusInsert): Promise<TrackStatus> => {
    // Auto-generate key if not provided
    let finalKey = status.key
    if (!finalKey) {
      const baseKey = generateSlug(status.name)
      
      // Check if key exists and generate unique one
      finalKey = await generateUniqueSlug(baseKey, async (key) => {
        const { data, error } = await supabase.from('track_statuses').select('id').eq('key', key).maybeSingle()
        return !!data && !error
      })
    }

    // Create the status with generated key
    const statusData = { ...status, key: finalKey }
    const { data, error } = await supabase
      .from('track_statuses')
      .insert(statusData)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  }

  const updateTrackStatus = async (
    id: string,
    updates: TrackStatusUpdate
  ): Promise<TrackStatus> => {
    const { data, error } = await supabase
      .from('track_statuses')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  }

  const deleteTrackStatus = async (id: string): Promise<void> => {
    const { error } = await supabase.from('track_statuses').delete().eq('id', id)

    if (error) {
      throw error
    }
  }

  // ==================== Steps ====================

  const getSteps = async (artistId?: string | null): Promise<Step[]> => {
    let query = supabase.from('steps').select('*').order('created_at', { ascending: false })

    if (artistId !== undefined) {
      if (artistId === null) {
        query = query.is('artist_id', null)
      } else {
        query = query.eq('artist_id', artistId)
      }
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

  const getStep = async (id: string): Promise<Step | null> => {
    const { data, error } = await supabase.from('steps').select('*').eq('id', id).single()

    if (error) {
      throw error
    }

    return data
  }

  const createStep = async (step: StepInsert): Promise<Step> => {
    // Auto-generate key if not provided
    let finalKey = step.key
    if (!finalKey) {
      const baseKey = generateSlug(step.name)
      
      // Check if key exists and generate unique one
      finalKey = await generateUniqueSlug(baseKey, async (key) => {
        const { data, error } = await supabase.from('steps').select('id').eq('key', key).maybeSingle()
        return !!data && !error
      })
    }

    // Create the step with generated key
    const stepData = { ...step, key: finalKey }
    const { data, error } = await supabase.from('steps').insert(stepData).select().single()

    if (error) {
      throw error
    }

    return data
  }

  const updateStep = async (id: string, updates: StepUpdate): Promise<Step> => {
    const { data, error } = await supabase
      .from('steps')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  }

  const deleteStep = async (id: string): Promise<void> => {
    const { error } = await supabase.from('steps').delete().eq('id', id)

    if (error) {
      throw error
    }
  }

  // ==================== Templates ====================

  const getTemplates = async (artistId?: string | null): Promise<Template[]> => {
    let query = supabase.from('templates').select('*').order('created_at', { ascending: false })

    if (artistId !== undefined) {
      if (artistId === null) {
        query = query.is('artist_id', null)
      } else {
        query = query.eq('artist_id', artistId)
      }
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

  const getTemplate = async (id: string): Promise<Template | null> => {
    const { data, error } = await supabase.from('templates').select('*').eq('id', id).single()

    if (error) {
      throw error
    }

    return data
  }

  const getTemplateWithStatuses = async (id: string): Promise<TemplateWithStatuses | null> => {
    const { data, error } = await supabase
      .from('templates')
      .select(
        `
        *,
        template_statuses(
          order_index,
          track_statuses(*)
        )
      `
      )
      .eq('id', id)
      .single()

    if (error) {
      throw error
    }

    if (!data) return null

    // Transform the nested data structure
    const template = data as any
    const statuses = template.template_statuses
      ?.sort((a: any, b: any) => a.order_index - b.order_index)
      .map((ts: any) => ts.track_statuses)
      .filter((status: any) => status !== null) || []

    return {
      ...template,
      statuses,
    }
  }

  const createTemplate = async (template: TemplateInsert): Promise<Template> => {
    const { data, error } = await supabase.from('templates').insert(template).select().single()

    if (error) {
      throw error
    }

    return data
  }

  const updateTemplate = async (id: string, updates: TemplateUpdate): Promise<Template> => {
    const { data, error } = await supabase
      .from('templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  }

  const deleteTemplate = async (id: string): Promise<void> => {
    const { error } = await supabase.from('templates').delete().eq('id', id)

    if (error) {
      throw error
    }
  }

  // ==================== Junction Table Operations ====================

  // Add a status to a template
  const addStatusToTemplate = async (
    templateId: string,
    trackStatusId: string,
    orderIndex: number = 0
  ): Promise<void> => {
    const { error } = await supabase.from('template_statuses').insert({
      template_id: templateId,
      track_status_id: trackStatusId,
      order_index: orderIndex,
    })

    if (error) {
      throw error
    }
  }

  // Remove a status from a template
  const removeStatusFromTemplate = async (
    templateId: string,
    trackStatusId: string
  ): Promise<void> => {
    const { error } = await supabase
      .from('template_statuses')
      .delete()
      .eq('template_id', templateId)
      .eq('track_status_id', trackStatusId)

    if (error) {
      throw error
    }
  }

  // Add a step to a track status
  const addStepToTrackStatus = async (
    trackStatusId: string,
    stepId: string,
    orderIndex: number = 0
  ): Promise<void> => {
    const { error } = await supabase.from('step_track_statuses').insert({
      track_status_id: trackStatusId,
      step_id: stepId,
      order_index: orderIndex,
    })

    if (error) {
      throw error
    }
  }

  // Remove a step from a track status
  const removeStepFromTrackStatus = async (trackStatusId: string, stepId: string): Promise<void> => {
    const { error } = await supabase
      .from('step_track_statuses')
      .delete()
      .eq('track_status_id', trackStatusId)
      .eq('step_id', stepId)

    if (error) {
      throw error
    }
  }

  // ==================== Track Step Completion ====================

  // Get all completed step IDs for a track
  const getCompletedSteps = async (trackId: string): Promise<string[]> => {
    const { data, error } = await supabase
      .from('track_steps')
      .select('step_id')
      .eq('track_id', trackId)

    if (error) {
      // If table doesn't exist yet (PGRST205, 42P01, or 404), return empty array
      const isTableNotFound =
        error.code === 'PGRST205' ||
        error.code === '42P01' ||
        error.message?.includes("Could not find the table") ||
        error.message?.includes("track_steps") ||
        (error as any).status === 404 ||
        (error as any).statusCode === 404

      if (isTableNotFound) {
        // Silently return empty array - table will be created when migration is run
        return []
      }
      throw error
    }

    return data?.map(row => row.step_id) || []
  }

  // Mark a step as completed for a track
  const completeStep = async (trackId: string, stepId: string): Promise<void> => {
    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { error } = await supabase.from('track_steps').insert({
      track_id: trackId,
      step_id: stepId,
      completed_by: user?.id || null,
    })

    if (error) {
      // If duplicate (already completed), that's okay
      if (error.code === '23505') {
        return
      }
      // If table doesn't exist yet, silently fail (migration not run)
      const isTableNotFound =
        error.code === 'PGRST205' ||
        error.code === '42P01' ||
        error.message?.includes("Could not find the table") ||
        error.message?.includes("track_steps") ||
        (error as any).status === 404 ||
        (error as any).statusCode === 404

      if (isTableNotFound) {
        // Silently fail - table will be created when migration is run
        return
      }
      throw error
    }
  }

  // Mark a step as incomplete (uncomplete) for a track
  const uncompleteStep = async (trackId: string, stepId: string): Promise<void> => {
    const { error } = await supabase
      .from('track_steps')
      .delete()
      .eq('track_id', trackId)
      .eq('step_id', stepId)

    if (error) {
      // If table doesn't exist yet, silently fail (migration not run)
      const isTableNotFound =
        error.code === 'PGRST205' ||
        error.code === '42P01' ||
        error.message?.includes("Could not find the table") ||
        error.message?.includes("track_steps") ||
        (error as any).status === 404 ||
        (error as any).statusCode === 404

      if (isTableNotFound) {
        // Silently fail - table will be created when migration is run
        return
      }
      throw error
    }
  }

  return {
    // Track Statuses
    getTrackStatuses,
    getTrackStatus,
    getTrackStatusWithSteps,
    createTrackStatus,
    updateTrackStatus,
    deleteTrackStatus,
    // Steps
    getSteps,
    getStep,
    createStep,
    updateStep,
    deleteStep,
    // Templates
    getTemplates,
    getTemplate,
    getTemplateWithStatuses,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    // Junction operations
    addStatusToTemplate,
    removeStatusFromTemplate,
    addStepToTrackStatus,
    removeStepFromTrackStatus,
    // Track step completion
    getCompletedSteps,
    completeStep,
    uncompleteStep,
  }
}


