# Copilot Driver - Asisten Cerdas Mitra Pengemudi

Aplikasi Web Progresif (PWA) yang dirancang khusus untuk mitra pengemudi ojek online dan taksi online (ride-hailing). Aplikasi ini berfungsi sebagai asisten pintar (Copilot) dengan UI/UX yang modern, kokoh, dan fungsional. Menganalisa data titik keramaian, cuaca, waktu sibuk, serta kondisi jalan raya untuk merekomendasikan area dengan peluang pesanan tinggi secara *real-time*.

## 🚀 Fitur Utama

1. **Analisa Cerdas (Heuristic & AI)**: Menggunakan algoritma presisi dan heuristik berbasis Point of Interest (POI) secara real-time. Memperhitungkan waktu (jam sibuk, jam makan siang), kondisi cuaca (hujan), jarak, dan layanan yang dipilih (Ride, Food, Send).
2. **Peta Heatmap Interaktif (Radar)**: Menampilkan zona keramaian interaktif menggunakan data Overpass API (OSM) langsung di atas peta (Leaflet). Titik panas mewakili area dengan skor potensial yang dihitung secara dinamis.
3. **Peringatan & Rekomendasi Realtime (Smart Alerts)**: Aplikasi memberikan "Live Intel" menyarankan tempat potensial atau peringatan kondisi lalu lintas, mengintegrasikan fitur waktu dan kondisi cuaca di sekitar pengemudi.
4. **Tombol SOS & Keselamatan**: Fitur keamanan dengan satu tombol (Floating SOS) yang mengirim pesan WhatsApp darurat beserta koordinat lokasi pengemudi secara presisi ke nomor kontak yang telah diatur.
5. **Input Order & Shift Summary**: Pengemudi dapat mencatat pendapatan harian secara rinci, termasuk waktu order, kecamatan (di Bandung), jenis layanan, tarif bersih, tips, dan metode pembayaran (tunai/non-tunai). Di akhir hari, fitur *Shift Summary* menyajikan statistik pendapatan komprehensif.
6. **Personalisasi & Pengaturan Kendaraan**: Dapat diatur sesuai dengan layanan (Mobil/Motor) dan fokus order (Penumpang, Makanan, Barang).
7. **PWA (Progressive Web App)**: Dirancang secara *Offline First* dengan kemampuan untuk diinstal langsung di layar beranda ponsel (Add to Home Screen) layaknya aplikasi *native*.

## ⚙️ Logika Algoritma & Scoring

Algoritma *Scoring* mengevaluasi Point of Interest (POI) nyata dari Overpass API dengan perhitungan presisi:

- **Filter Layanan (Service Type)**:
  - `Food`: Fokus pada `amenity=restaurant`, `fast_food`, `cafe`. Mendapat tambahan skor di jam makan siang (11-14) dan jam makan malam (17-21).
  - `Send`: Fokus pada perkantoran, `mall`, `marketplace`, dan kantor pos.
  - `Ride / Semua`: Fokus pada stasiun, sekolah/universitas, dan pusat perbelanjaan, terutama di jam pulang-pergi (Rush Hour).
- **Pengaruh Cuaca**: Permintaan order transportasi (`Ride`) dan makanan (`Food`) mendapatkan pengali tambahan saat kondisi dilaporkan hujan.
- **Efek Jarak (Distance Decay)**: Setiap kilometer jarak tempuh mengurangi skor kelayakan POI untuk memastikan rekomendasi tidak terlalu jauh, kecuali area sekitar sangat sepi.

## 🛠️ Teknologi yang Digunakan

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, Motion (Framer Motion), Leaflet & React-Leaflet.
- **Backend / API Server**: Node.js, Express.js, TypeScript.
- **AI & Data Sources**: Overpass API (OSM) untuk data jalan/bangunan, Google Gemini AI (Opsional untuk analisa cuaca/konteks).
- **PWA Tooling**: `vite-plugin-pwa` dengan `workbox` (Service Worker) terintegrasi untuk *caching* dan instalasi.

## 📱 Panduan Instalasi PWA

1. Buka URL aplikasi di peramban perangkat seluler (disarankan Google Chrome untuk Android, Safari untuk iOS).
2. Browser akan memunculkan spanduk (banner) **"Add to Home Screen"** atau **"Tambahkan ke Layar Utama"**.
3. Jika spanduk tidak muncul otomatis, ketuk ikon menu (tiga titik di sudut kanan atas pada Chrome atau ikon Share di Safari) dan pilih **"Add to Home Screen"**.
4. Aplikasi akan terinstal dan beroperasi tanpa kolom URL peramban (Standalone Mode).

---
> *"Dirancang dengan fokus tinggi pada keselamatan, kenyamanan, dan peningkatan pendapatan mitra pengemudi di jalanan."*
