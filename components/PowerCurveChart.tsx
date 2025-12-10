'use client';

import React from 'react';
import {
  ComposedChart,
  Scatter,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ZAxis,
} from 'recharts';
import { TrendingUp, Info } from 'lucide-react';
import { PowerCurveDataPoint } from '@/lib/mockData';

interface PowerCurveChartProps {
  actualData: PowerCurveDataPoint[];
  unitName: string;
  unitStatus: 'normal' | 'warning' | 'critical';
}

export default function PowerCurveChart({
  actualData,
  unitName,
  unitStatus,
}: PowerCurveChartProps) {
  // Calculate average performance ratio
  const validData = actualData.filter((d) => d.expectedPower > 0 && d.actualPower !== undefined);
  const performanceRatio =
    validData.reduce((sum, d) => {
      return sum + ((d.actualPower || 0) / d.expectedPower);
    }, 0) / (validData.length || 1);

  const performancePercent = (performanceRatio * 100).toFixed(1);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl">
          <div className="space-y-1">
            <p className="text-sm">
              <span className="text-yellow-400 font-semibold">Wind Speed: </span>
              <span className="text-white">{data.windSpeed} m/s</span>
            </p>
            {data.actualPower !== undefined && (
              <p className="text-sm">
                <span className="text-blue-400 font-semibold">Actual Power: </span>
                <span className="text-white">{data.actualPower.toFixed(1)} kW</span>
              </p>
            )}
            <p className="text-sm">
              <span className="text-gray-400 font-semibold">NBM Range: </span>
              <span className="text-white">{data.minPower.toFixed(0)} - {data.maxPower.toFixed(0)} kW</span>
            </p>
            <p className="text-sm">
              <span className="text-orange-400 font-semibold">Expected: </span>
              <span className="text-white">{data.expectedPower.toFixed(1)} kW</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Get status color
  const getStatusColor = () => {
    switch (unitStatus) {
      case 'critical':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      default:
        return '#22c55e';
    }
  };

  return (
    <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 rounded-xl p-6 border border-yellow-500/20">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-yellow-400" />
            <h2 className="text-xl font-bold text-white">Power Curve Analysis</h2>
          </div>
          <p className="text-sm text-slate-400 mt-1">{unitName} - Wind Speed vs Power Output</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg px-4 py-2 border border-slate-700">
          <p className="text-xs text-slate-400">Performance</p>
          <p className="text-2xl font-bold" style={{ color: getStatusColor() }}>
            {performancePercent}%
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="flex items-start gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4">
        <Info className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-slate-300">
          The <span className="text-gray-400 font-semibold">gray shaded area</span> represents the Normal Behavior Model (NBM) baseline range.
          The <span className={unitStatus === 'critical' ? 'text-red-400 font-semibold' : 'text-blue-400 font-semibold'}>
          {unitStatus === 'critical' ? 'red' : 'blue'} line</span> shows actual power output.
          Normal units should return inside the gray area, while faulty units show failed recovery attempts.
        </p>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={actualData} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />

          <XAxis
            dataKey="windSpeed"
            type="number"
            domain={[0, 25]}
            stroke="#94a3b8"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            label={{
              value: 'Wind Speed (m/s)',
              position: 'insideBottom',
              offset: -10,
              fill: '#94a3b8',
            }}
          />

          <YAxis
            stroke="#94a3b8"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            domain={[0, 2200]}
            label={{
              value: 'Power (kW)',
              angle: -90,
              position: 'insideLeft',
              fill: '#94a3b8',
            }}
          />

          <ZAxis range={[40, 40]} />

          <Tooltip content={<CustomTooltip />} />

          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
            formatter={(value) => <span style={{ color: '#e2e8f0' }}>{value}</span>}
          />

          {/* Gray NBM Baseline Area (Min-Max Range) */}
          <Area
            type="monotone"
            dataKey="maxPower"
            stroke="none"
            fill="#6B7280"
            fillOpacity={0.3}
            name="NBM Upper Bound"
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="minPower"
            stroke="none"
            fill="#1F2937"
            fillOpacity={1}
            name="NBM Lower Bound"
            isAnimationActive={false}
          />

          {/* Actual Power Line */}
          <Line
            type="monotone"
            dataKey="actualPower"
            stroke={getStatusColor()}
            strokeWidth={3}
            dot={false}
            name="Actual Power Output"
            isAnimationActive={false}
            connectNulls={false}
          />

          {/* Actual Data Points - Scatter Dots */}
          <Scatter
            dataKey="actualPower"
            fill={getStatusColor()}
            fillOpacity={0.7}
            name="Data Points"
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Performance Indicators */}
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <p className="text-xs text-slate-400">Data Points</p>
          <p className="text-xl font-bold text-white">{validData.length}</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <p className="text-xs text-slate-400">Avg Wind Speed</p>
          <p className="text-xl font-bold text-white">
            {(validData.reduce((sum, d) => sum + d.windSpeed, 0) / (validData.length || 1)).toFixed(1)} m/s
          </p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <p className="text-xs text-slate-400">Avg Power</p>
          <p className="text-xl font-bold text-white">
            {(validData.reduce((sum, d) => sum + (d.actualPower || 0), 0) / (validData.length || 1)).toFixed(0)} kW
          </p>
        </div>
      </div>
    </div>
  );
}
