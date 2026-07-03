import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "dummy-key-for-now",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});


async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.post("/api/smart-alerts", async (req, res) => {
    try {
      const { locationName, weather, time, day, config } = req.body;
      
      const configText = config ? `Tipe Kendaraan: ${config.vehicleType === 'car' ? 'Mobil' : 'Motor'}\nLayanan Prioritas: ${config.serviceType === 'all' ? 'Semua' : config.serviceType === 'ride' ? 'Penumpang' : config.serviceType === 'food' ? 'Makanan' : 'Barang'}\nTarget Pendapatan: Rp${config.targetIncome}` : '';

      const systemPrompt = `Anda adalah sistem AI 'HeatMap Engine' untuk driver Maxim di Kota Bandung. Tugas Anda adalah memberikan rekomendasi pintar dan ringkas (1-2 kalimat) berdasarkan Knowledge Base dan konteks real-time driver. Gunakan bahasa tongkrongan Bandung yang asik, sopan, dan memotivasi (misal: 'Kang', 'Lur', 'Gaskeun'). Output murni teks polos TANPA BOLD, TANPA ASTERISK (*), dan TANPA MARKDOWN sama sekali.

=== KNOWLEDGE BASE DRIVER MAXIM BANDUNG ===
- Zona Primer: Arcamanik, Antapani, Cisaranten, Kiaracondong, Babakan Sari, Buah Batu, Rancasari.
- Generator Order Tinggi: RS, Terminal, Stasiun, Sekolah, Kampus, Pasar.
- Pola Weekday: 05-07 (Mobilitas pekerja, sekolah, RS), 07-09 (Peak 1), 13-15 (Delivery barang), 15-17 (Peak 2, pulang sekolah/kantor), 21-24 (Kuliner, kos, minimarket).
- Pola Weekend: 06.30-08.30 (Kuliner, pasar, olahraga), 09-12 (Wisata, mall), 13-17 (Family, shopping, delivery), 21-24 (Braga, Asia Afrika).
- Hotspot Utama: RS Al Islam, Kiaracondong, Antapani, Arcamanik, Soekarno Hatta.
- Aturan Operasional: Jika sepi order atau mencari area potensial, arahkan ke hotspot terdekat di koridor utama. PASTIKAN SARAN SESUAI DENGAN TIPE KENDARAAN DAN LAYANAN PRIORITAS DRIVER. Jika driver mobil, jangan arahkan ke gang sempit. Jika prioritas makanan, arahkan ke pusat kuliner.

Konteks Driver Saat Ini:
Lokasi: ${locationName || 'Bandung'}
Cuaca: ${weather || 'Cerah'}
Waktu: ${time ? new Date(time).toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta' }) : 'Tidak diketahui'}
Hari: ${day === 0 || day === 6 ? 'Weekend' : 'Weekday'}
${configText}`;

      const contents = "Carikan 1 info lalin/event real-time ATAU berikan rekomendasi taktis (pindah area) berdasarkan konteks dan knowledge base di atas. Rangkum dalam 1-2 kalimat padat yang langsung bisa ditindaklanjuti driver saat ini juga.";

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents,
        config: {
          temperature: 0.7,
          systemInstruction: systemPrompt
        }
      });
      
      let text = response.text || "Lalin Bandung terpantau aman terkendali, gaskeun cari order kang!";
      
      // Clean up citations or extra formatting
      text = text.replace(/\[\d+\]/g, '').trim();
      
      res.json({ message: text });
    } catch (e) {
      console.warn("Smart alert AI fallback triggered (quota/network).");
      res.json({ message: "Lalin Bandung terpantau aman terkendali, gaskeun cari order kang!", fallback: true });
    }
  });

  app.post("/api/copilot", async (req, res) => {
    try {
      const { messages, context } = req.body;
      let responseText = "";
      try {
        const formattedContents = messages.map((m: any) => ({
          role: m.role === 'ai' ? 'model' : 'user',
          parts: [{ text: m.text }]
        }));

        const configText = context.config ? `Tipe Kendaraan: ${context.config.vehicleType === 'car' ? 'Mobil' : 'Motor'}\nLayanan Prioritas: ${context.config.serviceType === 'all' ? 'Semua' : context.config.serviceType === 'ride' ? 'Penumpang' : context.config.serviceType === 'food' ? 'Makanan' : 'Barang'}\nTarget Pendapatan: Rp${context.config.targetIncome}` : '';

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: formattedContents,
          config: {
            systemInstruction: `Anda adalah AI Copilot untuk driver ojek online/pengiriman barang di Bandung.
Konteks Shift Saat Ini:
Skor Area: ${context.score}/100
Tingkat Permintaan: ${context.demandLevel}
Lokasi Saat Ini: ${context.locationName}
Cuaca: ${context.weather}
Insight Aktif: ${context.contextPills?.join(', ') || 'Normal'}
${configText}

Berikan respons yang singkat, jelas, logis, dan sangat membantu dengan menggunakan bahasa pergaulan santai (Bahasa Gaul/Santai). Jangan menggunakan lebih dari 3 kalimat. Berikan saran konkret atau analisis yang logis terkait pertanyaan user berdasarkan konteks lokasi, cuaca, TIPE KENDARAAN, LAYANAN PRIORITAS, dan target pendapatan saat ini.`,
            temperature: 0.7
          }
        });
        responseText = response.text || "";
      } catch (aiError: any) {
        console.warn("Copilot AI fallback triggered (quota/network).");
        // Fallback response if AI is unavailable or quota exceeded
        let isFallback = true;
        if (context.score >= 70) {
          responseText = "Skor bagus nih! Stay sini aja, pasti bentar lagi nyangkut orderan.";
        } else if (context.score <= 40) {
          responseText = `Mending gas geser aja bro, coba ke area yang lebih rame.`;
        } else {
          responseText = "Area lumayan stabil. Sabar dulu atau geser dikit ke pusat keramaian.";
        }
        res.json({ text: responseText, fallback: isFallback });
        return;
      }
      res.json({ text: responseText });
    } catch (error: any) {
      console.error("COPILOT ROUTE ERROR:", error, error.stack);
      import('fs').then(fs => fs.writeFileSync('copilot_error.log', error.toString() + (error.stack || '')));
      res.status(500).json({ error: "Copilot failed to respond" });
    }
  });

  // API route for Real-World MVP Heuristic Engine
  app.post("/api/predict", async (req, res) => {
    try {
      const { lat, lng, time, config } = req.body;
      
      const serviceType = config?.serviceType || 'all';
      const vehicleType = config?.vehicleType || 'motorcycle';

      // 1. Fetch Real Weather Data (Open-Meteo - Free, No API Key)
      let weatherData = null;
      try {
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`);
        if (weatherRes.ok) {
          weatherData = await weatherRes.json();
        }
      } catch (err) {
        console.warn("Failed to fetch weather, using defaults", err);
      }

      // 1.5 Fetch Location Name (Reverse Geocoding)
      let locationName = "Area Sekitar Anda";
      try {
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, {
          headers: { 'User-Agent': 'aistudio-build-driver-app' }
        });
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          locationName = geoData.address.neighbourhood || geoData.address.suburb || geoData.address.village || geoData.address.road || "Area Sekitar Anda";
        }
      } catch (err) {
        console.warn("Reverse geocoding failed", err);
      }

      // 2. Fetch Real POI and Road Data (OpenStreetMap Overpass API)
      let pois: any[] = [];
      let roads: any[] = [];
      try {
        const searchRadius = vehicleType === 'car' ? 3000 : 1500;
        let poiQuery = '';
        if (serviceType === 'food') {
          poiQuery = `
            node["amenity"~"restaurant|fast_food|cafe|food_court"](around:${searchRadius},${lat},${lng});
            node["shop"~"bakery|supermarket|convenience"](around:${searchRadius},${lat},${lng});
          `;
        } else if (serviceType === 'send') {
          poiQuery = `
            node["office"](around:${searchRadius},${lat},${lng});
            node["shop"~"mall|supermarket|wholesale"](around:${searchRadius},${lat},${lng});
            node["amenity"~"post_office|marketplace"](around:${searchRadius},${lat},${lng});
          `;
        } else {
          // ride or all
          poiQuery = `
            node["amenity"~"university|college|hospital|bus_station|school|restaurant"](around:${searchRadius},${lat},${lng});
            node["shop"~"mall|supermarket"](around:${searchRadius},${lat},${lng});
            node["railway"~"station|subway_entrance"](around:${searchRadius},${lat},${lng});
          `;
        }

        const overpassQuery = `
          [out:json];
          (
            ${poiQuery}
            way["highway"~"primary|secondary|trunk"](around:${searchRadius},${lat},${lng});
          );
          out geom;
        `;
        const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout
        const overpassRes = await fetch(overpassUrl, { 
          headers: { 'User-Agent': 'BandungRideRadar/1.0' },
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (overpassRes.ok) {
          const overpassData = await overpassRes.json();
          pois = overpassData.elements.filter((e: any) => e.type === 'node') || [];
          roads = overpassData.elements.filter((e: any) => e.type === 'way') || [];
        }
      } catch (err) {
        // Silently use fallback data if fetch fails
        pois = [
            { lat: lat + 0.005, lon: lng + 0.005, tags: { amenity: 'university', name: 'Kampus Terdekat' } },
            { lat: lat - 0.005, lon: lng + 0.008, tags: { shop: 'mall', name: 'Pusat Perbelanjaan' } },
            { lat: lat + 0.008, lon: lng - 0.005, tags: { amenity: 'hospital', name: 'RS Daerah' } },
            { lat: lat - 0.007, lon: lng - 0.007, tags: { railway: 'station', name: 'Stasiun Transit' } }
        ];
      }

      // 3. Rule-Based Heuristic Engine (ROS - Ride Opportunity Score)
      const clientTime = new Date(time);
      // Convert to UTC+7 (Bandung)
      const currentHour = (clientTime.getUTCHours() + 7) % 24;
      let isRushHour = false;
      let timeMultiplier = 0.5; // Base multiplier

      // Rush Hour Logic (06:00-09:00 and 16:00-19:00)
      if ((currentHour >= 6 && currentHour <= 9) || (currentHour >= 16 && currentHour <= 19)) {
        isRushHour = true;
        timeMultiplier = 1.2;
      } else if (currentHour >= 11 && currentHour <= 13) { // Lunch rush
        timeMultiplier = 1.0;
      }

      // Weather Logic
      let isRaining = false;
      let weatherMultiplier = 1.0;
      let weatherContext = "Cuaca Cerah";
      if (weatherData && weatherData.current_weather) {
        const wcode = weatherData.current_weather.weathercode;
        // WMO Weather interpretation codes (51-67, 80-99 are rain/showers)
        if ((wcode >= 51 && wcode <= 67) || (wcode >= 80 && wcode <= 99)) {
          isRaining = true;
          weatherMultiplier = 1.5; // Rain increases ride demand significantly
          weatherContext = "Hujan Turun";
        } else if (wcode >= 1 && wcode <= 3) {
          weatherContext = "Berawan";
        }
      }

      // Evaluate Individual POI scores for better precision and recommendations
      pois = pois.map((p: any) => {
        let baseScore = 20; // Default minimum
        let tags = p.tags || {};
        
        if (serviceType === 'food') {
           if (tags.amenity === 'restaurant' || tags.amenity === 'fast_food' || tags.amenity === 'cafe') {
               baseScore = 70;
               if (currentHour >= 11 && currentHour <= 14) baseScore += 20; // Lunch rush
               if (currentHour >= 17 && currentHour <= 21) baseScore += 20; // Dinner rush
           } else if (tags.shop === 'supermarket' || tags.shop === 'bakery' || tags.shop === 'convenience') {
               baseScore = 55;
               if (currentHour >= 16 && currentHour <= 20) baseScore += 15;
           }
        } else if (serviceType === 'send') {
           if (tags.office) {
               baseScore = 75;
               if (currentHour >= 9 && currentHour <= 17) baseScore += 15;
           } else if (tags.shop === 'mall' || tags.shop === 'wholesale') {
               baseScore = 65;
               if (currentHour >= 12 && currentHour <= 18) baseScore += 15;
           } else if (tags.amenity === 'marketplace' || tags.amenity === 'post_office') {
               baseScore = 70;
               if (currentHour >= 8 && currentHour <= 14) baseScore += 20;
           }
        } else {
           // ride or all
           if (tags.amenity === 'university' || tags.amenity === 'college' || tags.amenity === 'school') {
               baseScore = 75;
               // School/Campus rush
               if ((currentHour >= 6 && currentHour <= 9) || (currentHour >= 14 && currentHour <= 17)) baseScore += 20;
           } else if (tags.amenity === 'hospital') {
               baseScore = 65;
               if (currentHour >= 7 && currentHour <= 10) baseScore += 10;
           } else if (tags.shop === 'mall' || tags.shop === 'supermarket') {
               baseScore = 70;
               if (currentHour >= 16 && currentHour <= 21) baseScore += 15;
               if (isRaining) baseScore += 10; // People go to malls when it rains
           } else if (tags.railway === 'station' || tags.railway === 'subway_entrance' || tags.amenity === 'bus_station') {
               baseScore = 80;
               if (isRushHour) baseScore += 15;
           }
        }
        
        // Weather impact: rain generally increases ride/food demand slightly
        if (isRaining) {
           baseScore *= 1.15;
        }
        
        // Distance penalty: Calculate distance to user
        const distKm = Math.sqrt(Math.pow(lat - p.lat, 2) + Math.pow(lng - p.lon, 2)) * 111;
        p.distanceKm = parseFloat(distKm.toFixed(1));
        
        // Apply slight distance decay to score
        let distPenalty = Math.max(0, distKm - 1) * 5; // -5 points for every km beyond 1km
        p.calculatedScore = Math.min(100, Math.max(10, Math.round(baseScore - distPenalty)));
        
        return p;
      });

      // POI Density Logic
      let poiScore = 0;
      let contextMap: Record<string, number> = {};

      if (serviceType === 'food') {
        const numFood = pois.filter((p: any) => p.tags && (p.tags.amenity === 'restaurant' || p.tags.amenity === 'fast_food' || p.tags.amenity === 'cafe')).length;
        const numSupermarket = pois.filter((p: any) => p.tags && (p.tags.shop === 'supermarket' || p.tags.shop === 'bakery')).length;
        poiScore = (numFood * 2.5) + (numSupermarket * 1.5);
        if (numFood > 0) contextMap["Area Kuliner Ramai"] = numFood;
      } else if (serviceType === 'send') {
        const numOffice = pois.filter((p: any) => p.tags && p.tags.office).length;
        const numMall = pois.filter((p: any) => p.tags && p.tags.shop === 'mall').length;
        const numMarket = pois.filter((p: any) => p.tags && p.tags.amenity === 'marketplace').length;
        poiScore = (numOffice * 3) + (numMall * 2) + (numMarket * 1.5);
        if (numOffice > 0) contextMap["Pusat Perkantoran Aktif"] = numOffice;
        if (numMarket > 0) contextMap["Area Niaga & Grosir"] = numMarket;
      } else {
        const numUniversities = pois.filter((p: any) => p.tags && (p.tags.amenity === 'university' || p.tags.amenity === 'college')).length;
        const numHospitals = pois.filter((p: any) => p.tags && p.tags.amenity === 'hospital').length;
        const numMalls = pois.filter((p: any) => p.tags && p.tags.shop === 'mall').length;
        const numStations = pois.filter((p: any) => p.tags && (p.tags.amenity === 'bus_station' || p.tags.railway === 'station')).length;
        
        poiScore = (numUniversities * 2) + (numMalls * 1.5) + (numHospitals * 1.5) + (numStations * 3);
        if (numUniversities > 0) contextMap["Kampus Sekitar Aktif"] = numUniversities;
        if (numStations > 0) contextMap["Titik Transit Padat"] = numStations;
        if (numMalls > 0) contextMap["Pusat Perbelanjaan Ramai"] = numMalls;
      }
      
      // Calculate Final Base Score (0-100)
      let rawScore = (poiScore * 5) * timeMultiplier * weatherMultiplier;
      // Precision final score based on actual conditions, no random numbers
      let finalScore = Math.min(95, Math.max(10, Math.round(rawScore)));

      // 4. Generate Context & Recommendations
      let deterministicContexts: string[] = [];
      if (isRushHour) {
        deterministicContexts.push(currentHour < 12 ? "Jam Berangkat Sibuk" : "Jam Pulang Sibuk");
      } else if (currentHour >= 11 && currentHour <= 13) {
        deterministicContexts.push("Jam Makan Siang");
      } else if (currentHour >= 22 || currentHour <= 4) {
        deterministicContexts.push("Jam Malam/Sunyi");
      }
      
      const sortedPois = Object.entries(contextMap).sort((a, b) => b[1] - a[1]);
      if (sortedPois.length > 0) {
        deterministicContexts.push(sortedPois[0][0]);
      } else {
        deterministicContexts.push("Area Standar");
      }

      const context = deterministicContexts;
      const demandLevel = finalScore >= 75 ? "High" : finalScore >= 50 ? "Medium" : "Low";
      
      // Get the best real target from calculated scores
      const validNamedPois = pois.filter((p: any) => p.tags && p.tags.name && p.calculatedScore);
      validNamedPois.sort((a: any, b: any) => b.calculatedScore - a.calculatedScore); // Sort descending by score
      
      const bestPoi = validNamedPois.length > 0 ? validNamedPois[0] : null;
      const targetName = bestPoi ? bestPoi.tags.name : (sortedPois.length > 0 ? sortedPois[0][0] : "Pusat Keramaian");
      const targetDistance = bestPoi ? bestPoi.distanceKm : 1.5;
      const actionText = finalScore >= 75 ? "Bertahan di Lokasi" : `Geser ke ${targetName}`;

      // Create real heatmap points from fetched POIs
      const realHeatmapData: [number, number, number][] = [];
      
      // We will also add some ambient noise/demand across the entire radius to make it look organic
      const radiusDeg = vehicleType === 'car' ? 0.03 : 0.015; // ~3km or ~1.5km
      for (let i = 0; i < 30; i++) {
        const randLat = lat + (Math.random() - 0.5) * radiusDeg * 2;
        const randLng = lng + (Math.random() - 0.5) * radiusDeg * 2;
        realHeatmapData.push([randLat, randLng, 0.15 + Math.random() * 0.1]);
      }

      pois
        .filter((p: any) => typeof p.lat === 'number' && typeof p.lon === 'number')
        .forEach((p: any) => {
          let baseIntensity = 0.2; 
          
          if (p.tags) {
            // Base intensity on specific POI types
            if (p.tags.railway === 'station' || p.tags.amenity === 'bus_station') { 
              baseIntensity = 1.0; 
            } else if (p.tags.shop === 'mall') { 
              baseIntensity = 0.9; 
            } else if (p.tags.amenity === 'university' || p.tags.amenity === 'college') { 
              baseIntensity = 0.8; 
            } else if (p.tags.amenity === 'hospital') { 
              baseIntensity = 0.6; 
            } else if (p.tags.amenity === 'restaurant' || p.tags.amenity === 'fast_food' || p.tags.amenity === 'cafe') {
              baseIntensity = 0.5;
            } else if (p.tags.office) {
              baseIntensity = 0.7;
            }

            // Time-based modifiers
            if (isRushHour && (p.tags.office || p.tags.railway === 'station')) {
              baseIntensity = Math.min(1.0, baseIntensity * 1.5); 
            }
            if (currentHour >= 11 && currentHour <= 14 && (p.tags.amenity === 'restaurant' || p.tags.amenity === 'fast_food' || p.tags.amenity === 'cafe')) {
              baseIntensity = Math.min(1.0, baseIntensity * 1.8); 
            }
            if (isRaining && p.tags.shop === 'mall') {
              baseIntensity = Math.min(1.0, baseIntensity * 1.5); 
            }
          }
          
          if (baseIntensity > 0.2) {
            const finalIntensity = Math.min(1.0, baseIntensity * timeMultiplier * weatherMultiplier);
            
            // Core epicenter
            realHeatmapData.push([p.lat, p.lon, finalIntensity]);

            // Scatter organic "crowd" points around the POI based on intensity
            // High intensity = wider spread, more points
            const pointCount = Math.floor(finalIntensity * 12); 
            const maxSpread = finalIntensity * 0.003; // up to ~300m spread for huge hotspots
            
            for (let i = 0; i < pointCount; i++) {
              // Use random angle and radius for circular spread
              const angle = Math.random() * Math.PI * 2;
              // Bias towards center (sqrt of random)
              const r = Math.sqrt(Math.random()) * maxSpread;
              
              const scatterLat = p.lat + Math.cos(angle) * r;
              const scatterLon = p.lon + Math.sin(angle) * r;
              
              // Intensity fades further from center
              const falloff = 1 - (r / maxSpread);
              const scatterIntensity = finalIntensity * falloff * (0.5 + Math.random() * 0.5);
              
              if (scatterIntensity > 0.1) {
                realHeatmapData.push([scatterLat, scatterLon, scatterIntensity]);
              }
            }
          }
        });

      const recommendationsList = validNamedPois
        .slice(0, 4)
        .map((p: any) => {
          let addressParts = [];
          if (p.tags['addr:street']) addressParts.push(p.tags['addr:street']);
          if (p.tags['addr:suburb']) addressParts.push(p.tags['addr:suburb']);
          if (p.tags['addr:city']) addressParts.push(p.tags['addr:city']);
          let address = addressParts.join(', ');
          if (!address) {
            address = p.tags.amenity || p.tags.shop || p.tags.office || "Kawasan Publik";
            address = address.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
          }

          return {
            targetLocation: p.tags.name,
            address: address,
            distanceKm: p.distanceKm,
            etaMins: Math.round(p.distanceKm * 4),
            score: p.calculatedScore
          };
        });

      if (recommendationsList.length === 0) {
        recommendationsList.push({
          targetLocation: "Pusat Kota",
          address: "Bandung",
          distanceKm: 2.5,
          etaMins: 10,
          score: 85
        });
      }

      const responseData = {
        score: finalScore,
        demandLevel,
        locationName,
        context: context.length > 0 ? context : ["Kawasan Pemukiman Biasa"],
        recommendation: {
          targetLocation: targetName,
          distanceKm: targetDistance,
          etaMins: Math.round(targetDistance * 4), // Approx 4 mins per km in city traffic
          actionText: actionText
        },
        recommendations: recommendationsList,
        weather: weatherContext,
        heatmapData: realHeatmapData,
      };
      
      res.json(responseData);

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Prediction failed" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
