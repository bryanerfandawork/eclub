-- 031: Artikel panduan "Cara menentukan kebutuhan dana mimpi" (dipakai di form Tulis Mimpi).
-- Aman dijalankan berkali-kali.

with a as (
  insert into public.articles (slug, title, excerpt, category, sef_step, access, status, read_min, published_at)
  values ('cara-menentukan-kebutuhan-dana-mimpi', 'Cara Menentukan Kebutuhan Dana Mimpi, Walau Belum Tahu Harga Pastinya', 'Tidak perlu angka yang persis. Dengan harga saat ini dan sedikit hitungan sederhana, mimpi Anda langsung punya angka yang bisa dikejar.', 'Spark', 'spark', 'free', 'published', 4, now())
  on conflict (slug) do nothing returning id
)
insert into public.article_bodies (article_id, body) select id, $body$Kebutuhan dana adalah total uang yang dibutuhkan agar mimpi Anda benar-benar terwujud. Angka ini membuat mimpi berubah dari angan-angan menjadi target: EClub bisa menghitung berapa yang perlu disisihkan per bulan, dan Anda tahu persis apa yang sedang dikejar.

Kabar baiknya, angkanya tidak harus persis. Perkiraan yang masuk akal sudah cukup, dan bisa Anda ubah kapan saja.

## Langkah 1: Cek harga saat ini
Cari harga barang atau layanan yang Anda impikan hari ini.
- Rumah, tanah, kendaraan: lihat iklan properti atau marketplace di kota yang Anda inginkan.
- Barang (laptop, peralatan usaha): lihat 3 toko atau penjual, lalu ambil harga rata-ratanya.
- Perjalanan, umroh, haji: lihat paket dari 2 sampai 3 biro perjalanan.

Contoh: rumah 5 kamar di Jogja. Tiga iklan yang mirip: Rp2,8 miliar, Rp3 miliar, dan Rp3,2 miliar. Rata-ratanya Rp3 miliar.

## Langkah 2: Untuk biaya rutin, kalikan dengan lamanya
Ada mimpi yang biayanya berulang, misalnya pendidikan anak atau liburan tahunan.

Rumusnya: biaya per tahun × jumlah tahun.

Contoh: kuliah Rp20 juta per tahun selama 4 tahun = Rp80 juta.

## Langkah 3: Untuk usaha, hitung modal awal dan biaya jalan
Kebutuhan dana usaha = modal awal + biaya operasional 3 bulan pertama.
- Modal awal: alat, renovasi tempat, stok pertama, izin.
- Biaya jalan: sewa, gaji, bahan, listrik selama 3 bulan, karena usaha baru biasanya belum langsung untung.

## Langkah 4: Tambahkan kenaikan harga
Harga hampir selalu naik. Kalau target Anda lebih dari 2 tahun lagi, tambahkan sekitar 5% per tahun.

Contoh: mobil Rp300 juta hari ini, target 3 tahun lagi. Tambahkan 5% × 3 = 15%, jadi sekitar Rp345 juta.

## Langkah 5: Jangan lupa biaya pendamping
Biaya yang sering terlupa: pajak, balik nama, notaris, asuransi, perabot, ongkos kirim. Tambahkan sekitar 10% untuk berjaga-jaga.

## Bagaimana dengan mimpi yang bukan soal uang?
Mimpi seperti "lebih sabar" atau "hafal Al-Qur'an" tetap punya biaya pendukung: buku, kelas, mentor, atau waktu yang harus dibeli dengan mengurangi jam kerja. Isi perkiraan biaya pendukung itu.

## Sudah punya angkanya?
Tulis angka tersebut di kolom Kebutuhan dana, lalu isi tanggal target. Kalkulator mimpi EClub langsung menunjukkan berapa yang perlu disisihkan setiap bulan.$body$ from a;
