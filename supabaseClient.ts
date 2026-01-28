
import { createClient } from '@supabase/supabase-js';

// Safely retrieve environment variables
const getEnvVar = (key: string) => {
  // Check import.meta.env (Vite standard)
  try {
    const meta = import.meta as any;
    if (meta && meta.env && meta.env[key]) {
      return meta.env[key];
    }
  } catch (e) {
    // Ignore errors
  }
  
  // Check process.env (Node/Webpack/Polyfills)
  try {
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      // @ts-ignore
      return process.env[key];
    }
  } catch (e) {
    // Ignore errors accessing process
  }

  return '';
};

// Replace with your actual Supabase URL and Anon Key
const supabaseUrl = getEnvVar('VITE_SUPABASE_URL') || 'https://qrkzedetlnamvbhaheny.supabase.co';
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFya3plZGV0bG5hbXZiaGFoZW55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1OTIxODIsImV4cCI6MjA4NTE2ODE4Mn0.wdo_3Ee6yDRCCBayjv8qw-FK_VK6tq7gU-MIXyFsjSE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
