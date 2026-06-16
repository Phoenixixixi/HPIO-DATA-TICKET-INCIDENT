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

interface ShiftConfig {
  id: number;
  shift_name: string;
  start_time: string;
  end_time: string;
}

interface StationsViewProps {
  stations: Station[];
  alerts: Alert[];
  orders: MaintenanceOrder[];
  technicians: Technician[];
  shift_schedules?: ShiftScheduleRow[];
  today_day?: number;
  station_incidents?: Record<string, { total: number; closed: number }>;
  configs?: ShiftConfig[];
}

const DEFAULT_CONFIGS: ShiftConfig[] = [
  { id: 1, shift_name: 'Shift 1', start_time: '07:00', end_time: '15:00' },
  { id: 2, shift_name: 'Shift 2', start_time: '15:00', end_time: '23:00' },
  { id: 3, shift_name: 'Shift 3', start_time: '23:00', end_time: '07:00' },
  { id: 4, shift_name: 'Middle', start_time: '09:00', end_time: '17:00' },
];

function isTimeInShift(startTimeStr: string, endTimeStr: string): boolean {
  const now = new Date();
  const [startH, startM] = startTimeStr.split(':').map(Number);
  const [endH, endM] = endTimeStr.split(':').map(Number);

  const start = new Date(now);
  start.setHours(startH, startM, 0, 0);

  const end = new Date(now);
  end.setHours(endH, endM, 0, 0);

  if (end <= start) {
    // Shift crosses midnight
    return now >= start || now < end;
  } else {
    return now >= start && now < end;
  }
}

function getShiftConfigName(shiftCode: string): string | null {
  const code = shiftCode.toUpperCase().trim();
  if (code === 'LIBUR') return null;
  if (code === 'SM' || code.endsWith(' M')) {
    return 'Middle';
  }
  if (code.endsWith('3') || code.endsWith(' 3')) {
    return 'Shift 3';
  }
  if (code.endsWith('2')) {
    return 'Shift 2';
  }
  if (code.endsWith('1')) {
    return 'Shift 1';
  }
  return null;
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
    'TGR': ['tegalluar'],
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
  station_incidents = {},
  configs = []
}: StationsViewProps) {
  const unresolvedAlerts = alerts.filter(a => !a.resolved_at);

  const mergedConfigs = configs && configs.length > 0 ? configs : DEFAULT_CONFIGS;
  const activeConfig = mergedConfigs.find(cfg => isTimeInShift(cfg.start_time, cfg.end_time));



  // Determine current day of week key (1 = Monday, 7 = Sunday)
  const baseDayKey = today_day || (() => {
    const jsDay = new Date().getDay();
    return jsDay === 0 ? 7 : jsDay;
  })();

  // Shift 3 ends at 07:00. If current hour is < 7, the active shift (Shift 3) started yesterday.
  // We check the schedule for yesterday to fetch the correct active night shift team.
  const currentHour = new Date().getHours();
  const dayKey = currentHour < 7 ? (baseDayKey - 1 === 0 ? 7 : baseDayKey - 1) : baseDayKey;

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
            <span className="text-[10px] font-mono font-bold text-gray-700 uppercase">
              Active Shift: {activeConfig ? `${activeConfig.shift_name} (${activeConfig.start_time} - ${activeConfig.end_time})` : 'None'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {stations.map(station => {
          const stationAlerts = unresolvedAlerts.filter(a => a.station_id === station.id);
          const stationCriticalAlerts = stationAlerts.filter(a => a.severity === 'critical');

          // Get engineers for this station based on today's/yesterday's shift schedule AND active shift config
          const dynamicTechs = shift_schedules.filter(row => {
            const shiftCodeForToday = row.shifts?.[dayKey];
            if (!shiftCodeForToday) return false;

            const shiftCodeUpper = shiftCodeForToday.toUpperCase();
            const stationCodeUpper = station.code.toUpperCase();

            // Map shift code to config name
            const configName = getShiftConfigName(shiftCodeForToday);
            if (!configName) return false;

            // Check if this config is active right now
            const isTodayShiftActive = activeConfig?.shift_name === configName;
            if (!isTodayShiftActive) return false;

            // If the shift code is a general shift (doesn't contain a specific station code),
            // we assume they support all stations.
            const hasStationPrefix = ['HLM', 'KWG', 'KRW', 'PDL', 'PDG', 'TGL', 'TGR', 'OCC'].some(prefix =>
              shiftCodeUpper.includes(prefix)
            );
            if (!hasStationPrefix) {
              return true; // General shift applies to all stations
            }

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
            if (stationCodeUpper === 'TGR') {
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
                  <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-widest block leading-none">ON-DUTY TECHNICIANS ({activeConfig?.shift_name || 'No Shift'})</span>
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
