// Data Tes DISC dari file Excel milik EClub ("Tes_DISC.xlsx"): pernyataan, kunci jawaban, tabel konversi, kode grafik, dan deskripsi tipe.
// Dihasilkan otomatis dari Excel, jangan diubah manual tanpa mencocokkan ke file aslinya.
// Catatan: file sumber mencantumkan "Copyright 1986-2000 Target Training International, Ltd."

export type DiscQuestion = { options: string[]; most: string; least: string };
export type DiscTypeInfo = { strengths: string[]; improve: string[]; pursues: string; judged: string; influence: string; value: string; overuse: string; stress: string; fear: string };

export const DISC_QUESTIONS: DiscQuestion[] = [
 {
  "options": [
   "Lembut, ramah",
   "Membujuk, meyakinkan",
   "Sederhana, mudah menerima, rendah hati",
   "Orisinal, berdayacipta, individulis"
  ],
  "most": "SICX",
  "least": "SXCD"
 },
 {
  "options": [
   "Menarik, mempesona, menarik bagi orang lain",
   "Dapat bekerja sama, mudah meyetujui",
   "Keras kepala, tidak mudah menyerah",
   "Manis, memuaskan/menyenangkan"
  ],
  "most": "ICDX",
  "least": "ICDS"
 },
 {
  "options": [
   "Mau dipimpin, cenderung mengikuti/pengikut",
   "Tangguh, berani",
   "Loyal, setia, mengabdi",
   "Mempesona, menyenangkan"
  ],
  "most": "XDSI",
  "least": "CDXI"
 },
 {
  "options": [
   "Berpandangan terbuka, mau menerima",
   "Tegar, suka menolong",
   "Tekun, berkemauan keras",
   "Periang, selalu bergembira"
  ],
  "most": "CSXI",
  "least": "XSDI"
 },
 {
  "options": [
   "Periang, suka bergurau",
   "Teliti, tepat",
   "Kasar, berani, kurang sopan, tidak mudah malu",
   "Tenang, emosi terkendali, tidak mudah heboh"
  ],
  "most": "XCXS",
  "least": "ICDS"
 },
 {
  "options": [
   "Kompetitif, selalu ingin berhasil",
   "Timbang rasa, peduli, bijaksana",
   "Terbuka, ramah, suka senang-senang",
   "Harmonis, mudah menyetujui"
  ],
  "most": "DSXX",
  "least": "DSIC"
 },
 {
  "options": [
   "Rewel, cerewet, sulit untuk dipuaskan hatinya",
   "Taat, melakukan apa yg diperintahkan, patuh",
   "Tidak mudah mundur, fokus akan satu hal, ulet",
   "Suka melucu, lincah, periang"
  ],
  "most": "XSDI",
  "least": "CXDI"
 },
 {
  "options": [
   "Berani, tidak gentar, tangguh",
   "Membangkitkan semangat, memotivasi",
   "Patuh, berhasil, menyerah",
   "Takut-takut, malu, pendiam"
  ],
  "most": "DIXX",
  "least": "XXSC"
 },
 {
  "options": [
   "Suka bergaul dan ber-sosialisasi",
   "Sabar, penuh keyakinan, bersikap toleransi",
   "Percaya diri, mandiri",
   "Berwatak halus/lembut, pendiam, suka menyendiri"
  ],
  "most": "ISDC",
  "least": "ISDX"
 },
 {
  "options": [
   "Menyukai hal-hal baru, suka tantangan",
   "Terbuka dan mau menerima ide-ide baru dan saran",
   "Ramah, hangat, bersahabat",
   "Moderat, menghindari hal-hal yg ekstrim atau aneh"
  ],
  "most": "DCXS",
  "least": "DXIS"
 },
 {
  "options": [
   "Banyak bicara, cerewet",
   "Terkendali, mudah diatur",
   "Melakukan hal-hal yg sudah biasa, tidak berlebihan",
   "Tegas, cepat dalam membuat keputusan"
  ],
  "most": "ISXD",
  "least": "ISCD"
 },
 {
  "options": [
   "Berbudi bahasa halus, tingkah laku halus",
   "Berani, suka mengambil resiko",
   "Diplomatik, bijaksana",
   "Mudah puas atau senang"
  ],
  "most": "XDCS",
  "least": "IDXS"
 },
 {
  "options": [
   "Agresif, suka tantangan, penuh inisiatif",
   "Menyukai hiburan, ramah, suka pesta/acara kumpul",
   "Pengikut, mudah didayagunakan oleh orang lain",
   "Gelisah, khawatir"
  ],
  "most": "DISX",
  "least": "XISC"
 },
 {
  "options": [
   "Berhati-hati",
   "Fokus pada satu hal tertentu, tidah mudah goyah",
   "Meyakinkan",
   "Baik hati, menyenangkan"
  ],
  "most": "CDIS",
  "least": "CXIX"
 },
 {
  "options": [
   "Rela berkorban, mengikuti arus",
   "Antusias, selalu ingin tahu",
   "Mudah menyetujui",
   "Lincah, antusias"
  ],
  "most": "SXCX",
  "least": "XICD"
 },
 {
  "options": [
   "Percaya diri, yakin pada diri sendiri",
   "Simpatik, orang yg pengertian",
   "Toleran",
   "Tegas, agresif"
  ],
  "most": "IXXD",
  "least": "XSCD"
 },
 {
  "options": [
   "Disiplin, terkendali",
   "Dermawan, suka berbagi",
   "Suka berekspresi, banyak menggerakkan tubuh",
   "Gigih, tidak mudah menyerah"
  ],
  "most": "CSXD",
  "least": "XSID"
 },
 {
  "options": [
   "Terpuji, dapat dikagumi, patut dipuji",
   "Ramah, senang menolong",
   "Mudah Menyerah/menerima pendapat yg lain",
   "Memiliki karakter kuat, tangguh"
  ],
  "most": "ISXD",
  "least": "XXCD"
 },
 {
  "options": [
   "Menunjukkan rasa hormat",
   "Pelopor, perintis, giat, mau berusaha",
   "Optimis, pandangan positif",
   "Selalu siap untuk membantu"
  ],
  "most": "CDIS",
  "least": "XDIS"
 },
 {
  "options": [
   "Dapat ber-argumentasi",
   "Fleksibel, mudah beradaptasi",
   "Tak peduli, acuh tak acuh, tidak perhatian",
   "Riang, tiada yg dipikirkan sama sekali"
  ],
  "most": "DCXI",
  "least": "DXSI"
 },
 {
  "options": [
   "Dapat dipercaya, percaya kepada orang lain",
   "Mudah puas, selalu merasa cukup",
   "Selalu positif, tidak diragukan",
   "Tenang, Pendiam"
  ],
  "most": "SXDC",
  "least": "ISDC"
 },
 {
  "options": [
   "Mudah bergaul, suka berteman",
   "Berbudaya, memiliki banyak pengetahuan",
   "Bersemangat, giat",
   "Toleransi, tidak tegas"
  ],
  "most": "IXDS",
  "least": "ICDS"
 },
 {
  "options": [
   "Menyenangkan, ramah",
   "Teliti, akurat",
   "Terus terang, bicara bebas",
   "Terkendali, emosi terkendali"
  ],
  "most": "ICDX",
  "least": "IXDS"
 },
 {
  "options": [
   "Resah, tidak bisa santai",
   "Baik hati, ramah",
   "Populer, disukai banyak orang",
   "Rapi, teratur"
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
  "strengths": [
   "Kemampuan untuk menyelesaikan tugas berat dengan benar pada kali pertama",
   "Sensitif dan peka terhadap kesalahan saat kemampuan presisi dan akurasi diperlukan",
   "Melakukan pendekatan yang profesional dan disiplin pada hal yang berkaitan dengan bidang keahlian mereka",
   "Keterampilan berorganisasi, mampu mengatur waktu secara bijaksana"
  ],
  "improve": [
   "Tidak terlalu perfeksionis",
   "Bersikap lebih luwes (tidak semua hal harus selalu sesuai dengan aturan)",
   "Meningkatkan antusiasme, mengurangi ketergantungan pada data"
  ],
  "pursues": "Akurasi dan kualitas",
  "judged": "Hasil kerjanya yang baik (menyajikan bukti dan fakta)",
  "influence": "Penggunaan data dan ketepatannya",
  "value": "Memiliki standar tinggi untuk diri sendiri dan bawahan, serta disiplin yang baik",
  "overuse": "Aturan dan ketentuan",
  "stress": "Menjadi terlalu kritis terhadap diri sendiri dan orang lain",
  "fear": "Keputusan beresiko tinggi"
 },
 "Coordinator #21": {
  "strengths": [
   "Kemampuan untuk menetapkan dan mencapai standar perilaku dan kerja yang tinggi",
   "Sensitif dan peka terhadap masalah, aturan, kesalahan, dan prosedur",
   "Kemampuan untuk membuat keputusan sulit tanpa melibatkan emosi",
   "Kemampuan untuk memahami apa yang dibutuhkan suatu sistem agar tetap terjaga kualitasnya"
  ],
  "improve": [
   "Jujur mengungkapkan pendapatnya tentang suatu masalah",
   "Mengurangi anggapan bahwa setiap perubahan akan selalu berdampak pada rusaknya hubungan atau kualitas",
   "Meningkatkan percaya diri, saling mengandalkan antar anggota tim"
  ],
  "pursues": "Keamanan dan kerapian",
  "judged": "Standar yang tepat",
  "influence": "Dapat diandalkan, memperhatikan hal detail",
  "value": "Berhati-hati, dapat mempertahankan standar",
  "overuse": "Ketergantungan pada SOP",
  "stress": "Menjadi tertutup, keras kepala",
  "fear": "Pertentangan"
 },
 "Implementor #24": {
  "strengths": [
   "Kemampuan untuk menyelesaikan pekerjaan yang berkualitas sambil mengeksplorasi cara-cara baru untuk meningkatkan kuantitas",
   "Kemampuan untuk membuat keputusan yang sulit menggunakan wawasan dan fakta, namun tetap tidak emosional",
   "Daya juang yang tinggi untuk menemukan solusi paling tepat untuk sebuah masalah",
   "Ahli dibidangnya dan mampu memacu tim untuk mencapai kinerja yang lebih baik"
  ],
  "improve": [
   "Peka terhadap perasaan orang lain",
   "Tidak terlalu blak-blakan dan terusterang",
   "Menunjukkan lebih banyak ketulusan"
  ],
  "pursues": "Merancang sistem",
  "judged": "Standar pribadi mereka yang tinggi",
  "influence": "Dapat mengatur ritme kerja dalam mengembangkan sistem",
  "value": "Pekerja yang teliti dan berhati-hati",
  "overuse": "Fakta dan angka",
  "stress": "Terlalu gelisah",
  "fear": "Kekacauan"
 },
 "Analyzer #60": {
  "strengths": [
   "Seorang promotor sistem yang berkualitas",
   "Paham jika suatu hal mendesak untuk diselesaikan namun tetap mempertahankan standar yang tinggi",
   "Terorganisir, bahkan dalam hubungan sekalipun. Menghargai orang-orang dengan ide-ide yang serupa, suka kerapihan dan sadar kualitas",
   "Peka terhadap perubahan di lingkungan sosial dan pekerjaan"
  ],
  "improve": [
   "Lebih menerima ide dan kepercayaan yang dianut orang lain",
   "Menyusun target yang realistis",
   "Tidak terlalu peduli pada komentar orang lain"
  ],
  "pursues": "Diplomatis",
  "judged": "Siapa yang mereka kenal, gengsi dan pencapaian",
  "influence": "Strateginya dalam membangun relasi yang baik",
  "value": "Menciptakan lingkungan kerja yang baik",
  "overuse": "Kebijaksanaan",
  "stress": "Menjadi terlalu ramah",
  "fear": "Harus mengabaikan kualitas demi menjaga hubungan baik."
 },
 "Analyzer #55": {
  "strengths": [
   "Kemampuan untuk menyelesaikan banyak proyek dengan standar tinggi",
   "Memiliki intuisi yang kuat pada hal-hal tertentu",
   "Mendelegasi orang lain untuk membantunya mencapai hasil yang diinginkan",
   "Mampu mempertahankan standar dengan mengikuti prosedur yang teruji"
  ],
  "improve": [
   "Tidak bersikap terlalu mengendalikan dalam berbagai situasi",
   "Bersikap realistis saat menilai orang lain",
   "Meningkatkan kemampuan beradaptasi di bawah tekanan"
  ],
  "pursues": "Tantangan yang banyak",
  "judged": "Keahlian dan komitmen mereka",
  "influence": "Sifat optimisnya",
  "value": "Mampu membagi tugas kepada anggota tim sesuai dengan kapasitasnya masing-masing",
  "overuse": "Prosedur standar",
  "stress": "Terlalu mengendalikan",
  "fear": "Meleset dari Deadline"
 },
 "Analyzer #38": {
  "strengths": [
   "Kemampuan berjuang dengan kesungguhan untuk memastikan kualitas dan kebenaran dari sebuah prosedur dan / atau hasil",
   "Kemampuan untuk mengajukan pertanyaan yang tepat demi mengungkap fakta yang tersembunyi",
   "Menghindari sikap pilih kasih saat mengevaluasi personil dalam tim",
   "Akan menggabungkan keterampilan analitis dan intuitif ketika berhadapan dengan masalah yang kompleks"
  ],
  "improve": [
   "Tidak bersikap  terlalu analitis dalam berusaha mencari kebenaran",
   "Tidak memendam emosi dan mulai lebih banyak menyampaikan gagasan kepada orang lain",
   "Berbagi informasi, kerja sama tim"
  ],
  "pursues": "Pemecah masalah",
  "judged": "Penggunaan data mereka",
  "influence": "Kekuatannya pada fakta dan angka",
  "value": "Secara sukarela menerima tugas analitis yang menantang",
  "overuse": "Kesempurnaan",
  "stress": "Menjadi tidak sopan",
  "fear": "Kontak dengan orang lain, hal yang berisiko tinggi dan kurangnya privasi"
 },
 "Conductor #1": {
  "strengths": [
   "Kemampuan untuk mengatasi masalah sulit yang kompleks",
   "Progresif, agresif dan kompetitif",
   "Kemampuan untuk bekerja di lingkungan yang heterogen dan dinamis",
   "Memulai pergerakan dan menetapkan langkah untuk mencapai hasil yang diinginkan"
  ],
  "improve": [
   "Tidak bersikap terlalu keras, egois, dan blak-blakan",
   "Tidak memaksa orang lain yang tidak memiliki komitmen pada suatu proyek untuk mengerjakannya",
   "Bersikap sabar, peduli terhadap orang lain, rendah hati"
  ],
  "pursues": "Dominasi dan kemandirian",
  "judged": "Kemampuan mereka untuk menyelesaikan tugas dengan cepat",
  "influence": "Kekuatan karakter, ketekunan",
  "value": "Memiliki attitude",
  "overuse": "Tantangan dan kompetisi",
  "stress": "Menjadi pendiam dan analitis",
  "fear": "Kehilangan kontrol"
 },
 "Persuader #12": {
  "strengths": [
   "Berorientasi pada hasil dan memiliki urgensi untuk dapat menyelesaikan target sesuai deadline yang telah ditentukan",
   "Tegas dan agresif ketika dihadapkan dengan tantangan",
   "Memulai aktivitas dengan mendelegasi orang lain (tim) untuk mendapatkan hasil yang diinginkan",
   "Ekstrovert dan senang menjalin relasi dengan berbagai orang"
  ],
  "improve": [
   "Tidak bersikap terlalu kesal jika deadline tertunda atau terlewati",
   "Tidak mengambil terlalu banyak tanggung jawab pada satu waktu, bersikap lebih konsisten",
   "Meningkatkan kinerja, bersikap lebih terusterang, mengurangi ekspektasi"
  ],
  "pursues": "Agresif dan percaya diri untuk menang",
  "judged": "Kemampuan berkomunikasi dan berpikir",
  "influence": "Memiliki keramahan dan keinginan yang kuat untuk mencapai target",
  "value": "Perencana yang baik, pemecah masalah dan banyak akal",
  "overuse": "Posisi (jabatan) dan cara kerja mereka pribadi",
  "stress": "Menjadi gelisah, tidak sabar dan tidak sensitif",
  "fear": "Kekalahan dan kekacauan"
 },
 "Implementor #9": {
  "strengths": [
   "Menetapkan standar tinggi untuk diri sendiri dan orang lain, mengharapkan kinerja yang baik dan kerja tim",
   "Sadar dan peka terhadap dampak yang akan ditimbulkan dari suatu kesalahan dan kekeliruan",
   "Menggunakan waktu secara terstruktur",
   "Memecahkan masalah secara sistematis tanpa membiarkan emosi memengaruhi keputusan"
  ],
  "improve": [
   "Bersikap lebih hangat dan menghargai anggota tim lainnya",
   "Bisa membedakan antara \"buruknya kualitas yang disebabkan oleh suatu keputusan yang salah\" versus kualitas yang memang sudah bermasalah dari awal",
   "Tidak bersikap blak-blakan atau terlalu mengkritisi orang lain yang tidak memenuhi standar mereka"
  ],
  "pursues": "Dominasi dan kepeloporan",
  "judged": "Standar dan ide-ide progresif mereka",
  "influence": "Ketertarikannya pada kompetisi dan tantangan yang unik",
  "value": "Mandiri dalam menciptakan perubahan ",
  "overuse": "Blak-blakan dan terlalu kritis",
  "stress": "Mendikte dan menuntut",
  "fear": "Tidak memiliki pengaruh"
 },
 "Conductor #57": {
  "strengths": [
   "Kemampuan untuk memunculkan ide-ide baru dan menindaklanjutinya hingga selesai",
   "Mengapresiasi orang lain yang merupakan anggota di dalam tim",
   "Kemampuan melihat \"gambaran besar\" beserta detail kecilnya",
   "Memiliki tekad dan kegigihan"
  ],
  "improve": [
   "Tidak terlalu fokus pada satu masalah sehingga kehilangan peluang lainnya",
   "Tidak terlalu berpegang pada standar pribadi",
   "Mendiskusikan prioritas kerja dengan anggota tim lainnya"
  ],
  "pursues": "Tekad yang kuat",
  "judged": "Jumlah pekerjaan yang mereka selesaikan",
  "influence": "Kegigihan dan ketekunannya",
  "value": "Berorientasi pada hasil dan konsisten",
  "overuse": "Mengandalkan diri sendiri",
  "stress": "Keras kepala, pendiam dan tidak demonstratif",
  "fear": "Keterlibatan dengan terlalu banyak orang"
 },
 "Conductor #27": {
  "strengths": [
   "Mampu mendelegasi orang lain untuk mencapai targetnya",
   "Menghadapi rintangan dan tantangan dengan optimis",
   "Memiliki target personal yang tinggi",
   "Memiliki rasa keterdesakan (sense of urgency) untuk mewujudkan sesuatu"
  ],
  "improve": [
   "Lebih teliti dengan hal detail",
   "Bersikap lebih santai saat mendelegasikan semua pekerjaan",
   "Lebih konsisten ketika mendisiplinkan orang lain"
  ],
  "pursues": "Secara agresif mendelegasi orang untuk mencapai hasil yang diinginkan",
  "judged": "Partisipasi dalam tim",
  "influence": "Sika persuasif yang dimilikinya",
  "value": "Berinovasi dan futuristik",
  "overuse": "Tekad yang kuat",
  "stress": "Tidak sabar dan mengendalikan",
  "fear": "Tidak mencapai tujuan yang diinginkan"
 },
 "Conductor #42": {
  "strengths": [
   "Kemampuan untuk mengekspresikan ide secara logis tanpa melibatkan perasaan",
   "Konsentrasi tunggal hanya pada target dan masalah-masalah vital",
   "Meneliti dengan cermat orang - orang sekitar yang dapat memengaruhi kinerjanya",
   "Kemampuan untuk menjelaskan data teknis dengan jelas dan menerjemahkan teori menjadi solusi yang bisa diterapkan"
  ],
  "improve": [
   "Berbagi pengetahuan, pikiran, dan perasaan dengan orang lain",
   "Tidak ragu untuk bertindak di bawah tekanan berat",
   "Meningkatkan kemampuan berinteraksi dan berbicara"
  ],
  "pursues": "Mampu memenuhi kebutuhannya secara mandiri",
  "judged": "Pemahaman dan kekuatan penalaran",
  "influence": "Sikap rasional dan tidak terusterang",
  "value": "Inisiatif, berorientasi pada tujuan",
  "overuse": "Kemandirian",
  "stress": "Ambivalen dan pesimis",
  "fear": "Deadline tanpa alokasi waktu untuk mengecek kualitas hasil pekerjaan"
 },
 "Supporter #5": {
  "strengths": [
   "Kemampuan untuk bersikap tenang dan terkendali, menggunakan kemampuan konsentrasi sebagai sarana untuk mendengarkan dan belajar",
   "Kemampuan untuk tetap konsisten menjalani tugas yang dapat memberikan kontribusi berarti bagi organisasi",
   "Seorang anggota tim yang besifat terbuka, sabar dan toleran terhadap perbedaan",
   "Senang memuji orang lain"
  ],
  "improve": [
   "Menunjukkan urgensi/keterdesakan saat diperlukan",
   "Mengurangi ketergantungan pada rutinitas",
   "Meningkatkan inisiatif, dan kemampuan beradaptasi pada perubahan"
  ],
  "pursues": "Stabilitas dan keterandalan",
  "judged": "Konsistensi mereka",
  "influence": "Watak yang menyenangkan, melayani orang lain",
  "value": "Menstabilkan lingkungan dengan cara yang baik",
  "overuse": "Tetap bersikap tenang",
  "stress": "Tidak ekspresif",
  "fear": "Tidak dihargai, dan tidak dikenal"
 },
 "Coordinator #20": {
  "strengths": [
   "Kemampuan untuk memulai sebuah proyek dan menindaklanjutinya sampai selesai",
   "Bersedia bekerja untuk pemimpin dan mengerjakan pekerjaan diluar jobdescnya saat diperlukan",
   "Pandai mencari solusi yang komprehensif dan menyenangkan bagi semua yang terlibat dengan menggunakan logika",
   "Memimpin dengan energi yang positif, mempertimbangan perasaan orang lain dalam tim dalam setiap keputusan"
  ],
  "improve": [
   "Belajar untuk mempromosikan kemampuan diri agar orang lain tau",
   "Menggunakan pendekatan langsung pada masalah",
   "Menyampaikan kekhawatiran dan apa yang ia rasakan pada anggota tim"
  ],
  "pursues": "Mencapai standar tinggi (yang ia tetapkan untuk dirinya sendiri)",
  "judged": "Penggunaan pengetahuan mereka",
  "influence": "Kemampuan untuk menindaklanjuti suatru pekerjaan",
  "value": "Menggunakan logika fokus saat dibutuhkan",
  "overuse": "Menolak perubahan",
  "stress": "Mempunyai tekad yang kuat, keras kepala",
  "fear": "Tidak memenuhi syarat tertentu yang spesifik"
 },
 "Relater #17": {
  "strengths": [
   "Keterampilan mendengarkan yang baik dilengkapi dengan kemampuan berempati kepada orang lain",
   "Terampil dalam membantu dan mendukung orang lain mencapai tujuan dan aspirasinya",
   "Berbakat dalam memahami perasaan, kepercayaan, dan nilai-nilai yang diyakini orang lain",
   "Kemampuan untuk menciptakan lingkungan di mana orang merasa dirinya penting/dibutuhkan"
  ],
  "improve": [
   "Bersikap tegas dan teguh pada pendirian",
   "Tidak terlena dengan status quo",
   "Meningkatkan kekuatan, ketegasan, dan kepercayaan diri"
  ],
  "pursues": "Menerima keadaaan",
  "judged": "Loyalitas, ketulusan, keterandalan",
  "influence": "Pengertian, bersahabat",
  "value": "Mendukung, menyelaraskan dan memberikan stabilitas meski di bawah tekanan",
  "overuse": "Kebaikan, kasih sayang",
  "stress": "Menyendiri",
  "fear": "Pertikaian, konflik, tidak disukai"
 },
 "Supporter #59": {
  "strengths": [
   "Kemampuan untuk menghadapi masalah dan menyelesaikannya dengan baik",
   "Gigih, logis, bertekad kuat, dan ulet dalam mengejar target",
   "Pandai menjaga hubungan baik di dalam maupun di luar pekerjaan",
   "Anggota tim yang memancarkan jiwa kepemimpinan dan mampu mempertahankan apa yang mereka yakini benar"
  ],
  "improve": [
   "Kurangi bersikap pasif, bahkan jika hal itu dapat mengancam keamanan mereka",
   "Menggunakan pemikiran dari sudut pandang baru dan kreatif saat memecahkan masalah",
   "Tidak menolak situasi baru yang mungkin mengharuskan untuk keluar dari zona nyaman"
  ],
  "pursues": "Pencapaian personal",
  "judged": "Prestasi dan keberhasilan mereka",
  "influence": "Kegigihan  ",
  "value": "Bekerja secara mandiri dan menyukai tantangan",
  "overuse": "Blak-blakan, terlalu kritis",
  "stress": "Keras kepala, tidak fleksibel, keras hati",
  "fear": "Tidak mencapai hasil yang diinginkan"
 },
 "Supporter #35": {
  "strengths": [
   "Kemampuan untuk mendukung, bersikap ramah, dan optimis dalam hubungan apa pun",
   "Mudah bergaul dan mampu menikmati berbagai keunikan yang berbeda dari setiap manusia",
   "Kemampuan untuk mengambil keputusan yang seimbang, membawa stabilitas ke seluruh tim",
   "Bagus dalam menganalisis situasi yang dapat dirasakan, disentuh, dilihat, didengar, diamati atau dialami secara pribadi"
  ],
  "improve": [
   "Tetap fokus pada peran dan harapan agar bisa bekerja lebih efektif",
   "Memiliki rasa keterdesakan (sense of urgency)",
   "Lebih menghargai metode pintas (tidak harus selalu menggunakan metode yang lengkap dan sempurna)"
  ],
  "pursues": "Status quo",
  "judged": "Pertemanan",
  "influence": "Konsistensi dalam kinerja, dan mampu mengakomodasi",
  "value": "Perencana, konsisten, dapat mempertahankan ritme kerja",
  "overuse": "Sederhana dan kolot",
  "stress": "Pendendam",
  "fear": "Konflik, dipermalukan"
 },
 "Supporter #50": {
  "strengths": [
   "Kemampuan untuk tetap bersikap mandiri meskipun memiliki rasa empati yang tinggi",
   "Unggul dalam urusan yang membutuhkan tekad dan kegigihan yang kuat untuk berhasil",
   "Mampu memberi pengaruh positif pada anggota tim yang tidak kooperatif atau bersikap negatif",
   "Lihai menggiring lawan bicara untuk bernegosiasi dan mampu mendengarkan pendapat yang berbeda"
  ],
  "improve": [
   "Membuat skala prioritas kegiatan harian",
   "Lebih mempertimbangkan pro dan kontra terkait suatu masalah",
   "Bersikap lebih tegas dan konsisten atas pendirian mereka"
  ],
  "pursues": "Sukses melalui konsistensi",
  "judged": "Pertemanan mereka yang loyal",
  "influence": "Keterampilan persuasif",
  "value": "Memecahkan masalah secara kreatif dan berinovasi melalui orang-orang",
  "overuse": "Intensitas",
  "stress": "Bersemangat, kuat",
  "fear": "Tidak didukung oleh tim dan perubahan"
 },
 "Promoter #3": {
  "strengths": [
   "Seseorang yang sangat optimis dengan selera humor yang positif",
   "Memperhatikan orang lain dan menaruh kepercayaan tinggi dalam suatu hubungan relasi",
   "Mudah berteman dengan orang baru, senang berjejaring",
   "Menggunakan pendekatan konsensus (musyawarah) untuk pengambilan keputusan"
  ],
  "improve": [
   "Mengawasi target pekerjaan",
   "Mengurangi rasa terlalu peduli pada perasaan orang lain",
   "Menjadi lebih terorganisir dan bersikap realistis"
  ],
  "pursues": "Melayani dan mengakomodasi",
  "judged": "Kehangatan mereka",
  "influence": "Keterampilan interpersonal dan bersahabat",
  "value": "Pandai mengkomunikasikan \"mimpi besar\", memiliki kemampuan untuk menyatukan tim",
  "overuse": "Kebergantungan pada orang lain dan optimisme",
  "stress": "Terlalu mendahulukan emosi",
  "fear": "Tidak cukup disukai orang lain"
 },
 "Persuader #13": {
  "strengths": [
   "Kemampuan untuk mempengaruhi orang lain supaya sejalan dengan pendapatnya",
   "Berkomunikasi dengan sangat terbuka",
   "Kemampuan untuk menenangkan situasi konflik",
   "Kemampuan untuk mempromosikan ide dan produk baru"
  ],
  "improve": [
   "Mengurangi keterlibatan emosi saat mengambil keputusan",
   "Bersedia berkonfrontasi saat diperlukan",
   "Mempunyai deadline yang realistis dan pandai mengatur waktu"
  ],
  "pursues": "Memelihara hubungan pertemanan",
  "judged": "Relasi mereka yang memiliki pengaruh, komitmen",
  "influence": "Inspirasi dan karisma",
  "value": "Stabil, dapat diandalkan, memiliki jaringan yang luas",
  "overuse": "Antusiasme",
  "stress": "Terlalu banyak bicara",
  "fear": "Kegagalan"
 },
 "Relater #16": {
  "strengths": [
   "Kemampuan untuk membantu orang lain menggunakan kehangatan, empati dan pengertian",
   "Melindungi dan menghargai orang maupun benda",
   "Pendengar dan pembicara yang baik"
  ],
  "improve": [
   "Bersikap tegas dan teguh pada keputusan ketika dibutuhkan",
   "Tidak menghindari konfrontasi, bahkan ketika berisiko",
   "Lebih inisiatif, memiliki rasa keterdesakan (sense of urgency)"
  ],
  "pursues": "mempertahankan pertemanan jangka panjang",
  "judged": "Loyalitas mereka terhadap suatu hubungan",
  "influence": "Memberi contoh yang baik dalam hubungan personal",
  "value": "Pendengar yang baik, sabar menghadapi orang lain",
  "overuse": "Toleransi",
  "stress": "Pendendam, gelisah dalam situasi yang penuh tekanan",
  "fear": "Konfrontasi"
 },
 "Promoter #58": {
  "strengths": [
   "Kemampuan untuk menangani situasi sulit dengan bijaksana, peka terhadap kebutuhan orang lain",
   "Kemampuan untuk menciptakan suasana yang menyenangkan dan nyaman",
   "Kemampuan untuk menyampaikan ide secara efektif",
   "Lebih nyaman berada pada lingkungan yang pergerakannya cepat"
  ],
  "improve": [
   "Tidak terlalu analitis berlebih demi mencapai akurasi",
   "Mengomunikasikan lebih sedikit informasi saat menjual produk atau ide",
   "Menjadi lebih tegas"
  ],
  "pursues": "Persetujuan dan penerimaan",
  "judged": "Kemampuan mereka membaca gelagat verbal dan nonverbal",
  "influence": "Ketenangan dan kepercayaan diri",
  "value": "Pencair suasana, pandai dalam mempromosikan orang dan proyek",
  "overuse": "Mendominasi pada percakapan",
  "stress": "Kata-katanya pedas terhadap orang lain",
  "fear": "Kehilangan ciri khas"
 },
 "Promoter #47": {
  "strengths": [
   "Kemampuan untuk beradaptasi dalam banyak situasi",
   "Anggota tim yang optimis, mudah bergaul, dan kooperatif",
   "Akan berusaha untuk menyatukan tim secara teratur",
   "Sabar mendengarkan apa yang orang lain katakan"
  ],
  "improve": [
   "Mengurangi keramah-tamahan terhadap orang lain",
   "Menampilkan ketegasan dengan lebih konsisten",
   "Bersikap lebih terusterang dan meningkatkan kemampuan manajemen waktu "
  ],
  "pursues": "Mampu mengarahkan timnya untuk menyusun hasil kerja yang sistematis",
  "judged": "Kemampuan mereka untuk berkomunikasi dan berpikir",
  "influence": "Diplomasi",
  "value": "Berhati-hati dan berkepribadian",
  "overuse": "Posisi dan standar mereka",
  "stress": "Posesif dan terlalu sensitif",
  "fear": "Tidak menjadi bagian dari tim"
 },
 "Promoter #30": {
  "strengths": [
   "Kemampuan untuk menjadi persuasif, tegas dan bersikap tenang",
   "Kemampuan untuk menjadi mandiri ketika dibutuhkan",
   "Kemampuan untuk membuat dan menyampaikan ide pada orang lain",
   "Kemampuan untuk mempresentasikan ide dengan baik dan gamblang"
  ],
  "improve": [
   "Mengurangi sikap berpendirian terlalu keras",
   "Mengumpulkan informasi yang cukup sebelum bertindak",
   "Lebih memperhatikan hal detail, dan terorganisir"
  ],
  "pursues": "Pandai bersosialisasi dan meyakinkan",
  "judged": "Dedikasi dan keuletan mereka",
  "influence": "Mengambil tanggungjawab",
  "value": "Antusias dan berterusterang akan gagasan dan pendapat baru",
  "overuse": "Ambisi",
  "stress": "Dangkal",
  "fear": "Tidak dianggap sebagai anggota tim"
 }
};
