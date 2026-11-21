-- EClub 011: Pembayaran manual. Tempat penyimpanan gambar (mis. QRIS) yang bisa diunggah admin.
insert into storage.buckets (id, name, public) values ('assets', 'assets', true)
on conflict (id) do update set public = true;

drop policy if exists "aset dibaca publik" on storage.objects;
create policy "aset dibaca publik" on storage.objects for select using (bucket_id = 'assets');
drop policy if exists "admin unggah aset" on storage.objects;
create policy "admin unggah aset" on storage.objects for insert to authenticated with check (bucket_id = 'assets' and public.is_staff());
drop policy if exists "admin ubah aset" on storage.objects;
create policy "admin ubah aset" on storage.objects for update to authenticated using (bucket_id = 'assets' and public.is_staff());
drop policy if exists "admin hapus aset" on storage.objects;
create policy "admin hapus aset" on storage.objects for delete to authenticated using (bucket_id = 'assets' and public.is_staff());

insert into public.app_settings (key, value) values ('payment_mode', '"manual"'), ('order_expiry_hours', '48')
on conflict (key) do update set value = excluded.value;
