# Arsitektur Aplikasi Copilot Driver

Dokumen ini menjelaskan struktur arsitektur dan aliran data dari aplikasi **Copilot Driver**.

## 1. Tinjauan Sistem (System Overview)

Copilot Driver dibangun dengan arsitektur Full-Stack menggunakan **Node.js/Express.js** untuk sisi server (Backend) dan **React/Vite** untuk sisi klien (Frontend). Aplikasi ini dirancang agar ringan, responsif, dan dapat berjalan secara mandiri (Standalone) sebagai **Progressive Web App (PWA)** di perangkat seluler pengemudi.

## 2. Komponen Utama

### A. Frontend (Klien React)
- **Framework**: React 18 menggunakan bundler Vite.
- **Styling**: Menggunakan Tailwind CSS untuk utilitas desain yang cepat dan responsif.
- **State Management**: Menggunakan React Hooks bawaan (`useState`, `useEffect`) yang digabungkan dengan `localStorage` untuk persistensi data *offline* seperti pengaturan dan riwayat shift.
- **Peta & Visualisasi (Radar)**: Diimplementasikan menggunakan **Leaflet** dan **react-leaflet**, bersama dengan plugin `leaflet.heat` untuk merender lapisan *heatmap* intensitas orderan di atas peta.
- **Animasi (Motion)**: Menggunakan pustaka **Framer Motion (motion/react)** untuk memberikan transisi halus antar-layar dan feedback komponen UI.
- **Service Worker (PWA)**: Dikelola oleh `vite-plugin-pwa` (Workbox) untuk menyediakan fungsi luring (offline caching) dan instalasi aplikasi *Add to Home Screen*.

### B. Backend (Server Express)
- **Platform**: Node.js dengan framework Express.js.
- **API Endpoints**: 
  - `/api/radar`: Mengambil data dari Overpass API (OSM) dan menghitung skor zona keramaian (*Opportunity Score*) di sekitar lokasi pengemudi berdasarkan layanan yang dipilih (Ride/Food/Send).
  - `/api/smart-alerts`: (Fungsional opsional) Berinteraksi dengan Google Gemini AI untuk memberikan *Intel/Insights* berbasis AI terkait kondisi lalu lintas, cuaca, dan rekomendasi arah yang dinamis.
  - `/api/health`: Endpoint standar untuk mengecek status nyala server.

## 3. Aliran Data (Data Flow)

1. **Inisialisasi Lokasi**: Peramban meminta izin Geolocation dari pengguna. Setelah diizinkan, koordinat (Latitude/Longitude) terus diperbarui melalui `navigator.geolocation.watchPosition`.
2. **Pengambilan Data (Radar/Heatmap)**: 
   - Koordinat lokasi dikirim ke server via `/api/radar`.
   - Server backend meneruskan kueri *bounding box* ke **Overpass API**.
   - Server memproses data mentah OSM menjadi daftar `HeatmapPoint` dan area-area potensial yang sudah disaring (*scoring*) berdasarkan waktu dan layanan.
   - Frontend menerima data tersebut lalu merendernya dalam UI Radar (peta suhu).
3. **Penyimpanan Lokal (Offline Persistence)**:
   - Data konfigurasi pengemudi (jenis kendaraan, preferensi layanan, nomor SOS).
   - Data pendapatan harian (shift, orderan, nominal penghasilan).
   - Seluruhnya disimpan di `localStorage` klien sehingga tidak hilang walau peramban/aplikasi ditutup.

## 4. Keamanan dan Batasan Sistem
- **API Keys**: Akses ke model AI (Google Gemini) dikelola seutuhnya di sisi server (`process.env.GEMINI_API_KEY`). Tidak ada kunci akses rahasia yang dikirimkan ke peramban.
- **Rate Limiting (Overpass)**: Server memberikan pembatasan kecepatan pembaruan radar (*debouncing* & interval sinkronisasi) untuk menghindari pemblokiran batas tingkat penggunaan dari server OSM publik.

