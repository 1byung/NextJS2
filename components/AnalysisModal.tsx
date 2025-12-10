'use client';

import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { X, TrendingUp, Activity } from 'lucide-react';
import { CorrelationFactor, generateDistributionData } from '@/lib/mockData';

interface AnalysisModalProps {
  factor: CorrelationFactor | null;
  unitId: number;
  unitName: string;
  onClose: () => void;
}

export default function AnalysisModal({ factor, unitId, unitName, onClose }: AnalysisModalProps) {
  // Generate distribution data
  const distributionData = useMemo(() => {
    if (!factor) return null;
    return generateDistributionData(factor, unitId);
  }, [factor, unitId]);

  // Merge reference and actual data for Recharts
  const chartData = useMemo(() => {
    if (!distributionData) return [];

    return distributionData.reference.map((point, index) => ({
      value: point.value,
      referenceDensity: point.density,
      actualDensity: distributionData.actual[index]?.density || 0,
    }));
  }, [distributionData]);

  // Get color based on deviation
  const getColor = (deviationScore: number) => {
    if (deviationScore > 50) return '#ef4444'; // Red - Critical
    if (deviationScore > 25) return '#f59e0b'; // Amber - Warning
    return '#10b981'; // Green - Normal
  };

  if (!factor || !distributionData) return null;

  const color = getColor(factor.deviationScore);
  const isCritical = factor.deviationScore > 50;
  const isWarning = factor.deviationScore > 25 && factor.deviationScore <= 50;

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl">
          <p className="text-xs text-slate-400 mb-2">Value: {label} {factor.unit}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm">
              <span style={{ color: entry.color }}>{entry.name}: </span>
              <span className="text-white font-semibold">{entry.value.toFixed(4)}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-2xl border-2 border-slate-700 shadow-2xl w-[90vw] max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-slate-800 rounded-full p-3" style={{ borderColor: color, borderWidth: 2 }}>
                <Activity className="w-6 h-6" style={{ color }} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  Distribution Analysis: {factor.name}
                </h2>
                <p className="text-sm text-slate-400">
                  {unitName} - Statistical Comparison (NBM vs Actual)
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 rounded-lg p-2 transition-colors"
            >
              <X className="w-6 h-6 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Statistics Summary */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Reference (NBM) Stats */}
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-4 h-4 rounded bg-gray-500 opacity-50"></div>
                <h3 className="text-sm font-semibold text-slate-300">Reference (NBM)</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-slate-400">Mean (μ):</span>
                  <span className="text-sm font-bold text-white">
                    {distributionData.referenceMean} {factor.unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-400">Std Dev (σ):</span>
                  <span className="text-sm font-bold text-white">
                    {distributionData.referenceStdDev} {factor.unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-400">Status:</span>
                  <span className="text-sm font-bold text-green-400">Baseline</span>
                </div>
              </div>
            </div>

            {/* Actual Stats */}
            <div
              className="bg-slate-800/50 rounded-lg p-4 border-2 transition-all"
              style={{ borderColor: color }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: color }}></div>
                <h3 className="text-sm font-semibold text-slate-300">Actual (Current)</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-slate-400">Mean (μ):</span>
                  <span className="text-sm font-bold text-white">
                    {distributionData.actualMean} {factor.unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-400">Std Dev (σ):</span>
                  <span className="text-sm font-bold text-white">
                    {distributionData.actualStdDev} {factor.unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-400">Deviation:</span>
                  <span className="text-sm font-bold" style={{ color }}>
                    {factor.deviationScore.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-300 mb-2">
                  <span className="font-semibold text-blue-400">Interpretation:</span>
                </p>
                <p className="text-xs text-slate-400">
                  {isCritical && (
                    <>
                      <span className="text-red-400 font-semibold">Critical Deviation:</span> The actual distribution is
                      <span className="font-semibold"> heavily shifted</span> from the baseline. This indicates
                      <span className="font-semibold"> severe performance degradation</span> requiring immediate attention.
                    </>
                  )}
                  {isWarning && !isCritical && (
                    <>
                      <span className="text-yellow-400 font-semibold">Warning:</span> The actual distribution shows
                      <span className="font-semibold"> moderate deviation</span> from the baseline. This suggests
                      <span className="font-semibold"> optimization in progress</span> or a recoverable fault.
                    </>
                  )}
                  {!isWarning && !isCritical && (
                    <>
                      <span className="text-green-400 font-semibold">Normal Operation:</span> The actual distribution
                      <span className="font-semibold"> closely matches</span> the baseline. The turbine is operating
                      <span className="font-semibold"> within expected parameters</span>.
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Bell Curve Chart */}
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <h3 className="text-sm font-semibold text-slate-300 mb-4">
              Probability Density Function (Gaussian Distribution)
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />

                <XAxis
                  dataKey="value"
                  stroke="#94a3b8"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  label={{
                    value: `${factor.name} (${factor.unit})`,
                    position: 'insideBottom',
                    offset: -10,
                    fill: '#94a3b8',
                  }}
                />

                <YAxis
                  stroke="#94a3b8"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  label={{
                    value: 'Probability Density',
                    angle: -90,
                    position: 'insideLeft',
                    fill: '#94a3b8',
                  }}
                />

                <Tooltip content={<CustomTooltip />} />

                <Legend
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="circle"
                  formatter={(value) => <span style={{ color: '#e2e8f0' }}>{value}</span>}
                />

                {/* Reference line at mean values */}
                <ReferenceLine
                  x={distributionData.referenceMean}
                  stroke="#9ca3af"
                  strokeDasharray="3 3"
                  label={{ value: 'NBM μ', fill: '#9ca3af', fontSize: 10 }}
                />
                <ReferenceLine
                  x={distributionData.actualMean}
                  stroke={color}
                  strokeDasharray="3 3"
                  label={{ value: 'Actual μ', fill: color, fontSize: 10 }}
                />

                {/* Reference (NBM) Distribution - Gray Dashed */}
                <Area
                  type="monotone"
                  dataKey="referenceDensity"
                  stroke="#9ca3af"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fill="#9ca3af"
                  fillOpacity={0.2}
                  name="Reference (NBM)"
                  isAnimationActive={true}
                />

                {/* Actual Distribution - Colored Solid */}
                <Area
                  type="monotone"
                  dataKey="actualDensity"
                  stroke={color}
                  strokeWidth={3}
                  fill={color}
                  fillOpacity={0.3}
                  name="Actual (Current)"
                  isAnimationActive={true}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Normal Range Indicator */}
          <div className="mt-4 bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <p className="text-xs text-slate-400 mb-2">Normal Operating Range:</p>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-green-400">{factor.normalRange.min} {factor.unit}</span>
              <div className="flex-1 bg-slate-700 rounded-full h-2 overflow-hidden">
                <div className="bg-green-500 h-full" style={{ width: '100%' }}></div>
              </div>
              <span className="text-sm font-bold text-green-400">{factor.normalRange.max} {factor.unit}</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Current Value: <span className="font-bold" style={{ color }}>{factor.value} {factor.unit}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
