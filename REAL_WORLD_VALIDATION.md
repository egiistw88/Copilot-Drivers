# FASE VALIDASI DUNIA NYATA: BANDUNG RIDE RADAR

Dokumen ini memuat analisis kejujuran teknis dan kelayakan dunia nyata untuk sistem prediksi permintaan *ride-hailing* (Gojek, Grab, dll) di Bandung Raya. Sistem ini menolak penggunaan data *dummy* atau asumsi kosong.

---

## 1. Audit Data

| Data | Tersedia Publik | Legal | Akurasi | Biaya |
| :--- | :--- | :--- | :--- | :--- |
| Order ojek online | Tidak | - | - | - |
| Lokasi driver aktif | Tidak | - | - | - |
| Lokasi penumpang aktif | Tidak | - | - | - |
| Lokasi restoran | Ya (OSM/Google) | Ya | Tinggi | Gratis/Premium (API) |
| Lokasi UMKM | Ya (Sebagian) | Ya | Menengah | Gratis (OSM) |
| Lokasi kantor | Ya (OSM/Google) | Ya | Tinggi | Gratis/Premium (API) |
| Lokasi kampus/sekolah | Ya (OSM/Diknas) | Ya | Sangat Tinggi | Gratis |
| Lokasi rumah sakit | Ya (OSM/Kemenkes)| Ya | Sangat Tinggi | Gratis |
| Lokasi wisata | Ya (OSM/Google) | Ya | Tinggi | Gratis/Premium (API) |
| Lokasi event | Sebagian | Ya | Rendah-Menengah| Waktu/Scraping |
| Data cuaca (BMKG/OpenWeather)| Ya | Ya | Tinggi | Gratis/Berbayar |
| Data kemacetan | Ya (TomTom/Google)| Ya | Tinggi | Berbayar (API) |
| Data transportasi publik | Ya (Kemenhub/Dishub)| Ya | Menengah | Gratis |

---

## 2. Sumber Data Nyata (Identifikasi Akses)

**Data Sangat Mudah Didapat**
*   **Geospatial / POI Dasar:** OpenStreetMap (OSM) via Overpass API. Memberikan koordinat kampus, stasiun, halte, RS secara presisi tinggi. Gratis dan legal.
*   **Cuaca Real-time:** OpenWeatherMap API atau data BMKG. Memberikan data suhu dan curah hujan per jam untuk Bandung.
*   **Kalender Dasar:** Libur nasional, jadwal ibadah (Jumat/Ramadhan).

**Data Cukup Sulit Didapat**
*   **Data Kemacetan Real-time (Traffic):** TomTom Traffic API atau Google Maps Distance Matrix. Legal, tapi berbiaya tinggi untuk skala kota (jutaan *request*).
*   **Data Event Lokal:** Konser di Sabuga, pameran di Braga, atau wisuda ITB/Unpad. Harus di-*scrape* dari Instagram, web tiket, atau input komunitas manual.
*   **Aktivitas UMKM / Restoran Kecil:** Banyak *hidden gem* di Bandung yang ramai orderan *food* namun belum ada di OSM, hanya ada di database GoFood/GrabFood.

---

## 3. Data Yang Tidak Bisa Diakses

**Data Hampir Mustahil Didapat**
*   Jumlah order Grab/Gojek/Maxim per jam per wilayah.
*   Lokasi sebaran *driver* lain secara *real-time*.
*   Lokasi penumpang yang sedang membuka aplikasi.

**Alasan:** Ini adalah nyawa bisnis dan properti intelektual perusahaan *ride-hailing*. Membobol atau melakukan *reverse-engineering* terhadap aplikasi mereka adalah tindakan ilegal (melanggar UU ITE) dan pasti diblokir oleh sistem anti-fraud mereka.

---

## 4. Alternatif Pengganti (Proxy Signal)

Karena data order tidak ada, kita menebak "peluang order" dari **Proxy Signal**:
1.  **Kepadatan Pusat Aktivitas (Anchors):** Jika pukul 16.00 WIB jalan Riau macet dan itu adalah jam pulang kantor, maka *probabilitas* order ride-hailing di area itu sangat tinggi.
2.  **Jadwal Aktivitas Kawasan:**
    *   **Kampus (ITB, Unpad, Tel-U):** Jam ramai masuk (07.00-08.30) dan pulang (15.00-17.00).
    *   **Stasiun/Terminal (St. Bandung, Kiaracondong, Leuwipanjang):** Mengikuti jadwal kedatangan kereta/bus utama. Jika KA Argo Parahyangan tiba, 15 menit setelahnya akan terjadi lonjakan (Surge) permintaan.
3.  **Kondisi Lingkungan:** Jika turun hujan lebat di daerah Dago, permintaan mobil (Gocar/GrabCar) dan GoFood akan naik drastis, sementara ketersediaan motor (Goride/GrabBike) akan menurun (driver berteduh).

---

## 5. Metode Crowdsourcing (Alternatif Paling Valid)

Satu-satunya cara melatih ML tanpa data internal perusahaan adalah meminta data dari pengguna kita (driver).

*   **Tahap 1 (100 driver, 1 Bulan):** Observasi Manual & Feedback Sederhana. Aplikasi MVP memberi rekomendasi area (berdasarkan Proxy). Driver cukup menekan 1 tombol di aplikasi: "Dapat Order" atau "Sepi". Data yang dikirim: `[Timestamp, Lat/Lng H3 Grid, Cuaca saat itu]`.
*   **Tahap 2 (500 driver, 3 Bulan):** Klasifikasi Order. Tombol dibagi menjadi "Order Penumpang", "Order Makanan", "Order Barang". Mulai membentuk *dataset* latih yang bermakna.
*   **Tahap 3 (1000+ driver, Berkelanjutan):** Validasi Panas/Dingin Area. Driver mengkonfirmasi "Titik merah ini memang ramai" atau "Titik merah ini zonk". Ini menjadi sinyal *reward* untuk perbaikan model (Mirip *reinforcement* dasar).

---

## 6. Desain AI Yang Realistis

*   **Rule-Based Expert System (Heuristik):** 
    *   *Data yang diperlukan:* Jarak ke POI, Jam, Cuaca. 
    *   *Ketersediaan:* Ada (OSM + Jam + Cuaca). 
    *   *Kelayakan:* **Sangat Layak (Baseline MVP).** Tidak butuh *training* data order. Hanya logika: `Jika (jarak < 500m dari Kampus) DAN (jam = 16.00), maka Skor = Tinggi`.
*   **Supervised Machine Learning (XGBoost / LightGBM):**
    *   *Data yang diperlukan:* Ribuan riwayat order nyata.
    *   *Ketersediaan:* **TIDAK ADA** (kecuali tahap 2 crowdsourcing sukses).
    *   *Kelayakan:* **TIDAK LAYAK untuk awal rilis.** Jika dipaksakan *training* dengan data sintesis, hasilnya akan menipu driver di lapangan.
*   **Spatio-Temporal Graph Neural Networks (STGNN):**
    *   *Data yang diperlukan:* Pemetaan jutaan perpindahan rute dan order per menit se-kota.
    *   *Kelayakan:* **TIDAK REALISTIS.** Tanpa akses *database backend* Gojek/Grab, ini mustahil.

---

## 7. Penilaian Kejujuran Teknis (Fitur)

*   🟢 **Heatmap Berbasis Kepadatan POI (Rumah Sakit, Kampus, Stasiun)** (Bisa dibangun sekarang - Pakai OSM)
*   🟢 **Penyesuaian Skor Berdasarkan Hujan/Cuaca** (Bisa dibangun sekarang - Pakai OpenWeatherMap)
*   🟢 **Radar Penyesuaian Jam Sibuk (Rush Hour) Statis** (Bisa dibangun sekarang - Hardcode logika jam)
*   🟡 **Sistem Pelaporan "Gacor/Sepi" oleh Driver** (Bisa dibangun jika memiliki komunitas driver aktif)
*   🟡 **Heatmap Prediktif 30-Menit ke Depan Berbasis Machine Learning** (Membutuhkan data crowdsourcing berbulan-bulan terlebih dahulu)
*   🟠 **Rekomendasi Rute Menghindari Kemacetan ke Titik Ramai** (Membutuhkan kerja sama/budget API Traffic seperti TomTom)
*   🔴 **Prediksi "Order Berikutnya Muncul di Mana" secara Pasti** (Tidak realistis tanpa akses data internal perusahaan ride-hailing)
*   🔴 **Menampilkan Posisi Driver Lain Secara Real-time** (Tidak realistis tanpa akses data internal)

---

## 8. Fitur Yang Tidak Realistis (Dihapus dari MVP)

Berdasarkan syarat "akurasi minimal 70%", berikut fitur yang **DIHAPUS DARI MVP**:
1.  *Prediksi Munculnya Order Spesifik (Demand Forecasting AI)*: Karena ketiadaan *ground truth* (data order riil), AI akan berhalusinasi. Tingkat akurasi di bawah 30%.
2.  *Rekomendasi Perpindahan Rute Terpendek Berdasarkan Kemacetan*: Tanpa API berbayar mahal (TomTom), menggunakan algoritma jarak lurus akan menyesatkan driver.
3.  *Heatmap Order Makanan vs Penumpang yang dipisah secara cerdas oleh AI*: Terlalu berisiko salah tembak tanpa data dari komunitas.

*Fokus MVP murni pada: "Geospatial Proxy Radar" (Memberi tahu driver di mana pusat aktivitas yang potensial ramai berdasarkan jam, kalender, dan cuaca).*

---

## 9. Roadmap Pengumpulan Data & Fokus Area (Bandung Raya)

1.  **Kota Bandung (Kawasan Pusat, Dago, Riau, Braga):** *Paling mudah dipetakan.* Data POI di OSM sangat lengkap. Pola mobilitas jelas (Pusat Belanja, Kuliner, Perkantoran). Prioritas utama.
2.  **Kabupaten Sleman... (Wait, Kabupaten Sleman di Jogja). Untuk Bandung: Kabupaten Sumedang (Jatinangor):** *Sangat mudah.* Merupakan kota mahasiswa terpusat (Unpad, ITB Jatinangor, IPDN). Pola siklus akademik sangat tebal dan bisa ditebak jadwalnya.
3.  **Kota Cimahi:** *Menengah.* Area industri padat. Jadwal pergantian *shift* pabrik menjadi kunci data. Perlu input komunitas untuk titik *pick-up* karyawan pabrik.
4.  **Kabupaten Bandung (Soreang, Banjaran, dll) & KBB (Lembang):** *Paling sulit dipetakan.* Area penyangga perumahan yang luas atau kawasan wisata murni yang sangat bergantung pada *event* / akhir pekan *long-weekend*. Sulit diprediksi secara harian menggunakan POI statis.

---

## 10. Kesimpulan Akhir

Untuk membangun "Bandung Ride Radar" secara realistis tanpa data *ride-hailing* asli, kita harus **membuang ego membuat Deep Learning yang canggih di awal**, karena akan menghasilkan sistem yang berhalusinasi. 

Pendekatan dunia nyatanya adalah:
1.  **Membangun Engine Heuristik (Rule-Based)** yang meracik data publik gratis yang valid (Lokasi Kampus, Stasiun, Cuaca, Jam) menjadi sebuah skor peluang (Proxy).
2.  **Membentuk Komunitas Driver** sebagai sensor hidup (*crowdsourcing*).
3.  Baru setelah berbulan-bulan mengumpulkan "Klik Order" dari driver, sistem bergeser mengaktifkan **Machine Learning yang sesungguhnya** untuk menemukan korelasi pola yang tersembunyi.

Sistem *Ride Radar* tahap awal bukanlah AI peramal masa depan, melainkan **Asisten Cerdas Spasial** yang menyingkirkan *blind-spot* driver di lapangan.
