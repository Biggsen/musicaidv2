import type { User } from '@supabase/supabase-js'

export interface UserProfile {
  id: string
  name: string
  email: string
  created_at: string
  updated_at: string
}

export const useAuth = () => {
  const supabase = useSupabase()
  const user = useSupabaseUser()
  const router = useRouter()

  // Get current user profile from public.users table
  const getUserProfile = async (): Promise<UserProfile | null> => {
    if (!user.value || !user.value.id) return null

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.value.id)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
      return null
    }

    return data as UserProfile
  }

  // Sign up with email and password
  const signUp = async (email: string, password: string, name: string) => {
    const config = useRuntimeConfig()
    const origin = process.client ? window.location.origin : (config.public.siteUrl || 'http://localhost:3000')
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name
        },
        emailRedirectTo: `${origin}/auth/callback`
      }
    })

    return { data, error }
  }

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      throw error
    }

    return data
  }

  // Sign out
  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      throw error
    }

    await router.push('/login')
  }

  // Check if user is authenticated
  const isAuthenticated = computed(() => !!user.value)

  return {
    user: readonly(user),
    getUserProfile,
    signUp,
    signIn,
    signOut,
    isAuthenticated
  }
}

