# Email EClub yang profesional (panduan untuk Ridha)

Saat ini email konfirmasi dikirim dari "Supabase Auth <noreply@mail.app.supabase.io>", berbahasa Inggris, dan tampilannya polos. Ada dua masalah lain:

- **Batasnya cuma 2 email per jam** untuk seluruh aplikasi. Kalau 3 orang mendaftar dalam satu jam, orang ketiga tidak menerima email konfirmasi. Ini tidak cukup untuk peluncuran.
- **Template tidak bisa diubah.** Sejak Juni 2026, proyek Supabase gratis yang dibuat setelah 3 Juni 2026 (EClub termasuk) baru bisa mengganti tampilan email setelah memakai pengirim email sendiri (SMTP).

Jadi urutannya: **(A) pasang Resend** (gratis, 3.000 email per bulan, 100 per hari), lalu **(B) tempel template EClub**. Setelah itu, email datang dari **"EClub <noreply@eclub.co.id>"** dengan tampilan merah marun dan berbahasa Indonesia.

Waktu: sekitar 20 menit, ditambah waktu tunggu DNS (biasanya 5 sampai 30 menit).

---

## A. Pasang Resend (pengirim email dari domain eclub.co.id)

### A1. Buat akun dan tambahkan domain
1. Buka **https://resend.com**, klik **Get Started**. Daftar memakai email bisnis EClub.
2. Di menu kiri, klik **Domains**, lalu klik **Add Domain**.
3. Isi **eclub.co.id**. Di bagian Region, pilih **Tokyo (ap-northeast-1)** karena paling dekat dengan Indonesia. Klik **Add**.
4. Resend akan menampilkan 3 atau 4 baris "DNS Records". Biarkan tab ini terbuka.

### A2. Tambahkan record DNS di cPanel
Record ini hanya menambah subdomain `send` dan `resend._domainkey`. **Email lama di mail.eclub.co.id tidak terganggu.** Jangan ubah atau hapus record MX yang sudah ada.

1. Buka cPanel Rumahweb, lalu **Zone Editor**. Di baris eclub.co.id, klik **Manage**.
2. Untuk **setiap** baris di Resend, klik **Add Record** dan salin isinya persis:
   - **Type**: samakan (TXT atau MX).
   - **Name**: salin dari kolom "Name" di Resend, lalu tambahkan `.eclub.co.id.` di belakangnya. Contoh: `resend._domainkey` menjadi `resend._domainkey.eclub.co.id.`, dan `send` menjadi `send.eclub.co.id.`
   - **Record / Value**: salin persis dari kolom "Content/Value" (pakai tombol salin di Resend).
   - Untuk record **MX**: Priority `10`, Destination diisi dari Resend (contohnya `feedback-smtp.ap-northeast-1.amazonses.com`).
3. Klik **Save** untuk setiap record.
4. Kembali ke Resend, lalu klik **Verify DNS Records**. Kalau masih "Pending", tunggu 10 sampai 30 menit lalu klik lagi sampai semuanya **Verified** (hijau).

### A3. Buat API key
1. Di Resend, buka menu **API Keys**, lalu klik **Create API Key**.
2. Name: `supabase`. Permission: **Sending access**. Domain: **eclub.co.id**. Klik **Add**.
3. **Salin key-nya** (diawali `re_`). Key ini hanya ditampilkan sekali. **Jangan kirim key ini di chat.** Langsung tempel ke Supabase pada langkah berikutnya.

### A4. Sambungkan ke Supabase
1. Buka Supabase, lalu buka proyek EClub. Klik **Authentication**, pilih **Emails**, lalu tab **SMTP Settings**.
2. Nyalakan **Enable Custom SMTP**, lalu isi:
   - Sender email: `noreply@eclub.co.id`
   - Sender name: `EClub`
   - Host: `smtp.resend.com`
   - Port: `465`
   - Username: `resend`
   - Password: tempel API key dari langkah A3
3. Klik **Save changes**.
4. Buka **Authentication**, lalu **Rate Limits**. Ubah **Rate limit for sending emails** menjadi `100` per jam, lalu **Save**.

---

## B. Tempel template email EClub

1. Di Supabase, buka **Authentication**, pilih **Emails**, lalu tab **Templates**.
2. Untuk setiap template di tabel di bawah:
   - Klik nama templatenya.
   - Ganti **Subject** dengan teks di kolom Subject.
   - Buka link file di kolom ketiga, klik ikon **Copy raw file** (dua kotak, kanan atas). Di Supabase, hapus semua isi **Body** lalu tempel (Ctrl+V).
   - Klik **Save**.

| Template di Supabase | Subject | File |
|---|---|---|
| Confirm signup | `Satu langkah lagi untuk mulai bersama EClub` | [confirm-signup.html](https://github.com/bryanerfandawork/eclub/blob/main/supabase/email-templates/confirm-signup.html) |
| Invite user | `Anda diundang bergabung di EClub` | [invite.html](https://github.com/bryanerfandawork/eclub/blob/main/supabase/email-templates/invite.html) |
| Magic link | `Tautan masuk ke EClub` | [magic-link.html](https://github.com/bryanerfandawork/eclub/blob/main/supabase/email-templates/magic-link.html) |
| Change email address | `Konfirmasi perubahan email EClub` | [change-email.html](https://github.com/bryanerfandawork/eclub/blob/main/supabase/email-templates/change-email.html) |
| Reset password | `Atur ulang kata sandi EClub Anda` | [reset-password.html](https://github.com/bryanerfandawork/eclub/blob/main/supabase/email-templates/reset-password.html) |

## C. Satu pengecekan terakhir
Buka **Authentication**, lalu **URL Configuration**. Pastikan di **Redirect URLs** ada `https://www.eclub.co.id/**`. Kalau belum ada, klik **Add URL** dan tambahkan. Ini dibutuhkan untuk fitur baru **Lupa kata sandi**.

Setelah selesai, coba daftar dengan email lain. Email konfirmasinya akan tampil dengan desain EClub.
