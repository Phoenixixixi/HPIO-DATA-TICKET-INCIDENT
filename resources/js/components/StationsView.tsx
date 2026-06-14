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
  Radio,
  Clock
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
  station_incidents?: Record<string, { total: number; closed: number }>;
}

// Determine the current shift based on time of day
function getCurrentShift(): string {
  const now = new Date();
  const hour = now.getHours();
  // S1: 06:00-14:00, S2: 14:00-22:00, S3: 22:00-06:00
  if (hour >= 6 && hour < 14) return 'S1';
  if (hour >= 14 && hour < 22) return 'S2';
  return 'S3';
}

// Map station code to incident station name patterns
function getStationIncidentCount(
  stationCode: string,
  stationIncidents: Record<string, { total: number; closed: number }>
): { total: number; closed: number } {
  const code = stationCode.toUpperCase();

  const patterns: Record<string, string[]> = {
    'HLM': ['halim'],
    'KWG': ['karawang'],
    'PDL': ['padalarang'],
    'TGL': ['tegalluar'],
  };

  const stationPatterns = patterns[code] || [];
  let total = 0;
  let closed = 0;

  for (const [stasiunName, counts] of Object.entries(stationIncidents)) {
    const lower = stasiunName.toLowerCase();
    if (stationPatterns.some(p => lower.includes(p))) {
      total += counts.total;
      closed += counts.closed;
    }
  }

  return { total, closed };
}

export default function StationsView({
  stations,
  alerts,
  orders,
  technicians,
  shift_schedules = [],
  today_day,
  station_incidents = {}
}: StationsViewProps) {
  const unresolvedAlerts = alerts.filter(a => !a.resolved_at);
  const currentShift = getCurrentShift();

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-[#F4F5F7] text-[#1A1C1E] font-sans">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 m-0 leading-none">Stations & Depots Operations Map</h2>
          <p className="text-[10px] text-gray-400 font-mono mt-1 uppercase tracking-wider select-none">Repair Bays Summary & Technician Logistics Status</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-[4px] px-2.5 py-1 shadow-sm">
            <Clock className="w-3 h-3 text-[#C8102E]" />
            <span className="text-[10px] font-mono font-bold text-gray-700 uppercase">Active Shift: {currentShift}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {stations.map(station => {
          const stationAlerts = unresolvedAlerts.filter(a => a.station_id === station.id);
          const stationCriticalAlerts = stationAlerts.filter(a => a.severity === 'critical');

          const dayKey = today_day ?? new Date().getDate();

          // Get engineers for this station based on today's shift schedule AND current shift
          const dynamicTechs = shift_schedules.filter(row => {
            const shiftCodeForToday = row.shifts?.[dayKey];
            if (!shiftCodeForToday) return false;

            const shiftCodeUpper = shiftCodeForToday.toUpperCase();
            const stationCodeUpper = station.code.toUpperCase();

            // Check if the shift code matches the current shift (S1, S2, S3)
            if (!shiftCodeUpper.includes(currentShift)) return false;

            // Check if the shift code matches the station
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

          // Get today's incident counts for this station
          const incidentCounts = getStationIncidentCount(station.code, station_incidents);

          const isCriticalStatus = stationCriticalAlerts.length > 0;

          return (
            <div
              key={station.id}
              className={`bg-white border rounded-[4px] p-6 space-y-5 shadow-sm hover:shadow-md transition-all duration-150 ${isCriticalStatus ? 'border-l-4 border-l-[#C8102E] border-gray-200' : 'border-gray-200'
                }`}
            >

              {/* Card Title Block */}
              <div className="flex items-start justify-between pb-3 border-b border-gray-150">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${isCriticalStatus
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

                {/* Metric 1: Total Incidents Today */}
                <div className="p-3 bg-gray-50 rounded-[4px] border border-gray-150 text-center shadow-inner">
                  <span className="text-[9px] text-gray-400 font-mono font-bold uppercase leading-none block tracking-wide">TOTAL INCIDENT</span>
                  <span className={`text-base font-bold mt-1.5 block leading-none font-mono ${incidentCounts.total > 0 ? 'text-[#C8102E]' : 'text-emerald-600'
                    }`}>
                    {incidentCounts.total}
                  </span>
                  <span className="text-[8px] text-gray-400 font-mono mt-1 block">TODAY</span>
                </div>

                {/* Metric 2: Closed Incidents Today */}
                <div className="p-3 bg-gray-50 rounded-[4px] border border-gray-150 text-center shadow-inner">
                  <span className="text-[9px] text-gray-400 font-mono font-bold uppercase leading-none block tracking-wide">CLOSED</span>
                  <span className="text-base font-bold text-emerald-600 mt-1.5 block leading-none font-mono">
                    {incidentCounts.closed}
                  </span>
                  <span className="text-[8px] text-gray-400 font-mono mt-1 block">TODAY</span>
                </div>

                {/* Metric 3: Engineers On Duty */}
                <div className="p-3 bg-gray-50 rounded-[4px] border border-gray-150 text-center shadow-inner">
                  <span className="text-[9px] text-gray-400 font-mono font-bold uppercase leading-none block tracking-wide">ENGINEERS</span>
                  <span className="text-base font-bold text-gray-850 mt-1.5 block leading-none font-mono">
                    {dynamicTechs.length}
                  </span>
                  <span className="text-[8px] text-gray-400 font-mono mt-1 block">ON DUTY</span>
                </div>

              </div>

              {/* Station Staff & active schedules info rows */}
              <div className="space-y-2 pt-1 text-xs text-gray-650">
                <div className="flex justify-between items-center py-1 border-b border-gray-50">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>Assigned Engineers:</span>
                  </div>
                  <span className="font-mono text-gray-900 font-bold">{dynamicTechs.length} technicians</span>
                </div>
              </div>

              {/* Assigned Staff Rosters list overlay */}
              <div className="space-y-2.5 bg-[#F4F5F7] p-3.5 rounded-[4px] border border-gray-150 font-sans">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-widest block leading-none">ON-DUTY TECHNICIANS ({currentShift})</span>
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
