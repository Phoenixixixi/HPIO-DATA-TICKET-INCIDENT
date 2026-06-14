/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Play,
  ShieldAlert,
  BarChart2,
  PieChartIcon
} from 'lucide-react';
import { Alert, MaintenanceOrder, Station, TrainSet, Incident } from '../types';
import {
  PieChart, Pie, Cell, Tooltip as ReTooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

interface CategoryData {
  kategori_aset: string;
  total: number;
}

interface StationCount {
  stasiun_lokasi: string;
  total: number;
}

interface DashboardData {
  data_perangkat: CategoryData[];
  data_open: number;
  incidents: Incident[];
  month_data: string;
  data_station_count: StationCount[];
  today_day?: number;
}

interface DashboardViewProps {
  alerts: Alert[];
  orders: MaintenanceOrder[];
  stations: Station[];
  trains: TrainSet[];
  onResolveAlert: (id: string) => void;
  onSimulateFault: (severity: 'critical' | 'high' | 'warning', message: string, stationCode: string) => void;
  data_dashboard: DashboardData;
}

// ── colour palette ──────────────────────────────────────────────────────────
const PIE_COLORS: Record<string, string> = {
  'Open': '#C8102E',
  'On Escalation': '#F59E0B',
  'Closed': '#10B981',
};

const PRIORITY_COLORS: Record<string, string> = {
  'P1 (URGENT)': '#C8102E',
  'P2 (CRITICAL)': '#F59E0B',
  'P3 (SERIOUS)': '#6366F1',
};

const CATEGORY_COLORS: Record<string, string> = {
  TVM: '#C8102E',
  GATE: '#F59E0B',
  PC: '#5dfbea',
  PIDS: '#6366F1',
  PDP: '#10B981',
  XRAY: '#0EA5E9',
  SPEAKER: '#8B5CF6',
  CCTV: '#7de09e'
};

const DEFAULT_FALLBACK = '#94A3B8';

// Custom tooltip for recharts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1A1C1E] border border-white/10 rounded-[4px] px-3 py-2 text-white text-xs shadow-xl">
        {label && <p className="font-bold mb-1">{label}</p>}
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color ?? p.fill }} className="font-mono">
            {p.name}: <span className="font-bold">{p.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const formatDateTime = (timestampStr: string) => {
  if (!timestampStr) return '';
  // Replace dashes with slashes for cross-browser Date parsing support
  const dateStr = timestampStr.includes('-') ? timestampStr.replace(/-/g, '/') : timestampStr;
  const dt = new Date(dateStr);
  if (isNaN(dt.getTime())) return timestampStr;

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
  ];
  const day = dt.getDate();
  const month = monthNames[dt.getMonth()];
  const year = dt.getFullYear();
  const hour = String(dt.getHours()).padStart(2, '0');
  const minute = String(dt.getMinutes()).padStart(2, '0');

  return `${day} ${month} ${year} ${hour}:${minute}`;
};

export default function DashboardView({
  alerts,
  orders,
  stations,
  trains,
  onResolveAlert,
  onSimulateFault,
  data_dashboard
}: DashboardViewProps) {
  const { data_perangkat = [], data_open = 0, incidents = [], today_day } = data_dashboard || {};
  const [activeFeedTab, setActiveFeedTab] = useState<'telemetry' | 'incidents'>('incidents');
  const [selectedStation, setSelectedStation] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [testFaultMsg, setTestFaultMsg] = useState('');
  const [testFaultStation, setTestFaultStation] = useState('HLM');
  const [testSeverity, setTestSeverity] = useState<'critical' | 'high' | 'warning'>('high');

  const [periodFilter, setPeriodFilter] = useState<'monthly' | 'weekly' | 'daily'>('monthly');
  const [selectedWeek, setSelectedWeek] = useState<number>(1);

  const unresolvedAlerts = alerts.filter(a => !a.resolved_at);

  const getDayFromDate = (dateStr: string) => {
    if (!dateStr) return null;
    const parts = dateStr.split(' ');
    const datePart = parts[0];
    const subParts = datePart.split('-');
    if (subParts.length === 3) {
      return parseInt(subParts[2], 10);
    }
    return null;
  };

  const todayDay = today_day ?? new Date().getDate();

  const filteredByPeriodIncidents = incidents.filter(inc => {
    const day = getDayFromDate(inc.tanggal_lapor);
    if (day === null) return true;

    if (periodFilter === 'daily') {
      return day === todayDay;
    }
    if (periodFilter === 'weekly') {
      if (selectedWeek === 1) return day >= 1 && day <= 7;
      if (selectedWeek === 2) return day >= 8 && day <= 14;
      if (selectedWeek === 3) return day >= 15 && day <= 21;
      if (selectedWeek === 4) return day >= 22 && day <= 28;
      if (selectedWeek === 5) return day >= 29;
    }
    return true; // monthly
  });

  // Incident calculations
  const activeIncidents = filteredByPeriodIncidents.filter(i =>
    i.status !== 'Closed' &&
    (i.prioritas === 'P1 (URGENT)' || i.prioritas === 'P2 (CRITICAL)' || i.prioritas === 'P3 (SERIOUS)')
  );
  const urgentIncidentsCount = activeIncidents.filter(i => i.prioritas === 'P1 (URGENT)').length;

  // States counts matching the KPI blueprints
  const openOrdersCount = orders.filter(o => o.status === 'pending' || o.status === 'in_progress').length;
  const operationalTrainsCount = trains.filter(t => t.status === 'operational').length;
  const trainsInMaintenance = trains.filter(t => t.status === 'maintenance').length;
  const completedOrders = orders.filter(o => o.status === 'completed').length;

  // Custom filter if any station is targeted
  const filteredAlerts = selectedStation === 'all'
    ? alerts
    : alerts.filter(a => a.station_id === selectedStation);

  // Filter incidents matching selected station and priority
  const filteredIncidents = filteredByPeriodIncidents.filter(inc => {
    // Only show urgent, critical, and serious
    const isPriorityAllowed =
      inc.prioritas === 'P1 (URGENT)' ||
      inc.prioritas === 'P2 (CRITICAL)' ||
      inc.prioritas === 'P3 (SERIOUS)';
    if (!isPriorityAllowed) return false;

    // Apply user-selected priority filter
    if (selectedPriority !== 'all' && inc.prioritas !== selectedPriority) return false;

    if (selectedStation === 'all') return true;
    const activeStationObj = stations.find(s => s.id === selectedStation);
    const activeStationCode = activeStationObj ? activeStationObj.code.toLowerCase() : '';
    const incStasiun = inc.stasiun.toLowerCase();

    const matchesHalim = activeStationCode === 'hlm' && incStasiun.includes('halim');
    const matchesKarawang = activeStationCode === 'kwg' && incStasiun.includes('karawang');
    const matchesPadalarang = activeStationCode === 'pdl' && incStasiun.includes('padalarang');
    const matchesTegalluar = activeStationCode === 'tgl' && incStasiun.includes('tegalluar');

    return matchesHalim || matchesKarawang || matchesPadalarang || matchesTegalluar;
  });

  // Sort incidents: active (Open/Escalated) first, then Closed, sub-sorted by date/timestamp
  const sortedIncidents = [...filteredIncidents].sort((a, b) => {
    const aActive = a.status !== 'Closed' ? 1 : 0;
    const bActive = b.status !== 'Closed' ? 1 : 0;
    if (aActive !== bActive) return bActive - aActive;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  // ── chart data derivation ───────────────────────────────────────────────
  // 1. Pie chart – status distribution
  const statusMap: Record<string, number> = {};
  filteredByPeriodIncidents.forEach(inc => {
    statusMap[inc.status] = (statusMap[inc.status] ?? 0) + 1;
  });
  const statusPieData = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

  // 2. Bar chart – incidents per category
  const categoryMap: Record<string, number> = {};
  filteredByPeriodIncidents.forEach(inc => {
    categoryMap[inc.kategori_aset] = (categoryMap[inc.kategori_aset] ?? 0) + 1;
  });
  const categoryBarData = Object.entries(categoryMap).map(([name, total]) => ({ name, total }));

  // 3. Bar chart – incidents by priority
  const priorityMap: Record<string, number> = {};
  filteredByPeriodIncidents.forEach(inc => {
    priorityMap[inc.prioritas] = (priorityMap[inc.prioritas] ?? 0) + 1;
  });
  const priorityBarData = Object.entries(priorityMap)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([name, total]) => ({ name: name.replace(' (', '\n('), total, fullName: name }));

  // Helper lists of predefined emergency logs to facilitate fast simulation clicking
  const quickFaultTemplates = [
    { code: 'HLM', msg: "Overheating Braking System. TS-001 (CR400AF) • Halim Station Temp: 122°C.", sev: 'critical' as const },
    { code: 'PDL', msg: "Hydraulic Pressure Anomaly measured on TS-009 at Padalarang high-speed bypass line.", sev: 'high' as const },
    { code: 'TGL', msg: "Routine AC Cleaning Due. TS-004 (CR400AF) • Tegalluar Yard", sev: 'warning' as const },
  ];

  // Extract month and date range dynamically from database incidents
  let dateRangeText = data_dashboard.month_data; // fallback
  if (incidents.length > 0) {
    const firstIncident = incidents[0];
    if (firstIncident.bulan) {
      const parts = firstIncident.bulan.split(' ');
      const monthName = parts[0];
      const year = parts[1] || '2026';

      const monthNamesIndonesian: Record<string, { days: number; name: string }> = {
        "januari": { days: 31, name: "Januari" },
        "februari": { days: 28, name: "Februari" },
        "maret": { days: 31, name: "Maret" },
        "april": { days: 30, name: "April" },
        "mei": { days: 31, name: "Mei" },
        "juni": { days: 30, name: "Juni" },
        "juli": { days: 31, name: "Juli" },
        "agustus": { days: 31, name: "Agustus" },
        "september": { days: 30, name: "September" },
        "oktober": { days: 31, name: "Oktober" },
        "november": { days: 30, name: "November" },
        "desember": { days: 31, name: "Desember" }
      };

      const key = monthName.toLowerCase();
      if (monthNamesIndonesian[key]) {
        const days = monthNamesIndonesian[key].days;
        const normalizedMonthName = monthNamesIndonesian[key].name;
        dateRangeText = `1 - ${days} ${normalizedMonthName} ${year}`;
      } else {
        dateRangeText = `1 - 30 ${monthName} ${year}`;
      }
    }
  }

  return (
    <div className="p-8 space-y-8 bg-[#F4F5F7] text-[#1A1C1E] font-sans h-full overflow-y-auto flex-1">

      {/* TOP HEADER */}
      {(() => {
        let activePeriodText = dateRangeText;
        if (periodFilter === 'daily') {
          activePeriodText = `Hari Ini (Tanggal ${todayDay})`;
        } else if (periodFilter === 'weekly') {
          const weekRanges = [
            'Tanggal 1 - 7',
            'Tanggal 8 - 14',
            'Tanggal 15 - 21',
            'Tanggal 22 - 28',
            'Tanggal 29 s/d Akhir Bulan'
          ];
          activePeriodText = `Minggu ${selectedWeek} (${weekRanges[selectedWeek - 1]})`;
        }
        return (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-gray-250 gap-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-950 m-0 leading-none">
                Dashboard Report
              </h2>
              <p className="text-[10px] text-gray-400 font-mono mt-1.5 uppercase tracking-wider">
                PERIODE LAPORAN: {activePeriodText}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {/* Period Filter Dropdown */}
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-[4px] px-2 py-1 shadow-sm">
                <span className="text-[10px] font-bold text-gray-400 uppercase font-mono">Periode:</span>
                <select
                  value={periodFilter}
                  onChange={(e) => setPeriodFilter(e.target.value as any)}
                  className="text-[11px] font-semibold bg-transparent border-none outline-none text-gray-700 cursor-pointer"
                >
                  <option value="monthly">Bulanan</option>
                  <option value="weekly">Mingguan</option>
                  <option value="daily">Harian</option>
                </select>
              </div>

              {/* Week Selector Dropdown (visible only when Weekly is selected) */}
              {periodFilter === 'weekly' && (
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-[4px] px-2 py-1 shadow-sm">
                  <span className="text-[10px] font-bold text-gray-400 uppercase font-mono">Minggu Ke:</span>
                  <select
                    value={selectedWeek}
                    onChange={(e) => setSelectedWeek(parseInt(e.target.value, 10))}
                    className="text-[11px] font-semibold bg-transparent border-none outline-none text-gray-700 cursor-pointer"
                  >
                    <option value={1}>Minggu 1 (Tgl 1-7)</option>
                    <option value={2}>Minggu 2 (Tgl 8-14)</option>
                    <option value={3}>Minggu 3 (Tgl 15-21)</option>
                    <option value={4}>Minggu 4 (Tgl 22-28)</option>
                    <option value={5}>Minggu 5 (Tgl 29+)</option>
                  </select>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs font-semibold text-gray-650">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500">LIVE DATABASE</span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 4 KPI Grid Cards on Header row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* KPI 1: Open Orders */}
        <div className="bg-white p-5 rounded-[4px] border border-gray-200/80 shadow-sm flex flex-col justify-between">
          <p className="text-[11px] uppercase tracking-wider text-gray-400 font-bold mb-1">Open Orders</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-gray-900 tracking-tight">{data_dashboard.data_open}</span>
            <span className="text-xs text-green-600 font-medium font-sans">Active</span>
          </div>
        </div>

        {/* KPI 2: Active Incidents */}
        <div className="bg-white p-5 rounded-[4px] border border-gray-200/80 shadow-sm border-l-4 border-l-[#C8102E] flex flex-col justify-between">
          <p className="text-[11px] uppercase tracking-wider text-gray-400 font-bold mb-1">Active Incidents</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-gray-950 tracking-tight">
              {String(activeIncidents.length).padStart(2, '0')}
            </span>
            <span className="text-xs text-red-650 font-semibold font-sans">
              {urgentIncidentsCount} Urgent P1
            </span>
          </div>
        </div>

        {/* KPI 3: Operational Trains */}
        <div className="bg-white p-5 rounded-[4px] border border-gray-200/80 shadow-sm flex flex-col justify-between">
          <p className="text-[11px] uppercase tracking-wider text-gray-400 font-bold mb-1">Operational Trains</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-gray-900 tracking-tight">
              {operationalTrainsCount}/{trains.length}
            </span>
            <span className="text-xs text-gray-500 font-sans">
              {Math.round((operationalTrainsCount / trains.length) * 100)}% Fleet
            </span>
          </div>
        </div>

        {/* KPI 4: Total Incidents */}
        <div className="bg-white p-5 rounded-[4px] border border-gray-200/80 shadow-sm flex flex-col justify-between">
          <p className="text-[11px] uppercase tracking-wider text-gray-400 font-bold mb-1">Total Incidents</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-gray-900 tracking-tight">
              {incidents.length}
            </span>
            <span className="text-xs text-blue-600 font-medium font-sans">
              {incidents.filter(i => i.status === 'Closed').length} Closed
            </span>
          </div>
        </div>

      </div>

      {/* ── CHART ROW ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* PIE: Status Distribution */}
        <div className="lg:col-span-4 bg-white rounded-[4px] border border-gray-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
            <PieChartIcon className="w-4 h-4 text-[#C8102E]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">Status Distribution</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={statusPieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {statusPieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PIE_COLORS[entry.name] ?? DEFAULT_FALLBACK}
                    stroke="none"
                  />
                ))}
              </Pie>
              <ReTooltip content={<CustomTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(value) => (
                  <span className="text-[10px] text-gray-600 font-mono">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Centre label */}
          <div className="flex justify-center gap-4 mt-1">
            {statusPieData.map(d => (
              <div key={d.name} className="flex flex-col items-center">
                <span className="text-lg font-bold font-mono" style={{ color: PIE_COLORS[d.name] ?? DEFAULT_FALLBACK }}>{d.value}</span>
                <span className="text-[9px] uppercase tracking-wider text-gray-400 font-mono">{d.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* BAR: Incidents per Category */}
        <div className="lg:col-span-8 bg-white rounded-[4px] border border-gray-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
            <BarChart2 className="w-4 h-4 text-[#C8102E]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">Incidents by Category</h3>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={categoryBarData} barSize={32} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fontFamily: 'monospace', fill: '#6B7280' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 10, fontFamily: 'monospace', fill: '#6B7280' }}
                axisLine={false}
                tickLine={false}
              />
              <ReTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
              <Bar dataKey="total" name="Incidents" radius={[4, 4, 0, 0]}>
                {categoryBarData.map((entry, index) => (

                  <Cell
                    key={`cat-${index}`}
                    fill={CATEGORY_COLORS[entry.name.toUpperCase()] ?? DEFAULT_FALLBACK}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {/* legend chips */}
          <div className="flex flex-wrap gap-2 mt-3">
            {categoryBarData.map(d => (
              <div key={d.name} className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-[4px] px-2 py-1">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: CATEGORY_COLORS[d.name?.toUpperCase()] ?? DEFAULT_FALLBACK }}></span>
                <span className="text-[10px] font-mono text-gray-600">{d.name}: <b>{d.total}</b></span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── PRIORITY BAR (full width) ────────────────────────────────────────── */}
      <div className="bg-white rounded-[4px] border border-gray-200 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
          <ShieldAlert className="w-4 h-4 text-[#C8102E]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">Incidents by Priority Level</h3>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={priorityBarData} barSize={48} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fontFamily: 'monospace', fill: '#6B7280' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 10, fontFamily: 'monospace', fill: '#6B7280' }}
              axisLine={false}
              tickLine={false}
            />
            <ReTooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(0,0,0,0.04)' }}
              formatter={(_val: any, _name: any, props: any) => [props.payload.total, props.payload.fullName]}
            />
            <Bar dataKey="total" name="Incidents" radius={[4, 4, 0, 0]}>
              {priorityBarData.map((entry, index) => (
                <Cell
                  key={`prio-${index}`}
                  fill={PRIORITY_COLORS[entry.fullName] ?? DEFAULT_FALLBACK}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        {/* summary pills */}
        <div className="flex flex-wrap gap-3 mt-3">
          {priorityBarData.map(d => (
            <div key={d.fullName} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: PRIORITY_COLORS[d.fullName] ?? DEFAULT_FALLBACK }}></span>
              <span className="text-[10px] font-mono text-gray-600">{d.fullName}: <b className="text-gray-900">{d.total}</b></span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Double Columns Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* LEFT COLUMN (col-span-8): Alerts feed and Fault Simulator */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active Feed Tab Switcher Container */}
          <div className="bg-white rounded-[4px] border border-gray-250 shadow-sm">
            <div className="p-4 border-b border-gray-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
              <div className="flex gap-5 border-b border-gray-100 sm:border-none pb-2 sm:pb-0">
                <button
                  type="button"
                  onClick={() => setActiveFeedTab('telemetry')}
                  className={`text-xs font-bold uppercase tracking-wider pb-1.5 cursor-pointer transition-all border-b-2 ${activeFeedTab === 'telemetry'
                    ? 'text-[#C8102E] border-b-[#C8102E]'
                    : 'text-gray-400 border-b-transparent hover:text-gray-650'
                    }`}
                >
                  Live Telemetry Alerts ({unresolvedAlerts.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFeedTab('incidents')}
                  className={`text-xs font-bold uppercase tracking-wider pb-1.5 cursor-pointer transition-all border-b-2 ${activeFeedTab === 'incidents'
                    ? 'text-[#C8102E] border-b-[#C8102E]'
                    : 'text-gray-400 border-b-transparent hover:text-gray-650'
                    }`}
                >
                  Active Incident Tickets ({activeIncidents.length})
                </button>
              </div>

              {/* Filter Dropdowns */}
              <div className="flex items-center gap-2">
                {/* Priority Filter Dropdown */}
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="text-[11px] font-mono px-2 py-1 bg-gray-50 border border-gray-200 rounded-[4px] outline-none text-gray-600 hover:border-gray-300 transition-colors"
                >
                  <option value="all">Priority: All</option>
                  <option value="P1 (URGENT)">🔴 P1 (URGENT)</option>
                  <option value="P2 (CRITICAL)">🟠 P2 (CRITICAL)</option>
                  <option value="P3 (SERIOUS)">🟢 P3 (SERIOUS)</option>
                </select>

                {/* Station Filter Dropdown */}
                <select
                  value={selectedStation}
                  onChange={(e) => setSelectedStation(e.target.value)}
                  className="text-[11px] font-mono px-2 py-1 bg-gray-50 border border-gray-200 rounded-[4px] outline-none text-gray-600 hover:border-gray-300 transition-colors"
                >
                  <option value="all">View: All Depots</option>
                  {stations.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* List with Dividers */}
            <div className="divide-y divide-gray-100 max-h-[360px] overflow-y-auto">
              {activeFeedTab === 'telemetry' ? (
                filteredAlerts.length === 0 ? (
                  <div className="p-8 text-center flex flex-col items-center justify-center space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    <p className="text-xs font-semibold text-gray-800">All Systems Balanced</p>
                    <p className="text-[10px] text-gray-400 font-mono">No telemetry errors reported inside the active channels.</p>
                  </div>
                ) : (
                  filteredAlerts.map(alert => {
                    const isResolved = !!alert.resolved_at;
                    let bgBadge = 'bg-blue-50 text-blue-600';
                    let iconLetter = 'i';
                    let strokeColor = 'border-blue-100';

                    if (alert.severity === 'critical') {
                      bgBadge = 'bg-red-50 text-red-600';
                      iconLetter = '!';
                      strokeColor = 'border-red-100';
                    } else if (alert.severity === 'high') {
                      bgBadge = 'bg-yellow-50 text-yellow-600';
                      iconLetter = '!';
                      strokeColor = 'border-yellow-105';
                    }

                    return (
                      <div
                        key={alert.id}
                        className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${isResolved ? 'bg-gray-50/50 opacity-60' : 'bg-white hover:bg-gray-55'
                          }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-10 h-10 rounded-[4px] font-bold flex items-center justify-center shrink-0 border uppercase font-mono ${bgBadge} ${strokeColor}`}>
                            {iconLetter}
                          </div>

                          <div className="space-y-1">
                            <p className="text-xs font-bold text-gray-900 leading-snug">{alert.message}</p>
                            <div className="flex items-center gap-2 text-[11px] text-gray-500 font-sans">
                              <span className="font-semibold text-gray-700">
                                {alert.train_number || 'TS-OOT'}
                              </span>
                              <span>•</span>
                              <span>{alert.station_name || 'Global Depot'}</span>
                              {alert.resolved_at && (
                                <>
                                  <span>•</span>
                                  <span className="text-emerald-600 font-semibold uppercase font-mono text-[9px]">RESOLVED</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-end justify-between sm:justify-center shrink-0 gap-2">
                          <span className={`px-2 py-0.5 text-[9px] font-bold rounded-[4px] uppercase font-mono ${alert.severity === 'critical'
                            ? 'bg-red-100 text-red-700'
                            : alert.severity === 'high'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-700'
                            }`}>
                            {alert.severity}
                          </span>

                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 text-[10px] text-gray-400 font-mono">
                              <Clock className="w-3 h-3 text-gray-350" />
                              <span>{new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>

                            {!isResolved ? (
                              <button
                                onClick={() => onResolveAlert(alert.id)}
                                className="px-2 py-1 bg-white hover:bg-[#C8102E] border border-gray-200 hover:border-[#C8102E] text-gray-750 hover:text-white text-[10px] font-bold uppercase rounded-[4px] transition-colors cursor-pointer"
                              >
                                Resolve
                              </button>
                            ) : (
                              <span className="text-[9px] text-gray-400 font-bold uppercase italic select-none">Cleared</span>
                            )}
                          </div>
                        </div>

                      </div>
                    );
                  })
                )
              ) : (
                sortedIncidents.length === 0 ? (
                  <div className="p-8 text-center flex flex-col items-center justify-center space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    <p className="text-xs font-semibold text-gray-800">All Incidents Solved</p>
                    <p className="text-[10px] text-gray-400 font-mono">No active incident tickets registered at this depot.</p>
                  </div>
                ) : (
                  sortedIncidents.map(inc => {
                    const isActive = inc.status !== 'Closed';
                    let bgBadge = 'bg-blue-50 text-blue-600 border-blue-100';
                    let strokeColor = 'border-blue-100';
                    const iconText = (inc.kategori_aset ?? '').substring(0, 3).toUpperCase();

                    if (inc.prioritas === 'P1 (URGENT)') {
                      bgBadge = 'bg-red-50 text-[#C8102E] border-red-100';
                      strokeColor = 'border-red-100';
                    } else if (inc.prioritas === 'P2 (CRITICAL)') {
                      bgBadge = 'bg-amber-50 text-amber-700 border-amber-100';
                      strokeColor = 'border-amber-100';
                    } else {
                      bgBadge = 'bg-emerald-50 text-emerald-700 border-emerald-100';
                      strokeColor = 'border-emerald-100';
                    }

                    return (
                      <div
                        key={inc.id}
                        className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${!isActive ? 'bg-gray-50/50 opacity-60' : 'bg-white hover:bg-gray-55/50'
                          }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-10 h-10 rounded-[4px] font-bold flex items-center justify-center shrink-0 border text-[10px] font-mono ${bgBadge} ${strokeColor}`}>
                            {iconText}
                          </div>

                          <div className="space-y-1">
                            <p className="text-xs font-bold text-gray-900 leading-snug">
                              {inc.nomor_tiket} • <span className="text-[#C8102E]">{inc.kategori_aset}</span>
                            </p>
                            <p className="text-[11px] text-gray-700 leading-normal">{inc.deskripsi_masalah}</p>
                            <div className="flex items-center gap-2 text-[10px] text-gray-500 font-sans">
                              <span className="font-semibold text-gray-700">
                                {inc.stasiun}
                              </span>
                              <span>•</span>
                              <span>Reporter: {inc.nama_pelapor}</span>
                              <span>•</span>
                              <span className={`font-mono text-[9px] px-1 py-0.5 rounded ${inc.status === 'Closed'
                                ? 'bg-emerald-50 text-emerald-700'
                                : inc.status === 'On Escalation'
                                  ? 'bg-yellow-50 text-yellow-800'
                                  : 'bg-red-50 text-red-700'
                                }`}>
                                {inc.status.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-end justify-between sm:justify-center shrink-0 gap-2">
                          <span className={`px-2 py-0.5 text-[9px] font-bold rounded-[4px] uppercase font-mono ${inc.prioritas === 'P1 (URGENT)'
                            ? 'bg-red-100 text-red-700'
                            : inc.prioritas === 'P2 (CRITICAL)'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                            }`}>
                            {inc.prioritas}
                          </span>

                          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-mono">
                            <Clock className="w-3 h-3 text-gray-350" />
                            <span>{formatDateTime(inc.timestamp)}</span>
                          </div>
                        </div>

                      </div>
                    );
                  })
                )
              )}
            </div>
          </div>



        </div>

        {/* RIGHT COLUMN (col-span-4): Station Summary list and Dark Fleet Card */}
        <div className="lg:col-span-4 space-y-6">

          {/* Station Health Panel */}
          <div className="bg-white rounded-[4px] border border-gray-200 p-5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-4 border-b border-gray-100 pb-2">Station Health</h3>
            <div className="space-y-4">
              {data_dashboard.data_station_count
                .filter(station => station.stasiun.toLowerCase() !== "belum teridentifikasi")
                .map(station => (
                  <div
                    key={station.stasiun_lokasi}
                    className="flex items-center justify-between py-1"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full"></div>

                      <span className="text-xs font-medium text-gray-900">
                        {station.stasiun_lokasi}
                      </span>
                    </div>

                    <span className="text-xs font-sans">
                      {station.total}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Epic Dark Fleet Status Graphic block */}


        </div>

      </div>

    </div>
  );
}
