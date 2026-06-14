/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  Building2, 
  MapPin, 
  ShieldAlert, 
  Users, 
  Wrench, 
  CheckCircle2, 
  ArrowUpRight,
  TrendingUp,
  Radio
} from 'lucide-react';
import { Station, Alert, MaintenanceOrder, Technician } from '../types';

interface ShiftScheduleRow {
  id: number;
  employee_name: string;
  nip: string | null;
  no_hp: string | null;
  month: string;
  shifts: Record<number, string>;
}

interface StationsViewProps {
  stations: Station[];
  alerts: Alert[];
  orders: MaintenanceOrder[];
  technicians: Technician[];
  shift_schedules?: ShiftScheduleRow[];
  today_day?: number;
}

export default function StationsView({ 
  stations, 
  alerts, 
  orders, 
  technicians,
  shift_schedules = [],
  today_day
}: StationsViewProps) {
  const unresolvedAlerts = alerts.filter(a => !a.resolved_at);

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-[#F4F5F7] text-[#1A1C1E] font-sans">
      
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 m-0 leading-none">Stations & Depots Operations Map</h2>
        <p className="text-[10px] text-gray-400 font-mono mt-1 uppercase tracking-wider select-none">Repair Bays Summary & Technician Logistics Status</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {stations.map(station => {
          const stationAlerts = unresolvedAlerts.filter(a => a.station_id === station.id);
          const stationCriticalAlerts = stationAlerts.filter(a => a.severity === 'critical');
          
          const dayKey = today_day ?? new Date().getDate();
          
          const dynamicTechs = shift_schedules.filter(row => {
            const shiftCodeForToday = row.shifts?.[dayKey];
            if (!shiftCodeForToday) return false;
            
            const shiftCodeUpper = shiftCodeForToday.toUpperCase();
            const stationCodeUpper = station.code.toUpperCase();
            
            if (stationCodeUpper === 'HLM') {
              return shiftCodeUpper.includes('HLM');
            }
            if (stationCodeUpper === 'KWG') {
              return shiftCodeUpper.includes('KWG') || shiftCodeUpper.includes('KRW');
            }
            if (stationCodeUpper === 'PDL') {
              return shiftCodeUpper.includes('PDL') || shiftCodeUpper.includes('PDG');
            }
            if (stationCodeUpper === 'TGL') {
              return shiftCodeUpper.includes('TGL') || shiftCodeUpper.includes('TGR');
            }
            return false;
          }).map(row => ({
            id: `dynamic-${row.id}`,
            name: row.employee_name,
            specialization: row.shifts?.[dayKey]
          }));

          const stationOrders = orders.filter(o => o.station_id === station.id);
          const completedOrders = stationOrders.filter(o => o.status === 'completed');
          const activeOrders = stationOrders.filter(o => o.status === 'in_progress');

          const completionRate = stationOrders.length > 0 
            ? Math.round((completedOrders.length / stationOrders.length) * 100) 
            : 100;

          const isCriticalStatus = stationCriticalAlerts.length > 0;

          return (
            <div 
              key={station.id} 
              className={`bg-white border rounded-[4px] p-6 space-y-5 shadow-sm hover:shadow-md transition-all duration-150 ${
                isCriticalStatus ? 'border-l-4 border-l-[#C8102E] border-gray-200' : 'border-gray-200'
              }`}
            >
              
              {/* Card Title Block */}
              <div className="flex items-start justify-between pb-3 border-b border-gray-150">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      isCriticalStatus 
                        ? 'bg-[#C8102E] animate-pulse-slow' 
                        : stationAlerts.length > 0 
                        ? 'bg-amber-500 animate-pulse-slow' 
                        : 'bg-emerald-500'
                    }`}></span>
                    <h3 className="text-sm font-bold text-gray-900 leading-none font-sans">{station.name}</h3>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span>{station.location}</span>
                  </div>
                </div>

                <div className="bg-[#1A1C1E] text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-[3px] tracking-wide select-none">
                  {station.code}
                </div>
              </div>

              {/* Station Metrics Grid */}
              <div className="grid grid-cols-3 gap-3 font-sans">
                
                {/* Metric 1 */}
                <div className="p-3 bg-gray-50 rounded-[4px] border border-gray-150 text-center shadow-inner">
                  <span className="text-[9px] text-gray-400 font-mono font-bold uppercase leading-none block tracking-wide">ACTIVE ALARMS</span>
                  <span className={`text-base font-bold mt-1.5 block leading-none font-mono ${
                    stationAlerts.length > 0 ? 'text-[#C8102E]' : 'text-emerald-600'
                  }`}>
                    {stationAlerts.length}
                  </span>
                </div>

                {/* Metric 2 */}
                <div className="p-3 bg-gray-50 rounded-[4px] border border-gray-150 text-center shadow-inner">
                  <span className="text-[9px] text-gray-400 font-mono font-bold uppercase leading-none block tracking-wide">YARD ORDERS</span>
                  <span className="text-base font-bold text-gray-850 mt-1.5 block leading-none font-mono">
                    {stationOrders.length}
                  </span>
                </div>

                {/* Metric 3 */}
                <div className="p-3 bg-gray-50 rounded-[4px] border border-gray-150 text-center shadow-inner">
                  <span className="text-[9px] text-gray-400 font-mono font-bold uppercase leading-none block tracking-wide">RESOLVE RATE</span>
                  <span className="text-base font-bold text-gray-850 mt-1.5 block leading-none font-mono">
                    {completionRate}%
                  </span>
                </div>

              </div>

              {/* Station Staff & active schedules info rows */}
              <div className="space-y-2 pt-1 text-xs text-gray-650">
                <div className="flex justify-between items-center py-1 border-b border-gray-50">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>Assigned Depot Engineers:</span>
                  </div>
                  <span className="font-mono text-gray-900 font-bold">{dynamicTechs.length} technicians</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-gray-50 font-sans">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Wrench className="w-4 h-4 text-gray-400" />
                    <span>Currently In Operations:</span>
                  </div>
                  <span className="font-mono text-gray-900 font-bold">{activeOrders.length} trainsets</span>
                </div>
              </div>

              {/* Assigned Staff Rosters list overlay */}
              <div className="space-y-2.5 bg-[#F4F5F7] p-3.5 rounded-[4px] border border-gray-150 font-sans">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-widest block leading-none">ON-DUTY TECHNICIANS (TODAY)</span>
                  <span className="text-[9px] bg-emerald-50 text-emerald-700 font-mono font-bold px-1.5 py-0.5 rounded border border-emerald-250 select-none uppercase tracking-wider scale-90 origin-right">Dynamic Schedule</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {dynamicTechs.length === 0 ? (
                    <span className="text-[10px] text-gray-400 font-medium italic">No technicians scheduled on duty today (HQ dispatch support active)</span>
                  ) : (
                    dynamicTechs.map(tech => (
                      <span key={tech.id} className="text-[10px] bg-white border border-gray-200 px-2 py-1 rounded-[3px] text-gray-700 font-semibold shadow-sm">
                        {tech.name} • <span className="text-[#C8102E] font-mono text-[9px] font-bold">{tech.specialization}</span>
                      </span>
                    ))
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
