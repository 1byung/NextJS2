"use client";

import React from "react";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Info } from "lucide-react";
import { TimeSeriesDataPoint } from "@/lib/mockData";

interface YieldAnalysisChartProps {
  data: TimeSeriesDataPoint[];
  unitName: string;
}

export default function YieldAnalysisChart({
  data,
  unitName,
}: YieldAnalysisChartProps) {
  // Calculate average yield
  const avgYield =
    data.reduce(
      (sum, d: any) => sum + (d.power || d.value || d.actualYield || 0),
      0
    ) / data.length;

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl">
          <p className="text-xs text-slate-400 mb-2">
            {new Date(data.timestamp).toLocaleString()}
          </p>
          <div className="space-y-1">
            <p className="text-sm">
              <span className="text-blue-400 font-semibold">
                Actual Yield:{" "}
              </span>
              <span className="text-white">{data.actualYield.toFixed(2)}%</span>
            </p>
            <p className="text-sm">
              <span className="text-yellow-400 font-semibold">NBM Range: </span>
              <span className="text-white">
                {data.baselineMin.toFixed(1)}% - {data.baselineMax.toFixed(1)}%
              </span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 rounded-xl p-6 border border-yellow-500/20">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-yellow-400" />
            <h2 className="text-xl font-bold text-white">
              Yield Analysis - NBM Baseline
            </h2>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            {unitName} - 24 Hour Performance
          </p>
        </div>
        <div className="bg-slate-800/50 rounded-lg px-4 py-2 border border-slate-700">
          <p className="text-xs text-slate-400">Avg Yield</p>
          <p className="text-2xl font-bold text-blue-400">
            {avgYield.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="flex items-start gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4">
        <Info className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-slate-300">
          The <span className="text-yellow-400 font-semibold">shaded area</span>{" "}
          represents the Normal Behavior Model (NBM) baseline. The{" "}
          <span className="text-blue-400 font-semibold">blue line</span> shows
          actual yield. Deviations outside the baseline indicate anomalies
          requiring attention.
        </p>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={350}>
        <ComposedChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="baselineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.05} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />

          <XAxis
            dataKey="time"
            stroke="#94a3b8"
            tick={{ fill: "#94a3b8", fontSize: 12 }}
            tickFormatter={(value) => {
              if (value % 24 === 0) return `${value / 12}h`;
              return "";
            }}
          />

          <YAxis
            stroke="#94a3b8"
            tick={{ fill: "#94a3b8", fontSize: 12 }}
            domain={[75, 105]}
            label={{
              value: "Yield (%)",
              angle: -90,
              position: "insideLeft",
              fill: "#94a3b8",
            }}
          />

          <Tooltip content={<CustomTooltip />} />

          <Legend
            wrapperStyle={{ paddingTop: "20px" }}
            iconType="line"
            formatter={(value) => (
              <span style={{ color: "#e2e8f0" }}>{value}</span>
            )}
          />

          {/* NBM Baseline Area (Yellow shaded region) */}
          <Area
            type="monotone"
            dataKey="baselineMax"
            stroke="none"
            fill="url(#baselineGradient)"
            name="NBM Baseline"
          />
          <Area
            type="monotone"
            dataKey="baselineMin"
            stroke="none"
            fill="#0a0e1a"
            name=""
          />

          {/* Baseline boundary lines */}
          <Line
            type="monotone"
            dataKey="baselineMax"
            stroke="#fbbf24"
            strokeWidth={1}
            strokeDasharray="5 5"
            dot={false}
            name=""
            opacity={0.6}
          />
          <Line
            type="monotone"
            dataKey="baselineMin"
            stroke="#fbbf24"
            strokeWidth={1}
            strokeDasharray="5 5"
            dot={false}
            name=""
            opacity={0.6}
          />

          {/* Actual Yield Line (Blue) */}
          <Line
            type="monotone"
            dataKey="actualYield"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={false}
            name="Actual Yield"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
