# FASE UI/UX DAN PROACTIVE INTELLIGENCE SYSTEM: BANDUNG RIDE RADAR

Dokumen ini memuat rancangan antarmuka (UI) dan pengalaman pengguna (UX) untuk aplikasi Bandung Ride Radar. Desain difokuskan secara radikal pada efisiensi, visibilitas di bawah sinar matahari terik, dan pengambilan keputusan instan (kurang dari 3 detik) bagi pengemudi ojek online di lapangan.

---

## 1. Design Philosophy
Pengguna tidak membuka aplikasi ini untuk menganalisis data, melainkan untuk **mendapatkan order secepat mungkin**. 
*   **The 3-Second Rule:** Jika informasi tidak dapat dipahami dalam 3 detik saat layar dilirik di *phone holder* motor, maka desain tersebut gagal.
*   **Actionable over Analytical:** Daripada menampilkan grafik keramaian, aplikasi menampilkan instruksi jelas: *"Geser 1.4 km ke Antapani"*.
*   **Glanceable UI:** Mengandalkan kontras warna mutlak dan hierarki tipografi yang masif untuk menembus silau matahari siang Bandung.

## 2. Design System
Sistem desain menggunakan pendekatan **"Chunky & Tactile"**.
*   **Grid & Spacing:** Menggunakan kelipatan 8px dengan margin luar yang sangat lebar (24px) untuk mencegah *accidental touch* di pinggir layar HP lengkung.
*   **Touch Targets:** Area sentuh minimum adalah **60x60 px** (melampaui standar Apple 44px) agar dapat ditekan dengan mudah meski menggunakan sarung tangan kulit tipis.
*   **Borders & Shapes:** Menggunakan *rounded corners* (radius 16px) yang ramah dipandang, dibalut dengan *outline* tebal (2px) untuk memisahkan elemen secara tegas pada *Light Mode*.

## 3. Color System
Skema warna sangat dibatasi pada 4 warna solid tanpa gradien (*flat & solid*):
*   ⚪ **Putih (#FFFFFF):** Latar belakang utama aplikasi, kanvas peta (mode jalan), dan interior *card*. Memaksimalkan *brightness* layar di luar ruangan.
*   🟡 **Kuning (#FFC107):** Aksen peluang tinggi, tombol aksi utama (*Call to Action*), dan rekomendasi rute AI. Warna ini dipilih karena sangat mencolok namun tetap nyaman (tidak membuat mata cepat lelah seperti hijau neon).
*   ⚫ **Hitam (#111111):** Warna teks utama, teks sekunder (tanpa abu-abu muda agar kontras terjaga), ikon solid, dan garis tepi (*border*).
*   🔴 **Merah (#E53935):** Notifikasi krusial, indikator kawasan macet total, dan penurunan drastis *opportunity score*.

## 4. Typography
*   **Font Family:** **Inter** atau **SF Pro** (Sans-Serif geometris yang sangat terbaca).
*   **Weights:** Hanya menggunakan Medium (500), Semi-Bold (600), dan Extra-Bold (800). *Light* atau *Regular* ditiadakan demi visibilitas.
*   **Size Hierarchy:**
    *   *Display Score:* 64px Extra-Bold (Sangat besar).
    *   *Primary Action:* 20px Semi-Bold.
    *   *Body/Info:* 16px Medium. Tidak ada teks di bawah 14px.

## 5. Component Library
*   **Cards:** Kotak putih solid, border hitam 2px, tanpa efek *drop shadow* melayang (karena *shadow* pudar di bawah matahari).
*   **Buttons:** Lebar penuh (*full-width*), tinggi 64px, warna *fill* kuning solid, teks hitam *bold*.
*   **Icons:** Harus berjenis **Solid** (bukan *Outline/Line*) agar massa pikselnya tebal dan mudah dilihat dari jarak mata ke stang motor. (Misal: ikon bensin, motor, petir).

## 6. Home Screen
Beranda didesain sebagai layar "Buka & Bergerak".
*   **Top Bar:** Menampilkan zona lokasi saat ini (Misal: "Dago Bawah").
*   **Opportunity Score:** Angka raksasa (Misal: **85**) dengan teks di bawahnya "Peluang Tinggi".
*   **AI Recommendation Card:** 
    *   Teks: "Geser ke kawasan Antapani"
    *   Metrik: "Jarak 1.4 km • Estimasi: 5 mnt"
    *   Tombol Kuning Besar: **"Mulai Navigasi"**
*   **Status Kawasan (Pills):** *Tag* solid yang menginformasikan konteks: `[Kampus Aktif]`, `[Cuaca Cerah]`, `[Lalu Lintas Sedang]`.
*   **Mini Heatmap:** Kotak rasio 16:9 yang menampilkan peta area sekitar. Area panas berwarna kuning cerah. Berfungsi sebagai *thumbnail* yang jika ditekan masuk ke *Radar Screen*.

## 7. Radar Screen
Layar peta penuh untuk eksplorasi mandiri.
*   **Map Canvas:** Tampilan peta minimalis (abu-abu putih terang, jalan hitam, tanpa nama toko kecil, hanya label jalan besar).
*   **Quick Toggles:** Tombol melayang (*Floating Action Button*) besar di kanan bawah, bisa dikembangkan *accordion style*: `[Heatmap]`, `[Traffic]`, `[Event]`, `[Cuaca]`.
*   **Lock Orientation:** Memastikan peta selalu menghadap arah motor berjalan (Heads-Up).

## 8. AI Copilot
Bukan halaman *chat* melainkan **Voice-First Command & Bottom Sheet Alert**.
*   **Akses:** Tombol *mic* kuning tebal di pojok layar.
*   **Fungsi:** Driver menekan dan bicara: "Ramai di mana?". Sistem merespons lewat audio (TTS): *"Ada lonjakan penumpang di Stasiun Bandung dalam 10 menit. Ingin diarahkan ke sana?"*
*   **Visual:** Saat merespons, layar bawah menampilkan *Card* singkat jawaban AI dengan tombol "Ya / Tolak".

## 9. Proactive Intelligence System
Sistem *Push Notification* cerdas yang berbunyi dengan *tone* khusus:
*   **Smart Alert:** "🔥 Potensi lonjakan order dalam 15 menit di Gasibu."
*   **Event Alert:** "🎸 Konser di Sabuga selesai pukul 21:00. Bersiap di Tamansari."
*   **Weather Alert:** "🌧️ Hujan turun dalam 20 menit di Dipatiukur. Siapkan jas hujan."
*   **Lunch Rush Alert:** "🍜 Jam GoFood dimulai. Merapat ke Sentra Kuliner Burangrang."
*   **Opportunity Shift:** "📉 Peluang Dago turun drastis (macet total). Hindari kawasan."

## 10. Driver Work Mode
Ketika driver menekan tombol **"Mulai Shift"**, UI bertransformasi menjadi versi **Ultra-Minimalis**:
*   *Opportunity Score* tetap di atas.
*   Tombol rekomendasi mendominasi layar.
*   Navigasi bawah (*tab bar*) disembunyikan untuk menghindari salah tekan.
*   Warna hitam dan putih dipertegas untuk meniru instrumen dasbor *speedometer*.

## 11. Accessibility (Aksesibilitas Ekstrem)
*   **Sunlight Legibility:** Rasio kontras elemen teks (hitam) di atas latar belakang (kuning/putih) mencapai rasio minimal 7:1 (Standar AAA WCAG).
*   **Glove-Friendly:** Tidak ada gestur *swipe* rumit atau cubit (*pinch*) yang dipaksakan. *Zoom in/out* peta menggunakan tombol [+] dan [-] fisik di layar, bukan sekadar gestur *pinch*.
*   **Haptic Feedback:** Setiap perubahan *Opportunity Score* ke arah positif (peluang naik) memicu getaran pendek ganda. Penurunan tajam memicu getaran panjang satu kali.

## 12. Wireframe Detail (Hierarki Layar Beranda)
```text
[Header] Lokasi: Pasteur, Bandung
-----------------------------------------
[Opportunity Score]
       85
  PELUANG TINGGI
-----------------------------------------
[AI Recommendation Card]
  Geser ke kawasan Cihampelas
  Jarak: 2.1 km | Waktu: 7 mnt
  [ TOMBOL KUNING: MULAI NAVIGASI ]
-----------------------------------------
[Status Kawasan]
  [Kampus Aktif] [Lalin Sedang] [Cerah]
-----------------------------------------
[Mini Heatmap]
  (Preview Peta dengan titik Kuning/Merah)
-----------------------------------------
[Opportunity Timeline]
  Now: 85 | +15m: 90 | +30m: 60 | +1h: 40
```

## 13. User Journey (Alur Kerja)
1.  **Aplikasi Dibuka:** Driver sedang di pinggir jalan, membuka aplikasi.
2.  **Layar Utama (0-3 detik):** Driver melihat layar "85 - Bertahan di lokasi". Driver diam menunggu order dari Gojek/Grab.
3.  **Proactive Alert (Menit ke-15):** HP bergetar, muncul "Lunch Rush Alert: Area Riau memanas dalam 10 menit".
4.  **AI Recommendation:** Layar berubah menampilkan tombol "Pindah ke Riau (1.2 km)".
5.  **Eksekusi:** Driver menekan "Mulai Navigasi", UI berubah menjadi *Map Navigation Mode* sederhana, driver melaju ke titik tujuan.

## 14. UI Asset Requirement
*   **Base Map Tiles:** *Custom Mapbox* atau *Stadia Maps* dengan filter kontras tinggi (Light mode, no terrain, high-contrast roads).
*   **Icons:** Set ikon solid SVG khusus (Mobil, Motor, Hujan, Sendok Garpu, Tas Belanja).
*   **Audio Assets:** File suara notifikasi berfrekuensi tinggi (agar terdengar menembus suara bising knalpot/angin lalu lintas).

## 15. Final Design Recommendation
Desain *Bandung Ride Radar* harus menolak estetika aplikasi modern konvensional yang "bersih namun tipis" (*clean but thin*). Pendekatan yang benar adalah **"Alat Berat / Heavy Duty Tool"** layaknya perangkat navigasi maritim atau instrumen penerbangan. Menggunakan kombinasi palet Putih-Kuning-Hitam secara ketat akan menciptakan identitas visual yang khas, tangguh di bawah terik matahari, dan secara langsung mengurangi beban kognitif pengemudi yang sedang mempertaruhkan keselamatan mereka di jalan raya.
