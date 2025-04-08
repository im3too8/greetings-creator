// src/lib/supabaseClient.ts

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hxdmyqdcqyvwlajholak.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4ZG15cWRjcXl2d2xhamhvbGFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwOTM4NTksImV4cCI6MjA1OTY2OTg1OX0.kjQNaAkWCAcYVyg7tK8ZZGAoS0DqoBNy8agjthfw6fU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
