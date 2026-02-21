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
  - Tombol salin tautan dan bagikan (Web Share API jika mendukung).

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

## Instalasi dan Deployment

### Prasyarat
- Akun Cloudinary (gratis).
- Untuk fitur sinkronisasi, diperlukan API Key dan API Secret (dapatkan dari dashboard Cloudinary).

### Langkah-langkah
1. **Salin semua file** ke repositori GitHub atau hosting statis pilihan.
2. **Konfigurasi Cloudinary**:
   - Buat dua upload preset:
     - Satu untuk media (gambar/video/audio) dengan mode unsigned.
     - Satu untuk teks (raw) dengan mode unsigned.
   - Catat **Cloud Name**, **Upload Preset Media**, dan **Upload Preset Teks**.
3. **Buka aplikasi** melalui browser.
4. **Isi konfigurasi** pada modal yang muncul pertama kali. Jika tidak muncul, klik ikon gear di pojok kanan bawah sidebar.
   - Isi Media Cloud Name dan Upload Preset.
   - Isi Text Cloud Name dan Upload Preset (bisa sama dengan media jika diinginkan).
   - API Key dan Secret bersifat opsional, hanya diperlukan untuk sinkronisasi otomatis.
5. **Mulai gunakan** aplikasi: buat folder, unggah media, buat catatan teks, dan bagikan tautan.

### Deployment di GitHub Pages
- Push semua file ke repositori GitHub.
- Aktifkan GitHub Pages pada branch yang digunakan.
- Akses aplikasi melalui `https://nflora-ux.github.io/Cloud-s/`.

---

## Konfigurasi Cloudinary

### Membuat Upload Preset
1. Login ke [Cloudinary Console](https://console.cloudinary.com).
2. Buka **Settings** > **Upload**.
3. Pada bagian **Upload presets**, klik **Add upload preset**.
4. Beri nama (misal: `neverlabs`), pilih mode **Unsigned**.
5. Atur opsi lain sesuai kebutuhan (folder, format yang diizinkan, dll).
6. Simpan.
7. Ulangi langkah di atas untuk preset teks (misal: `neverlabs_text`), pastikan tipe file yang diizinkan mencakup teks.

### Mendapatkan API Key dan Secret (Opsional)
- Pada dashboard Cloudinary, lihat bagian **Account Details**.
- Salin **API Key** dan **API Secret**. Jangan bagikan kepada siapa pun.

---

## Penggunaan Aplikasi

### Desktop
- **Sidebar kiri**: Menampilkan hierarki folder. Klik folder untuk membuka isinya.
- **Header atas**: Menampilkan nama folder saat ini dan tombol aksi:
  - `Upload Media`: Membuka widget Cloudinary untuk unggah file.
  - `Folder Baru`: Membuat folder baru di lokasi saat ini.
  - `Buat Teks`: Membuka modal untuk membuat catatan teks baru.
- **Grid file**: Menampilkan file dan folder. Klik file untuk membuka pratinjau, klik folder untuk masuk ke folder tersebut.
- **Dropdown menu (titik tiga) pada setiap item**: Rename atau hapus item.

### Mobile
- **Header**: Menampilkan judul "Neverlabs Cloud's" dan tombol folder (drawer).
- **Drawer navigasi**: Muncul dengan menggeser dari tepi kiri atau menekan tombol folder. Berisi hierarki folder dan footer dengan teks "Administrator" serta tombol pengaturan.
- **Tombol aksi utama**: Berada di pojok kanan bawah (ikon bulat): unggah media, folder baru, buat teks.
- **Kembali**: Gunakan tombol "Kembali ke Cloud" di halaman pratinjau.

### Halaman Pratinjau
- Menampilkan file sesuai tipenya.
- **Gambar**: Toolbar kualitas (Auto, HD, 4K) untuk mengubah resolusi.
- **Video/Audio**: Pemutar bawaan.
- **Teks**: Tampilan editor dengan latar gelap, font monospace. Tersedia tombol **Edit** (ikon pensil) untuk mengubah isi teks.
- **Tombol**: Salin tautan dan bagikan (jika perangkat mendukung).
- **Informasi file**: Nama, ukuran, tanggal unggah, tipe, dan tautan ke file asli.

---

## Pengembangan Lebih Lanjut

Aplikasi ini dirancang modular sehingga mudah dikembangkan. Beberapa ide pengembangan:

- **Dukungan multi-pengguna** dengan sistem login sederhana (menggunakan localStorage berbeda).
- **Integrasi penyimpanan lain** seperti Backblaze B2 atau Supabase.
- **Pencarian file** di dalam folder.
- **Drag and drop** untuk unggah dan memindahkan file.
- **Mode offline** dengan service worker.

---

## Lisensi

Proyek ini dibuat untuk keperluan pribadi dan pembelajaran. Silakan gunakan, modifikasi, dan distribusikan sesuai kebutuhan. Tidak ada jaminan atau dukungan resmi.

---

## Kontak

Untuk pertanyaan atau saran, silakan hubungi melalui [GitHub Issues](https://github.com/nflora-ux/Cloud-s/).

---

**Catatan**: Aplikasi ini sepenuhnya berjalan di sisi klien. Pastikan untuk selalu menjaga kerahasiaan API Key dan Secret Anda.

---

<div align="center">
  Copyright &copy; Neverlabs Cloud's. All rights reserved.
</div>
