# Neverlabs Cloud's

Neverlabs Cloud's adalah aplikasi web penyimpanan file pribadi yang berjalan sepenuhnya di browser Anda. Semua file dan data disimpan secara lokal menggunakan **IndexedDB**, sehingga Anda memiliki kendali penuh atas data Anda tanpa perlu server eksternal. Aplikasi ini mendukung unggah berbagai jenis file (gambar, video, audio, dokumen, teks), manajemen folder, pratinjau, dan penyuntingan teks secara langsung.

Dibangun dengan HTML, CSS, dan JavaScript murni, aplikasi ini responsif dan dapat dihosting di GitHub Pages atau layanan web statis lainnya.

---

## Fitur Utama

- **Manajemen File & Folder**
  - Buat, hapus, dan ubah nama folder.
  - Navigasi folder secara hierarkis.
  - Pindahkan file secara otomatis saat mengunggah ke folder tertentu.

- **Unggah File**
  - Unggah satu atau beberapa file sekaligus melalui tombol atau drag and drop.
  - Drag and drop mendukung file dan folder (termasuk struktur folder) — folder akan dibuat ulang secara otomatis.
  - File disimpan sebagai blob di IndexedDB, metadata disimpan terpisah.

- **Pratinjau Media**
  - Tampilan gambar, video, audio, dan file teks langsung di browser.
  - File teks (txt, js, py, html, css, md, json) ditampilkan dalam editor bergaya GitHub dengan latar gelap.
  - Fitur edit teks pada halaman pratinjau untuk mengubah konten file teks.

- **Catatan Teks**
  - Buat catatan teks baru langsung dari antarmuka.
  - Edit catatan teks yang sudah ada di halaman pratinjau.

- **Ekspor dan Hapus Data**
  - Ekspor seluruh metadata file (daftar file dan folder) ke file JSON sebagai cadangan.
  - Hapus semua data sekaligus (termasuk semua file dan folder) dengan konfirmasi.

- **Keamanan dan Privasi**
  - Semua data tersimpan di perangkat Anda sendiri (IndexedDB).
  - Tidak ada data yang dikirim ke server eksternal.
  - Aplikasi dapat digunakan secara offline setelah dimuat.

- **Antarmuka Responsif**
  - Tampilan desktop dengan sidebar tetap.
  - Tampilan mobile dengan drawer navigasi yang dapat diakses melalui gesek dari tepi kiri.
  - Tombol aksi utama (unggah, folder baru, buat teks) berubah menjadi ikon bulat di pojok kanan bawah pada perangkat mobile.

---

## Teknologi yang Digunakan

- **HTML5** – Struktur halaman.
- **CSS3** – Styling modern dengan tema gelap, tata letak fleksibel, dan media query untuk responsivitas.
- **JavaScript (ES6+)** – Logika aplikasi, manajemen state, operasi IndexedDB.
- **IndexedDB** – Penyimpanan file dan metadata di browser.
- **File API** – Membaca file dari sistem pengguna.
- **Drag and Drop API** – Mendukung unggah file dan folder.
- **Font Awesome 6** – Ikon vektor untuk antarmuka yang menarik.
- **localStorage & sessionStorage** – Menyimpan preferensi folder aktif.

---

## Instalasi dan Deployment

### Prasyarat
- Browser modern yang mendukung IndexedDB dan Drag and Drop API (Chrome, Firefox, Edge, Safari).

### Langkah-langkah
1. **Salin semua file** ke repositori GitHub atau hosting statis pilihan.
2. **Buka aplikasi** melalui browser.
3. **Mulai gunakan** aplikasi: buat folder, unggah file, buat catatan teks, dan kelola data Anda.

### Deployment di GitHub Pages
- Push semua file ke repositori GitHub.
- Aktifkan GitHub Pages pada branch yang digunakan.
- Akses aplikasi melalui `(https://nflora-ux.github.io/Cloud-s/)`.

---

## Penggunaan Aplikasi

### Desktop
- **Sidebar kiri**: Menampilkan hierarki folder. Klik folder untuk membuka isinya.
- **Header atas**: Menampilkan nama folder saat ini dan tombol aksi:
  - `Upload Media`: Membuka dialog pemilihan file (bisa pilih banyak file).
  - `Folder Baru`: Membuat folder baru di lokasi saat ini.
  - `Buat Teks`: Membuka modal untuk membuat catatan teks baru.
- **Grid file**: Menampilkan file dan folder. Klik file untuk membuka pratinjau, klik folder untuk masuk ke folder tersebut.
- **Dropdown menu (titik tiga) pada setiap item**: Rename atau hapus item.
- **Drag and drop**: Seret file atau folder dari komputer Anda ke area konten utama untuk mengunggah. Folder akan dibuat ulang secara otomatis.

### Mobile
- **Header**: Menampilkan judul "Neverlabs Cloud's" dan tombol folder (drawer).
- **Drawer navigasi**: Muncul dengan menggeser dari tepi kiri atau menekan tombol folder. Berisi hierarki folder dan footer dengan teks "Administrator" serta tombol pengaturan.
- **Tombol aksi utama**: Berada di pojok kanan bawah (ikon bulat): unggah media, folder baru, buat teks.
- **Kembali**: Gunakan tombol "Kembali ke Cloud" di halaman pratinjau.

### Halaman Pratinjau
- Menampilkan file sesuai tipenya.
- **Gambar, Video, Audio**: Ditampilkan dengan elemen bawaan browser.
- **Teks**: Tampilan editor dengan latar gelap, font monospace. Tersedia tombol **Edit** (ikon pensil) untuk mengubah isi teks.
- **Informasi file**: Nama, ukuran, tanggal unggah, tipe.

### Pengaturan (Modal Tentang)
- Klik ikon gear di sidebar untuk membuka modal tentang.
- Di sini Anda dapat:
  - Melihat informasi kontak (email, Instagram, WhatsApp, GitHub, Telegram).
  - Mengakses tautan Lisensi MIT dan Kebijakan Privasi.
  - **Ekspor Data**: Menyimpan metadata file ke file JSON.
  - **Hapus Semua Data**: Menghapus seluruh file dan folder (permanen).

---

## Pengembangan Lebih Lanjut

Aplikasi ini dirancang modular sehingga mudah dikembangkan. Beberapa ide pengembangan:

- **Pencarian file** di dalam folder.
- **Mode offline penuh** dengan service worker.
- **Enkripsi file** sebelum disimpan.
- **Sinkronisasi antar perangkat** menggunakan teknologi seperti WebRTC atau library pihak ketiga.

---

## Lisensi

Proyek ini menggunakan lisensi MIT. Silakan lihat file [LICENSE](https://github.com/nflora-ux/Cloud-s/blob/6420f17752e44e7fcb80f2da30a237326259fd6c/LICENSE) untuk informasi lebih lanjut.

---

## Kontak

Untuk pertanyaan atau saran, silakan hubungi melalui:

- Email: [userlinuxorg@gmail.com](mailto:userlinuxorg@gmail.com)
- Instagram: [@neveerlabs](https://instagram.com/neveerlabs)
- WhatsApp: [+62 856-1765-372](https://wa.me/628561765372)
- GitHub: [neveerlabs](https://github.com/neveerlabs)
- Telegram: [@Neverlabs](https://t.me/Neverlabs)

---

## Kebijakan Privasi

Lihat [PRIVACY.md](https://github.com/nflora-ux/Cloud-s/blob/6420f17752e44e7fcb80f2da30a237326259fd6c/PRIVACY.md) untuk informasi tentang penanganan data.

---

<div align="center">
  Copyright &copy; Neverlabs Cloud's. All rights reserved.
</div>
