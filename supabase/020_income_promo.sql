-- 020: Peta Income (active -> massive -> passive) + 5 artikel gratis "Bingung?" + hitungan kuota promo.
-- Aman dijalankan ulang.

-- 1. Peta Income per pengguna
create table if not exists public.income_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade default auth.uid(),
  interests text[] not null default '{}',
  hobbies text[] not null default '{}',
  talents text[] not null default '{}',
  passions text[] not null default '{}',
  sources jsonb not null default '[]',
  expenses jsonb not null default '[]',
  plans jsonb not null default '[]',
  updated_at timestamptz not null default now()
);
-- Langkah 2 (kesibukan saat ini) & langkah 3 (Personal SWOT, Peta Aset).
alter table public.income_profiles add column if not exists situation jsonb not null default '{}';
alter table public.income_profiles add column if not exists swot jsonb not null default '{}';
alter table public.income_profiles add column if not exists assets jsonb not null default '{}';
alter table public.income_profiles enable row level security;
drop policy if exists income_own on public.income_profiles;
create policy income_own on public.income_profiles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
grant select, insert, update, delete on public.income_profiles to authenticated;
grant all on public.income_profiles to service_role;

insert into public.plan_features (key, label, description, free_limit, plus_limit, unit, enforced, sort)
values ('income_reco', 'Rekomendasi Peta Income', 'Ide active, massive, dan passive income yang dipersonalisasi dari DISC, minat, dan mimpi', 0, null, null, true, 37)
on conflict (key) do nothing;

-- Nama tes kepribadian di tampilan: "Tes Gaya Diri" (kunci internal tetap disc).
update public.plan_features set label = 'Laporan lengkap Gaya Diri', description = 'Interpretasi mendalam, rekomendasi karier & bisnis' where key = 'disc_report' and label ilike '%DISC%';
update public.plan_features set description = 'Ide active, massive, dan passive income yang dipersonalisasi dari Gaya Diri, minat, dan mimpi' where key = 'income_reco';

-- 2. Hitungan pembeli Plus asli sejak tanggal promo dimulai (untuk "sisa kuota" yang jujur).
create or replace function public.promo_paid_count(since timestamptz)
returns integer language sql stable security definer set search_path = '' as $$
  select count(*)::integer from public.orders
  where status = 'paid' and product in ('plus_monthly', 'plus_yearly') and coalesce(paid_at, created_at) >= since;
$$;
revoke execute on function public.promo_paid_count from public;
grant execute on function public.promo_paid_count to anon, authenticated, service_role;

-- 3. Artikel gratis untuk tombol "Bingung?"
with a as (
  insert into public.articles (slug, title, excerpt, category, sef_step, access, status, read_min, published_at)
  values ('menemukan-minat-bakat-passion', 'Minat, Hobi, Bakat, dan Passion: Apa Bedanya dan Cara Menemukannya', 'Empat kata ini sering dianggap sama. Padahal kalau dipahami bedanya, Anda lebih mudah menemukan jalan penghasilan yang pas.', 'Personal Mapping', 'personal_mapping', 'free', 'published', 5, now())
  on conflict (slug) do nothing returning id
)
insert into public.article_bodies (article_id, body) select id, $body$Banyak orang bingung saat ditanya, "Passion kamu apa?" Jawabannya sering "belum tahu" atau "semua suka". Itu wajar. Kuncinya adalah memisahkan empat hal yang sering tercampur: minat, hobi, bakat, dan passion.

## Minat: topik yang membuat Anda betah
Minat adalah topik yang membuat Anda penasaran. Anda betah membaca, menonton, atau mengobrol tentangnya walau tidak ada yang menyuruh. Contoh: bisnis, teknologi, kuliner, kesehatan.

Pertanyaan pemandu: video atau konten apa yang paling sering Anda tonton sampai habis?

## Hobi: kegiatan yang Anda lakukan saat waktu luang
Hobi adalah kegiatan, bukan topik. Minat Anda mungkin kuliner, hobinya memasak. Minat Anda teknologi, hobinya main game atau merakit komputer.

Pertanyaan pemandu: kalau libur seharian tanpa kewajiban, apa yang Anda kerjakan?

## Bakat: hal yang terasa mudah bagi Anda, tapi sulit bagi orang lain
Bakat sering tidak disadari karena terasa biasa saja. Petunjuk terbaiknya datang dari orang lain.
- Hal apa yang sering orang minta bantuan Anda?
- Pujian apa yang paling sering Anda dengar?
- Pekerjaan apa yang Anda selesaikan lebih cepat dari teman-teman?

## Passion: hal yang membuat Anda merasa hidup dan bermakna
Passion lebih dalam dari sekadar suka. Ia berhubungan dengan nilai dan makna. Contoh: membantu orang berkembang, keluarga yang aman, kebebasan waktu, dampak sosial.

Pertanyaan pemandu: kapan terakhir kali Anda merasa lelah tapi bahagia? Apa yang sedang Anda kerjakan?

## Mengapa keempatnya penting untuk penghasilan
Penghasilan yang bertahan lama biasanya berada di titik temu: ada bakatnya (Anda mampu), ada minat atau hobinya (Anda betah), ada passion-nya (Anda punya alasan kuat), dan ada orang yang mau membayar.

Tidak perlu sempurna sejak awal. Pilih saja yang paling terasa sekarang. Peta Income EClub akan mencocokkannya dengan gaya DISC Anda dan memberi gambaran ide penghasilan yang nyambung.

## Latihan 5 menit
- Tulis 3 topik yang paling sering Anda konsumsi minggu ini (minat).
- Tulis 3 kegiatan favorit saat libur (hobi).
- Tanyakan ke 3 orang terdekat: "Menurutmu aku jago di bidang apa?" (bakat).
- Tulis 1 hal yang ingin Anda perjuangkan 10 tahun lagi (passion).$body$ from a;

with a as (
  insert into public.articles (slug, title, excerpt, category, sef_step, access, status, read_min, published_at)
  values ('active-massive-passive-income', 'Active, Massive, dan Passive Income: Tiga Tahap Penghasilan untuk Semua Orang', 'Pelajar, karyawan, freelancer, atau pemilik usaha, semuanya bisa menempuh tiga tahap penghasilan ini. Begini bedanya dan hubungannya dengan SEF.', 'Keuangan', 'personal_mapping', 'free', 'published', 6, now())
  on conflict (slug) do nothing returning id
)
insert into public.article_bodies (article_id, body) select id, $body$Kebebasan finansial tidak datang dari satu lompatan besar. Ia dibangun bertahap, dari penghasilan yang bergantung pada tenaga Anda, menjadi penghasilan yang bisa dilipatgandakan, lalu penghasilan yang bekerja untuk Anda.

## 1. Active income: Survive dan Sustain
Active income adalah uang yang Anda dapat dari waktu dan tenaga sendiri. Kalau Anda berhenti bekerja, uangnya ikut berhenti.
- Gaji karyawan, honor, upah harian
- Uang saku (untuk pelajar dan mahasiswa)
- Jasa freelance yang Anda kerjakan sendiri
- Jualan yang semuanya masih Anda tangani sendiri

Di peta SEF, ini tahap Survive (bertahan) dan Sustain (stabil). Fokusnya: penghasilan rutin, pengeluaran terkendali, dan mulai ada sisa.

## 2. Massive income: Sustain dan Scale Up
Massive income adalah sumber penghasilan yang bisa tumbuh lebih besar dari jam kerja Anda. Caranya dengan sistem, tim, produk, atau jangkauan yang luas.
- Side hustle di luar pekerjaan utama
- Usaha yang mulai punya tim atau mitra
- Kelas online yang mengajar banyak orang sekaligus
- Produk digital yang dibuat sekali dan dijual berkali-kali

Di peta SEF, ini tahap Sustain menuju Scale Up. Banyak orang berhenti di active income karena merasa tidak punya waktu. Padahal massive income bisa dimulai kecil: 1 jam sehari, satu produk, satu klien.

## 3. Passive income: Spread Up
Passive income adalah uang yang tetap mengalir walau Anda tidak bekerja aktif setiap hari.
- Investasi: reksa dana, obligasi negara, saham dividen
- Sewa aset: kos-kosan, kontrakan, kendaraan, alat
- Royalti dari buku atau kursus rekaman
- Bagi hasil dari usaha yang dijalankan orang lain

Di peta SEF, ini tahap Spread Up: hasil Anda menyebar, menolong lebih banyak orang, dan bisa diwariskan. Catatan penting: hampir tidak ada yang benar-benar pasif sejak awal. Biasanya butuh modal yang dikumpulkan dari dua tahap sebelumnya.

## Urutan itu penting
Melompat langsung ke passive income tanpa active income yang sehat sering berakhir dengan rugi, utang, atau tertipu investasi bodong. Urutan yang aman:
- Kuatkan active income sampai ada sisa setiap bulan.
- Siapkan dana darurat 3 sampai 6 kali pengeluaran bulanan.
- Mulai satu massive income kecil, lalu kembangkan.
- Gunakan uang dingin dari massive income untuk belajar dan memulai passive income.

## Cara mengisinya di Peta Income
Saat mencatat sumber penghasilan, tanyakan satu hal: "Kalau saya berhenti mengerjakannya sebulan, apakah uangnya tetap masuk?" Kalau berhenti, itu active. Kalau tetap tumbuh karena sistem atau tim, itu massive. Kalau tetap masuk tanpa Anda bekerja, itu passive.$body$ from a;

with a as (
  insert into public.articles (slug, title, excerpt, category, sef_step, access, status, read_min, published_at)
  values ('mencatat-pengeluaran-bulanan', 'Cara Menghitung Pengeluaran Bulanan dengan Mudah (Walau Belum Pernah Mencatat)', 'Tidak tahu uang lari ke mana? Ini cara cepat menaksir pengeluaran bulanan dalam 10 menit, lalu merapikannya pelan-pelan.', 'Keuangan', 'acquisition', 'free', 'published', 5, now())
  on conflict (slug) do nothing returning id
)
insert into public.article_bodies (article_id, body) select id, $body$Banyak orang menunda mencatat pengeluaran karena merasa harus rapi dan lengkap. Padahal untuk memulai, taksiran yang jujur jauh lebih berguna daripada catatan sempurna yang tidak pernah dibuat.

## Langkah 1: pisahkan pengeluaran tetap dan tidak tetap
Pengeluaran tetap jumlahnya hampir sama setiap bulan: sewa atau cicilan, listrik, internet, uang sekolah. Lihat saja tagihan atau mutasi rekening bulan lalu.

Pengeluaran tidak tetap berubah-ubah: makan, bensin, jajan, hiburan. Untuk ini, gunakan cara taksiran harian.

## Langkah 2: taksir dari kebiasaan harian
Contoh: makan siang dan kopi sekitar Rp35.000 sehari. Dikali 30 hari, menjadi Rp1.050.000 sebulan. Bensin Rp20.000 per dua hari, menjadi sekitar Rp300.000 sebulan.

Angka kecil yang rutin sering menjadi kejutan terbesar. Itulah aha moment pertama banyak orang.

## Langkah 3: jangan lupa yang tahunan
Biaya seperti pajak kendaraan, servis, atau biaya sekolah tahunan bagi 12, lalu masukkan sebagai pengeluaran bulanan. Dengan begitu bulan tertentu tidak terasa berat sekali.

## Langkah 4: beri ruang untuk sedekah dan hiburan
Pengeluaran yang terlalu ketat biasanya tidak bertahan. Masukkan sedekah, zakat, dan hiburan secara sadar. Yang penting tercatat dan terkendali.

## Langkah 5: cocokkan dengan kenyataan
Setelah satu bulan, bandingkan taksiran dengan catatan nyata di menu Keuangan EClub. Peta Income akan menampilkan petunjuk dari catatan 30 hari terakhir Anda, jadi angkanya makin akurat dari bulan ke bulan.

## Rumus sederhana yang perlu diingat
- Sisa uang = penghasilan dikurangi pengeluaran.
- Dana darurat ideal = 3 sampai 6 kali pengeluaran bulanan.
- Kalau sisa uang masih nol atau minus, fokus pertama adalah menata pengeluaran dan menaikkan active income, bukan investasi.$body$ from a;

with a as (
  insert into public.articles (slug, title, excerpt, category, sef_step, access, status, read_min, published_at)
  values ('memulai-massive-income-side-hustle', 'Memulai Massive Income dari Nol: Panduan Side Hustle 30 Hari', 'Tidak perlu resign atau modal besar. Begini cara memilih dan menguji satu sumber penghasilan tambahan dalam 30 hari.', 'Bisnis', 'acquisition', 'free', 'published', 6, now())
  on conflict (slug) do nothing returning id
)
insert into public.article_bodies (article_id, body) select id, $body$Massive income adalah sumber penghasilan yang bisa tumbuh lebih besar dari jam kerja Anda. Kabar baiknya, ia hampir selalu dimulai kecil: satu produk, satu jasa, satu klien.

## Langkah 1: pilih dari titik temu diri Anda
Lihat lagi minat, hobi, bakat, dan passion Anda. Ide terbaik biasanya ada di persilangannya. Contoh:
- Suka memasak dan teliti: makanan beku dengan resep yang konsisten.
- Pandai menjelaskan dan suka media sosial: kelas online kecil.
- Rapi dengan angka: jasa pembukuan untuk UMKM sekitar.
- Kreatif dan suka desain: template atau desain feed untuk toko online.

Peta Income membantu mencocokkan pilihan Anda dengan gaya DISC, jadi ide yang muncul lebih nyambung dengan cara kerja alami Anda.

## Langkah 2: tentukan target yang kecil dan jelas
Bukan "ingin penghasilan tambahan", tetapi "Rp1.000.000 per bulan dari 10 pesanan katering". Target kecil yang jelas lebih mudah dikejar dan diukur.

## Langkah 3: uji dalam 30 hari
- Minggu 1: tawarkan ke 20 orang terdekat. Catat siapa yang tertarik dan berapa yang mau membayar.
- Minggu 2: perbaiki penawaran dari masukan. Tetapkan harga dengan menghitung HPP.
- Minggu 3: minta testimoni jujur dari pembeli pertama, lalu tawarkan ke lingkaran yang lebih luas.
- Minggu 4: evaluasi. Lanjutkan, ubah, atau ganti ide.

## Langkah 4: ubah dari mengerjakan menjadi membangun sistem
Supaya menjadi massive income, bukan sekadar tambahan kerja, pikirkan sejak awal:
- Bagian mana yang bisa dibuat standar (resep, template, SOP)?
- Bagian mana yang bisa dibantu orang lain atau alat?
- Apakah produknya bisa dijual berkali-kali tanpa kerja ulang?

## Kesalahan yang sering terjadi
- Langsung belanja alat dan stok besar sebelum ada pembeli.
- Menunggu sempurna, sehingga tidak pernah mulai.
- Mencampur uang usaha dengan uang pribadi. Gunakan dua dompet di menu Keuangan EClub.

Kalau masih bingung memilih, sesi mentoring 1-on-1 bisa membantu menyaring ide yang paling cocok dengan kondisi Anda.$body$ from a;

with a as (
  insert into public.articles (slug, title, excerpt, category, sef_step, access, status, read_min, published_at)
  values ('berapa-harus-menabung-untuk-mimpi', 'Berapa yang Harus Ditabung untuk Mimpi Anda? Begini Cara Menghitungnya', 'Mimpi terasa jauh karena belum ada angkanya. Hitung kebutuhan per bulan, lihat selisihnya, dan temukan jalan untuk menutupnya.', 'Spark', 'spark', 'free', 'published', 4, now())
  on conflict (slug) do nothing returning id
)
insert into public.article_bodies (article_id, body) select id, $body$Mimpi yang punya angka dan tanggal jauh lebih mudah dicapai daripada mimpi yang hanya diangankan. Rumusnya sederhana, dan aha moment-nya sering muncul saat Anda melihat selisihnya.

## Rumus dasar
Tabungan per bulan = (target dana dikurangi yang sudah terkumpul) dibagi jumlah bulan sampai tanggal target.

Contoh: umroh berdua Rp60.000.000, sudah terkumpul Rp6.000.000, target 36 bulan lagi. Maka (60 juta dikurangi 6 juta) dibagi 36 sama dengan Rp1.500.000 per bulan.

## Bandingkan dengan sisa uang Anda
Sisa uang adalah penghasilan dikurangi pengeluaran bulanan. Kalau sisa uang Anda Rp1.000.000 sementara kebutuhan mimpi Rp1.500.000, ada selisih Rp500.000 per bulan.

Selisih ini bukan alasan untuk menyerah. Ia adalah petunjuk.

## Tiga cara menutup selisih
- Kurangi pengeluaran yang tidak penting. Seringnya ada Rp200.000 sampai Rp500.000 yang bocor di jajan dan langganan yang jarang dipakai.
- Tambah penghasilan lewat massive income. Satu sumber tambahan kecil bisa menutup selisih lebih cepat dari yang dibayangkan.
- Geser tanggal target dengan sadar. Lebih baik sedikit lebih lama tapi tercapai, daripada menyerah di tengah jalan.

## Urutan prioritas yang sehat
- Dana darurat dulu (3 sampai 6 kali pengeluaran bulanan).
- Lalu mimpi yang paling penting, satu per satu atau dibagi porsinya.
- Jangan gunakan uang mimpi jangka pendek (di bawah 3 tahun) untuk investasi berisiko tinggi.

## Biarkan EClub menghitungkan
Isi target dana dan tanggal di My Dreams, lalu isi penghasilan dan pengeluaran di Peta Income. EClub akan menunjukkan kebutuhan per bulan, selisihnya, berapa lama mimpi tercapai dengan kondisi sekarang, dan seberapa cepat jika rencana massive income Anda berjalan.$body$ from a;
