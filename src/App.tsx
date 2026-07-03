import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { HomeView } from './components/HomeView';
import { RadarView } from './components/RadarView';
import { WorkModeView } from './components/WorkModeView';
import { SmartNewsAlert, AlertType } from './components/SmartNewsAlert';
import { CopilotSheet } from './components/CopilotSheet';
import { ConfirmDialog } from './components/ConfirmDialog';
import { SettingsSheet } from './components/SettingsSheet';
import { OrderInputSheet } from './components/OrderInputSheet';
import { ShiftRecapSheet } from './components/ShiftRecapSheet';
import { RecommendationsSheet } from './components/RecommendationsSheet';
import { FinalReceiptModal } from './components/FinalReceiptModal';
import { SOSButton } from './components/SOSButton';
import { 
  ViewState, 
  FinalReceiptData, 
  DriverPosition, 
  DriverConfig, 
  ShiftStats, 
  OrderHistoryItem, 
  Recommendation 
} from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [driverPosition, setDriverPosition] = useState<DriverPosition>({ lat: -6.8906, lng: 107.6105, accuracy: 10, heading: 0 }); // Dago, Bandung
  const [score, setScore] = useState(85);
  const [locationName, setLocationName] = useState("Mencari Lokasi...");
  const [recommendation, setRecommendation] = useState<Recommendation>({
    targetLocation: "Antapani",
    distanceKm: 1.4,
    etaMins: 5,
    actionText: "Geser ke Antapani"
  });
  const [recommendationsList, setRecommendationsList] = useState<Recommendation[]>([]);
  const [contextPills, setContextPills] = useState(["Kampus Aktif", "Lalin Sedang", "Cerah"]);
  const [heatmapData, setHeatmapData] = useState<Array<[number, number, number]>>([]);
  
  const [activeTargetLocation, setActiveTargetLocation] = useState<string | null>(null);
  const [activeTargetAddress, setActiveTargetAddress] = useState<string | null>(null);
  
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<AlertType>('news');
  const [showCopilot, setShowCopilot] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showOrderInput, setShowOrderInput] = useState(false);
  const [showRecapSheet, setShowRecapSheet] = useState(false);
  const [showFinalReceipt, setShowFinalReceipt] = useState(false);
  const [finalReceiptData, setFinalReceiptData] = useState<FinalReceiptData | null>(null);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Driver Configuration
  const [driverConfig, setDriverConfig] = useState<DriverConfig>({
    vehicleType: 'motorcycle',
    serviceType: 'all',
    targetIncome: 150000,
  });

  // Shift statistics
  const [shiftStats, setShiftStats] = useState<ShiftStats>({ orders: 0, income: 0 });
  const [orderHistory, setOrderHistory] = useState<OrderHistoryItem[]>([]);
  
  // Confirmation states
  const [confirmState, setConfirmState] = useState<{
    isVisible: boolean;
    title: string;
    message: string;
    confirmText?: string;
    variant?: 'danger' | 'primary';
    onConfirm: () => void;
  }>({ isVisible: false, title: '', message: '', onConfirm: () => {} });

  const closeConfirm = () => setConfirmState(prev => ({ ...prev, isVisible: false }));

  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchInsights = async (lat: number, lng: number, config = driverConfig) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lng, time: new Date().toISOString(), config })
      });
      if (res.ok) {
        const data = await res.json();
        setScore(data.score);
        setRecommendation(data.recommendation);
        if (data.recommendations) setRecommendationsList(data.recommendations);
        if (data.locationName) setLocationName(data.locationName);
        if (data.heatmapData) setHeatmapData(data.heatmapData);
        
        let newPills = [...data.context];
        if (data.weather) newPills.push(data.weather);
        setContextPills(newPills);
        setLastUpdated(new Date());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch for default location
    fetchInsights(driverPosition.lat, driverPosition.lng);

    let watchId: number;

    if ('geolocation' in navigator) {
      // First get current position quickly
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newPos = { 
            lat: position.coords.latitude, 
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy || 10,
            heading: position.coords.heading || 0
          };
          setDriverPosition(newPos);
          fetchInsights(newPos.lat, newPos.lng);
        },
        (error) => {
          console.log("Using default location", error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );

      // Then watch for continuous updates
      let lastUpdate = 0;
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const now = Date.now();
          // Throttle updates to at most once every 5 seconds to prevent excessive re-renders
          if (now - lastUpdate > 5000) {
            setDriverPosition(prev => {
              // Only update if location changed significantly (e.g. > 10 meters)
              // For simplicity, we just throttle by time here, but could also check distance
              return { 
                lat: position.coords.latitude, 
                lng: position.coords.longitude,
                accuracy: position.coords.accuracy || 10,
                heading: position.coords.heading || 0
              };
            });
            lastUpdate = now;
          }
        },
        (error) => console.log("Error watching location", error),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
      );
    }

    const timer = setTimeout(() => {
      setAlertMessage("");
      setAlertType('news');
      setShowAlert(true);
    }, 5000);

    return () => {
      clearTimeout(timer);
      if (watchId !== undefined && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  const driverPositionRef = React.useRef(driverPosition);
  const driverConfigRef = React.useRef(driverConfig);

  useEffect(() => {
    driverPositionRef.current = driverPosition;
    driverConfigRef.current = driverConfig;
  }, [driverPosition, driverConfig]);

  // Poll for latest insights every 3 minutes
  useEffect(() => {
    const pollTimer = setInterval(() => {
      fetchInsights(driverPositionRef.current.lat, driverPositionRef.current.lng, driverConfigRef.current);
    }, 180000);
    return () => clearInterval(pollTimer);
  }, []);

  const triggerAlert = (message: string, type: AlertType = 'success') => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
  };

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-white font-sans selection:bg-[#FFC107]/30">
      
      {currentView === 'home' && (
        <HomeView 
          score={score}
          locationName={locationName}
          driverPosition={driverPosition}
          heatmapData={heatmapData}
          recommendation={recommendation}
          contextPills={contextPills}
          shiftStats={shiftStats}
          targetIncome={driverConfig.targetIncome}
          lastUpdated={lastUpdated}
          isLoading={isLoading}
          driverConfig={driverConfig}
          activeTargetLocation={activeTargetLocation}
          activeTargetAddress={activeTargetAddress}
          onNavigateRadar={() => setCurrentView('radar')}
          onShowRecommendations={() => setShowRecommendations(true)}
          onStartWork={() => {
            setConfirmState({
              isVisible: true,
              title: 'Mulai Shift Kerja?',
              message: 'Pastikan kondisi kendaraan dan fisik Anda optimal sebelum memulai.',
              confirmText: 'Ya, Mulai Shift',
              variant: 'primary',
              onConfirm: () => {
                setCurrentView('work');
                closeConfirm();
              }
            });
          }}
          onResetStats={() => {
            setConfirmState({
              isVisible: true,
              title: 'Reset Data Shift?',
              message: 'Tindakan ini akan mereset statistik order dan pendapatan Anda hari ini. Lanjutkan?',
              confirmText: 'Ya, Reset Data',
              variant: 'danger',
              onConfirm: () => {
                setShiftStats({ orders: 0, income: 0 });
                closeConfirm();
                triggerAlert('Data shift berhasil direset.');
              }
            });
          }}
          onCopilot={() => setShowCopilot(true)}
          onSettings={() => setShowSettings(true)}
          onRecapShift={() => setShowRecapSheet(true)}
        />
      )}

      {currentView === 'radar' && (
        <RadarView 
          driverPosition={driverPosition}
          heatmapData={heatmapData}
          weather={contextPills.find(p => p.includes("Cerah") || p.includes("Hujan") || p.includes("Mendung") || p.includes("Awan") || p.includes("Gerimis")) || "Cerah"}
          onClose={() => setCurrentView('home')}
        />
      )}

      {currentView === 'work' && (
        <WorkModeView 
          score={score}
          recommendation={recommendation}
          shiftStats={shiftStats}
          targetIncome={driverConfig.targetIncome}
          onStopWork={() => {
            setConfirmState({
              isVisible: true,
              title: 'Akhiri Shift?',
              message: 'Anda akan berhenti menerima rekomendasi area prioritas.',
              confirmText: 'Istirahat dulu?',
              cancelText: 'Batal',
              variant: 'danger',
              onConfirm: () => {
                setCurrentView('home');
                closeConfirm();
              }
            });
          }}
          onNavigate={() => {
            setActiveTargetLocation(recommendation.targetLocation);
            setActiveTargetAddress(null); // Wait, recommendation from predict has no address?
            triggerAlert(`Target lokasi diatur ke ${recommendation.targetLocation} (${recommendation.distanceKm} km)`, 'success');
          }}
          onReportOrder={() => setShowOrderInput(true)}
          onReportQuiet={() => setShowCopilot(true)} // if quiet, show copilot!
        />
      )}

      <SmartNewsAlert 
        isVisible={showAlert && currentView !== 'radar'} 
        message={alertMessage}
        type={alertType}
        onClose={() => setShowAlert(false)}
        locationName={locationName}
        weather={contextPills.find(p => p.includes("Cerah") || p.includes("Hujan") || p.includes("Mendung") || p.includes("Awan") || p.includes("Gerimis")) || "Cerah"}
        onWarning={(msg) => triggerAlert(msg, 'warning')}
        config={driverConfig}
      />

      <OrderInputSheet 
        isVisible={showOrderInput}
        onClose={() => setShowOrderInput(false)}
        onSubmit={({ amount, time, location }) => {
          setOrderHistory(prev => [...prev, { id: Math.random().toString(36).substring(7), amount, time, location }]);
          setShiftStats(prev => ({ orders: prev.orders + 1, income: prev.income + amount }));
          setShowOrderInput(false);
          triggerAlert("Data pendapatan berhasil disimpan!");
        }}
      />

      <ShiftRecapSheet 
        isVisible={showRecapSheet}
        onClose={() => setShowRecapSheet(false)}
        shiftStats={shiftStats}
        orderHistory={orderHistory}
        onSubmit={(details) => {
          setFinalReceiptData({
            date: new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
            totalOrders: shiftStats.orders,
            grossIncome: details.grossIncome,
            expenses: details.expenses,
            netIncome: details.netIncome,
            orderHistory: [...orderHistory]
          });
          setShowRecapSheet(false);
          setShiftStats({ orders: 0, income: 0 });
          setOrderHistory([]);
          setShowFinalReceipt(true);
        }}
      />

      <CopilotSheet 
        isVisible={showCopilot}
        onClose={() => setShowCopilot(false)}
        contextData={{
          score,
          demandLevel: recommendation.actionText.includes("Bertahan") ? "High" : "Medium/Low",
          locationName,
          weather: contextPills.find(p => p.includes('Hujan') || p.includes('Cerah') || p.includes('Berawan')) || "Cerah",
          contextPills,
          config: driverConfig
        }}
        onWarning={(msg) => triggerAlert(msg, 'warning')}
      />

      <SettingsSheet 
        isVisible={showSettings}
        onClose={() => setShowSettings(false)}
        config={driverConfig}
        onSave={(newConfig) => {
          setDriverConfig(newConfig);
          setShowSettings(false);
          triggerAlert("Pengaturan berhasil disimpan.");
          fetchInsights(driverPosition.lat, driverPosition.lng, newConfig);
        }}
      />

      <ConfirmDialog 
        isVisible={confirmState.isVisible}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        variant={confirmState.variant}
        onConfirm={confirmState.onConfirm}
        onCancel={closeConfirm}
      />

      <RecommendationsSheet
        isVisible={showRecommendations}
        onClose={() => setShowRecommendations(false)}
        recommendations={recommendationsList}
        onNavigate={(rec) => {
          setShowRecommendations(false);
          setActiveTargetLocation(rec.targetLocation);
          setActiveTargetAddress(rec.address || null);
          triggerAlert(`Target lokasi diatur ke ${rec.targetLocation} (${rec.distanceKm} km)`, 'success');
        }}
      />

      <FinalReceiptModal 
        isVisible={showFinalReceipt}
        onClose={() => setShowFinalReceipt(false)}
        data={finalReceiptData}
      />

      {/* SOS Button available in all views */}
      <SOSButton 
        emergencyNumber={driverConfig.emergencyNumber}
        driverPosition={driverPosition}
        triggerAlert={triggerAlert}
      />
    </div>
  );
}

