# Copilot Driver - Aplikasi Asisten Pintar Pengemudi

Aplikasi Web Progresif (PWA) yang dirancang khusus untuk membantu pengemudi ojek online dan taksi online (ride-hailing). Aplikasi ini berfungsi sebagai asisten pintar (Copilot) yang menganalisa data titik keramaian, cuaca, waktu sibuk, serta kondisi jalan raya untuk merekomendasikan area dengan peluang pesanan tinggi secara real-time.

## 🚀 Fitur Utama

1. **Analisa Cerdas (Heuristic & AI)**: Menggunakan algoritma presisi dan heuristik berbasis Point of Interest (POI) secara real-time. Memperhitungkan waktu (jam sibuk, jam makan siang), kondisi cuaca (hujan), jarak, dan layanan yang dipilih (Ride, Food, Send).
2. **Peta Heatmap Interaktif (Radar)**: Menampilkan zona keramaian interaktif menggunakan data Overpass API (OSM) langsung di atas peta (Leaflet). Titik panas mewakili area dengan skor potensial yang dihitung secara dinamis.
3. **Peringatan & Rekomendasi Realtime**: Aplikasi akan terus menyarankan tempat "mangkal" atau target lokasi perpindahan yang spesifik untuk meningkatkan peluang mendapat orderan.
4. **Tombol SOS & Keselamatan**: Fitur keamanan khusus dengan satu tombol (Floating SOS) yang secara otomatis akan mengirim pesan WhatsApp darurat ke nomor yang diatur. Pesan berisi lokasi pengemudi secara akurat dan waktu kejadian.
5. **Manajemen Shift & Resi Penghasilan**: Melacak pendapatan secara harian. Ketika shift diakhiri, aplikasi dapat mencetak struk pendapatan ala *thermal printer* yang merangkum hasil kerja hari itu.
6. **Personalisasi & Pengaturan Kendaraan**: Dapat diatur sesuai dengan layanan (Mobil/Motor) dan fokus order (Penumpang, Makanan, Barang).
7. **PWA (Progressive Web App)**: Dirancang secara _Offline First_ dengan kemampuan dapat diinstal langsung di layar beranda ponsel (Add to Home Screen) layaknya aplikasi native.

## ⚙️ Logika Algoritma & Scoring

Algoritma *Scoring* tidak menggunakan data *mockup*, melainkan mengevaluasi Point of Interest (POI) nyata dari Overpass API dengan perhitungan presisi:

- **Filter Layanan (Service Type)**:
  - `Food`: Fokus pada `amenity=restaurant`, `fast_food`, `cafe`, `supermarket`. Mendapat tambahan skor di jam makan siang (11-14) dan jam makan malam (17-21).
  - `Send`: Fokus pada perkantoran, `mall`, `marketplace`, dan kantor pos.
  - `Ride / Semua`: Fokus pada stasiun, sekolah/universitas, dan pusat perbelanjaan terutama di jam-jam pulang pergi (Rush Hour).
- **Pengaruh Cuaca**: Permintaan order transportasi (`Ride`) dan Makanan (`Food`) akan mendapatkan pengali tambahan saat kondisi dilaporkan sedang hujan.
- **Efek Jarak (Distance Decay)**: Setiap kilometer jarak tempuh mengurangi kelayakan POI. Tempat ramai yang terlalu jauh tidak akan diprioritaskan kecuali di sekitarnya kosong.

## 🛠️ Teknologi yang Digunakan

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, Motion (Framer Motion), Leaflet & React-Leaflet.
- **Backend / API Server**: Node.js, Express.js, TypeScript.
- **AI & Data Sources**: Overpass API (OSM) untuk data jalan/bangunan, Google Gemini AI (Opsional untuk analisa cuaca/konteks).
- **PWA Tooling**: `vite-plugin-pwa` dengan `workbox` (Service Worker) terintegrasi untuk *caching* dan instalasi.

## 📱 Panduan Instalasi (Untuk Pengguna)

1. Buka URL aplikasi di peramban perangkat seluler (disarankan Google Chrome untuk Android, Safari untuk iOS).
2. Browser akan memunculkan spanduk (banner) **"Add to Home Screen"** atau **"Tambahkan ke Layar Utama"**.
3. Jika spanduk tidak muncul secara otomatis, ketuk ikon menu (tiga titik di sudut kanan atas pada Chrome) dan pilih **"Add to Home Screen"**.
4. Aplikasi akan terinstal dan ikon akan muncul di layar beranda, beroperasi tanpa kolom URL peramban (Standalone Mode) memberikan pengalaman layaknya aplikasi asli.

---

> *"Dirancang dengan fokus tinggi pada keselamatan, kenyamanan, dan peningkatan pendapatan mitra pengemudi."*
