// Data Tes DISC EClub: 24 kelompok pernyataan (ditulis ulang oleh EClub dengan makna yang sama), kunci jawaban, tabel konversi, kode grafik, dan deskripsi tipe.
// Urutan pilihan dan kunci jawaban tidak boleh diubah: penilaian memakai indeks pilihan (a-d).

export type DiscQuestion = { options: string[]; most: string; least: string };
export type DiscTypeInfo = { name: string; tagline: string; strengths: string[]; improve: string[]; pursues: string; judged: string; influence: string; value: string; overuse: string; stress: string; fear: string };

export const DISC_QUESTIONS: DiscQuestion[] = [
 {
  "options": [
   "Hangat dan bersahabat",
   "Pandai meyakinkan orang lain",
   "Bersahaja, rendah hati, mudah menerima",
   "Punya gagasan sendiri, kreatif, mandiri"
  ],
  "most": "SICX",
  "least": "SXCD"
 },
 {
  "options": [
   "Memikat dan disukai banyak orang",
   "Kooperatif, mudah sepakat",
   "Teguh pendirian, pantang mundur",
   "Menyenangkan dan suka membuat orang puas"
  ],
  "most": "ICDX",
  "least": "ICDS"
 },
 {
  "options": [
   "Nyaman mengikuti arahan orang lain",
   "Kuat dan berani menghadapi tantangan",
   "Setia dan berdedikasi",
   "Memesona dan enak diajak bergaul"
  ],
  "most": "XDSI",
  "least": "CDXI"
 },
 {
  "options": [
   "Berpikiran terbuka, mau menerima masukan",
   "Kokoh dan senang membantu",
   "Tekun dan berkemauan kuat",
   "Ceria dan selalu bersemangat"
  ],
  "most": "CSXI",
  "least": "XSDI"
 },
 {
  "options": [
   "Ceria dan suka bercanda",
   "Cermat dan tepat",
   "Blak-blakan, berani, tidak mudah sungkan",
   "Kalem, mampu menahan emosi"
  ],
  "most": "XCXS",
  "least": "ICDS"
 },
 {
  "options": [
   "Suka bersaing dan ingin selalu menang",
   "Penuh perhatian dan bijak",
   "Supel dan suka bersenang-senang",
   "Suka keselarasan, mudah sepakat"
  ],
  "most": "DSXX",
  "least": "DSIC"
 },
 {
  "options": [
   "Banyak menuntut, tidak mudah merasa puas",
   "Patuh dan menjalankan perintah",
   "Fokus pada satu tujuan dan pantang menyerah",
   "Jenaka, lincah, dan riang"
  ],
  "most": "XSDI",
  "least": "CXDI"
 },
 {
  "options": [
   "Berani dan tidak gentar",
   "Mampu membangkitkan semangat orang lain",
   "Penurut, mudah mengalah",
   "Pemalu, pendiam, mudah sungkan"
  ],
  "most": "DIXX",
  "least": "XXSC"
 },
 {
  "options": [
   "Senang bergaul dan bersosialisasi",
   "Sabar, yakin, dan toleran",
   "Percaya diri dan mandiri",
   "Halus perangainya, pendiam, suka menyendiri"
  ],
  "most": "ISDC",
  "least": "ISDX"
 },
 {
  "options": [
   "Suka hal baru dan tantangan",
   "Terbuka pada gagasan dan saran baru",
   "Ramah, hangat, mudah akrab",
   "Sedang-sedang saja, menghindari hal ekstrem"
  ],
  "most": "DCXS",
  "least": "DXIS"
 },
 {
  "options": [
   "Senang berbicara, banyak cerita",
   "Terkendali dan mudah diarahkan",
   "Menjalankan kebiasaan yang biasa, tidak berlebihan",
   "Tegas dan cepat mengambil keputusan"
  ],
  "most": "ISXD",
  "least": "ISCD"
 },
 {
  "options": [
   "Santun dalam tutur kata dan sikap",
   "Berani mengambil risiko",
   "Diplomatis dan bijaksana",
   "Mudah merasa puas dan senang"
  ],
  "most": "XDCS",
  "least": "IDXS"
 },
 {
  "options": [
   "Agresif, berinisiatif, suka tantangan",
   "Suka keramaian, hiburan, dan acara kumpul",
   "Mudah ikut dan dimanfaatkan orang lain",
   "Mudah cemas dan khawatir"
  ],
  "most": "DISX",
  "least": "XISC"
 },
 {
  "options": [
   "Penuh kehati-hatian",
   "Teguh pada satu hal, tidak mudah goyah",
   "Pandai meyakinkan",
   "Baik hati dan menyenangkan"
  ],
  "most": "CDIS",
  "least": "CXIX"
 },
 {
  "options": [
   "Mau berkorban, mengikuti keadaan",
   "Bersemangat dan selalu ingin tahu",
   "Mudah setuju",
   "Gesit dan antusias"
  ],
  "most": "SXCX",
  "least": "XICD"
 },
 {
  "options": [
   "Yakin pada kemampuan diri sendiri",
   "Penuh empati, mudah memahami orang lain",
   "Toleran",
   "Tegas dan agresif"
  ],
  "most": "IXXD",
  "least": "XSCD"
 },
 {
  "options": [
   "Disiplin dan terkendali",
   "Murah hati, suka berbagi",
   "Ekspresif, banyak bergerak saat berbicara",
   "Gigih, pantang menyerah"
  ],
  "most": "CSXD",
  "least": "XSID"
 },
 {
  "options": [
   "Layak dikagumi dan dipuji",
   "Ramah dan senang membantu",
   "Mudah mengalah pada pendapat orang lain",
   "Berkarakter kuat dan tangguh"
  ],
  "most": "ISXD",
  "least": "XXCD"
 },
 {
  "options": [
   "Menghargai dan menghormati orang lain",
   "Perintis, giat, dan mau berusaha",
   "Optimis, selalu melihat sisi baik",
   "Selalu siap membantu"
  ],
  "most": "CDIS",
  "least": "XDIS"
 },
 {
  "options": [
   "Pandai beradu argumen",
   "Luwes, mudah menyesuaikan diri",
   "Cuek, kurang peduli",
   "Santai, riang tanpa beban pikiran"
  ],
  "most": "DCXI",
  "least": "DXSI"
 },
 {
  "options": [
   "Bisa dipercaya dan mudah percaya pada orang lain",
   "Mudah puas, merasa cukup",
   "Selalu berpikir positif dan yakin",
   "Tenang dan pendiam"
  ],
  "most": "SXDC",
  "least": "ISDC"
 },
 {
  "options": [
   "Supel, mudah berteman",
   "Berwawasan luas dan berbudaya",
   "Penuh semangat dan giat",
   "Toleran, kurang tegas"
  ],
  "most": "IXDS",
  "least": "ICDS"
 },
 {
  "options": [
   "Menyenangkan dan ramah",
   "Teliti dan akurat",
   "Bicara apa adanya, lugas",
   "Tenang, emosi terjaga"
  ],
  "most": "ICDX",
  "least": "IXDS"
 },
 {
  "options": [
   "Gelisah, sulit bersantai",
   "Baik hati dan ramah",
   "Populer, disukai banyak orang",
   "Rapi dan teratur"
  ],
  "most": "DSIC",
  "least": "DSIC"
 }
];

/** Tabel konversi [jumlah, nilai grafik] per faktor (lookup persis seperti VLOOKUP di Excel). */
export const CONVERT_MOST: Record<string, [number, number][]> = {"D": [[20, 100], [16, 97], [15, 93], [14, 95], [13, 83], [12, 79], [11, 76], [10, 73], [9, 65], [8, 59], [7, 53], [6, 48], [5, 43], [4, 38], [3, 33], [2, 24], [1, 15], [0, 3]], "I": [[17, 100], [16, 100], [15, 100], [14, 100], [13, 100], [12, 100], [11, 100], [10, 97], [9, 92], [8, 88], [7, 83], [6, 73], [5, 68], [4, 56], [3, 43], [2, 35], [1, 20], [0, 8]], "S": [[19, 100], [16, 100], [15, 100], [14, 100], [13, 100], [12, 97], [11, 89], [10, 85], [9, 78], [8, 74], [7, 67], [6, 61], [5, 55], [4, 45], [3, 38], [2, 30], [1, 22], [0, 11]], "C": [[15, 100], [14, 100], [13, 100], [12, 100], [11, 100], [10, 100], [9, 96], [8, 89], [7, 84], [6, 73], [5, 66], [4, 54], [3, 40], [2, 29], [1, 16], [0, 0]]};
export const CONVERT_LEAST: Record<string, [number, number][]> = {"D": [[0, 100], [1, 87], [2, 75], [3, 67], [4, 59], [5, 53], [6, 48], [7, 42], [8, 38], [9, 31], [10, 28], [11, 25], [12, 21], [13, 15], [14, 11], [15, 8], [16, 5], [21, 1]], "I": [[0, 100], [1, 86], [2, 75], [3, 67], [4, 55], [5, 46], [6, 37], [7, 28], [8, 22], [9, 15], [10, 10], [11, 7], [19, 0]], "S": [[0, 100], [1, 96], [2, 85], [3, 75], [4, 67], [5, 59], [6, 53], [7, 42], [8, 37], [9, 29], [10, 23], [11, 15], [12, 8], [13, 4], [19, 1]], "C": [[0, 100], [1, 95], [2, 82], [3, 74], [4, 65], [5, 58], [6, 52], [7, 47], [8, 39], [9, 33], [10, 23], [11, 14], [12, 7], [13, 3], [16, 0]]};

/** Kode pola grafik → nama tipe. */
export const DISC_CODES: Record<string, string> = {
 "HCLDLILS": "Analyzer #7",
 "HCLILDLS": "Analyzer #7",
 "HCHSLDLI": "Coordinator #21",
 "HCHSLILD": "Coordinator #21",
 "HCHDLILS": "Implementor #24",
 "HCHDLSLI": "Implementor #24",
 "HCHILSLD": "Analyzer #60",
 "HCHILDLS": "Analyzer #60",
 "HCHIHDLS": "Analyzer #55",
 "HCHDHILS": "Analyzer #55",
 "HCHSHDLI": "Analyzer #38",
 "HCHDHSLI": "Analyzer #38",
 "HDLILCLS": "Conductor #1",
 "HDHILSLC": "Persuader #12",
 "HDHILCLS": "Persuader #12",
 "HDHCLILS": "Implementor #9",
 "HDHCLSLI": "Implementor #9",
 "HDHSLILC": "Conductor #57",
 "HDHSLCLI": "Conductor #57",
 "HDHIHCLS": "Conductor #27",
 "HDHCHILS": "Conductor #27",
 "HDHSHCLI": "Conductor #42",
 "HDHCHSLI": "Conductor #42",
 "HSLDLCLI": "Supporter #5",
 "HSLDLILC": "Supporter #5",
 "HSLCLDLI": "Supporter #5",
 "HSLCLILD": "Supporter #5",
 "HSLILDLC": "Supporter #5",
 "HSLILCLD": "Supporter #5",
 "HSHCLDLI": "Coordinator #20",
 "HSHCLILD": "Coordinator #20",
 "HSHILDLC": "Relater #17",
 "HSHILCLD": "Relater #17",
 "HSHDLILC": "Supporter #59",
 "HSHDLCLI": "Supporter #59",
 "HSHIHCLD": "Supporter #35",
 "HSHCHILD": "Supporter #35",
 "HSHDHILC": "Supporter #50",
 "HSHIHDLC": "Supporter #50",
 "HILDLCLS": "Promoter #3",
 "HILDLSLC": "Promoter #3",
 "HILCLDLS": "Promoter #3",
 "HILCLSLD": "Promoter #3",
 "HILSLDLC": "Promoter #3",
 "HILSLCLD": "Promoter #3",
 "HIHDLSLC": "Persuader #13",
 "HIHDLCLS": "Persuader #13",
 "HIHSLDLC": "Relater #16",
 "HIHSLCLD": "Relater #16",
 "HIHCLDLS": "Promoter #58",
 "HIHCLSLD": "Promoter #58",
 "HIHSHCLD": "Promoter #47",
 "HIHCHSLD": "Promoter #47",
 "HIHDHSLC": "Promoter #30",
 "HIHSHDLC": "Promoter #30"
};

export const DISC_TYPES: Record<string, DiscTypeInfo> = {
 "Analyzer #7": {
  "name": "Sang Penjamin Mutu",
  "tagline": "Sekali kerja, langsung benar.",
  "strengths": [
   "Menyelesaikan pekerjaan sulit dengan benar sejak percobaan pertama",
   "Cepat menangkap kesalahan kecil saat ketelitian sangat dibutuhkan",
   "Profesional dan disiplin dalam bidang keahliannya",
   "Rapi dalam mengatur pekerjaan dan pandai memakai waktu"
  ],
  "improve": [
   "Melepas tuntutan untuk selalu sempurna",
   "Lebih luwes: tidak semua hal harus persis sesuai aturan",
   "Menunjukkan antusiasme dan berani memutuskan tanpa menunggu data lengkap"
  ],
  "pursues": "Hasil yang akurat dan berkualitas",
  "judged": "Dari mutu hasil kerjanya, lengkap dengan bukti dan fakta",
  "influence": "Dengan data yang tepat dan bisa dipertanggungjawabkan",
  "value": "Menetapkan standar tinggi bagi diri sendiri dan tim, dengan disiplin yang kuat",
  "overuse": "Aturan dan prosedur",
  "stress": "Terlalu keras mengkritik diri sendiri dan orang lain",
  "fear": "Mengambil keputusan yang berisiko tinggi"
 },
 "Coordinator #21": {
  "name": "Sang Penjaga Standar",
  "tagline": "Rapi, aman, dan selalu bisa diandalkan.",
  "strengths": [
   "Menetapkan dan menjaga standar kerja serta perilaku yang tinggi",
   "Peka terhadap masalah, aturan, kesalahan, dan prosedur",
   "Mampu mengambil keputusan sulit dengan kepala dingin",
   "Paham apa yang dibutuhkan sebuah sistem agar mutunya tetap terjaga"
  ],
  "improve": [
   "Lebih berani menyampaikan pendapat secara jujur",
   "Melihat perubahan sebagai peluang, bukan ancaman bagi mutu atau hubungan",
   "Lebih percaya diri dan mau mengandalkan rekan satu tim"
  ],
  "pursues": "Rasa aman dan keteraturan",
  "judged": "Dari ketepatan mereka memenuhi standar",
  "influence": "Dengan bisa diandalkan dan teliti pada detail",
  "value": "Berhati-hati dan konsisten menjaga standar",
  "overuse": "Ketergantungan pada SOP",
  "stress": "Menutup diri dan bertahan pada pendapatnya",
  "fear": "Konflik dan pertentangan"
 },
 "Implementor #24": {
  "name": "Sang Arsitek Sistem",
  "tagline": "Kualitas terjaga, cara kerja terus disempurnakan.",
  "strengths": [
   "Menjaga mutu sambil terus mencari cara agar hasil lebih banyak",
   "Mengambil keputusan sulit berdasarkan wawasan dan fakta, bukan emosi",
   "Pantang berhenti sebelum menemukan solusi yang paling tepat",
   "Ahli di bidangnya dan mendorong tim mencapai kinerja lebih tinggi"
  ],
  "improve": [
   "Lebih peka terhadap perasaan orang lain",
   "Menyampaikan kritik dengan cara yang lebih halus",
   "Menunjukkan kepedulian yang tulus kepada tim"
  ],
  "pursues": "Merancang sistem yang lebih baik",
  "judged": "Dari standar pribadi mereka yang tinggi",
  "influence": "Dengan mengatur ritme kerja saat membangun sistem",
  "value": "Teliti, cermat, dan berhati-hati",
  "overuse": "Fakta dan angka",
  "stress": "Mudah gelisah",
  "fear": "Keadaan yang kacau dan tidak teratur"
 },
 "Analyzer #60": {
  "name": "Sang Diplomat Berkualitas",
  "tagline": "Menjaga mutu sambil merawat relasi.",
  "strengths": [
   "Pendukung sistem yang bermutu",
   "Tahu mana yang mendesak, tanpa menurunkan standar",
   "Teratur, bahkan dalam menjalin hubungan; menghargai orang yang sepemikiran, rapi, dan sadar mutu",
   "Peka terhadap perubahan di lingkungan sosial maupun pekerjaan"
  ],
  "improve": [
   "Lebih terbuka pada gagasan dan keyakinan orang lain",
   "Menetapkan target yang realistis",
   "Tidak terlalu terpengaruh komentar orang"
  ],
  "pursues": "Hubungan yang baik melalui sikap diplomatis",
  "judged": "Dari siapa yang mereka kenal, reputasi, dan pencapaian",
  "influence": "Dengan strategi membangun relasi yang baik",
  "value": "Menciptakan suasana kerja yang nyaman",
  "overuse": "Sikap serba bijaksana",
  "stress": "Menjadi terlalu ramah demi menghindari masalah",
  "fear": "Terpaksa mengorbankan mutu demi menjaga hubungan"
 },
 "Analyzer #55": {
  "name": "Sang Pengelola Proyek",
  "tagline": "Banyak target, standar tetap tinggi.",
  "strengths": [
   "Mampu menuntaskan banyak proyek dengan standar tinggi",
   "Punya intuisi tajam di bidang tertentu",
   "Pandai membagi tugas agar orang lain ikut membantu mencapai hasil",
   "Menjaga standar dengan prosedur yang sudah terbukti"
  ],
  "improve": [
   "Tidak ingin mengendalikan semua hal",
   "Lebih realistis saat menilai orang lain",
   "Tetap luwes saat berada di bawah tekanan"
  ],
  "pursues": "Banyak tantangan sekaligus",
  "judged": "Dari keahlian dan komitmen mereka",
  "influence": "Dengan sikap optimis",
  "value": "Membagi tugas kepada tim sesuai kemampuan masing-masing",
  "overuse": "Prosedur standar",
  "stress": "Terlalu mengendalikan",
  "fear": "Gagal memenuhi tenggat waktu"
 },
 "Analyzer #38": {
  "name": "Sang Pemecah Masalah",
  "tagline": "Menggali fakta sampai ke akarnya.",
  "strengths": [
   "Bersungguh-sungguh memastikan prosedur dan hasil benar serta bermutu",
   "Pandai mengajukan pertanyaan yang tepat untuk menemukan fakta tersembunyi",
   "Adil dan tidak pilih kasih saat menilai anggota tim",
   "Memadukan analisis dan intuisi untuk masalah yang rumit"
  ],
  "improve": [
   "Tidak berlebihan menganalisis saat mencari kebenaran",
   "Mengungkapkan perasaan dan lebih sering berbagi gagasan",
   "Berbagi informasi dan bekerja sama dengan tim"
  ],
  "pursues": "Memecahkan masalah",
  "judged": "Dari cara mereka memakai data",
  "influence": "Dengan kekuatan fakta dan angka",
  "value": "Sukarela mengambil tugas analisis yang menantang",
  "overuse": "Tuntutan kesempurnaan",
  "stress": "Bersikap ketus dan kurang sopan",
  "fear": "Terlalu banyak berinteraksi, risiko tinggi, dan kurangnya ruang pribadi"
 },
 "Conductor #1": {
  "name": "Sang Pendobrak",
  "tagline": "Bergerak cepat, menembus rintangan.",
  "strengths": [
   "Berani menghadapi masalah sulit dan rumit",
   "Progresif, agresif, dan senang bersaing",
   "Nyaman bekerja di lingkungan yang beragam dan cepat berubah",
   "Memulai gerakan dan menentukan langkah menuju hasil"
  ],
  "improve": [
   "Mengurangi sikap keras, egois, dan terlalu blak-blakan",
   "Tidak memaksa orang yang belum berkomitmen untuk ikut mengerjakan proyek",
   "Lebih sabar, peduli, dan rendah hati"
  ],
  "pursues": "Kendali dan kemandirian",
  "judged": "Dari kecepatan mereka menyelesaikan tugas",
  "influence": "Dengan karakter yang kuat dan kegigihan",
  "value": "Punya sikap dan pendirian yang jelas",
  "overuse": "Tantangan dan persaingan",
  "stress": "Menarik diri dan menjadi sangat analitis",
  "fear": "Kehilangan kendali"
 },
 "Persuader #12": {
  "name": "Sang Penggerak Target",
  "tagline": "Mengajak tim mengejar hasil.",
  "strengths": [
   "Fokus pada hasil dan bergerak cepat agar target selesai tepat waktu",
   "Tegas dan berani saat menghadapi tantangan",
   "Memulai pekerjaan dengan menggerakkan tim untuk mencapai hasil",
   "Supel dan senang menjalin relasi dengan banyak orang"
  ],
  "improve": [
   "Tidak mudah kesal saat tenggat mundur atau terlewat",
   "Tidak memikul terlalu banyak tanggung jawab sekaligus, lebih konsisten",
   "Lebih lugas dan menurunkan ekspektasi yang berlebihan"
  ],
  "pursues": "Kemenangan dengan percaya diri dan agresif",
  "judged": "Dari kemampuan berkomunikasi dan berpikir",
  "influence": "Dengan keramahan dan semangat kuat mencapai target",
  "value": "Perencana yang baik, pemecah masalah, dan banyak akal",
  "overuse": "Jabatan dan cara kerjanya sendiri",
  "stress": "Gelisah, tidak sabar, dan kurang peka",
  "fear": "Kekalahan dan kekacauan"
 },
 "Implementor #9": {
  "name": "Sang Pelopor Berstandar",
  "tagline": "Mendobrak dengan rencana yang rapi.",
  "strengths": [
   "Menuntut standar tinggi dari diri sendiri dan tim, serta kerja sama yang baik",
   "Sadar akan dampak dari setiap kesalahan",
   "Memakai waktu secara terstruktur",
   "Memecahkan masalah secara sistematis tanpa terbawa emosi"
  ],
  "improve": [
   "Lebih hangat dan menghargai anggota tim",
   "Membedakan mutu buruk karena keputusan keliru dengan masalah yang sudah ada sejak awal",
   "Tidak terlalu blak-blakan atau keras mengkritik orang yang belum memenuhi standar"
  ],
  "pursues": "Kendali dan kepeloporan",
  "judged": "Dari standar dan gagasan maju mereka",
  "influence": "Dengan semangat menghadapi persaingan dan tantangan yang unik",
  "value": "Mandiri dalam mendorong perubahan",
  "overuse": "Sikap blak-blakan dan kritis",
  "stress": "Mendikte dan banyak menuntut",
  "fear": "Tidak punya pengaruh"
 },
 "Conductor #57": {
  "name": "Sang Eksekutor Gigih",
  "tagline": "Ide baru dikawal sampai tuntas.",
  "strengths": [
   "Melahirkan ide baru dan mengawalnya sampai selesai",
   "Menghargai setiap anggota tim",
   "Bisa melihat gambaran besar sekaligus detail kecilnya",
   "Punya tekad dan kegigihan yang kuat"
  ],
  "improve": [
   "Tidak terpaku pada satu masalah sampai melewatkan peluang lain",
   "Tidak terlalu kaku pada standar pribadi",
   "Membicarakan prioritas kerja bersama tim"
  ],
  "pursues": "Mewujudkan tekad",
  "judged": "Dari banyaknya pekerjaan yang diselesaikan",
  "influence": "Dengan kegigihan dan ketekunan",
  "value": "Fokus pada hasil dan konsisten",
  "overuse": "Mengandalkan diri sendiri",
  "stress": "Keras kepala, diam, dan menyimpan perasaan",
  "fear": "Harus terlibat dengan terlalu banyak orang"
 },
 "Conductor #27": {
  "name": "Sang Penggerak Optimis",
  "tagline": "Target tinggi, tim ikut bergerak.",
  "strengths": [
   "Pandai menggerakkan orang lain untuk mencapai target",
   "Menghadapi rintangan dengan optimis",
   "Menetapkan target pribadi yang tinggi",
   "Punya dorongan kuat untuk segera mewujudkan sesuatu"
  ],
  "improve": [
   "Lebih teliti pada detail",
   "Lebih santai saat menyerahkan pekerjaan kepada orang lain",
   "Lebih konsisten saat menegakkan disiplin"
  ],
  "pursues": "Menggerakkan orang secara aktif untuk mencapai hasil",
  "judged": "Dari keterlibatan mereka dalam tim",
  "influence": "Dengan kemampuan membujuk",
  "value": "Inovatif dan berpikir jauh ke depan",
  "overuse": "Tekad yang terlalu kuat",
  "stress": "Tidak sabar dan ingin mengendalikan",
  "fear": "Gagal mencapai tujuan"
 },
 "Conductor #42": {
  "name": "Sang Pemikir Strategis",
  "tagline": "Logis, fokus, dan mandiri.",
  "strengths": [
   "Menyampaikan gagasan secara logis tanpa terbawa perasaan",
   "Fokus penuh pada target dan masalah yang paling penting",
   "Cermat mengamati orang-orang yang memengaruhi kinerjanya",
   "Menjelaskan data teknis dengan jelas dan mengubah teori menjadi solusi nyata"
  ],
  "improve": [
   "Berbagi pengetahuan, pikiran, dan perasaan dengan orang lain",
   "Tidak ragu bertindak saat tekanan tinggi",
   "Melatih kemampuan berinteraksi dan berbicara"
  ],
  "pursues": "Memenuhi kebutuhannya secara mandiri",
  "judged": "Dari pemahaman dan daya nalar",
  "influence": "Dengan sikap rasional dan tidak menunjukkan semua isi pikiran",
  "value": "Berinisiatif dan fokus pada tujuan",
  "overuse": "Kemandirian",
  "stress": "Bimbang dan pesimis",
  "fear": "Tenggat yang tidak menyisakan waktu untuk memeriksa mutu"
 },
 "Supporter #5": {
  "name": "Sang Penenang Tim",
  "tagline": "Stabil, sabar, dan setia pada tugas.",
  "strengths": [
   "Tenang dan terkendali, fokus mendengarkan dan belajar",
   "Konsisten menjalankan tugas yang berarti bagi organisasi",
   "Anggota tim yang terbuka, sabar, dan menerima perbedaan",
   "Senang memberi pujian kepada orang lain"
  ],
  "improve": [
   "Bergerak cepat saat keadaan mendesak",
   "Tidak terlalu bergantung pada rutinitas",
   "Lebih berinisiatif dan siap menghadapi perubahan"
  ],
  "pursues": "Kestabilan dan keandalan",
  "judged": "Dari konsistensi mereka",
  "influence": "Dengan sikap yang menyenangkan dan suka melayani",
  "value": "Membuat suasana kerja tetap stabil",
  "overuse": "Sikap tenang",
  "stress": "Memendam perasaan",
  "fear": "Tidak dihargai dan tidak dikenali"
 },
 "Coordinator #20": {
  "name": "Sang Penuntas Andal",
  "tagline": "Memulai, mengawal, dan menyelesaikan.",
  "strengths": [
   "Memulai proyek dan mengawalnya sampai tuntas",
   "Siap membantu pimpinan dan mengerjakan tugas di luar perannya saat dibutuhkan",
   "Pandai menemukan solusi menyeluruh yang adil bagi semua pihak dengan logika",
   "Memimpin dengan energi positif dan mempertimbangkan perasaan tim"
  ],
  "improve": [
   "Berani menunjukkan kemampuan diri agar dikenal",
   "Menghadapi masalah secara langsung",
   "Menyampaikan kekhawatiran dan perasaan kepada tim"
  ],
  "pursues": "Standar tinggi yang ditetapkannya sendiri",
  "judged": "Dari cara mereka memakai pengetahuan",
  "influence": "Dengan kemampuan mengawal pekerjaan sampai selesai",
  "value": "Berpikir logis dan fokus saat dibutuhkan",
  "overuse": "Menolak perubahan",
  "stress": "Bertahan keras pada kemauannya",
  "fear": "Tidak memenuhi persyaratan tertentu"
 },
 "Relater #17": {
  "name": "Sang Pendengar Empatik",
  "tagline": "Membuat orang merasa berarti.",
  "strengths": [
   "Pendengar yang baik dan mampu berempati",
   "Senang membantu orang lain meraih tujuan dan cita-citanya",
   "Mudah memahami perasaan, keyakinan, dan nilai orang lain",
   "Menciptakan suasana di mana setiap orang merasa penting"
  ],
  "improve": [
   "Lebih tegas dan teguh pendirian",
   "Tidak terlena dengan keadaan yang sudah nyaman",
   "Membangun ketegasan dan kepercayaan diri"
  ],
  "pursues": "Kenyamanan dan penerimaan",
  "judged": "Dari kesetiaan, ketulusan, dan keandalan",
  "influence": "Dengan pengertian dan sikap bersahabat",
  "value": "Mendukung, menyelaraskan, dan menenangkan tim meski di bawah tekanan",
  "overuse": "Kebaikan hati",
  "stress": "Menarik diri",
  "fear": "Konflik dan tidak disukai"
 },
 "Supporter #59": {
  "name": "Sang Pejuang Tangguh",
  "tagline": "Gigih mengejar target, setia pada prinsip.",
  "strengths": [
   "Berani menghadapi masalah dan menyelesaikannya dengan baik",
   "Gigih, logis, dan ulet mengejar target",
   "Pandai menjaga hubungan baik di dalam dan di luar pekerjaan",
   "Berjiwa pemimpin dan teguh membela apa yang diyakini benar"
  ],
  "improve": [
   "Tidak pasif, bahkan saat merasa posisinya terancam",
   "Mencoba sudut pandang baru dan kreatif saat memecahkan masalah",
   "Mau keluar dari zona nyaman saat menghadapi situasi baru"
  ],
  "pursues": "Pencapaian pribadi",
  "judged": "Dari prestasi dan keberhasilan mereka",
  "influence": "Dengan kegigihan",
  "value": "Bekerja mandiri dan menyukai tantangan",
  "overuse": "Sikap blak-blakan dan kritis",
  "stress": "Keras kepala dan sulit berkompromi",
  "fear": "Gagal mencapai hasil yang diinginkan"
 },
 "Supporter #35": {
  "name": "Sang Penyeimbang Hangat",
  "tagline": "Ramah, seimbang, dan menenangkan tim.",
  "strengths": [
   "Suportif, ramah, dan optimis dalam setiap hubungan",
   "Mudah bergaul dan menikmati keunikan setiap orang",
   "Mengambil keputusan yang seimbang sehingga tim tetap stabil",
   "Pandai menilai situasi dari pengalaman nyata yang bisa dilihat dan dirasakan"
  ],
  "improve": [
   "Tetap fokus pada peran dan target agar kerja lebih efektif",
   "Lebih sigap saat keadaan mendesak",
   "Mau memakai cara yang lebih praktis, tidak harus selalu lengkap dan sempurna"
  ],
  "pursues": "Keadaan yang tetap dan nyaman",
  "judged": "Dari pertemanan",
  "influence": "Dengan kinerja yang konsisten dan sikap akomodatif",
  "value": "Perencana yang konsisten dan menjaga ritme kerja",
  "overuse": "Cara lama yang sederhana",
  "stress": "Menyimpan rasa kesal",
  "fear": "Konflik dan dipermalukan"
 },
 "Supporter #50": {
  "name": "Sang Negosiator Empatik",
  "tagline": "Mandiri, gigih, dan pandai merangkul.",
  "strengths": [
   "Tetap mandiri meski sangat berempati",
   "Unggul dalam tugas yang menuntut tekad dan kegigihan",
   "Mampu membawa pengaruh positif pada rekan yang kurang kooperatif",
   "Pandai mengajak orang bernegosiasi dan mau mendengar pendapat yang berbeda"
  ],
  "improve": [
   "Menyusun prioritas kegiatan harian",
   "Menimbang untung rugi sebelum memutuskan",
   "Lebih tegas dan konsisten pada pendirian"
  ],
  "pursues": "Sukses lewat konsistensi",
  "judged": "Dari kesetiaan dalam pertemanan",
  "influence": "Dengan kemampuan membujuk",
  "value": "Memecahkan masalah secara kreatif dan berinovasi bersama orang lain",
  "overuse": "Intensitas yang tinggi",
  "stress": "Terlalu menggebu-gebu",
  "fear": "Tidak didukung tim dan perubahan mendadak"
 },
 "Promoter #3": {
  "name": "Sang Pembawa Ceria",
  "tagline": "Optimis, hangat, dan mudah berteman.",
  "strengths": [
   "Sangat optimis dan punya selera humor yang menyenangkan",
   "Perhatian dan mudah memercayai orang dalam hubungan",
   "Cepat akrab dengan orang baru dan senang berjejaring",
   "Mengambil keputusan lewat musyawarah"
  ],
  "improve": [
   "Lebih disiplin memantau target kerja",
   "Tidak terlalu memikirkan perasaan semua orang",
   "Lebih teratur dan realistis"
  ],
  "pursues": "Melayani dan menyenangkan orang lain",
  "judged": "Dari kehangatan mereka",
  "influence": "Dengan keterampilan bergaul dan sikap bersahabat",
  "value": "Pandai menyampaikan mimpi besar dan menyatukan tim",
  "overuse": "Optimisme dan ketergantungan pada orang lain",
  "stress": "Terlalu mengikuti perasaan",
  "fear": "Tidak disukai"
 },
 "Persuader #13": {
  "name": "Sang Pemengaruh Karismatik",
  "tagline": "Ide jadi gerakan lewat kata-kata.",
  "strengths": [
   "Pandai mengajak orang lain sependapat",
   "Berkomunikasi dengan sangat terbuka",
   "Mampu meredakan suasana saat terjadi konflik",
   "Piawai mempromosikan ide dan produk baru"
  ],
  "improve": [
   "Tidak terlalu melibatkan emosi saat memutuskan",
   "Berani berhadapan langsung saat dibutuhkan",
   "Menetapkan tenggat yang realistis dan mengatur waktu dengan baik"
  ],
  "pursues": "Merawat pertemanan",
  "judged": "Dari relasi berpengaruh yang mereka miliki dan komitmennya",
  "influence": "Dengan inspirasi dan karisma",
  "value": "Stabil, bisa diandalkan, dan punya jaringan luas",
  "overuse": "Antusiasme",
  "stress": "Terlalu banyak bicara",
  "fear": "Kegagalan"
 },
 "Relater #16": {
  "name": "Sang Sahabat Setia",
  "tagline": "Hangat, sabar, dan selalu ada.",
  "strengths": [
   "Membantu orang dengan kehangatan, empati, dan pengertian",
   "Melindungi dan menghargai orang maupun barang yang dipercayakan",
   "Pendengar sekaligus pembicara yang baik"
  ],
  "improve": [
   "Tegas mengambil keputusan saat dibutuhkan",
   "Tidak menghindari konfrontasi meski berisiko",
   "Lebih berinisiatif dan sigap saat keadaan mendesak"
  ],
  "pursues": "Pertemanan yang langgeng",
  "judged": "Dari kesetiaan mereka dalam hubungan",
  "influence": "Dengan memberi teladan dalam hubungan pribadi",
  "value": "Pendengar yang baik dan sabar menghadapi orang",
  "overuse": "Toleransi",
  "stress": "Menyimpan rasa kesal dan gelisah saat tertekan",
  "fear": "Berhadapan langsung dalam konflik"
 },
 "Promoter #58": {
  "name": "Sang Pencair Suasana",
  "tagline": "Membuat orang nyaman, membuat ide terdengar.",
  "strengths": [
   "Menangani situasi sulit dengan bijak dan peka pada kebutuhan orang",
   "Menciptakan suasana yang menyenangkan dan nyaman",
   "Menyampaikan ide dengan efektif",
   "Nyaman di lingkungan yang bergerak cepat"
  ],
  "improve": [
   "Tidak berlebihan menganalisis demi ketepatan",
   "Lebih ringkas saat menawarkan produk atau ide",
   "Lebih tegas"
  ],
  "pursues": "Persetujuan dan penerimaan",
  "judged": "Dari kemampuan membaca isyarat ucapan dan bahasa tubuh",
  "influence": "Dengan ketenangan dan rasa percaya diri",
  "value": "Mencairkan suasana dan pandai mempromosikan orang serta proyek",
  "overuse": "Menguasai pembicaraan",
  "stress": "Kata-katanya bisa menyakitkan",
  "fear": "Kehilangan jati diri"
 },
 "Promoter #47": {
  "name": "Sang Perekat Tim",
  "tagline": "Luwes, kooperatif, dan menyatukan.",
  "strengths": [
   "Mudah menyesuaikan diri di berbagai situasi",
   "Anggota tim yang optimis, supel, dan kooperatif",
   "Rutin berupaya menyatukan tim",
   "Sabar mendengarkan orang lain"
  ],
  "improve": [
   "Tidak terlalu berbasa-basi kepada semua orang",
   "Lebih konsisten bersikap tegas",
   "Lebih lugas dan melatih pengaturan waktu"
  ],
  "pursues": "Mengarahkan tim menghasilkan kerja yang sistematis",
  "judged": "Dari kemampuan berkomunikasi dan berpikir",
  "influence": "Dengan diplomasi",
  "value": "Berhati-hati dan berkarakter",
  "overuse": "Posisi dan standarnya sendiri",
  "stress": "Posesif dan mudah tersinggung",
  "fear": "Tidak dianggap bagian dari tim"
 },
 "Promoter #30": {
  "name": "Sang Presenter Meyakinkan",
  "tagline": "Tenang, tegas, dan memikat saat bicara.",
  "strengths": [
   "Persuasif, tegas, dan tetap tenang",
   "Bisa bekerja mandiri saat dibutuhkan",
   "Pandai merumuskan dan menyampaikan ide kepada orang lain",
   "Mempresentasikan ide dengan jelas dan menarik"
  ],
  "improve": [
   "Tidak terlalu keras mempertahankan pendapat",
   "Mengumpulkan informasi yang cukup sebelum bertindak",
   "Lebih teliti pada detail dan lebih teratur"
  ],
  "pursues": "Bergaul luas dan meyakinkan orang",
  "judged": "Dari dedikasi dan keuletan mereka",
  "influence": "Dengan berani mengambil tanggung jawab",
  "value": "Antusias dan terbuka menyampaikan gagasan baru",
  "overuse": "Ambisi",
  "stress": "Terlihat dangkal",
  "fear": "Tidak dianggap bagian dari tim"
 }
};
