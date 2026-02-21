# Neverlabs Cloud's

Neverlabs Cloud's adalah aplikasi web frontend statis yang memungkinkan pengguna untuk mengunggah, mengelola, dan membagikan berbagai jenis file (gambar, video, audio, dokumen, dan file teks) dengan integrasi Cloudinary. Aplikasi ini dirancang dengan antarmuka modern, responsif, dan mendukung fitur manajemen file berbasis folder, pratinjau media, serta penyuntingan teks secara langsung.

Dibangun murni dengan HTML, CSS, dan JavaScript, serta memanfaatkan localStorage untuk menyimpan metadata, aplikasi ini dapat dihosting di GitHub Pages atau layanan statis lainnya tanpa memerlukan backend server.

---

## Fitur Utama

- **Manajemen File & Folder**
  - Buat, hapus, dan ubah nama folder.
  - Navigasi folder secara hierarkis.
  - Pindahkan file antar folder.

- **Unggah Media**
  - Unggah gambar, video, audio, dan dokumen (PDF, DOC, TXT, dll.) melalui widget Cloudinary.
  - Dukungan untuk berbagai format file dengan batasan ukuran 100MB.
  - Beri nama khusus untuk setiap file setelah unggah.

- **Pratinjau Media**
  - Tampilan gambar dengan opsi kualitas (Auto, HD, 4K).
  - Pemutar video dan audio bawaan.
  - Untuk file teks (TXT, PY, JS, HTML, CSS, MD, JSON), ditampilkan dalam editor bergaya GitHub dengan sintaks highlight.
  - Tombol salin tautan dan bagikan (Web Share API jika didukung).

- **Catatan Teks**
  - Buat catatan teks baru langsung dari antarmuka.
  - Edit catatan teks yang sudah ada di halaman pratinjau.
  - Penyimpanan teks menggunakan konfigurasi Cloudinary terpisah (raw).

- **Sinkronisasi dengan Cloudinary**
  - Ambil daftar file yang sudah ada di akun Cloudinary (memerlukan API Key dan Secret).
  - File yang belum tercatat di localStorage akan ditambahkan secara otomatis.

- **Keamanan dan Privasi**
  - Semua konfigurasi (Cloud Name, Upload Preset, API Key) disimpan di localStorage perangkat pengguna.
  - Tidak ada data yang dikirim ke server selain ke API Cloudinary.
  - Kredensial API bersifat opsional dan hanya digunakan untuk sinkronisasi.

- **Antarmuka Responsif**
  - Tampilan desktop dengan sidebar tetap.
  - Tampilan mobile dengan drawer navigasi yang dapat diakses melalui gesek dari tepi kiri.
  - Tombol aksi utama (unggah, folder baru, buat teks) berubah menjadi ikon bulat di pojok kanan bawah pada perangkat mobile.

---

## Teknologi yang Digunakan

- **HTML5** – Struktur halaman.
- **CSS3** – Styling modern dengan tema gelap, tata letak fleksibel, dan media query untuk responsivitas.
- **JavaScript (ES6+)** – Logika aplikasi, manajemen state, komunikasi dengan Cloudinary.
- **Cloudinary Widget** – Widget unggah resmi dari Cloudinary untuk kemudahan integrasi.
- **Cloudinary REST API** – Digunakan untuk mengunggah file teks dan sinkronisasi.
- **Font Awesome 6** – Ikon vektor untuk antarmuka yang menarik.
- **localStorage & sessionStorage** – Penyimpanan metadata dan status folder.

---

## Struktur Proyek
/
├── index.html # Halaman utama aplikasi
├── preview.html # Halaman pratinjau file
├── css/
│ ├── style.css # Gaya utama (desktop & mobile)
│ └── preview.css # Gaya khusus halaman pratinjau
├── js/
│ ├── config.js # Konfigurasi dan helper Cloudinary
│ ├── storage.js # Manajemen localStorage (CRUD data)
│ ├── ui.js # Render folder tree dan grid file
│ ├── upload.js # Logika unggah media dan teks
│ ├── app.js # Inisialisasi dan event handlers utama
│ └── preview.js # Logika halaman pratinjau (termasuk edit teks)
└── README.md # Dokumentasi ini
/
