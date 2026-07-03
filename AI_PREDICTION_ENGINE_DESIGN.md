# FASE LANJUTAN: DESAIN TEKNOLOGI, AI, DAN PREDICTION ENGINE (BANDUNG RIDE RADAR)

## 1. Gambaran Teknologi Keseluruhan
Sistem "Bandung Ride Radar" dirancang untuk menjadi otak spasial yang memberikan panduan kepada pengemudi ride-hailing tentang **di mana dan ke mana** mereka harus bergerak untuk memaksimalkan peluang mendapatkan pesanan. Karena data internal ride-hailing (Gojek, Grab, dll) bersifat tertutup, sistem ini menggunakan pendekatan **Proxy Data Intelligence**—menggabungkan sinyal eksternal seperti Point of Interest (POI), cuaca, lalu lintas, dan event publik untuk merekonstruksi dan memprediksi pola mobilitas manusia di Bandung Raya.

## 2. Arsitektur AI
Arsitektur AI dibangun di atas prinsip **Spatio-Temporal Proxy Modeling**. Sistem tidak memprediksi "order Gojek", melainkan memprediksi "kerumunan manusia yang memiliki probabilitas tinggi membutuhkan transportasi". 
Terdiri dari 5 Layer:
- **Layer 1: Data Collection Engine** (Pengumpul sinyal mentah)
- **Layer 2: Spatial Intelligence Engine** (Pemahaman konteks wilayah)
- **Layer 3: Behavior Pattern Engine** (Pemahaman siklus waktu)
- **Layer 4: Demand Prediction Engine** (Penghasil prediksi probabilitas)
- **Layer 5: Driver Recommendation Engine** (Pemberi instruksi pergerakan)

## 3. Data Pipeline (Layer 1)
Data mentah dikumpulkan, divalidasi, dan disinkronisasi:
- **OpenStreetMap & Google Places:** Sinkronisasi mingguan untuk pembaruan POI (Kampus, RS, Stasiun, Mall).
- **Weather API (BMKG/OpenWeather):** Crawling setiap 10 menit (suhu, curah hujan).
- **Traffic API (Google/TomTom/Here):** Crawling setiap 15 menit untuk mendeteksi anomali kecepatan (indikator keramaian).
- **Event API & Kalender:** Diperbarui harian. Mengambil data konser, libur nasional, jadwal kampus/sekolah.
- **Metode Sinkronisasi:** Apache Kafka / RabbitMQ untuk stream processing data real-time, Apache Airflow untuk batch processing reguler.
- **Validasi:** Anomaly detection (membuang data cuaca ekstrem yang tidak logis, atau traffic stuck yang tidak wajar akibat error sensor).

## 4. Geospatial Engine
Pendekatan terbaik untuk Bandung Raya adalah **H3 Hexagonal Grid (Resolusi 9)** dari Uber.
- **Mengapa H3?** Hexagon membagi wilayah secara merata tanpa distorsi jarak seperti kotak (Geohash), sangat efisien untuk perhitungan jarak antar grid yang krusial untuk panduan arah pergerakan driver.
- **Bandingkan:**
  - **Geohash:** Kurang akurat untuk mencari radius ketetanggaan (neighbors).
  - **Spatial Clustering (DBSCAN):** Bagus untuk deteksi hotspot, tapi sangat berat untuk komputasi real-time seluruh kota.
  - **Kernel Density Estimation (KDE):** Sangat baik untuk rendering visualisasi heatmap di sisi klien (frontend UI), tapi terlalu lambat jika digunakan sebagai basis data di backend.
- **Kesimpulan:** Gunakan **H3 (Res 9 ~ area 0.1 km2)** untuk indexing AI dan perhitungan probabilitas di backend, lalu konversi hasilnya ke format poin untuk di-render menjadi visual heatmap menggunakan **KDE (Leaflet.heat)** di frontend.

## 5. Prediction Engine (Layer 4)
Model untuk memprediksi demand pada t+5, t+15, t+30, t+60 menit:
- **Random Forest/XGBoost/LightGBM:** Sangat cepat dan bagus untuk tabular data (kombinasi jam, cuaca, POI), tapi kurang menangkap pola *sequential* waktu.
- **LSTM/GRU:** Bagus untuk deret waktu, tapi buta terhadap topologi spasial (bahwa titik A dan B bersebelahan).
- **Spatio-Temporal Graph Neural Network (STGNN):** Secara teoritis terbaik karena memahami bahwa kemacetan di Cihampelas memengaruhi demand di Dago.
- **Kombinasi Terbaik:** **XGBoost / LightGBM** sebagai baseline yang handal dan ringan untuk MVP. Pada fase lanjut, beralih ke **Temporal Fusion Transformer (TFT)** karena kemampuannya menjelaskan *feature importance* ("mengapa area ini diprediksi tinggi?").

## 6. Multi-Agent Architecture
Sistem menggunakan agen terdistribusi yang fokus pada tugas spesifik:
- **Agent Cuaca:** Jika mendeteksi hujan di area A, agen ini mensimulasikan bahwa *ride probability* di sekitar stasiun/shelter naik drastis (orang enggan jalan kaki/naik angkot).
- **Agent Mobilitas:** Menginjeksi pola pulang-pergi (pagi dari pinggiran ke pusat, sore dari pusat ke pinggiran).
- **Agent Event:** Jika ada event di Sabuga, 1 jam sebelum usai, agen menembakkan sinyal "Surge / Lonjakan" ke Agent Demand.
- **Agent Traffic:** Melihat kemacetan jalan protokol bukan sekadar masalah macet, tapi sebagai sinyal bahwa *supply* terhambat, probabilitas orang mencari alternatif (ojek) tinggi.
- **Agent Demand (Orchestrator):** Mengagregasi output agen lain, mengeksekusi model XGBoost, dan menghasilkan probabilitas final.

## 7. Machine Learning Stack
- **Data Prep & Feature Engineering:** Pandas, GeoPandas, H3-py.
- **Model Training:** XGBoost, Scikit-learn, PyTorch (untuk model masa depan).
- **Model Serving:** FastAPI, MLflow (untuk tracking), ONNX Runtime (inferensi latensi rendah).
- **Geospatial Processing:** PostGIS (esensial untuk kueri radius dan poligon spasial kota Bandung).

## 8. Database dan Infrastruktur
- **Relational / Spatial DB:** PostgreSQL + PostGIS (Menyimpan titik POI, jalan kota, indeks grid H3).
- **Time-Series / Real-Time Cache:** Redis (Menyimpan skor H3 sementara dan status lalu lintas terkini).
- **Data Lake (Historical):** Google Cloud Storage / AWS S3 (Menyimpan snapshot skor setiap jam).
- **Infrastruktur:** Google Cloud Run (Serverless auto-scaling saat jam pulang kerja) dan Cloud Scheduler.

## 9. Model Training Pipeline
- **Data Ingestion:** Menarik snapshot metrik harian dari Data Lake.
- **Feature Generation:** Menghasilkan *lag features* (kondisi sejam lalu) dan fitur *cyclical* (sin/cos jam untuk memahami siklus harian).
- **Training:** Dilakukan secara batch (mingguan). Shadow Deployment digunakan: model baru memprediksi data, namun UI tetap memakai model lama.
- **Deployment:** Jika metrik MAE model bayangan lebih baik, model baru dinaikkan (Canary Release).

## 10. Real-Time Learning
- **Online Learning:** Sangat rentan terhadap "concept drift" yang kotor akibat error sensor sesaat.
- **Reinforcement Learning:** **[HAMPIR MUSTAHIL DIBANGUN]** Sangat bagus untuk rekomendasi, tapi tidak bisa dilatih tanpa *feedback loop* real order data.
- **Pendekatan Terbaik:** **Incremental Batch Learning**. AI mengumpulkan input dari *crowdsourcing* ("Driver menekan tombol 'Dapat Order' di sini"), disimpan, dan model di-retrain ulang setiap tengah malam. Ini lebih stabil.

## 11. Ride Opportunity Score (ROS)
Sebuah metrik absolut (0 - 100) per grid H3.
**Formula Konseptual Base:**
`ROS = (w_POI * S_poi) + (w_Time * S_time) + (w_Weather * S_weather) + (w_Traffic * S_traffic) + (w_Event * S_event)`
- `S_poi`: Kepadatan kawasan (Stasiun KA memiliki nilai statis tinggi).
- `S_time`: Kurva multiplier waktu (Perkantoran = 1.0 di jam 17:00, 0.1 di jam 03:00).
- `S_weather`: Jika hujan, multiplier 1.5x untuk titik transit.
- `S_event`: Jika event "aktif", multiplier 2.0x radius 1km.
*(Nilai Weight (w) adalah koefisien yang dipelajari dan disetel oleh ML model)*.

## 12. Roadmap MVP
- **Target:** 1 developer, biaya rendah, 3 bulan.
- **Teknologi:** Rule-Based Heuristic Engine (Belum memakai ML berat). Python/Node.js sederhana + PostGIS.
- **Fitur:** Peta Leaflet + Grid H3 statis + Rumus ROS berbasis jam, hari, dan cuaca statis.
- **Validasi Realitas:** **[REALISTIS DIBANGUN]**. Bergantung pada integrasi API murah dan logika bisnis dasar. Estimasi akurasi kasat mata: 60%.

## 13. Roadmap Startup
- **Target:** Startup kecil, 1 tahun pengerjaan.
- **Teknologi:** XGBoost Prediction Engine dengan Data Pipeline harian.
- **Fitur:** Prediksi dinamis, integrasi Live Traffic (kondisi macet), fitur "Crowdsource Laporan" dari driver, dan Vector Guidance ("Geser 1km ke Utara").
- **Validasi Realitas:** **[CUKUP SULIT DIBANGUN]**. Hambatan terbesar adalah biaya API Live Traffic skala kota. Membutuhkan optimalisasi kueri spasial.

## 14. Roadmap Enterprise
- **Target:** Standar platform pro (Gojek/Grab).
- **Teknologi:** Spatio-Temporal GNN + Reinforcement Learning.
- **Fitur:** Dinamika harga (estimasi surge), personalisasi driver (pengarahan sesuai pola pulang sang driver), NLP untuk scraping info kecelakaan/event dari sosial media secara otomatis.
- **Validasi Realitas:** **[HAMPIR MUSTAHIL DIBANGUN]** tanpa akses langsung ke jutaan riwayat order asli milik platform ride-hailing.

## 15. Analisis Risiko
- **Keterbatasan Data Proxy:** Keramaian tidak selalu berarti order transportasi (bisa jadi orang hanya berjalan-jalan di mall).
- **Kelelahan API:** Melakukan kueri weather/traffic per titik di seluruh Bandung sangat boros. Solusi: Hanya pantau titik-titik jangkar (Anchors).
- **Adopsi Driver:** Jika tebakan meleset 3 kali, driver akan *churn* (berhenti pakai). Solusinya di awal adalah *Explainable AI* di UI (contoh: "Kenapa merah? Karena hujan + jam pulang kantor", bukan hanya menyala merah tanpa alasan).

## 16. Kesimpulan Teknis
Membangun "Bandung Ride Radar" secara independen adalah eksperimen **Proxy Intelligence** tingkat tinggi. Alih-alih mengejar deep learning mutakhir tanpa big data pesanan asli, tim harus fokus pada **Geospatial Feature Engineering**—merubah fakta-fakta tata kota Bandung (jam operasional ITB, jadwal KA di Stasiun Bandung, pola weekend di Lembang) menjadi formula spasial-temporal di atas sistem Grid H3. Kombinasi PostGIS, XGBoost (di fase Growth), dan visualisasi Leaflet.heat adalah *stack* paling taktis dan reliabel untuk mencapai tingkat kegunaan di lapangan.
