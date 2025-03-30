// Inisialisasi Supabase Client
const SUPABASE_URL = "https://iafrlxyoeostvhnoywnv.supabase.co"; // Ganti dengan URL Supabase kamu
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhZnJseHlvZW9zdHZobm95d252Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg1MzMwNjAsImV4cCI6MjA1NDEwOTA2MH0.WEdZeif209ew2iEWsGs9Y10529hDFI9BVdFvz_7Yeno"; // Ganti dengan API Key Supabase kamu

// Inisialisasi Supabase dan simpan ke window
window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
console.log("[DEBUG] Supabase berhasil diinisialisasi di supabase.js:", window.supabase);