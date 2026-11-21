-- EClub tahap 17: beri akses penuh ke service_role (dipakai server untuk cron, notifikasi HP, dan webhook).
-- Diperlukan karena "Grant API access" tidak dicentang saat proyek dibuat, sehingga tabel baru tidak otomatis bisa diakses server.
-- service_role hanya dipakai di server (kuncinya rahasia di Vercel), tidak pernah di browser.
grant usage on schema public to service_role;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant execute on all functions in schema public to service_role;
alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant all on sequences to service_role;
alter default privileges in schema public grant execute on functions to service_role;
