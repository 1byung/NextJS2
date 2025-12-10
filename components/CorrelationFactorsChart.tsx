'use client';

import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Activity, Gauge, Thermometer, AlertTriangle, Wind } from 'lucide-react';
import { CorrelationFactor } from '@/lib/mockData';
import AnalysisModal from './AnalysisModal';

interface CorrelationFactorsChartProps {
  factors: CorrelationFactor[];
  unitId: number;
  unitName: string;
}

export default function CorrelationFactorsChart({ factors, unitId, unitName }: CorrelationFactorsChartProps) {
  const [selectedFactor, setSelectedFactor] = useState<CorrelationFactor | null>(null);

  // Get icon for each factor
  const getIcon = (id: string) => {
    switch (id) {
      case 'pitch':
        return <Gauge className="w-5 h-5" />;
      case 'rotor':
        return <Activity className="w-5 h-5" />;
      case 'generator':
        return <Thermometer className="w-5 h-5" />;
      case 'windSpeed':
        return <Wind className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  // Get color based on deviation score
  const getColor = (deviationScore: number) => {
    if (deviationScore > 50) return '#ef4444'; // Red - Critical
    if (deviationScore > 25) return '#f59e0b'; // Amber - Warning
    return '#10b981'; // Green - Normal
  };

  // Get domain for Y-axis based on factor type
  const getDomain = (id: string): [number, number] => {
    switch (id) {
      case 'pitch':
        return [0, 30];
      case 'rotor':
        return [0, 25];
      case 'generator':
        return [60, 100];
      case 'windSpeed':
        return [0, 20];
      default:
        return [0, 100];
    }
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl">
          <p className="text-xs text-slate-400 mb-2">Time: {label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm">
              <span style={{ color: entry.color }}>{entry.name}: </span>
              <span className="text-white font-semibold">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-xl p-6 border border-green-500/20">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-1">
          Correlation Factors
          <span className="ml-2 text-xs text-slate-400">(Auto-sorted by Severity)</span>
        </h2>
        <p className="text-sm text-slate-400">
          Factors are dynamically reordered based on deviation from normal range. Top = Most Critical.
        </p>
      </div>

      {/* Factor Charts - 2x2 Grid, Sorted by Deviation */}
      <div className="grid grid-cols-2 gap-4">
        {factors.map((factor, index) => {
          const color = getColor(factor.deviationScore);
          const isCritical = factor.deviationScore > 50;
          const isWarning = factor.deviationScore > 25 && factor.deviationScore <= 50;

          return (
            <div
              key={factor.id}
              onClick={() => setSelectedFactor(factor)}
              className={`bg-slate-800/50 rounded-lg p-3 border transition-all duration-500 cursor-pointer hover:bg-slate-800/70 ${
                isCritical
                  ? 'border-red-500 shadow-lg shadow-red-500/20 hover:shadow-red-500/30'
                  : isWarning
                  ? 'border-yellow-500 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30'
                  : 'border-slate-700 hover:border-slate-600'
              }`}
            >
              {/* Factor Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {/* Rank Badge */}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                      index === 0
                        ? 'bg-red-500/20 text-red-400 border border-red-500'
                        : index === 1
                        ? 'bg-orange-500/20 text-orange-400 border border-orange-500'
                        : index === 2
                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500'
                        : 'bg-green-500/20 text-green-400 border border-green-500'
                    }`}
                  >
                    {index + 1}
                  </div>

                  <div style={{ color }}>
                    {getIcon(factor.id)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-xs">{factor.name}</h3>
                    <p className="text-[10px] text-slate-400">
                      {factor.normalRange.min}-{factor.normalRange.max} {factor.unit}
                    </p>
                  </div>

                  {isCritical && (
                    <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
                  )}
                </div>

                <div className="text-right">
                  <p className="text-xl font-bold" style={{ color }}>
                    {factor.value}
                  </p>
                  <p className="text-[10px] text-slate-400">{factor.unit}</p>
                  <p className="text-xs font-bold mt-0.5" style={{ color }}>
                    {factor.deviationScore.toFixed(0)}%
                  </p>
                </div>
              </div>

              {/* Mini Chart */}
              {factor.history.length > 0 && (
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart
                    data={factor.history}
                    margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                    <XAxis
                      dataKey="time"
                      stroke="#64748b"
                      tick={{ fontSize: 10, fill: '#64748b' }}
                    />
                    <YAxis
                      stroke="#64748b"
                      tick={{ fontSize: 9, fill: '#64748b' }}
                      domain={getDomain(factor.id)}
                      width={35}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={color}
                      strokeWidth={2}
                      dot={false}
                      name={factor.name}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}

              {/* Deviation Indicator */}
              <div className="mt-2">
                <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, factor.deviationScore)}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Real-time Update Indicator */}
      <div className="mt-4 bg-green-500/10 border border-green-500/30 rounded-lg p-3">
        <p className="text-xs text-slate-300">
          <span className="text-green-400 font-semibold">🔄 Live Monitoring: </span>
          Data updates every 5 seconds. Charts reorder in 2x2 grid:
          <span className="font-semibold"> #1 (Top-Left) → #2 (Top-Right) → #3 (Bottom-Left) → #4 (Bottom-Right)</span>.
          <span className="text-blue-400 font-semibold"> Click any chart</span> to view detailed distribution analysis.
        </p>
      </div>

      {/* Analysis Modal */}
      {selectedFactor && (
        <AnalysisModal
          factor={selectedFactor}
          unitId={unitId}
          unitName={unitName}
          onClose={() => setSelectedFactor(null)}
        />
      )}
    </div>
  );
}
