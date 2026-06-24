import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://xukifacfpvtwzgeutvyt.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1a2lmYWNmcHZ0d3pnZXV0dnl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0MDA1MzgsImV4cCI6MjA5Njk3NjUzOH0.kvCVFIBiaWsO2zEH4B5uaZw4-RB_gz6dsWKAzDtkVnM'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
