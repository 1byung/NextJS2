'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import PowerCurveChart from '@/components/PowerCurveChart';
import CorrelationFactorsChart from '@/components/CorrelationFactorsChart';
import {
  generateUnitsInfo,
  generatePowerCurveData,
  initializeCorrelationFactors,
  generateNextDataPoint,
  sortFactorsByDeviation,
  CorrelationFactor,
} from '@/lib/mockData';

export default function Home() {
  const [selectedUnitId, setSelectedUnitId] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  // ✅ CRITICAL: Initialize with 30 data points immediately - charts must be FULL from first render
  // Start with empty array, populate after mount to avoid hydration mismatch
  const [correlationFactors, setCorrelationFactors] = useState<CorrelationFactor[]>([]);

  // Generate units data (static, no random values)
  const units = useMemo(() => generateUnitsInfo(), []);

  // Generate power curve data for selected unit (includes NBM baseline and actual data)
  // Only generate after mount to avoid hydration mismatch from Math.random()
  const powerCurveData = useMemo(
    () => (isMounted ? generatePowerCurveData(selectedUnitId, 200) : []),
    [selectedUnitId, isMounted]
  );

  // Set mounted flag after client-side hydration (runs once)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Initialize correlation factors when unit changes
  useEffect(() => {
    if (isMounted) {
      setCorrelationFactors(initializeCorrelationFactors(selectedUnitId));
      setCurrentTime(0);
    }
  }, [selectedUnitId, isMounted]);

  // Get selected unit info
  const selectedUnit = units.find((u) => u.id === selectedUnitId);

  // Real-time simulation: Update data every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime((prev) => prev + 1);
      setCorrelationFactors((prevFactors) => {
        const updatedFactors = generateNextDataPoint(selectedUnitId, currentTime, prevFactors);
        // Sort by deviation score (highest deviation first)
        return sortFactorsByDeviation(updatedFactors);
      });
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [selectedUnitId, currentTime]);

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden">
      {/* Left Sidebar */}
      <Sidebar
        units={units}
        selectedUnitId={selectedUnitId}
        onSelectUnit={setSelectedUnitId}
      />

      {/* Right Main View */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {selectedUnit?.name} - Detailed Analysis
                </h1>
                <p className="text-slate-400">
                  Real-time monitoring and performance analytics
                </p>
              </div>
              <div className="bg-slate-800 rounded-lg px-6 py-4 border border-slate-700">
                <p className="text-xs text-slate-400 mb-1">Current Status</p>
                <p className={`text-2xl font-bold ${
                  selectedUnit?.status === 'critical' ? 'text-red-500' :
                  selectedUnit?.status === 'warning' ? 'text-yellow-500' :
                  'text-green-500'
                }`}>
                  {selectedUnit?.status.toUpperCase()}
                </p>
              </div>
            </div>
          </div>

          {/* Top Chart - Power Curve Analysis (Yellow Section) */}
          <PowerCurveChart
            actualData={powerCurveData}
            unitName={selectedUnit?.name || ''}
            unitStatus={selectedUnit?.status || 'normal'}
          />

          {/* Bottom Charts - Correlation Factors (Green Section) */}
          <CorrelationFactorsChart
            factors={correlationFactors}
            unitId={selectedUnitId}
            unitName={selectedUnit?.name || ''}
          />

          {/* Footer Info */}
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center justify-between text-sm text-slate-400">
              <span>Last Updated: {new Date().toLocaleString()}</span>
              <span>Data Interval: 5 minutes</span>
              <span>Time Range: 24 hours</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
