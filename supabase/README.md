# Supabase Setup Instructions

## Prerequisites

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from the project settings

## Environment Variables

Create a `.env` file in the root directory with:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
DATABASE_URL=your_supabase_database_url
```

## Running Migrations

### Option 1: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `supabase/migrations/001_initial_schema.sql`
4. Paste and run the SQL in the SQL Editor

### Option 2: Using Supabase CLI

If you have Supabase CLI installed:

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

## Verification

After running the migrations, verify:

1. Tables are created: `users`, `artists`, `tracks`, `user_artists`
2. RLS policies are enabled on all tables
3. Triggers are created for `updated_at` timestamps
4. The `handle_new_user()` function is created

## Next Steps

1. Test authentication by registering a new user
2. Verify the user profile is automatically created in `public.users`
3. Test creating an artist and track through the application




