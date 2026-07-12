import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Hier fügst du deine kopierten Daten ein:
const supabaseUrl = 'https://wpujwvkralbdtnsbzemy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwdWp3dmtyYWxiZHRuc2J6ZW15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3MDA1MzYsImV4cCI6MjA5OTI3NjUzNn0.ogHqOZjneakUp5O9-ThCdCsw4YLHMDNEktI_XWz_v38';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);