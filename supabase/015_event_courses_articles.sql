-- EClub tahap 15: event Gathering Member Yogyakarta + kerangka kelas per tahap SEF.
-- Aman dijalankan ulang: course yang slug-nya sudah ada tidak diubah, event tidak dobel.

-- 1. Event
insert into public.events (title, description, speaker, starts_at, duration_min, price, plus_price, published, regency, location)
select 'Gathering Member EClub Indonesia',
  'Kumpul bareng member EClub se-Yogyakarta: berbagi cerita perjalanan, sesi menyalakan spark, dan berjejaring dengan sesama pejuang usaha.',
  'Tim EClub', '2026-12-01 13:00:00+07', 180, 50000, 50000, true, '34.71', 'Gade Space Lempuyangan, Yogyakarta'
where not exists (select 1 from public.events where title = 'Gathering Member EClub Indonesia' and starts_at::date = date '2026-12-01');

-- 2. Kelas

do $$
declare cid uuid;
begin
  insert into public.courses (slug, title, summary, description, category, level, instructor, access, include_in_plus, price, status, sort, sef_step)
  values ('spark-menyalakan-kembali', 'Spark: Menyalakan Kembali Gairah Bertumbuh', 'Temukan kembali alasan Anda berjuang sebelum bicara strategi bisnis.', 'Kelas pembuka EClub. Banyak usaha jalan di tempat bukan karena modal, tetapi karena pemiliknya kehilangan alasan untuk bertumbuh. Di kelas ini Anda merumuskan ulang mimpi, makna, dan kebiasaan yang menjaga semangat tetap menyala. Versi awal: materi bacaan, video menyusul.', 'SEF', 'Pemula', 'Tim EClub', 'registered', true, 0, 'published', 1, null)
  on conflict (slug) do nothing returning id into cid;
  if cid is null then return; end if;

  insert into public.lessons (course_id, title, summary, content, duration_min, access, sort) values
    (cid, 'Kenapa spark bisa padam', 'Mengenali tanda-tanda kehilangan gairah dan penyebabnya.', 'TUJUAN
Mengenali tanda-tanda kehilangan gairah dan penyebabnya.

POKOK MATERI
• Tanda spark padam: menunda, sibuk tapi tanpa arah, mudah menyerah
• Penyebab umum: rutinitas, kegagalan berulang, tujuan yang kabur
• Spark bukan perasaan, tetapi energi yang bisa dirawat

LATIHAN
Tulis 3 momen dalam 12 bulan terakhir ketika Anda merasa paling bersemangat dan paling lelah. Apa bedanya?

RUJUKAN
• Viktor E. Frankl, Man''s Search for Meaning (1946)
• Angela Duckworth, Grit: The Power of Passion and Perseverance (2016)', 8, null, 1),
    (cid, 'Menemukan ''mengapa'' Anda', 'Merumuskan alasan pribadi yang membuat Anda mau bangun dan berjuang.', 'TUJUAN
Merumuskan alasan pribadi yang membuat Anda mau bangun dan berjuang.

POKOK MATERI
• Konsep Golden Circle: why, how, what
• Membedakan alasan dari luar (gengsi, tuntutan) dan dari dalam (makna, nilai)
• Menulis kalimat ''mengapa'' satu baris

LATIHAN
Lengkapi kalimat: ''Saya berjuang agar ...'' lalu simpan di menu My Life.

RUJUKAN
• Simon Sinek, Start With Why (2009)
• Simon Sinek dkk., Find Your Why (2017)', 10, null, 2),
    (cid, 'Mimpi yang dihitung, bukan sekadar diangankan', 'Mengubah mimpi menjadi angka, tenggat, dan target harian.', 'TUJUAN
Mengubah mimpi menjadi angka, tenggat, dan target harian.

POKOK MATERI
• Mimpi yang jelas: apa, berapa biayanya, kapan
• Memecah mimpi menjadi tabungan per hari
• Menghubungkan target harian dengan produk yang dijual

LATIHAN
Masukkan satu mimpi Anda di Dream Planner, lalu buka Target Harian untuk melihat berapa produk yang harus terjual per hari.

RUJUKAN
• Edwin A. Locke & Gary P. Latham, teori penetapan tujuan (Goal-Setting Theory, 1990)
• George T. Doran, kerangka S.M.A.R.T. (Management Review, 1981)', 10, null, 3),
    (cid, 'Pola pikir bertumbuh', 'Melihat kegagalan sebagai bahan belajar, bukan bukti tidak mampu.', 'TUJUAN
Melihat kegagalan sebagai bahan belajar, bukan bukti tidak mampu.

POKOK MATERI
• Fixed mindset vs growth mindset
• Bahasa diri yang menguatkan
• Belajar dari kegagalan tanpa menyalahkan diri

LATIHAN
Ambil satu kegagalan usaha Anda. Tuliskan 3 pelajaran yang bisa dipakai bulan ini.

RUJUKAN
• Carol S. Dweck, Mindset: The New Psychology of Success (2006)', 9, null, 4),
    (cid, 'Kebiasaan kecil yang menjaga api tetap menyala', 'Membangun sistem kebiasaan harian agar semangat tidak bergantung pada mood.', 'TUJUAN
Membangun sistem kebiasaan harian agar semangat tidak bergantung pada mood.

POKOK MATERI
• Kebiasaan kecil 1% setiap hari
• Membuat kebiasaan mudah, terlihat, dan memuaskan
• Melacak rangkaian (streak) dan bersyukur

LATIHAN
Buat 2 kebiasaan di menu Kebiasaan dan isi Jurnal Syukur selama 7 hari berturut-turut.

RUJUKAN
• James Clear, Atomic Habits (2018)
• Robert A. Emmons, Thanks! How the New Science of Gratitude Can Make You Happier (2007)', 9, null, 5);
end $$;

do $$
declare cid uuid;
begin
  insert into public.courses (slug, title, summary, description, category, level, instructor, access, include_in_plus, price, status, sort, sef_step)
  values ('personal-mapping-kenali-diri', 'Personal Mapping: Kenali Diri, Pilih Kendaraan', 'Petakan kepribadian, kompetensi, dan sumber daya Anda sebelum memilih jalan usaha.', 'Langkah pertama fase Survive. Anda memetakan siapa diri Anda, apa yang sudah Anda miliki, dan kendaraan apa yang paling cocok: karier, freelance, bisnis, atau gabungannya. Versi awal: materi bacaan, video menyusul.', 'SEF', 'Pemula', 'Tim EClub', 'registered', true, 0, 'published', 10, 'personal_mapping')
  on conflict (slug) do nothing returning id into cid;
  if cid is null then return; end if;

  insert into public.lessons (course_id, title, summary, content, duration_min, access, sort) values
    (cid, 'Entrepreneurnya dulu, bisnis hanya kendaraan', 'Memahami filosofi EClub dan mengapa pemetaan diri didahulukan.', 'TUJUAN
Memahami filosofi EClub dan mengapa pemetaan diri didahulukan.

POKOK MATERI
• Pengusaha sukses dibentuk oleh karakter dan kompetensi, bukan ide semata
• Empat kendaraan: karier, freelance, bisnis, investasi
• Peta SEF: Survive, Sustain, Scale Up, Spread Up

LATIHAN
Tuliskan kendaraan yang sedang Anda pakai sekarang dan yang ingin Anda tuju 3 tahun lagi.

RUJUKAN
• Michael E. Gerber, The E-Myth Revisited (1995)
• Robert T. Kiyosaki, Cashflow Quadrant (1998)', 8, null, 1),
    (cid, 'Membaca hasil DISC Anda', 'Memakai profil DISC untuk memahami gaya kerja, komunikasi, dan jebakan diri.', 'TUJUAN
Memakai profil DISC untuk memahami gaya kerja, komunikasi, dan jebakan diri.

POKOK MATERI
• Empat gaya: Dominance, Influence, Steadiness, Compliance
• Kekuatan dan titik buta tiap gaya
• Memilih peran dan partner yang melengkapi

LATIHAN
Ikuti Tes DISC di aplikasi, lalu tulis satu kebiasaan kerja yang perlu Anda ubah berdasarkan hasilnya.

RUJUKAN
• William Moulton Marston, Emotions of Normal People (1928)
• Dokumentasi model DISC dari berbagai penerbit asesmen (misalnya Everything DiSC)', 10, null, 2),
    (cid, '8 kompetensi entrepreneur', 'Mengenali kompetensi yang sudah kuat dan yang perlu dilatih.', 'TUJUAN
Mengenali kompetensi yang sudah kuat dan yang perlu dilatih.

POKOK MATERI
• Membaca diagram jaring 8 Wheel
• Kompetensi kewirausahaan menurut riset (misalnya EntreComp Uni Eropa)
• Memilih 1 kompetensi prioritas untuk 90 hari

LATIHAN
Ikuti tes 8 Wheel Entrepreneur dan tetapkan satu kompetensi yang akan Anda latih bulan ini.

RUJUKAN
• Bacigalupo dkk., EntreComp: The Entrepreneurship Competence Framework, Komisi Eropa (2016)
• David C. McClelland, The Achieving Society (1961)', 10, null, 3),
    (cid, 'Mulai dari yang Anda punya', 'Memakai prinsip effectuation: mulai dari siapa Anda, apa yang Anda tahu, dan siapa yang Anda kenal.', 'TUJUAN
Memakai prinsip effectuation: mulai dari siapa Anda, apa yang Anda tahu, dan siapa yang Anda kenal.

POKOK MATERI
• Prinsip bird-in-hand: inventaris sumber daya
• Affordable loss: berapa risiko yang sanggup ditanggung
• Kemitraan sejak awal

LATIHAN
Buat tiga daftar: keahlian Anda, pengetahuan Anda, dan 20 orang di jaringan Anda yang bisa membantu.

RUJUKAN
• Saras D. Sarasvathy, Effectuation: Elements of Entrepreneurial Expertise (2008)
• Stuart Read dkk., Effectual Entrepreneurship (2011)', 10, null, 4),
    (cid, 'Model bisnis pribadi', 'Menyusun gambaran satu halaman tentang nilai yang Anda tawarkan.', 'TUJUAN
Menyusun gambaran satu halaman tentang nilai yang Anda tawarkan.

POKOK MATERI
• Kanvas model bisnis untuk diri sendiri
• Siapa yang Anda bantu dan bagaimana
• Sumber pendapatan dari keahlian Anda

LATIHAN
Isi kanvas model bisnis pribadi Anda dalam satu halaman.

RUJUKAN
• Tim Clark, Alexander Osterwalder & Yves Pigneur, Business Model You (2012)', 10, null, 5),
    (cid, 'Visi, nilai, dan rencana 90 hari', 'Menyatukan hasil pemetaan menjadi rencana tindakan.', 'TUJUAN
Menyatukan hasil pemetaan menjadi rencana tindakan.

POKOK MATERI
• Visi 10 tahun dan definisi sukses pribadi
• Nilai yang tidak bisa ditawar
• Rencana 90 hari: 3 target, aksi mingguan

LATIHAN
Lengkapi menu My Life lalu buat 3 aksi pertama di Daily Action.

RUJUKAN
• Stephen R. Covey, The 7 Habits of Highly Effective People (1989)
• Brian P. Moran & Michael Lennington, The 12 Week Year (2013)', 9, null, 6);
end $$;

do $$
declare cid uuid;
begin
  insert into public.courses (slug, title, summary, description, category, level, instructor, access, include_in_plus, price, status, sort, sef_step)
  values ('acquisition-produk-dan-harga', 'Acquisition 1: Produk, HPP, dan Harga yang Menguntungkan', 'Pastikan setiap produk yang Anda jual benar-benar menghasilkan untung.', 'Langkah kedua fase Survive, bagian pertama. Anda menghitung HPP dengan benar, menetapkan harga jual, dan tahu untung per produk sebelum mengejar penjualan. Versi awal: materi bacaan, video menyusul.', 'SEF', 'Pemula', 'Tim EClub', 'registered', true, 0, 'published', 20, 'acquisition')
  on conflict (slug) do nothing returning id into cid;
  if cid is null then return; end if;

  insert into public.lessons (course_id, title, summary, content, duration_min, access, sort) values
    (cid, 'Masalah pelanggan dulu, produk kemudian', 'Memastikan produk menjawab masalah yang nyata.', 'TUJUAN
Memastikan produk menjawab masalah yang nyata.

POKOK MATERI
• Peta nilai: tugas, kesulitan, dan harapan pelanggan
• Mencocokkan produk dengan masalah
• Menguji kecocokan sebelum produksi besar

LATIHAN
Wawancarai 5 calon pelanggan. Tanyakan pengalaman mereka, bukan pendapat tentang produk Anda.

RUJUKAN
• Alexander Osterwalder dkk., Value Proposition Design (2014)
• Rob Fitzpatrick, The Mom Test (2013)', 9, null, 1),
    (cid, 'Menghitung HPP dengan benar', 'Menghitung harga pokok produksi per unit tanpa ada biaya yang terlewat.', 'TUJUAN
Menghitung harga pokok produksi per unit tanpa ada biaya yang terlewat.

POKOK MATERI
• Biaya bahan baku, tenaga kerja langsung, dan overhead
• Biaya tetap vs biaya variabel
• Kesalahan umum: lupa menghitung gaji sendiri dan kemasan

LATIHAN
Hitung HPP 3 produk utama Anda di menu Keuangan > Kalkulator HPP.

RUJUKAN
• Charles T. Horngren dkk., Cost Accounting: A Managerial Emphasis (edisi terbaru)
• Ikatan Akuntan Indonesia, SAK EMKM (berlaku 2018)', 12, null, 2),
    (cid, 'Strategi menetapkan harga', 'Menetapkan harga jual yang menutup biaya, bersaing, dan sesuai nilai.', 'TUJUAN
Menetapkan harga jual yang menutup biaya, bersaing, dan sesuai nilai.

POKOK MATERI
• Cost-plus, harga pesaing, dan harga berbasis nilai
• Psikologi harga: harga jangkar, paket, dan pilihan bertingkat
• Kapan boleh dan tidak boleh banting harga

LATIHAN
Buat dua versi harga untuk satu produk (reguler dan paket), lalu hitung margin keduanya.

RUJUKAN
• Hermann Simon, Confessions of the Pricing Man (2015)
• Philip Kotler & Kevin Lane Keller, Marketing Management (edisi terbaru)', 10, null, 3),
    (cid, 'Titik impas dan untung per produk', 'Mengetahui berapa unit yang harus terjual agar tidak rugi.', 'TUJUAN
Mengetahui berapa unit yang harus terjual agar tidak rugi.

POKOK MATERI
• Rumus titik impas (break-even point)
• Margin kontribusi per produk
• Produk mana yang paling menguntungkan

LATIHAN
Hitung titik impas bulanan usaha Anda dan bandingkan dengan penjualan rata-rata saat ini.

RUJUKAN
• Charles T. Horngren dkk., Cost Accounting: A Managerial Emphasis (bab cost-volume-profit)', 10, null, 4),
    (cid, 'Dari mimpi ke target jualan harian', 'Menghubungkan untung per produk dengan mimpi pribadi.', 'TUJUAN
Menghubungkan untung per produk dengan mimpi pribadi.

POKOK MATERI
• Tabungan per hari dari Dream Planner
• Konversi ke unit terjual per hari
• Menyusun aksi penjualan harian

LATIHAN
Buka Target Harian, masukkan produk Anda, lalu tambahkan target unit per hari ke Daily Action.

RUJUKAN
• Mike Michalowicz, Profit First (2014)', 9, null, 5);
end $$;

do $$
declare cid uuid;
begin
  insert into public.courses (slug, title, summary, description, category, level, instructor, access, include_in_plus, price, status, sort, sef_step)
  values ('acquisition-pelanggan-pertama', 'Acquisition 2: Mendapatkan Pelanggan dan Penjualan', 'Dari tawaran yang menarik sampai pelanggan yang datang lagi.', 'Langkah kedua fase Survive, bagian kedua. Anda menyusun tawaran, pesan pemasaran, dan proses jualan sederhana yang bisa diulang setiap hari. Versi awal: materi bacaan, video menyusul.', 'SEF', 'Pemula', 'Tim EClub', 'registered', true, 0, 'published', 21, 'acquisition')
  on conflict (slug) do nothing returning id into cid;
  if cid is null then return; end if;

  insert into public.lessons (course_id, title, summary, content, duration_min, access, sort) values
    (cid, 'Menyusun tawaran yang sulit ditolak', 'Membuat tawaran yang nilainya jauh lebih besar dari harganya.', 'TUJUAN
Membuat tawaran yang nilainya jauh lebih besar dari harganya.

POKOK MATERI
• Unsur nilai: hasil impian, peluang berhasil, waktu, dan usaha
• Bonus, garansi, dan kelangkaan yang jujur
• Nama tawaran yang jelas

LATIHAN
Tulis ulang tawaran produk utama Anda dengan menambahkan satu bonus dan satu garansi.

RUJUKAN
• Alex Hormozi, $100M Offers (2021)', 10, null, 1),
    (cid, 'Pesan pemasaran yang jelas', 'Menulis pesan yang membuat pelanggan merasa dipahami.', 'TUJUAN
Menulis pesan yang membuat pelanggan merasa dipahami.

POKOK MATERI
• Pelanggan sebagai tokoh utama, usaha Anda sebagai pemandu
• Satu kalimat yang menjelaskan apa yang Anda tawarkan
• Ajakan bertindak yang jelas

LATIHAN
Buat satu kalimat ''one-liner'' usaha Anda dan pasang di bio WhatsApp atau Instagram.

RUJUKAN
• Donald Miller, Building a StoryBrand (2017)', 10, null, 2),
    (cid, 'Prinsip persuasi yang etis', 'Memakai prinsip pengaruh tanpa memanipulasi.', 'TUJUAN
Memakai prinsip pengaruh tanpa memanipulasi.

POKOK MATERI
• Timbal balik, komitmen, bukti sosial, otoritas, rasa suka, kelangkaan
• Batas etis: jujur dan tidak memaksa
• Testimoni yang asli

LATIHAN
Kumpulkan 3 testimoni asli dari pelanggan (dengan izin) dan tampilkan di katalog Anda.

RUJUKAN
• Robert B. Cialdini, Influence: The Psychology of Persuasion (1984, edisi baru 2021)', 9, null, 3),
    (cid, 'Proses jualan lewat percakapan', 'Menjual lewat WhatsApp dan tatap muka dengan bertanya, bukan memaksa.', 'TUJUAN
Menjual lewat WhatsApp dan tatap muka dengan bertanya, bukan memaksa.

POKOK MATERI
• Pertanyaan situasi, masalah, dampak, dan kebutuhan
• Menangani keberatan harga
• Menutup penjualan dan meminta rujukan

LATIHAN
Siapkan 5 pertanyaan pembuka untuk calon pelanggan dan pakai ke 10 orang minggu ini.

RUJUKAN
• Neil Rackham, SPIN Selling (1988)', 10, null, 4),
    (cid, 'Corong pelanggan dan angka penting', 'Mengukur perjalanan pelanggan dari kenal sampai beli lagi.', 'TUJUAN
Mengukur perjalanan pelanggan dari kenal sampai beli lagi.

POKOK MATERI
• Tahapan: kenal, tertarik, mencoba, membeli, kembali, merekomendasikan
• Metrik AARRR untuk usaha kecil
• Memperbaiki satu tahap yang paling bocor

LATIHAN
Catat selama 2 minggu: berapa orang yang bertanya, membeli, dan membeli lagi.

RUJUKAN
• Dave McClure, Startup Metrics for Pirates: AARRR (2007)
• Eric Ries, The Lean Startup (2011)', 10, null, 5),
    (cid, 'Membuat pelanggan kembali dan merekomendasikan', 'Mengubah pembeli menjadi pelanggan setia dan duta usaha.', 'TUJUAN
Mengubah pembeli menjadi pelanggan setia dan duta usaha.

POKOK MATERI
• Pengalaman setelah pembelian
• Program pelanggan setia sederhana
• Meminta rujukan dengan cara yang nyaman

LATIHAN
Kirim pesan terima kasih dan tawaran pembelian ulang ke 10 pelanggan terakhir Anda.

RUJUKAN
• Fred Reichheld, The Ultimate Question 2.0 (2011)
• John Jantsch, The Referral Engine (2010)', 9, null, 6);
end $$;

do $$
declare cid uuid;
begin
  insert into public.courses (slug, title, summary, description, category, level, instructor, access, include_in_plus, price, status, sort, sef_step)
  values ('systemation-keuangan-usaha', 'Systemation 1: Sistem Keuangan Usaha', 'Pisahkan uang pribadi dan usaha, lalu kendalikan arus kas setiap bulan.', 'Langkah ketiga, fase Sustain. Anda membangun kebiasaan pencatatan, memisahkan rekening, membaca laba rugi, dan menjaga arus kas agar usaha tidak bergantung pada keberuntungan. Versi awal: materi bacaan, video menyusul.', 'SEF', 'Menengah', 'Tim EClub', 'plus', true, 0, 'published', 30, 'systemation')
  on conflict (slug) do nothing returning id into cid;
  if cid is null then return; end if;

  insert into public.lessons (course_id, title, summary, content, duration_min, access, sort) values
    (cid, 'Pisahkan uang pribadi dan usaha', 'Menghentikan kebiasaan mencampur keuangan pribadi dan usaha.', 'TUJUAN
Menghentikan kebiasaan mencampur keuangan pribadi dan usaha.

POKOK MATERI
• Mengapa usaha terlihat ramai tapi uangnya tidak ada
• Menggaji diri sendiri
• Dompet terpisah di aplikasi: pribadi dan usaha

LATIHAN
Pindahkan semua transaksi usaha bulan ini ke dompet Usaha di menu Keuangan.

RUJUKAN
• Mike Michalowicz, Profit First (2014)', 9, 'preview', 1),
    (cid, 'Pencatatan harian yang sederhana', 'Membangun kebiasaan mencatat pemasukan dan pengeluaran setiap hari.', 'TUJUAN
Membangun kebiasaan mencatat pemasukan dan pengeluaran setiap hari.

POKOK MATERI
• Kategori transaksi yang konsisten
• Mencatat dalam 1 menit per transaksi
• Standar pencatatan untuk usaha mikro dan kecil

LATIHAN
Catat semua transaksi usaha selama 14 hari berturut-turut.

RUJUKAN
• Ikatan Akuntan Indonesia, SAK EMKM (berlaku 2018)', 9, null, 2),
    (cid, 'Membaca laporan laba rugi', 'Memahami apakah usaha benar-benar untung.', 'TUJUAN
Memahami apakah usaha benar-benar untung.

POKOK MATERI
• Pendapatan, HPP, laba kotor, beban, laba bersih
• Margin dan tren bulanan
• Keputusan dari angka: naikkan harga, tekan biaya, atau dorong volume

LATIHAN
Buka laporan Laba Rugi bulan lalu dan tulis satu keputusan berdasarkan angkanya.

RUJUKAN
• Karen Berman & Joe Knight, Financial Intelligence for Entrepreneurs (2008)', 10, null, 3),
    (cid, 'Arus kas dan dana darurat usaha', 'Menjaga usaha tetap hidup saat penjualan turun.', 'TUJUAN
Menjaga usaha tetap hidup saat penjualan turun.

POKOK MATERI
• Untung belum tentu ada kas
• Siklus kas: stok, piutang, utang
• Dana cadangan 3 bulan biaya tetap

LATIHAN
Hitung biaya tetap bulanan dan tetapkan target dana cadangan usaha.

RUJUKAN
• Mike Michalowicz, Profit First (2014)
• Verne Harnish, Scaling Up (2014), bagian Cash', 10, null, 4),
    (cid, 'Alokasi laba: profit, pajak, gaji, operasional', 'Membagi setiap pemasukan ke pos yang jelas.', 'TUJUAN
Membagi setiap pemasukan ke pos yang jelas.

POKOK MATERI
• Persentase alokasi untuk usaha kecil
• Menyisihkan pajak sejak awal
• Meninjau alokasi setiap kuartal

LATIHAN
Tetapkan persentase alokasi Anda dan terapkan pada pemasukan minggu ini.

RUJUKAN
• Mike Michalowicz, Profit First (2014)
• Informasi PPh Final UMKM dari Direktorat Jenderal Pajak (pajak.go.id)', 9, null, 5);
end $$;

do $$
declare cid uuid;
begin
  insert into public.courses (slug, title, summary, description, category, level, instructor, access, include_in_plus, price, status, sort, sef_step)
  values ('systemation-sop-dan-tim', 'Systemation 2: SOP, Tim, dan Usaha yang Bisa Berjalan Tanpa Anda', 'Ubah cara kerja menjadi sistem agar usaha tidak bergantung pada Anda seorang.', 'Langkah ketiga, fase Sustain, bagian kedua. Anda menulis SOP, mendelegasikan pekerjaan, merekrut orang yang tepat, dan memimpin dengan ritme rapat yang sederhana. Versi awal: materi bacaan, video menyusul.', 'SEF', 'Menengah', 'Tim EClub', 'plus', true, 0, 'published', 31, 'systemation')
  on conflict (slug) do nothing returning id into cid;
  if cid is null then return; end if;

  insert into public.lessons (course_id, title, summary, content, duration_min, access, sort) values
    (cid, 'Bekerja pada usaha, bukan di dalam usaha', 'Beralih dari tukang menjadi pemilik sistem.', 'TUJUAN
Beralih dari tukang menjadi pemilik sistem.

POKOK MATERI
• Tiga peran: teknisi, manajer, entrepreneur
• Usaha sebagai prototipe yang bisa digandakan
• Waktu mingguan untuk memikirkan sistem

LATIHAN
Catat semua pekerjaan Anda selama 3 hari dan tandai mana yang hanya bisa Anda lakukan.

RUJUKAN
• Michael E. Gerber, The E-Myth Revisited (1995)
• Mike Michalowicz, Clockwork (2018)', 9, 'preview', 1),
    (cid, 'Menulis SOP dan checklist', 'Mendokumentasikan pekerjaan berulang agar hasilnya konsisten.', 'TUJUAN
Mendokumentasikan pekerjaan berulang agar hasilnya konsisten.

POKOK MATERI
• Pilih 3 proses paling sering
• Format SOP singkat: tujuan, langkah, standar hasil
• Checklist untuk mencegah kesalahan

LATIHAN
Tulis SOP untuk satu proses (misalnya menerima pesanan) dan uji ke orang lain.

RUJUKAN
• Atul Gawande, The Checklist Manifesto (2009)
• Siklus PDCA (Plan-Do-Check-Act) dari W. Edwards Deming', 10, null, 2),
    (cid, 'Delegasi dan rekrutmen orang yang tepat', 'Mencari dan melepas pekerjaan ke orang yang tepat.', 'TUJUAN
Mencari dan melepas pekerjaan ke orang yang tepat.

POKOK MATERI
• Orang yang tepat dulu, baru arah
• Kartu skor peran: hasil yang diharapkan dan kompetensi
• Tahapan delegasi: lakukan bersama, awasi, lepas

LATIHAN
Buat kartu skor untuk satu peran yang ingin Anda isi.

RUJUKAN
• Jim Collins, Good to Great (2001)
• Geoff Smart & Randy Street, Who: The A Method for Hiring (2008)', 10, null, 3),
    (cid, 'Tim yang solid', 'Membangun kepercayaan dan tanggung jawab dalam tim kecil.', 'TUJUAN
Membangun kepercayaan dan tanggung jawab dalam tim kecil.

POKOK MATERI
• Lima disfungsi tim
• Kepercayaan sebagai dasar
• Komitmen dan akuntabilitas

LATIHAN
Adakan pertemuan tim 30 menit dan sepakati 3 aturan kerja bersama.

RUJUKAN
• Patrick Lencioni, The Five Dysfunctions of a Team (2002)', 9, null, 4),
    (cid, 'Ritme rapat dan angka mingguan', 'Menjalankan usaha dengan sasaran dan rapat yang teratur.', 'TUJUAN
Menjalankan usaha dengan sasaran dan rapat yang teratur.

POKOK MATERI
• Rapat harian 15 menit dan mingguan 60 menit
• Scorecard: 5 sampai 10 angka mingguan
• Target 90 hari (rocks)

LATIHAN
Buat scorecard 5 angka untuk usaha Anda dan isi selama 4 minggu.

RUJUKAN
• Gino Wickman, Traction (2007)
• Verne Harnish, Scaling Up (2014)', 10, null, 5);
end $$;

do $$
declare cid uuid;
begin
  insert into public.courses (slug, title, summary, description, category, level, instructor, access, include_in_plus, price, status, sort, sef_step)
  values ('transformation-scale-up', 'Transformation: Digitalisasi, Inovasi, dan Memperbesar Usaha', 'Perbesar kapasitas lewat digitalisasi, inovasi, dan strategi pertumbuhan.', 'Langkah keempat, fase Scale Up. Setelah sistem berjalan, Anda mencari ruang pasar baru, memanfaatkan teknologi, dan mengukur pertumbuhan dengan sasaran yang jelas. Versi awal: materi bacaan, video menyusul.', 'SEF', 'Lanjut', 'Tim EClub', 'plus', true, 0, 'published', 40, 'transformation')
  on conflict (slug) do nothing returning id into cid;
  if cid is null then return; end if;

  insert into public.lessons (course_id, title, summary, content, duration_min, access, sort) values
    (cid, 'Kapan usaha siap diperbesar', 'Menilai kesiapan sebelum menambah modal, cabang, atau produk.', 'TUJUAN
Menilai kesiapan sebelum menambah modal, cabang, atau produk.

POKOK MATERI
• Tanda siap: margin sehat, sistem jalan, permintaan melebihi kapasitas
• Risiko memperbesar terlalu cepat
• Empat pilar: orang, strategi, eksekusi, kas

LATIHAN
Nilai usaha Anda pada empat pilar dengan skala 1 sampai 5.

RUJUKAN
• Verne Harnish, Scaling Up (2014)', 9, 'preview', 1),
    (cid, 'Mencari samudra biru', 'Keluar dari perang harga dengan menciptakan ruang pasar baru.', 'TUJUAN
Keluar dari perang harga dengan menciptakan ruang pasar baru.

POKOK MATERI
• Red ocean vs blue ocean
• Kerangka hapus, kurangi, tingkatkan, ciptakan
• Kanvas strategi sederhana

LATIHAN
Gambar kanvas strategi usaha Anda dibanding 2 pesaing utama.

RUJUKAN
• W. Chan Kim & Renée Mauborgne, Blue Ocean Strategy (2005)', 10, null, 2),
    (cid, 'Inovasi dan eksperimen cepat', 'Menguji ide baru dengan biaya kecil sebelum investasi besar.', 'TUJUAN
Menguji ide baru dengan biaya kecil sebelum investasi besar.

POKOK MATERI
• Siklus bangun, ukur, pelajari
• Produk minimum (MVP)
• Inovasi yang mengganggu pasar

LATIHAN
Rancang satu eksperimen produk baru yang bisa diuji dalam 14 hari.

RUJUKAN
• Eric Ries, The Lean Startup (2011)
• Clayton M. Christensen, The Innovator''s Dilemma (1997)', 10, null, 3),
    (cid, 'Digitalisasi usaha', 'Memanfaatkan kanal dan alat digital untuk menjangkau lebih banyak pelanggan.', 'TUJUAN
Memanfaatkan kanal dan alat digital untuk menjangkau lebih banyak pelanggan.

POKOK MATERI
• Kanal: marketplace, media sosial, WhatsApp Business
• Otomatisasi pesanan, pembayaran, dan pencatatan
• Tren ekonomi digital Asia Tenggara

LATIHAN
Pilih satu proses yang masih manual dan otomatisasikan bulan ini.

RUJUKAN
• Google, Temasek & Bain & Company, laporan tahunan e-Conomy SEA
• Kementerian Koperasi dan UKM, program digitalisasi UMKM', 10, null, 4),
    (cid, 'Sasaran dan hasil kunci (OKR)', 'Menyelaraskan tim pada sasaran pertumbuhan yang terukur.', 'TUJUAN
Menyelaraskan tim pada sasaran pertumbuhan yang terukur.

POKOK MATERI
• Objective yang menginspirasi, key result yang terukur
• OKR per kuartal
• Meninjau kemajuan setiap minggu

LATIHAN
Tulis 1 objective dan 3 key result untuk kuartal depan.

RUJUKAN
• John Doerr, Measure What Matters (2018)
• Andrew S. Grove, High Output Management (1983)', 9, null, 5),
    (cid, 'Menyeberangi jurang pasar', 'Membawa produk dari pembeli awal ke pasar yang lebih luas.', 'TUJUAN
Membawa produk dari pembeli awal ke pasar yang lebih luas.

POKOK MATERI
• Siklus adopsi: inovator sampai pembeli mayoritas
• Menguasai satu ceruk dulu
• Produk lengkap untuk pasar mayoritas

LATIHAN
Tentukan satu ceruk pasar yang ingin Anda kuasai dalam 6 bulan.

RUJUKAN
• Geoffrey A. Moore, Crossing the Chasm (1991)
• Everett M. Rogers, Diffusion of Innovations (1962)', 9, null, 6);
end $$;

do $$
declare cid uuid;
begin
  insert into public.courses (slug, title, summary, description, category, level, instructor, access, include_in_plus, price, status, sort, sef_step)
  values ('investation-aset-dan-dampak', 'Investation: Aset, Investasi, Dampak, dan Warisan', 'Ubah hasil usaha menjadi aset, investasi, dan dampak yang bertahan lama.', 'Langkah kelima, fase Spread Up. Anda mengelola kekayaan dengan bijak, mengenal instrumen investasi yang legal, membuka peluang kemitraan, dan menebar dampak bagi orang lain. Versi awal: materi bacaan, video menyusul.', 'SEF', 'Lanjut', 'Tim EClub', 'plus', true, 0, 'published', 50, 'investation')
  on conflict (slug) do nothing returning id into cid;
  if cid is null then return; end if;

  insert into public.lessons (course_id, title, summary, content, duration_min, access, sort) values
    (cid, 'Psikologi uang dan kekayaan', 'Memahami bahwa perilaku lebih menentukan kekayaan daripada kepintaran.', 'TUJUAN
Memahami bahwa perilaku lebih menentukan kekayaan daripada kepintaran.

POKOK MATERI
• Cukup itu berapa
• Kekuatan waktu dan bunga majemuk
• Kekayaan yang tidak terlihat

LATIHAN
Tulis definisi ''cukup'' versi Anda dan angka kekayaan bersih saat ini.

RUJUKAN
• Morgan Housel, The Psychology of Money (2020)
• George S. Clason, The Richest Man in Babylon (1926)', 9, 'preview', 1),
    (cid, 'Aset vs liabilitas', 'Membedakan pengeluaran yang membangun aset dan yang menggerus kekayaan.', 'TUJUAN
Membedakan pengeluaran yang membangun aset dan yang menggerus kekayaan.

POKOK MATERI
• Aset menghasilkan arus kas, liabilitas menyedotnya
• Neraca pribadi sederhana
• Memindahkan laba usaha ke aset

LATIHAN
Susun neraca pribadi: daftar aset, utang, dan kekayaan bersih.

RUJUKAN
• Robert T. Kiyosaki, Rich Dad Poor Dad (1997)', 9, null, 2),
    (cid, 'Instrumen investasi yang legal dan sesuai profil', 'Mengenal pilihan investasi dan cara memeriksa legalitasnya.', 'TUJUAN
Mengenal pilihan investasi dan cara memeriksa legalitasnya.

POKOK MATERI
• Deposito, reksa dana, obligasi negara, saham, emas, properti
• Profil risiko dan jangka waktu
• Cek izin OJK dan waspada investasi bodong

LATIHAN
Tentukan profil risiko Anda dan cek legalitas satu produk investasi di situs OJK.

RUJUKAN
• Benjamin Graham, The Intelligent Investor (1949)
• John C. Bogle, The Little Book of Common Sense Investing (2007)
• Otoritas Jasa Keuangan, materi literasi keuangan (sikapiuangmu.ojk.go.id)', 11, null, 3),
    (cid, 'Menggandakan usaha: kemitraan dan waralaba', 'Mengenal cara menggandakan usaha lewat mitra.', 'TUJUAN
Mengenal cara menggandakan usaha lewat mitra.

POKOK MATERI
• Kemitraan, lisensi, dan waralaba
• Syarat sistem sebelum diwaralabakan
• Aturan waralaba di Indonesia

LATIHAN
Nilai apakah usaha Anda sudah punya SOP, merek, dan margin yang cukup untuk kemitraan.

RUJUKAN
• Peraturan Pemerintah No. 42 Tahun 2007 tentang Waralaba
• Michael E. Gerber, The E-Myth Revisited (1995), konsep franchise prototype', 10, null, 4),
    (cid, 'Bisnis sosial dan dampak', 'Memakai usaha untuk menyelesaikan masalah sosial.', 'TUJUAN
Memakai usaha untuk menyelesaikan masalah sosial.

POKOK MATERI
• Bisnis sosial: untung untuk tujuan sosial
• Triple bottom line: profit, people, planet
• Zakat, infak, sedekah, dan wakaf produktif

LATIHAN
Pilih satu masalah di sekitar Anda yang bisa dibantu lewat usaha Anda.

RUJUKAN
• Muhammad Yunus, Building Social Business (2010)
• John Elkington, Cannibals with Forks (1997)', 9, null, 5),
    (cid, 'Warisan dan permainan jangka panjang', 'Menyiapkan keberlanjutan usaha dan nilai yang diwariskan.', 'TUJUAN
Menyiapkan keberlanjutan usaha dan nilai yang diwariskan.

POKOK MATERI
• Pola pikir permainan tanpa akhir
• Suksesi dan regenerasi kepemimpinan
• Menjadi mentor bagi generasi berikutnya

LATIHAN
Tuliskan siapa yang akan Anda bimbing tahun ini dan apa yang ingin Anda wariskan.

RUJUKAN
• Simon Sinek, The Infinite Game (2019)
• Stephen R. Covey, The 8th Habit (2004)', 9, null, 6);
end $$;

-- 3. Artikel (gratis & Plus). Isi artikel Plus hanya dikirim lewat get_article() kepada member Plus/staff.
create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{2,90}$'),
  title text not null,
  excerpt text,
  category text,
  sef_step text check (sef_step is null or sef_step in ('spark', 'personal_mapping', 'acquisition', 'systemation', 'transformation', 'investation')),
  access text not null default 'free' check (access in ('free', 'plus')),
  status text not null default 'draft' check (status in ('draft', 'published')),
  read_min integer not null default 4,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create table if not exists public.article_bodies (
  article_id uuid primary key references public.articles (id) on delete cascade,
  body text not null default ''
);
alter table public.articles enable row level security;
alter table public.article_bodies enable row level security;
drop policy if exists articles_read on public.articles;
create policy articles_read on public.articles for select using (status = 'published' or public.is_staff());
drop policy if exists articles_staff on public.articles;
create policy articles_staff on public.articles for all using (public.is_staff()) with check (public.is_staff());
drop policy if exists article_bodies_staff on public.article_bodies;
create policy article_bodies_staff on public.article_bodies for all using (public.is_staff()) with check (public.is_staff());
grant select on public.articles to anon, authenticated;
grant insert, update, delete on public.articles to authenticated;
grant select, insert, update, delete on public.article_bodies to authenticated;
create index if not exists articles_pub_idx on public.articles (status, published_at desc);

create or replace function public.get_article(p_slug text)
returns table (id uuid, slug text, title text, excerpt text, category text, sef_step text, access text, read_min integer, published_at timestamptz, body text, locked boolean)
language sql stable security definer set search_path = '' as $$
  select a.id, a.slug, a.title, a.excerpt, a.category, a.sef_step, a.access, a.read_min, a.published_at,
    case when a.access = 'free' or public.has_plus() or public.is_staff() then b.body else null end,
    not (a.access = 'free' or public.has_plus() or public.is_staff())
  from public.articles a left join public.article_bodies b on b.article_id = a.id
  where a.slug = p_slug and (a.status = 'published' or public.is_staff());
$$;
grant execute on function public.get_article to anon, authenticated;

update public.plan_features set enforced = true where key = 'premium_articles';

-- 4. Artikel awal (aman dijalankan ulang).
with a as (
  insert into public.articles (slug, title, excerpt, category, sef_step, access, status, read_min, published_at)
  values ('usaha-stuck-bukan-karena-modal', 'Usaha Stuck Bukan Karena Modal, Tapi Karena Spark yang Padam', 'Banyak pemilik usaha menyalahkan modal dan pemasaran. Padahal sering kali akarnya ada di dalam diri.', 'Spark', 'spark', 'free', 'published', 5, now() - interval '12 hours')
  on conflict (slug) do nothing returning id
)
insert into public.article_bodies (article_id, body) select id, 'Coba ingat lagi hari pertama Anda membuka usaha. Ada semangat, ada rencana, ada mimpi yang ingin dikejar. Beberapa tahun kemudian, banyak pemilik usaha merasa jalan di tempat. Penjualan begitu-begitu saja, dan bangun pagi terasa berat.

Saat ditanya apa masalahnya, jawaban yang paling sering muncul adalah modal kurang atau pemasaran susah. Dua hal itu memang nyata. Tetapi kalau kita telusuri lebih dalam, sering ada masalah yang lebih mendasar: pemiliknya sudah tidak tahu lagi untuk apa ia berjuang.

## Tanda-tanda spark mulai padam
- Anda sibuk dari pagi sampai malam, tetapi tidak yakin sedang menuju ke mana.
- Ide baru terasa melelahkan, bukan menyenangkan.
- Anda menunda pekerjaan penting dan memilih pekerjaan yang mudah.
- Target bulanan tidak lagi membuat Anda bersemangat.

## Mengapa ini terjadi
Rutinitas pelan-pelan menggantikan tujuan. Awalnya usaha adalah kendaraan menuju mimpi. Lama-lama kendaraan itu menjadi tujuan itu sendiri, dan kita lupa mau dibawa ke mana. Kegagalan yang berulang juga membuat kita berhenti bermimpi supaya tidak kecewa lagi.

## Cara menyalakannya kembali
Pertama, tulis ulang mimpi Anda dengan angka dan tanggal. Mimpi yang kabur tidak bisa memberi energi. Mimpi "umroh berdua 60 juta dalam 5 tahun" jauh lebih menggerakkan daripada "ingin hidup lebih baik".

Kedua, pecah mimpi itu menjadi target harian. Rp60 juta dalam 5 tahun berarti sekitar Rp33 ribu per hari. Kalau untung per produk Rp5 ribu, artinya 7 produk terjual setiap hari. Tiba-tiba mimpi besar terasa bisa dikerjakan.

Ketiga, rayakan kemajuan kecil. Spark tidak dijaga oleh motivasi sesaat, tetapi oleh bukti kecil bahwa Anda bergerak maju setiap hari.

Mulailah dari Cek Posisi di EClub untuk melihat di mana Anda sekarang, lalu hitung target harian Anda. Langkah kecil hari ini lebih berharga daripada rencana sempurna yang tidak pernah dimulai.' from a;

with a as (
  insert into public.articles (slug, title, excerpt, category, sef_step, access, status, read_min, published_at)
  values ('cara-menghitung-hpp-umkm', 'Cara Menghitung HPP untuk UMKM, Lengkap dengan Contoh', 'HPP yang salah membuat usaha terlihat untung padahal rugi. Begini cara menghitungnya dengan benar.', 'Keuangan', 'acquisition', 'free', 'published', 6, now() - interval '11 hours')
  on conflict (slug) do nothing returning id
)
insert into public.article_bodies (article_id, body) select id, 'Harga Pokok Produksi atau HPP adalah total biaya untuk menghasilkan satu unit produk. Angka ini adalah dasar untuk menentukan harga jual. Kalau HPP salah hitung, semua keputusan setelahnya ikut salah.

## Tiga komponen HPP
- Bahan baku: semua bahan yang menjadi bagian produk, termasuk kemasan.
- Tenaga kerja langsung: upah orang yang membuat produk, termasuk upah Anda sendiri kalau Anda ikut produksi.
- Overhead: biaya pendukung seperti gas, listrik, sewa tempat, dan penyusutan alat.

## Contoh: keripik singkong
Misalnya dalam satu kali produksi Anda membuat 100 bungkus keripik.
- Singkong, minyak, bumbu: Rp150.000
- Plastik kemasan dan label: Rp50.000
- Upah produksi: Rp100.000
- Gas, listrik, dan bagian sewa: Rp50.000

Total biaya Rp350.000 untuk 100 bungkus. Jadi HPP per bungkus adalah Rp3.500.

## Kesalahan yang paling sering terjadi
Banyak pemilik usaha hanya menghitung bahan baku. Akibatnya HPP terlihat Rp2.000, lalu harga jual dipasang Rp4.000 dan merasa untung Rp2.000. Padahal setelah upah dan overhead dihitung, untung sebenarnya hanya Rp500.

Kesalahan kedua adalah tidak menggaji diri sendiri. Kalau Anda bekerja 8 jam sehari di usaha itu, waktu Anda punya nilai. Tanpa menghitungnya, usaha tidak akan pernah bisa berjalan tanpa Anda.

## Setelah HPP diketahui
Dari HPP, Anda bisa menetapkan harga jual dan melihat untung per produk. Dari untung per produk, Anda bisa menghitung berapa unit yang harus terjual setiap hari untuk mencapai mimpi Anda.

Gunakan Kalkulator HPP di menu Keuangan EClub. Anda bisa menyimpan 3 produk secara gratis dan langsung melihat untung per produknya.' from a;

with a as (
  insert into public.articles (slug, title, excerpt, category, sef_step, access, status, read_min, published_at)
  values ('mimpi-jadi-target-harian', 'Mengubah Mimpi Menjadi Target Jualan Harian', 'Mimpi besar terasa jauh karena belum dipecah. Begini cara mengubahnya menjadi angka yang bisa dikejar setiap hari.', 'Spark', 'spark', 'free', 'published', 4, now() - interval '10 hours')
  on conflict (slug) do nothing returning id
)
insert into public.article_bodies (article_id, body) select id, 'Hampir semua orang punya mimpi: naik haji atau umroh, rumah sendiri, menyekolahkan anak setinggi mungkin. Masalahnya, mimpi sering berhenti sebagai keinginan karena terasa terlalu besar.

## Langkah 1: beri harga dan tanggal
Tuliskan mimpi Anda sejelas mungkin. Bukan "ingin umroh", tetapi "umroh berdua, Rp60 juta, dalam 5 tahun". Angka membuat otak kita mulai mencari jalan.

## Langkah 2: pecah per hari
Rp60.000.000 dibagi 5 tahun (sekitar 1.825 hari) sama dengan kurang lebih Rp33.000 per hari. Angka ini jauh lebih ringan untuk dibayangkan.

## Langkah 3: terjemahkan ke produk
Kalau untung bersih per produk Anda Rp5.000, maka Rp33.000 dibagi Rp5.000 sama dengan 7 produk per hari. Sekarang mimpi Anda punya target harian yang konkret: jual 7 keripik hari ini.

## Langkah 4: masukkan ke aksi harian
Target yang tidak masuk jadwal akan kalah oleh urusan mendesak. Jadikan "jual 7 produk" sebagai aksi harian dan centang setiap kali tercapai.

## Langkah 5: tinjau setiap bulan
Kalau penjualan harian sering di bawah target, ada tiga pilihan: menaikkan harga, menekan biaya agar untung per produk naik, atau menambah kanal penjualan. Kalau sering di atas target, selamat, mimpi Anda bisa tercapai lebih cepat.

Fitur Target Harian di EClub menghitung semua ini otomatis dari mimpi dan produk Anda.' from a;

with a as (
  insert into public.articles (slug, title, excerpt, category, sef_step, access, status, read_min, published_at)
  values ('pisahkan-uang-pribadi-dan-usaha', 'Kenapa Uang Pribadi dan Usaha Harus Dipisah (dan Cara Memulainya)', 'Usaha ramai tapi uangnya entah ke mana? Bisa jadi karena dompetnya masih tercampur.', 'Keuangan', 'systemation', 'free', 'published', 5, now() - interval '9 hours')
  on conflict (slug) do nothing returning id
)
insert into public.article_bodies (article_id, body) select id, '"Penjualannya lumayan, tapi kok uangnya tidak pernah ada?" Kalimat ini sangat sering terdengar dari pemilik usaha kecil. Penyebab paling umum: uang usaha dan uang pribadi masih tercampur di satu dompet atau satu rekening.

## Apa yang terjadi kalau tercampur
- Anda tidak tahu usaha sebenarnya untung atau rugi.
- Uang modal terpakai untuk kebutuhan rumah tangga tanpa terasa.
- Saat harus belanja stok, uangnya sudah tidak ada.
- Keputusan usaha diambil berdasarkan perasaan, bukan angka.

## Cara memulai minggu ini
Pertama, buka rekening atau dompet terpisah untuk usaha. Semua pemasukan usaha masuk ke sana.

Kedua, gaji diri sendiri. Tentukan jumlah tetap yang Anda ambil dari usaha setiap minggu atau setiap bulan, lalu pindahkan ke dompet pribadi. Di luar itu, uang usaha tidak boleh dipakai untuk kebutuhan pribadi.

Ketiga, catat setiap transaksi. Tidak perlu rumit. Cukup tanggal, jumlah, kategori, dan dompet mana.

Keempat, lihat laporan setiap akhir bulan. Dari situ Anda tahu laba sebenarnya dan bisa memutuskan berapa yang disimpan, berapa yang diputar kembali.

## Bonus: lebih tenang
Banyak member merasakan hal yang sama setelah memisahkan dompet: pikiran lebih tenang. Anda tahu persis posisi uang Anda, sehingga tidak lagi was-was setiap kali ada pengeluaran.

Menu Keuangan EClub sudah menyediakan dua dompet, Pribadi dan Usaha, supaya pemisahan ini mudah dimulai.' from a;

with a as (
  insert into public.articles (slug, title, excerpt, category, sef_step, access, status, read_min, published_at)
  values ('kebiasaan-kecil-pemilik-usaha', '7 Kebiasaan Kecil Pemilik Usaha yang Konsisten Bertumbuh', 'Pertumbuhan jarang datang dari satu keputusan besar. Ia datang dari kebiasaan kecil yang diulang.', 'Kebiasaan', 'spark', 'free', 'published', 4, now() - interval '8 hours')
  on conflict (slug) do nothing returning id
)
insert into public.article_bodies (article_id, body) select id, 'Kita sering kagum pada pengusaha yang tumbuh pesat dan mengira rahasianya ada pada satu keputusan besar. Kenyataannya, kebanyakan pertumbuhan dibangun dari kebiasaan kecil yang diulang setiap hari.

## 1. Menulis tiga prioritas setiap pagi
Bukan sepuluh, cukup tiga. Kalau tiga hal itu selesai, hari Anda sudah produktif.

## 2. Mencatat uang setiap hari
Satu menit setelah setiap transaksi. Kebiasaan ini membuat Anda selalu tahu kondisi usaha.

## 3. Menghubungi pelanggan setiap hari
Satu pesan terima kasih, satu tawaran, atau satu pertanyaan kabar. Hubungan yang dirawat menghasilkan pembelian ulang.

## 4. Belajar 15 menit
Membaca, menonton kelas, atau mendengarkan podcast. Dalam setahun, itu lebih dari 90 jam belajar.

## 5. Bergerak dan menjaga tubuh
Usaha yang sehat butuh pemilik yang sehat. Jalan kaki 20 menit sudah cukup untuk memulai.

## 6. Bersyukur sebelum tidur
Menuliskan tiga hal yang disyukuri membantu Anda melihat kemajuan, bukan hanya kekurangan.

## 7. Evaluasi mingguan
Setiap akhir pekan, lihat lagi target, angka penjualan, dan apa yang perlu diperbaiki minggu depan.

Mulai dari satu atau dua kebiasaan saja. Gunakan menu Kebiasaan di EClub untuk melacak rangkaian harian Anda dan lihat bagaimana konsistensi kecil mengubah banyak hal.' from a;

with a as (
  insert into public.articles (slug, title, excerpt, category, sef_step, access, status, read_min, published_at)
  values ('kenali-gaya-disc-untuk-usaha', 'Mengenal Gaya DISC Anda untuk Menjalankan Usaha', 'Setiap gaya kepribadian punya kekuatan dan titik buta. Mengenalinya membantu Anda memilih peran dan partner.', 'Personal Mapping', 'personal_mapping', 'free', 'published', 5, now() - interval '7 hours')
  on conflict (slug) do nothing returning id
)
insert into public.article_bodies (article_id, body) select id, 'Model DISC berasal dari gagasan psikolog William Moulton Marston pada tahun 1928 tentang cara orang merespons lingkungannya. Model ini membagi gaya perilaku menjadi empat kecenderungan. Tidak ada gaya yang lebih baik dari yang lain. Yang penting adalah mengenali gaya Anda sendiri.

## D, Dominance
Cepat mengambil keputusan, suka tantangan, berorientasi hasil. Dalam usaha, gaya ini kuat dalam memimpin dan mendorong target. Titik butanya: kurang sabar dan bisa terlihat terlalu keras pada tim.

## I, Influence
Antusias, mudah bergaul, pandai meyakinkan. Gaya ini kuat dalam penjualan, promosi, dan membangun jaringan. Titik butanya: mudah bosan dengan detail dan administrasi.

## S, Steadiness
Sabar, setia, dan bisa diandalkan. Gaya ini kuat dalam melayani pelanggan dan menjaga operasional tetap stabil. Titik butanya: sulit menerima perubahan cepat dan sungkan berkata tidak.

## C, Compliance
Teliti, analitis, menyukai standar yang jelas. Gaya ini kuat dalam keuangan, kualitas, dan SOP. Titik butanya: terlalu lama menganalisis sehingga keputusan tertunda.

## Bagaimana memakainya
Pertama, kenali gaya utama Anda. Kedua, sadari pekerjaan yang menguras energi Anda, lalu cari partner atau karyawan dengan gaya yang melengkapi. Pemilik bergaya I yang kuat jualan, misalnya, sangat terbantu oleh partner bergaya C yang rapi mengurus keuangan.

Ingat, DISC adalah alat refleksi, bukan label permanen. Ikuti Tes DISC gratis di EClub untuk melihat profil Anda.' from a;

with a as (
  insert into public.articles (slug, title, excerpt, category, sef_step, access, status, read_min, published_at)
  values ('tawaran-yang-sulit-ditolak', 'Menyusun Tawaran yang Membuat Pelanggan Sulit Menolak', 'Pelanggan tidak membeli produk, mereka membeli hasil. Begini cara menyusun tawaran yang bernilai tinggi.', 'Penjualan', 'acquisition', 'free', 'published', 5, now() - interval '6 hours')
  on conflict (slug) do nothing returning id
)
insert into public.article_bodies (article_id, body) select id, 'Dua penjual menjual keripik yang sama dengan harga yang sama. Yang satu laris, yang lain sepi. Sering kali bedanya bukan di produk, tetapi di cara menawarkan.

## Pelanggan membeli hasil
Orang tidak benar-benar membeli keripik. Mereka membeli camilan teman nonton bersama keluarga, oleh-oleh yang membuat tuan rumah senang, atau stok jualan warung yang cepat laku. Mulailah tawaran Anda dari hasil yang diinginkan pelanggan.

## Empat hal yang membuat tawaran terasa bernilai
- Hasil yang jelas: apa yang pelanggan dapatkan.
- Keyakinan berhasil: bukti, testimoni asli, atau garansi.
- Cepat: seberapa cepat pelanggan merasakan manfaatnya.
- Mudah: seberapa sedikit usaha yang perlu mereka keluarkan.

## Cara meningkatkan nilai tanpa banting harga
Buat paket. Misalnya "Paket Arisan isi 10 bungkus, gratis 1, diantar". Tambahkan bonus yang murah bagi Anda tetapi bernilai bagi pelanggan, seperti kartu ucapan. Berikan garansi yang jujur, misalnya ganti baru jika kemasan rusak saat diterima.

## Hindari kelangkaan palsu
Batas waktu dan stok terbatas memang efektif, tetapi hanya pakai kalau benar. Pelanggan yang merasa dibohongi tidak akan kembali.

Tawaran yang baik membuat pelanggan merasa mendapat lebih dari yang mereka bayar. Di situlah pembelian ulang dan rekomendasi dimulai.' from a;

with a as (
  insert into public.articles (slug, title, excerpt, category, sef_step, access, status, read_min, published_at)
  values ('titik-impas-usaha', 'Titik Impas: Berapa yang Harus Terjual Agar Tidak Rugi?', 'Sebelum mengejar untung, pastikan Anda tahu batas aman usaha Anda.', 'Keuangan', 'acquisition', 'free', 'published', 4, now() - interval '5 hours')
  on conflict (slug) do nothing returning id
)
insert into public.article_bodies (article_id, body) select id, 'Titik impas atau break-even point adalah jumlah penjualan saat pendapatan sama dengan seluruh biaya. Di bawah titik ini Anda rugi, di atasnya Anda mulai untung.

## Rumus sederhana
Titik impas (unit) = Biaya tetap bulanan dibagi (Harga jual per unit dikurangi Biaya variabel per unit).

Biaya tetap adalah biaya yang tetap keluar meski tidak ada penjualan, seperti sewa, gaji tetap, dan cicilan alat. Biaya variabel adalah biaya yang naik turun mengikuti jumlah produksi, seperti bahan baku dan kemasan.

## Contoh
- Biaya tetap: Rp3.000.000 per bulan
- Harga jual: Rp10.000 per unit
- Biaya variabel: Rp6.000 per unit

Margin per unit adalah Rp4.000. Titik impas = 3.000.000 dibagi 4.000 = 750 unit per bulan, atau sekitar 25 unit per hari.

## Apa artinya
Kalau rata-rata penjualan Anda 20 unit per hari, usaha Anda sebenarnya masih rugi meski terlihat ramai. Ada tiga jalan: naikkan harga, turunkan biaya variabel, atau tambah penjualan.

Ketahui titik impas Anda, lalu jadikan itu garis minimum harian. Target mimpi Anda dihitung di atas garis ini.' from a;

with a as (
  insert into public.articles (slug, title, excerpt, category, sef_step, access, status, read_min, published_at)
  values ('profit-first-untuk-umkm', 'Sistem Alokasi Laba: Agar Usaha Selalu Menyisakan Untung', 'Cara membagi setiap pemasukan ke pos profit, gaji pemilik, pajak, dan operasional, disesuaikan untuk UMKM.', 'Keuangan', 'systemation', 'plus', 'published', 7, now() - interval '4 hours')
  on conflict (slug) do nothing returning id
)
insert into public.article_bodies (article_id, body) select id, 'Kebanyakan usaha menghitung laba dengan rumus pendapatan dikurangi biaya. Masalahnya, biaya cenderung membesar mengikuti uang yang tersedia, sehingga laba selalu tersisa sedikit atau habis.

Pendekatan yang dipopulerkan Mike Michalowicz dalam buku Profit First membalik urutannya: sisihkan laba lebih dulu, lalu jalankan usaha dengan sisanya. Berikut adaptasi sederhananya untuk usaha kecil di Indonesia.

## Lima pos uang
- Pemasukan: semua uang masuk ditampung di sini dulu.
- Profit: bagian yang disisihkan sebagai laba dan cadangan.
- Gaji pemilik: penghasilan tetap Anda.
- Pajak: disisihkan sejak awal, misalnya untuk PPh Final UMKM.
- Operasional: untuk belanja bahan, sewa, dan biaya lain.

## Persentase awal yang realistis
Untuk usaha yang baru mulai, coba Profit 5%, Gaji pemilik 30%, Pajak 2% sampai 5%, dan sisanya Operasional. Angka ini bukan aturan mutlak. Mulai kecil, lalu naikkan persentase Profit sedikit demi sedikit setiap kuartal.

## Ritme pembagian
Lakukan pembagian dua kali sebulan, misalnya tanggal 10 dan 25. Pindahkan uang dari Pemasukan ke pos-pos lain sesuai persentase. Konsistensi lebih penting daripada besarnya angka.

## Kalau Operasional tidak cukup
Inilah gunanya sistem ini. Jika dana operasional kurang, itu sinyal bahwa biaya terlalu besar atau harga terlalu murah. Daripada mengambil dari pos Profit, cari biaya yang bisa dipangkas atau tinjau ulang harga jual.

## Memakai pos Profit
Setiap kuartal, ambil sebagian pos Profit sebagai bonus untuk Anda sebagai pemilik. Sisanya biarkan sebagai dana cadangan usaha, idealnya sampai setara 3 bulan biaya tetap.

## Langkah minggu ini
1. Hitung rata-rata pemasukan bulanan 3 bulan terakhir.
2. Tetapkan persentase awal untuk lima pos.
3. Buat dompet atau rekening terpisah untuk minimal tiga pos: Profit, Pajak, Operasional.
4. Lakukan pembagian pertama pada tanggal yang Anda tetapkan.

Catat semua perpindahan dana di menu Keuangan agar laporan laba rugi Anda tetap akurat.' from a;

with a as (
  insert into public.articles (slug, title, excerpt, category, sef_step, access, status, read_min, published_at)
  values ('menulis-sop-usaha-kecil', 'Menulis SOP Pertama untuk Usaha Kecil: Panduan Praktis', 'SOP bukan dokumen tebal. Ini cara membuat usaha berjalan konsisten meski Anda tidak di tempat.', 'Sistem', 'systemation', 'plus', 'published', 7, now() - interval '3 hours')
  on conflict (slug) do nothing returning id
)
insert into public.article_bodies (article_id, body) select id, 'Banyak pemilik usaha kecil merasa SOP hanya untuk perusahaan besar. Padahal justru usaha kecil yang paling butuh, karena biasanya semua pengetahuan hanya ada di kepala pemiliknya. Saat pemilik sakit atau ingin libur, usaha ikut berhenti.

## Mulai dari proses yang paling sering diulang
Jangan menulis SOP untuk semua hal sekaligus. Pilih tiga proses yang paling sering terjadi dan paling sering bermasalah. Contohnya: menerima pesanan lewat WhatsApp, produksi harian, dan pengiriman.

## Format satu halaman
Setiap SOP cukup berisi:
- Nama proses dan tujuannya.
- Siapa yang menjalankan.
- Langkah-langkah berurutan, maksimal 10 langkah.
- Standar hasil: seperti apa pekerjaan yang dianggap benar.
- Apa yang dilakukan jika ada masalah.

## Contoh singkat: menerima pesanan
1. Balas pesan pelanggan maksimal 15 menit pada jam kerja.
2. Kirim katalog dan daftar harga terbaru.
3. Konfirmasi pesanan: produk, jumlah, alamat, tanggal kirim.
4. Kirim total tagihan dan nomor rekening.
5. Setelah bayar, catat di buku pesanan dan kirim ucapan terima kasih.

## Uji ke orang lain
SOP yang baik bisa dijalankan orang lain tanpa banyak bertanya. Minta karyawan atau anggota keluarga mencoba menjalankannya. Setiap kali mereka bingung, perbaiki tulisan SOP-nya.

## Checklist untuk mencegah lupa
Untuk pekerjaan yang punya banyak detail, ubah SOP menjadi checklist. Atul Gawande dalam The Checklist Manifesto menunjukkan bagaimana checklist sederhana mengurangi kesalahan bahkan di bidang yang sangat kompleks.

## Perbaiki terus
Gunakan siklus rencanakan, kerjakan, periksa, perbaiki. Tinjau SOP setiap tiga bulan atau setiap kali ada keluhan pelanggan yang berulang.

Tujuan akhirnya sederhana: usaha Anda tetap memberi hasil yang konsisten, bahkan saat Anda sedang beristirahat bersama keluarga.' from a;

with a as (
  insert into public.articles (slug, title, excerpt, category, sef_step, access, status, read_min, published_at)
  values ('kapan-usaha-siap-scale-up', 'Kapan Usaha Siap Diperbesar? 6 Pertanyaan Sebelum Buka Cabang', 'Memperbesar usaha terlalu cepat bisa sama berbahayanya dengan tidak tumbuh sama sekali.', 'Scale Up', 'transformation', 'plus', 'published', 6, now() - interval '2 hours')
  on conflict (slug) do nothing returning id
)
insert into public.article_bodies (article_id, body) select id, 'Buka cabang, tambah produk, atau ambil pinjaman untuk ekspansi adalah langkah yang menggoda saat usaha mulai ramai. Namun banyak usaha justru goyah setelah memperbesar diri terlalu cepat. Sebelum melangkah, jawab enam pertanyaan berikut dengan jujur.

## 1. Apakah margin Anda sehat?
Kalau margin tipis, memperbesar usaha hanya memperbesar masalah. Pastikan untung per produk sudah layak sebelum menggandakan volume.

## 2. Apakah usaha bisa berjalan tanpa Anda selama dua minggu?
Kalau belum, cabang kedua akan membuat Anda terbelah dua. Bangun SOP dan tim lebih dulu.

## 3. Apakah permintaan melebihi kapasitas?
Ekspansi seharusnya menjawab permintaan yang sudah ada, bukan berharap permintaan datang setelah cabang dibuka.

## 4. Apakah arus kas Anda kuat?
Ekspansi menyedot kas sebelum menghasilkan. Hitung berapa bulan cabang baru bisa menutup biayanya sendiri, lalu pastikan cadangan Anda cukup.

## 5. Apakah Anda punya angka yang dipantau setiap minggu?
Tanpa scorecard, masalah di cabang baru baru ketahuan saat sudah besar.

## 6. Apakah orangnya sudah siap?
Siapa yang akan memimpin cabang baru? Kalau jawabannya masih Anda, tunda dulu.

## Alternatif yang lebih ringan
Sebelum membuka cabang fisik, pertimbangkan cara memperbesar dengan risiko lebih kecil: menambah kanal online, bekerja sama dengan reseller, atau menitipkan produk di toko lain. Uji permintaan di pasar baru dengan biaya kecil, lalu putuskan berdasarkan data.

Verne Harnish dalam Scaling Up merangkum kesiapan ini dalam empat pilar: orang, strategi, eksekusi, dan kas. Kalau salah satunya lemah, perkuat dulu sebelum menambah beban.' from a;

with a as (
  insert into public.articles (slug, title, excerpt, category, sef_step, access, status, read_min, published_at)
  values ('dari-laba-usaha-ke-aset', 'Dari Laba Usaha ke Aset: Membangun Kekayaan yang Bertahan', 'Laba yang hanya berputar di usaha belum menjadi kekayaan. Begini cara memindahkannya ke aset secara bertahap dan aman.', 'Investasi', 'investation', 'plus', 'published', 7, now() - interval '1 hours')
  on conflict (slug) do nothing returning id
)
insert into public.article_bodies (article_id, body) select id, 'Banyak pemilik usaha yang penghasilannya besar tetapi kekayaannya tidak bertambah. Penyebabnya, seluruh laba kembali diputar di usaha atau habis untuk gaya hidup. Usaha memang aset, tetapi menaruh seluruh kekayaan di satu tempat adalah risiko besar.

## Kenali aset dan liabilitas
Aset adalah sesuatu yang menghasilkan arus kas atau nilainya cenderung naik. Liabilitas adalah sesuatu yang terus menyedot uang. Mobil mewah yang dibeli dengan cicilan, misalnya, lebih sering menjadi liabilitas daripada aset.

## Urutan yang aman
1. Dana darurat pribadi: 6 bulan kebutuhan hidup, disimpan di instrumen yang mudah dicairkan.
2. Dana cadangan usaha: minimal 3 bulan biaya tetap usaha.
3. Lunasi utang konsumtif berbunga tinggi.
4. Baru mulai berinvestasi secara rutin.

## Pilihan instrumen
Setiap instrumen punya risiko dan jangka waktu berbeda. Deposito dan obligasi negara cenderung stabil. Reksa dana memberi diversifikasi dengan modal kecil. Saham berpotensi tumbuh lebih tinggi dalam jangka panjang tetapi naik turun. Emas sering dipakai sebagai pelindung nilai. Properti bisa menghasilkan sewa tetapi butuh modal besar dan sulit dicairkan.

## Aturan keamanan
- Selalu cek izin produk dan lembaganya di situs resmi OJK.
- Waspadai janji imbal hasil tinggi yang pasti. Investasi yang sah tidak menjanjikan untung tetap yang besar tanpa risiko.
- Jangan berinvestasi pada sesuatu yang tidak Anda pahami.

## Rutin, bukan sekali besar
Tetapkan persentase laba yang dipindahkan ke investasi setiap bulan, misalnya 10% dari gaji pemilik dan 30% dari pos Profit setiap kuartal. Morgan Housel dalam The Psychology of Money mengingatkan bahwa konsistensi dan waktu sering lebih menentukan daripada memilih instrumen terbaik.

Artikel ini bersifat edukasi umum, bukan rekomendasi investasi. Untuk keputusan yang besar, diskusikan dengan perencana keuangan berlisensi.' from a;
