import React, { useEffect, memo } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

export type HeatmapPoint = [number, number, number];

// Fix for default marker icons in Leaflet with Webpack/Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function HeatmapOverlay({ heatmapData }: { heatmapData: HeatmapPoint[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (!map) return;
    
    let heatLayer: any;
    let timeoutId: ReturnType<typeof setTimeout>;
    let isMounted = true;
    
    const initHeatmap = () => {
      if (!isMounted) return;
      const size = map.getSize();
      if (size.x === 0 || size.y === 0) {
        map.invalidateSize();
        timeoutId = setTimeout(initHeatmap, 100);
        return;
      }

      const points = heatmapData.map(p => [p[0], p[1], p[2]]);
      
      // @ts-ignore
      window.L = L;
      import('leaflet.heat').then(() => {
        if (!isMounted || !map) return; // check if unmounted during import
        
        if (heatLayer && map.hasLayer(heatLayer)) {
          map.removeLayer(heatLayer);
        }

        heatLayer = (L as any).heatLayer(points, {
          radius: 40,
          blur: 35,
          maxZoom: 15,
          max: 1.0,
          gradient: {
            0.2: '#bae6fd', // sky-200
            0.4: '#38bdf8', // sky-400
            0.6: '#facc15', // yellow-400
            0.8: '#f97316', // orange-500
            1.0: '#dc2626'  // red-600
          }
        }).addTo(map);
      }).catch(err => {
        console.error("Failed to load leaflet.heat", err);
      });
    };

    initHeatmap();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      if (heatLayer && map.hasLayer(heatLayer)) {
        map.removeLayer(heatLayer);
      }
    };
  }, [map, heatmapData]);

  return null;
}

// Custom driver icon using DivIcon
const driverIcon = new L.DivIcon({
  className: 'custom-driver-icon',
  html: '<div class="bg-[#111111] w-6 h-6 rounded-full border-4 border-white shadow-[0_0_15px_rgba(17,17,17,0.5)] animate-pulse flex items-center justify-center"><div class="w-2 h-2 bg-[#FFC107] rounded-full"></div></div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// Component to handle recentering the map
function MapController({ center, forceCenter = 0 }: { center: {lat: number, lng: number}, forceCenter?: number }) {
  const map = useMap();
  const prevForceCenter = React.useRef(forceCenter);
  const [initialCentered, setInitialCentered] = React.useState(false);

  useEffect(() => {
    if (!initialCentered || forceCenter !== prevForceCenter.current) {
      map.setView([center.lat, center.lng], map.getZoom(), {
        animate: true,
        duration: 0.5
      });
      setInitialCentered(true);
      prevForceCenter.current = forceCenter;
    }
  }, [center.lat, center.lng, forceCenter, map, initialCentered]);

  return null;
}

interface MapViewProps {
  heatmapData: HeatmapPoint[];
  driverPosition: { lat: number; lng: number; accuracy?: number; heading?: number };
  forceCenter?: number;
}

export const MapView = memo(function MapView({ heatmapData, driverPosition, forceCenter }: MapViewProps) {
  return (
    <div className="absolute inset-0 w-full h-full z-0">
      <MapContainer 
        center={[driverPosition.lat, driverPosition.lng]} 
        zoom={14} 
        preferCanvas={true}
        style={{ height: '100%', width: '100%', background: '#F8FAFC' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <HeatmapOverlay heatmapData={heatmapData} />
        <MapController center={driverPosition} forceCenter={forceCenter} />
        
        {/* Real-time accuracy circle */}
        {driverPosition.accuracy && (
          <Circle 
            center={[driverPosition.lat, driverPosition.lng]} 
            radius={driverPosition.accuracy} 
            pathOptions={{ color: '#3B82F6', fillColor: '#3B82F6', fillOpacity: 0.15, weight: 1 }} 
          />
        )}
        {/* Main driver marker */}
        <Marker position={[driverPosition.lat, driverPosition.lng]} icon={driverIcon} />
      </MapContainer>
    </div>
  );
});
