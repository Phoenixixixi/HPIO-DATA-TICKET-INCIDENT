import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  BarChart3,
  Filter,
  RotateCcw,
} from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Report Problem',
    href: '/report-problem',
  },
];

// Types matching the LaporanHpio model
interface LaporanHpio {
  idNumber: string;
  timestamp: string;
  nomor_tiket: string;
  tanggal_lapor: string;
  nama_pelapor: string;
  nama_penerima_laporan: string;
  stasiun_lokasi: string;
  kategori_aset: string;
  equipment: string;
  deskripsi_masalah: string;
  skala_prioritas: string;
  status_laporan: string;
  nama_teknisi: string;
  waktu_melapor: string;
  waktu_respon_teknisi: string;
  waktu_selesai: string | null;
  respon_time: string;
  solving_time: string;
  wr_doc_nomor: string | null;
  status_eskalasi: string | null;
  bulan: string;
}

interface PaginatedData {
  data: LaporanHpio[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
}

interface Summary {
  total: number;
  by_status: Record<string, number>;
  by_priority: Record<string, number>;
  by_station: Record<string, number>;
}

interface FilterOptions {
  bulan_list: string[];
  stasiun_list: string[];
  kategori_list: string[];
}

interface Props {
  laporans: PaginatedData;
  summary: Summary;
  filterOptions: FilterOptions;
  filters: Record<string, string>;
}

// Priority badge styling
function getPriorityBadge(priority: string) {
  const p = priority?.toLowerCase() || '';
  if (p.includes('p1') || p.includes('urgent') || p.includes('tinggi')) {
    return {
      className: 'text-red-700 bg-[#FCEBEB]',
      label: priority,
    };
  }
  if (p.includes('p2') || p.includes('critical') || p.includes('sedang')) {
    return {
      className: 'text-[#854F0B] bg-[#FAEEDA]',
      label: priority,
    };
  }
  return {
    className: 'text-emerald-800 bg-[#EAF3DE]',
    label: priority,
  };
}

// Status badge styling
function getStatusBadge(status: string) {
  const s = status?.toLowerCase() || '';
  if (s.includes('close') || s.includes('selesai') || s.includes('done')) {
    return {
      dotColor: 'bg-emerald-500',
      className: 'text-emerald-800 bg-emerald-50',
      label: status,
    };
  }
  if (s.includes('escalat') || s.includes('proses') || s.includes('progress')) {
    return {
      dotColor: 'bg-yellow-500',
      className: 'text-yellow-800 bg-yellow-50',
      label: status,
    };
  }
  return {
    dotColor: 'bg-[#C8102E]',
    className: 'text-red-700 bg-red-50',
    label: status,
  };
}

const PERIOD_OPTIONS = [
  { value: '', label: 'Semua Waktu' },
  { value: 'today', label: 'Hari Ini' },
  { value: 'week', label: 'Minggu Ini' },
  { value: 'month', label: 'Bulan Ini' },
  { value: 'year', label: 'Tahun Ini' },
];

export default function ReportProblem({ laporans, summary, filterOptions, filters, data_perangkat }: any) {
  const [localFilters, setLocalFilters] = useState<Record<string, string>>(filters || {});
  const [searchInput, setSearchInput] = useState('');
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedLaporan, setSelectedLaporan] = useState<LaporanHpio | null>(null);

  console.log(data_perangkat)

  // Navigate with filters using Inertia router
  const applyFilters = (overrides: Record<string, string> = {}) => {
    const merged = { ...localFilters, ...overrides };
    // Remove empty values
    const cleaned: Record<string, string> = {};
    Object.entries(merged).forEach(([k, v]) => {
      if (v && v.trim() !== '') {
        cleaned[k] = v;
      }
    });

    router.get('/report-problem', cleaned, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const handleFilterChange = (key: string, value: string) => {
    const updated = { ...localFilters, [key]: value };
    setLocalFilters(updated);
    applyFilters(updated);
  };

  const resetFilters = () => {
    setLocalFilters({});
    setSearchInput('');
    router.get('/report-problem', {}, {
      preserveState: false,
    });
  };

  const goToPage = (page: number) => {
    applyFilters({ ...localFilters, page: String(page) });
  };

  const openDetail = (laporan: LaporanHpio) => {
    setSelectedLaporan(laporan);
    setIsDetailOpen(true);
  };

  // KPI numbers from summary
  const totalReports = summary?.total ?? 0;
  const openCount = Object.entries(summary?.by_status ?? {}).reduce((acc, [k, v]) => {
    if (k.toLowerCase().includes('open') || k.toLowerCase().includes('baru')) return acc + v;
    return acc;
  }, 0);
  const closedCount = Object.entries(summary?.by_status ?? {}).reduce((acc, [k, v]) => {
    if (k.toLowerCase().includes('close') || k.toLowerCase().includes('selesai') || k.toLowerCase().includes('done')) return acc + v;
    return acc;
  }, 0);
  const escalationCount = Object.entries(summary?.by_status ?? {}).reduce((acc, [k, v]) => {
    if (k.toLowerCase().includes('escalat') || k.toLowerCase().includes('proses')) return acc + v;
    return acc;
  }, 0);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Report Problem" />

      <div className="flex-1 flex flex-col min-h-0 bg-[#F4F5F7] overflow-hidden select-none">
        <div className="flex-1 overflow-y-auto p-8 space-y-6">

          {/* TOP HEADER */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-950 m-0 leading-none">
                Report Problem — Laporan HPIO
              </h2>
              <p className="text-[10px] text-gray-400 font-mono mt-1 uppercase tracking-wider">
                Database-driven report problem index with time-based filtering
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-650">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500">LIVE DATABASE</span>
            </div>
          </div>

          {/* KPI METRIC CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 select-none">

            {/* Total Reports */}
            <div className="bg-white border-l-4 border-l-[#1A1C1E] border-y border-r border-gray-150 rounded-[4px] p-4 flex flex-col justify-between shadow-xs">
              <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block">
                TOTAL LAPORAN
              </span>
              <div className="flex items-baseline justify-between mt-3">
                <span className="text-2xl font-black font-mono text-gray-950 leading-none">
                  {totalReports}
                </span>
                <BarChart3 className="w-5 h-5 text-gray-300" />
              </div>
            </div>

            {/* Open / New */}
            <div className="bg-white border-l-4 border-l-[#C8102E] border-y border-r border-gray-150 rounded-[4px] p-4 flex flex-col justify-between shadow-xs">
              <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block">
                OPEN / BARU
              </span>
              <div className="flex items-baseline justify-between mt-3">
                <span className="text-2xl font-black font-mono text-gray-950 leading-none">
                  {openCount}
                </span>
                <AlertTriangle className="w-5 h-5 text-red-300" />
              </div>
            </div>

            {/* In Progress / Escalation */}
            <div className="bg-white border-l-4 border-l-[#D4A017] border-y border-r border-gray-150 rounded-[4px] p-4 flex flex-col justify-between shadow-xs">
              <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block">
                ON PROGRESS
              </span>
              <div className="flex items-baseline justify-between mt-3">
                <span className="text-2xl font-black font-mono text-gray-950 leading-none">
                  {escalationCount}
                </span>
                <Clock className="w-5 h-5 text-yellow-300" />
              </div>
            </div>

            {/* Closed */}
            <div className="bg-white border-l-4 border-l-[#3B6D11] border-y border-r border-gray-150 rounded-[4px] p-4 flex flex-col justify-between shadow-xs">
              <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block">
                CLOSED / SELESAI
              </span>
              <div className="flex items-baseline justify-between mt-3">
                <span className="text-2xl font-black font-mono text-gray-950 leading-none">
                  {closedCount}
                </span>
                <CheckCircle2 className="w-5 h-5 text-emerald-300" />
              </div>
            </div>
          </div>

          {/* FILTER BAR */}
          <div className="bg-white p-5 rounded-[4px] border border-gray-200 shadow-xs space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100 select-none">
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs font-bold text-gray-950 uppercase tracking-wider">
                  Time & Data Filters
                </span>
              </div>
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 text-[10px] text-[#C8102E] font-mono font-bold tracking-wider hover:underline uppercase cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">

              {/* Period Preset */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono font-bold text-gray-400 uppercase">
                  Periode
                </label>
                <select
                  value={localFilters.period || ''}
                  onChange={(e) => handleFilterChange('period', e.target.value)}
                  className="text-xs p-2 border border-gray-200 rounded-[4px] outline-none bg-white cursor-pointer hover:border-gray-300 focus:border-[#C8102E]"
                >
                  {PERIOD_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Bulan Dropdown */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono font-bold text-gray-400 uppercase">
                  Bulan
                </label>
                <select
                  value={localFilters.bulan || ''}
                  onChange={(e) => handleFilterChange('bulan', e.target.value)}
                  className="text-xs p-2 border border-gray-200 rounded-[4px] outline-none bg-white cursor-pointer hover:border-gray-300 focus:border-[#C8102E]"
                >
                  <option value="">Semua</option>
                  {(filterOptions?.bulan_list ?? []).map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {/* Station Filter */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono font-bold text-gray-400 uppercase">
                  Stasiun
                </label>
                <select
                  value={localFilters.stasiun || ''}
                  onChange={(e) => handleFilterChange('stasiun', e.target.value)}
                  className="text-xs p-2 border border-gray-200 rounded-[4px] outline-none bg-white cursor-pointer hover:border-gray-300 focus:border-[#C8102E]"
                >
                  <option value="">Semua</option>
                  {(filterOptions?.stasiun_list ?? []).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Kategori Filter */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono font-bold text-gray-400 uppercase">
                  Kategori Aset
                </label>
                <select
                  value={localFilters.kategori || ''}
                  onChange={(e) => handleFilterChange('kategori', e.target.value)}
                  className="text-xs p-2 border border-gray-200 rounded-[4px] outline-none bg-white cursor-pointer hover:border-gray-300 focus:border-[#C8102E]"
                >
                  <option value="">Semua</option>
                  {(filterOptions?.kategori_list ?? []).map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </div>

              {/* Date Range */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono font-bold text-gray-400 uppercase">
                  Dari Tanggal
                </label>
                <input
                  type="date"
                  value={localFilters.start_date || ''}
                  onChange={(e) => handleFilterChange('start_date', e.target.value)}
                  className="w-full text-xs p-2 border border-gray-200 rounded-[4px] outline-none cursor-pointer focus:border-[#C8102E]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono font-bold text-gray-400 uppercase">
                  Sampai Tanggal
                </label>
                <input
                  type="date"
                  value={localFilters.end_date || ''}
                  onChange={(e) => handleFilterChange('end_date', e.target.value)}
                  className="w-full text-xs p-2 border border-gray-200 rounded-[4px] outline-none cursor-pointer focus:border-[#C8102E]"
                />
              </div>

              {/* Status Filter */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono font-bold text-gray-400 uppercase">
                  Status
                </label>
                <select
                  value={localFilters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="text-xs p-2 border border-gray-200 rounded-[4px] outline-none bg-white cursor-pointer hover:border-gray-300 focus:border-[#C8102E]"
                >
                  <option value="">Semua</option>
                  {Object.keys(summary?.by_status ?? {}).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

            </div>
          </div>

          {/* SUMMARY BY STATION (horizontal pill bar) */}
          {Object.keys(summary?.by_station ?? {}).length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider mr-1">
                Per Stasiun:
              </span>
              {Object.entries(summary.by_station).map(([station, count]) => (
                <button
                  key={station}
                  onClick={() => handleFilterChange('stasiun', localFilters.stasiun === station ? '' : station)}
                  className={`text-[10px] font-mono font-bold px-3 py-1.5 rounded-[4px] border cursor-pointer transition-all ${localFilters.stasiun === station
                    ? 'bg-[#C8102E] text-white border-[#C8102E]'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  {station} <span className="ml-1 opacity-70">({count})</span>
                </button>
              ))}
            </div>
          )}

          {/* DATA TABLE */}
          <div className="bg-white rounded-[4px] border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              {laporans.data.length === 0 ? (
                <div className="py-20 text-center">
                  <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <span className="text-sm font-bold text-gray-900 leading-none block">
                    Tidak ada data laporan ditemukan
                  </span>
                  <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                    Ubah parameter waktu atau reset filter untuk melihat data laporan masalah.
                  </p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse bg-white font-sans text-xs">
                  <thead className="bg-[#1A1C1E] sticky top-0 z-10 border-b border-gray-200 text-white select-none">
                    <tr className="uppercase tracking-widest leading-none font-mono text-[9px] font-black h-11">
                      <th className="p-3 pl-5">Nomor Tiket</th>
                      <th className="p-3">Tgl Lapor</th>
                      <th className="p-3">Stasiun</th>
                      <th className="p-3">Kategori</th>
                      <th className="p-3">Equipment</th>
                      <th className="p-3 text-center">Prioritas</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 min-w-[180px]">Deskripsi Masalah</th>
                      <th className="p-3">Teknisi</th>
                      <th className="p-3 text-center">Respon</th>
                      <th className="p-3 text-center">Solving</th>
                      <th className="p-3 pr-5 text-right w-14">Aksi</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100 select-text">
                    {laporans.data.map((item, index) => {
                      const isEven = index % 2 === 0;
                      const priorityBadge = getPriorityBadge(item.skala_prioritas);
                      const statusBadge = getStatusBadge(item.status_laporan);

                      return (
                        <tr
                          key={item.idNumber}
                          className={`hover:bg-gray-50/70 transition-colors h-12 font-sans ${isEven ? 'bg-white' : 'bg-stone-50/50'
                            }`}
                        >
                          <td className="p-3 pl-5 font-mono font-bold text-gray-950 whitespace-nowrap">
                            {item.nomor_tiket}
                          </td>
                          <td className="p-3 text-gray-600 whitespace-nowrap">
                            {item.tanggal_lapor}
                          </td>
                          <td className="p-3">
                            <span className="text-[10px] font-mono font-black border border-gray-250 bg-stone-100/80 text-gray-700 px-2 py-0.5 rounded-[4px] leading-none whitespace-nowrap uppercase">
                              {item.stasiun_lokasi}
                            </span>
                          </td>
                          <td className="p-3 text-gray-900 font-medium truncate max-w-[120px] uppercase" title={item.kategori_aset}>
                            {item.kategori_aset}
                          </td>
                          <td className="p-3 text-gray-600 truncate max-w-[120px]" title={item.equipment}>
                            {item.equipment || '-'}
                          </td>
                          <td className="p-3 text-center">
                            <span className={`text-[9px] font-mono block mx-auto px-2 py-1 rounded-[4px] uppercase font-bold text-center leading-none ${priorityBadge.className}`}>
                              {priorityBadge.label}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`inline-flex items-center gap-1.5 text-[9px] font-bold font-mono px-2.5 py-1 rounded-[4px] ${statusBadge.className}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dotColor}`}></span>
                              <span className="uppercase">{statusBadge.label}</span>
                            </span>
                          </td>
                          <td className="p-3 text-gray-600 truncate max-w-[250px] group relative">
                            <span className="hover:text-gray-950 font-medium">
                              {item.deskripsi_masalah}
                            </span>
                            <div className="absolute hidden group-hover:block bg-[#1A1C1E] text-white text-[10px] p-3 rounded-[4px] shadow-lg z-30 max-w-sm border border-neutral-800 -top-12 left-3 leading-normal font-sans tracking-wide">
                              <span className="font-bold text-orange-400 block pb-0.5">DESKRIPSI MASALAH:</span>
                              {item.deskripsi_masalah}
                            </div>
                          </td>
                          <td className="p-3 text-gray-800 font-medium whitespace-nowrap">
                            {item.nama_teknisi || '-'}
                          </td>
                          <td className="p-3 text-center font-mono font-bold text-gray-600">
                            {item.respon_time || '-'}
                          </td>
                          <td className="p-3 text-center font-mono font-bold text-gray-600">
                            {item.solving_time || '-'}
                          </td>
                          <td className="p-3 pr-5 text-right select-none">
                            <button
                              type="button"
                              onClick={() => openDetail(item)}
                              className="bg-stone-100 hover:bg-[#C8102E] hover:text-white transition-all text-gray-500 p-2 rounded-[4px] cursor-pointer inline-flex items-center justify-center border border-gray-200"
                              title="Lihat detail laporan"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* PAGINATION */}
            {laporans.last_page > 1 && (
              <div className="bg-white px-6 py-4 border-t border-gray-200 flex justify-between items-center text-xs font-sans text-gray-600 select-none">
                <div>
                  Menampilkan <span className="font-bold text-gray-950">{laporans.from}</span> s/d{' '}
                  <span className="font-bold text-gray-950">{laporans.to}</span> dari{' '}
                  <span className="font-bold text-gray-950">{laporans.total}</span> laporan
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={laporans.current_page === 1}
                    onClick={() => goToPage(laporans.current_page - 1)}
                    className="p-1.5 border border-gray-200 rounded-[4px] bg-white text-gray-700 hover:bg-stone-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="font-mono text-[11px] font-bold text-gray-900 bg-stone-100 px-3 py-1 rounded-[4px]">
                    {laporans.current_page} / {laporans.last_page}
                  </div>

                  <button
                    type="button"
                    disabled={laporans.current_page === laporans.last_page}
                    onClick={() => goToPage(laporans.current_page + 1)}
                    className="p-1.5 border border-gray-200 rounded-[4px] bg-white text-gray-700 hover:bg-stone-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* DETAIL DRAWER OVERLAY */}
      {isDetailOpen && selectedLaporan && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setIsDetailOpen(false)}
          />
          <div className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col overflow-hidden animate-slide-in-right">
            {/* Drawer Header */}
            <div className="bg-[#1A1C1E] text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block">
                  Detail Laporan
                </span>
                <span className="text-sm font-bold font-mono mt-1 block">
                  {selectedLaporan.nomor_tiket}
                </span>
              </div>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="text-gray-400 hover:text-white p-2 cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">

              {/* Status + Priority badges */}
              <div className="flex items-center gap-3">
                {(() => {
                  const sb = getStatusBadge(selectedLaporan.status_laporan);
                  return (
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold font-mono px-3 py-1.5 rounded-[4px] ${sb.className}`}>
                      <span className={`w-2 h-2 rounded-full ${sb.dotColor}`}></span>
                      <span className="uppercase">{sb.label}</span>
                    </span>
                  );
                })()}
                {(() => {
                  const pb = getPriorityBadge(selectedLaporan.skala_prioritas);
                  return (
                    <span className={`text-[10px] font-mono font-bold px-3 py-1.5 rounded-[4px] uppercase ${pb.className}`}>
                      {pb.label}
                    </span>
                  );
                })()}
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Tanggal Lapor', value: selectedLaporan.tanggal_lapor },
                  { label: 'Stasiun / Lokasi', value: selectedLaporan.stasiun_lokasi },
                  { label: 'Kategori Aset', value: selectedLaporan.kategori_aset },
                  { label: 'Equipment', value: selectedLaporan.equipment || '-' },
                  { label: 'Nama Pelapor', value: selectedLaporan.nama_pelapor },
                  { label: 'Penerima Laporan', value: selectedLaporan.nama_penerima_laporan },
                  { label: 'Nama Teknisi', value: selectedLaporan.nama_teknisi || '-' },
                  { label: 'Bulan', value: selectedLaporan.bulan },
                  { label: 'Waktu Melapor', value: selectedLaporan.waktu_melapor || '-' },
                  { label: 'Waktu Respon', value: selectedLaporan.waktu_respon_teknisi || '-' },
                  { label: 'Waktu Selesai', value: selectedLaporan.waktu_selesai || '-' },
                  { label: 'Respon Time', value: selectedLaporan.respon_time || '-' },
                  { label: 'Solving Time', value: selectedLaporan.solving_time || '-' },
                  { label: 'WR Doc Nomor', value: selectedLaporan.wr_doc_nomor || '-' },
                  { label: 'Status Eskalasi', value: selectedLaporan.status_eskalasi || '-' },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider block mb-1">
                      {label}
                    </span>
                    <span className="text-gray-900 font-medium">{value}</span>
                  </div>
                ))}
              </div>

              {/* Deskripsi Masalah */}
              <div className="bg-stone-50 border border-gray-200 rounded-[4px] p-4">
                <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider block mb-2">
                  Deskripsi Masalah
                </span>
                <p className="text-gray-800 leading-relaxed">
                  {selectedLaporan.deskripsi_masalah}
                </p>
              </div>

            </div>
          </div>
        </>
      )}
    </AppLayout>
  );
}
