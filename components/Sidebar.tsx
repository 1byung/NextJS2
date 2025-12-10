import React from "react";
import { Wind, AlertCircle } from "lucide-react";
import { UnitInfo, getStatusColor } from "@/lib/mockData";

interface SidebarProps {
  units: UnitInfo[];
  selectedUnitId: number;
  onSelectUnit: (unitId: number) => void;
}

export default function Sidebar({
  units,
  selectedUnitId,
  onSelectUnit,
}: SidebarProps) {
  return (
    <aside className="w-80 bg-slate-900 border-r border-slate-700 flex flex-col">
      {/* Header/Brand */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <Wind className="w-8 h-8 text-blue-400" />
          <h1 className="text-2xl font-bold text-white">Wind Power</h1>
        </div>
        <p className="text-slate-400 text-sm mt-2">Turbine Monitoring System</p>
      </div>

      {/* Unit List */}
      <div className="flex-1 overflow-y-auto p-4">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">
          Wind Turbines
        </h2>
        <div className="space-y-2">
          {units.map((unit) => {
            const isSelected = unit.id === selectedUnitId;
            const isCritical = unit.status === "critical";
            const statusColor = getStatusColor(unit.status);

            return (
              <button
                key={unit.id}
                onClick={() => onSelectUnit(unit.id)}
                className={`
                  w-full text-left p-4 rounded-lg transition-all duration-200
                  ${
                    isSelected
                      ? "bg-slate-800 shadow-lg ring-2 ring-blue-500"
                      : "bg-slate-800/50 hover:bg-slate-800"
                  }
                  ${isCritical ? "ring-2 ring-red-500 border-red-500" : ""}
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white">{unit.name}</h3>
                      {isCritical && (
                        <AlertCircle className="w-4 h-4 text-red-500 animate-pulse" />
                      )}
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span
                        className="text-2xl font-bold"
                        style={{ color: statusColor }}
                      >
                        {unit.currentYield.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Status Indicator Dot */}
                  <div className="flex flex-col items-end gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: statusColor }}
                    />
                    <span className="text-xs text-slate-400 capitalize">
                      {unit.status}
                    </span>
                  </div>
                </div>

                {/* Status Bar */}
                <div className="mt-3 bg-slate-700 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${unit.currentYield}%`,
                      backgroundColor: statusColor,
                    }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Total Units: {units.length}</span>
          <span>
            Active: {units.filter((u) => u.status !== "critical").length}
          </span>
        </div>
      </div>
    </aside>
  );
}
