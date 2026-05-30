/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useTransition } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as XLSX from 'xlsx';
import {
  Plus,
  Download,
  Search,
  ArrowUpRight,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Calendar,
  MapPin,
  Clock,
  AlertCircle,
  FileText,
  User,
  Activity,
  UserCheck,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { useIncidentStore } from '../incidentStore';
import { Incident } from '../types';
import { INCIDENT_STATIONS } from '../incident_data';
import { Props } from '../pages/incident'
import { router } from '@inertiajs/react';
import { IncidentLog } from '@/types';

// Zod schema for Create Incident Form validation
const incidentSchema = z.object({
  tanggal_lapor: z.string().min(1, 'Tanggal lapor is required'),
  nama_pelapor: z.string().trim().min(1, 'Nama pelapor is required'),
  stasiun: z.string().min(1, 'Stasiun is required'),
  kategori_aset: z.string().min(1, 'Kategori aset is required'),
  deskripsi_masalah: z.string().trim().min(5, 'Deskripsi masalah must be at least 5 characters'),
  prioritas: z.enum(['P1 (URGENT)', 'P2 (CRITICAL)', 'P3 (SERIOUS)']),
  nama_penerima_laporan: z.string(),
  nama_teknisi: z.string(),
});

type IncidentFormType = z.infer<typeof incidentSchema>;

export default function IncidentView({ incident_log, data_count }: Props) {
  const queryClient = useQueryClient();
  const [, startTransition] = useTransition();
  const [copiedTicketNo, setCopiedTicketNo] = useState<string | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryError, setCategoryError] = useState('');

  function CountSLAResponse(report: string, response: string): string {
    const waktuMelapor = new Date(report);
    const waktuRespon = new Date(response);

    const diffMs = waktuRespon - waktuMelapor;

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    const responseTime =
      String(hours).padStart(2, "0") +
      ":" +
      String(minutes).padStart(2, "0") +
      ":" +
      String(seconds).padStart(2, "0");

    return responseTime;

  }

  // Zustand Store parameters
  const {
    incidents,
    filters,
    setFilter,
    resetFilters,
    activeIncidentId,
    isDrawerOpen,
    isCreateModalOpen,
    openDrawer,
    closeDrawer,
    openCreateModal,
    closeCreateModal,
    currentPage,
    setCurrentPage,
    rowsPerPage,
    addIncident,
    categories,
    addCategory,
  } = useIncidentStore();

  // Active month default (used for counting "this month" in KPIs)
  const currentMonthIdentifier = 'Mei 2026';

  // --- 1. TANSTACK QUERY FOR DATA FETCHING ---
  const { data: filteredIncidents = [], isLoading } = useQuery<Incident[]>({
    queryKey: ['incidents', filters],
    queryFn: async () => {
      // Simulate network request delay (300ms)
      await new Promise((resolve) => setTimeout(resolve, 300));

      let results = [...incidents];

      // a. Text Search (nomor_tiket or deskripsi_masalah)
      if (filters.textSearch.trim()) {
        const query = filters.textSearch.toLowerCase().trim();
        results = results.filter(
          (inc) =>
            inc.nomor_tiket.toLowerCase().includes(query) ||
            inc.deskripsi_masalah.toLowerCase().includes(query)
        );
      }

      // b. Station dropdown filter
      if (filters.stasiun) {
        results = results.filter((inc) => inc.stasiun === filters.stasiun);
      }

      // c. Priority dropdown filter
      if (filters.prioritas) {
        results = results.filter((inc) => inc.prioritas === filters.prioritas);
      }

      // d. Status dropdown filter
      if (filters.status) {
        results = results.filter((inc) => inc.status === filters.status);
      }

      // e. Asset category dropdown filter
      if (filters.kategori_aset) {
        results = results.filter((inc) => inc.kategori_aset === filters.kategori_aset);
      }

      // f. Dates ranges (tanggal_lapor)
      if (filters.tanggalLaporFrom) {
        results = results.filter((inc) => inc.tanggal_lapor >= filters.tanggalLaporFrom);
      }
      if (filters.tanggalLaporTo) {
        results = results.filter((inc) => inc.tanggal_lapor <= filters.tanggalLaporTo);
      }

      // g. Month dropdown filter
      if (filters.bulan) {
        results = results.filter((inc) => inc.bulan === filters.bulan);
      }

      return results;
    },
    placeholderData: (prev) => prev,
  });

  function handlePagination(page: number) {
    if (page < 0) {
      page = 0
    }
    router.get('/incident', {
      page
    }, {
      preserveState: true,
      replace: true
    })
  }

  // --- 2. TANSTACK MUTATION FOR CREATION ---
  const createIncidentMutation = useMutation({
    mutationFn: async (payload: IncidentFormType) => {
      // Simulate network delay for insertion
      await new Promise((resolve) => setTimeout(resolve, 500));

      const totalCountForDate = incidents.filter(
        (i) => i.tanggal_lapor === payload.tanggal_lapor
      ).length;

      const parts = payload.tanggal_lapor.split('-'); // [YYYY, MM, DD]
      const yearStr = parts[0] ? parts[0].slice(2) : '26';
      const monthStr = parts[1] || '05';
      const dateStr = parts[2] || '23';

      const ticketSeq = String(totalCountForDate + 1).padStart(3, '0');
      const nomor_tiket = `HPIO-INC-${dateStr}${monthStr}${yearStr}-${ticketSeq}`;

      const monthsIndo = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      const parsedMonthIdx = parseInt(monthStr, 10) - 1;
      const parsedYear = parts[0] ? parseInt(parts[0], 10) : 2026;
      const bulanName = `${monthsIndo[parsedMonthIdx] || 'Mei'} ${parsedYear}`;

      const mockWaktuMelapor = `${payload.tanggal_lapor}T09:00:00Z`;
      const mockWaktuRespon = `${payload.tanggal_lapor}T09:15:00Z`;

      const newIncident: Incident = {
        id: `inc-${Date.now()}`,
        timestamp: new Date().toISOString(),
        nomor_tiket,
        tanggal_lapor: payload.tanggal_lapor,
        nama_pelapor: payload.nama_pelapor,
        nama_penerima_laporan: payload.nama_penerima_laporan || 'Sarah Jane',
        stasiun: payload.stasiun,
        kategori_aset: payload.kategori_aset,
        deskripsi_masalah: payload.deskripsi_masalah,
        prioritas: payload.prioritas,
        status: 'Open',
        nama_teknisi: payload.nama_teknisi || 'Unassigned',
        waktu_melapor: mockWaktuMelapor,
        waktu_respon: mockWaktuRespon,
        waktu_selesai: null,
        response_time: '00:15',
        solving_time: '00:00',
        wr_doc_no: null,
        status_eskalasi: null,
        bulan: bulanName,
        merged_doc_id: '',
        merged_doc_url: ''
      };

      return newIncident;
    },
    onSuccess: (data) => {
      addIncident(data);
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      closeCreateModal();
    }
  });

  // --- 3. EXPORT EXCEL VIA SHEETJS ---
  const handleExport = () => {
    if (filteredIncidents.length === 0) return;

    const dataToExport = filteredIncidents.map((inc) => ({
      'Nomor Tiket': inc.nomor_tiket,
      'Tanggal Lapor': inc.tanggal_lapor,
      'Stasiun': inc.stasiun,
      'Kategori Aset': inc.kategori_aset,
      'Prioritas': inc.prioritas,
      'Status': inc.status,
      'Deskripsi Masalah': inc.deskripsi_masalah,
      'Nama Pelapor': inc.nama_pelapor,
      'Nama Penerima': inc.nama_penerima_laporan,
      'Teknisi': inc.nama_teknisi,
      'Waktu Melapor': inc.waktu_melapor,
      'Waktu Respon': inc.waktu_respon,
      'Waktu Selesai': inc.waktu_selesai || '-',
      'Response Time': inc.response_time,
      'Solving Time': inc.solving_time,
      'WR Doc No': inc.wr_doc_no || '-',
      'Status Eskalasi': inc.status_eskalasi || '-',
      'Bulan': inc.bulan,
      'Merged Doc ID': inc.merged_doc_id || '-',
      'Merged Doc URL': inc.merged_doc_url || '-',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Incidents File');

    // Auto fit column widths
    const max_widths = Object.keys(dataToExport[0] || {}).map((key) => {
      return Math.max(
        ...dataToExport.map((row) => String(row[key as keyof typeof row] || '').length),
        key.length
      );
    });
    worksheet['!cols'] = max_widths.map((w) => ({ wch: w + 2 }));

    XLSX.writeFile(
      workbook,
      `KCIC_Incident_Report_${new Date().toISOString().substring(0, 10)}.xlsx`
    );
  };

  // --- 4. KPI CALCULATIONS ---
  // Counts only within selected/current active month for accuracy
  const p1UrgentThisMonth = incidents.filter(
    (i) => i.prioritas === 'P1 (URGENT)' && i.bulan === currentMonthIdentifier
  ).length;

  const p2CriticalThisMonth = incidents.filter(
    (i) => i.prioritas === 'P2 (CRITICAL)' && i.bulan === currentMonthIdentifier
  ).length;

  const onEscalationCount = incidents.filter(
    (i) => i.status === 'On Escalation'
  ).length;

  const closedThisMonthCount = incidents.filter(
    (i) => i.status === 'Closed' && i.bulan === currentMonthIdentifier
  ).length;

  // --- 5. PAGINATION LOGIC ---
  const totalRows = filteredIncidents.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage) || 1;

  // Guard current page range
  const activePage = Math.min(currentPage, totalPages);

  const startIndex = (activePage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalRows);
  const paginatedIncidents = filteredIncidents.slice(startIndex, endIndex);

  // Clipboard copy feedback helper
  const handleCopyTicket = (ticketNo: string) => {
    navigator.clipboard.writeText(ticketNo);
    setCopiedTicketNo(ticketNo);
    setTimeout(() => setCopiedTicketNo(null), 2000);
  };

  // Selected incident details for drawer
  const selectedIncident = incident_log.data_incident.data.find((inc) => inc.idNumber === activeIncidentId);

  // React Hook Form setups
  const {
    control,
    handleSubmit: handleFormSubmit,
    reset: resetForm,
    formState: { errors },
  } = useForm<IncidentFormType>({
    resolver: zodResolver(incidentSchema),
    defaultValues: {
      tanggal_lapor: new Date().toISOString().split('T')[0],
      nama_pelapor: '',
      stasiun: '',
      kategori_aset: '',
      deskripsi_masalah: '',
      prioritas: 'P3 (SERIOUS)',
      nama_penerima_laporan: 'Sarah Jane',
      nama_teknisi: 'Unassigned',
    },
  });

  const onSubmit = (data: IncidentFormType) => {
    createIncidentMutation.mutate(data, {
      onSuccess: () => {
        resetForm();
      }
    });
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#F4F5F7] overflow-hidden select-none">

      {/* Scrollable Work Container */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6">

        {/* TOP COMMAND BAR */}
        <div className="flex items-center justify-between select-none">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-950 m-0 leading-none">
              Incident Management System
            </h2>
            <p className="text-[10px] text-gray-400 font-mono mt-1 uppercase tracking-wider">
              Automatic telemetry diagnostic log dispatcher
            </p>
          </div>

          <div className="flex items-center gap-3 select-none">
            <button
              onClick={handleExport}
              disabled={filteredIncidents.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-250 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-[4px] cursor-pointer transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Excel</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCategoryModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-250 hover:bg-gray-50 text-gray-705 text-xs font-semibold rounded-[4px] cursor-pointer transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 text-gray-500" />
              <span>Tambah Kategori</span>
            </button>

            <button
              onClick={openCreateModal}
              className="flex items-center gap-1.5 px-4.5 py-2 bg-[#C8102E] hover:bg-[#b00d25] text-white text-xs font-bold rounded-[4px] cursor-pointer transition-colors shadow-sm uppercase tracking-wide"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Tiket</span>
            </button>
          </div>
        </div>

        {/* --- KPI METRIC CARDS --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 select-none">

          {/* Card 1: P1 Urgent */}
          <div className="bg-white border-l-4 border-l-[#C8102E] border-y border-r border-gray-150 rounded-[4px] p-4 flex flex-col justify-between shadow-xs">
            <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block">
              P1 URGENT
            </span>
            <div className="flex items-baseline justify-between mt-3">
              <span className="text-2xl font-black font-mono text-gray-950 leading-none">
                {data_count.total}
              </span>
              <span className="text-[9px] font-mono text-red-700 bg-[#FCEBEB] px-1.5 py-0.5 rounded uppercase font-bold">
                Immediate Action
              </span>
            </div>
          </div>

          {/* Card 2: P2 Critical */}
          <div className="bg-white border-l-4 border-l-[#E07B29] border-y border-r border-gray-150 rounded-[4px] p-4 flex flex-col justify-between shadow-xs">
            <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block">
              P2 CRITICAL (MEI)
            </span>
            <div className="flex items-baseline justify-between mt-3">
              <span className="text-2xl font-black font-mono text-gray-950 leading-none">
                {data_count.total_p1}
              </span>
              <span className="text-[9px] font-mono text-[#854F0B] bg-[#FAEEDA] px-1.5 py-0.5 rounded uppercase font-bold">
                High Priority
              </span>
            </div>
          </div>

          {/* Card 3: On Escalation */}
          <div className="bg-white border-l-4 border-l-[#D4A017] border-y border-r border-gray-150 rounded-[4px] p-4 flex flex-col justify-between shadow-xs">
            <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block">
              ON ESCALATION
            </span>
            <div className="flex items-baseline justify-between mt-3">
              <span className="text-2xl font-black font-mono text-gray-950 leading-none">
                {data_count.total_p1}
              </span>
              <span className="text-[9px] font-mono text-yellow-800 bg-yellow-50 px-1.5 py-0.5 rounded uppercase font-bold">
                Active Routing
              </span>
            </div>
          </div>

          {/* Card 4: Closed */}
          <div className="bg-white border-l-4 border-l-[#3B6D11] border-y border-r border-gray-150 rounded-[4px] p-4 flex flex-col justify-between shadow-xs">
            <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block">
              CLOSED (MEI)
            </span>
            <div className="flex items-baseline justify-between mt-3">
              <span className="text-2xl font-black font-mono text-gray-950 leading-none">
                {data_count.total_close}
              </span>
              <span className="text-[9px] font-mono text-emerald-800 bg-[#EAF3DE] px-1.5 py-0.5 rounded uppercase font-bold">
                Resolved Loop
              </span>
            </div>
          </div>

        </div>

        {/* --- FILTER CONTROL BAR --- */}
        <div className="bg-white p-5 rounded-[4px] border border-gray-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-gray-100 select-none">
            <span className="text-xs font-bold text-gray-950 uppercase tracking-wider block">
              Fringe Filter Matrix
            </span>
            <button
              onClick={resetFilters}
              className="text-[10px] text-[#C8102E] font-mono font-bold tracking-wider hover:underline uppercase"
            >
              Reset Filters
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">

            {/* Search Input */}
            <div className="col-span-2 flex flex-col gap-1">
              <label className="text-[10px] font-mono font-bold text-gray-400 uppercase">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Ticket No / deskripsi..."
                  value={filters.textSearch}
                  onChange={(e) => startTransition(() => setFilter('textSearch', e.target.value))}
                  className="w-full text-xs py-2 pl-8 pr-2 border border-gray-200 rounded-[4px] focus:ring-1 focus:ring-[#C8102E] focus:border-[#C8102E] outline-none bg-stone-50 select-text"
                />
              </div>
            </div>

            {/* Station dropdown */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono font-bold text-gray-400 uppercase">
                Stasiun
              </label>
              <select
                value={filters.stasiun}
                onChange={(e) => setFilter('stasiun', e.target.value)}
                className="text-xs p-2 border border-gray-200 rounded-[4px] outline-none bg-white cursor-pointer hover:border-gray-300 focus:border-[#C8102E]"
              >
                <option value="">Semua</option>
                {INCIDENT_STATIONS.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority dropdown */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono font-bold text-gray-400 uppercase">
                Prioritas
              </label>
              <select
                value={filters.prioritas}
                onChange={(e) => setFilter('prioritas', e.target.value)}
                className="text-xs p-2 border border-gray-200 rounded-[4px] outline-none bg-white cursor-pointer hover:border-gray-300 focus:border-[#C8102E]"
              >
                <option value="">Semua</option>
                <option value="P1 (URGENT)">P1 (URGENT)</option>
                <option value="P2 (CRITICAL)">P2 (CRITICAL)</option>
                <option value="P3 (SERIOUS)">P3 (SERIOUS)</option>
              </select>
            </div>

            {/* Status dropdown */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono font-bold text-gray-400 uppercase">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilter('status', e.target.value)}
                className="text-xs p-2 border border-gray-200 rounded-[4px] outline-none bg-white cursor-pointer hover:border-gray-300 focus:border-[#C8102E]"
              >
                <option value="">Semua</option>
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
                <option value="On Escalation">On Escalation</option>
              </select>
            </div>

            {/* Category asset dropdown */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono font-bold text-gray-400 uppercase">
                Kategori Aset
              </label>
              <select
                value={filters.kategori_aset}
                onChange={(e) => setFilter('kategori_aset', e.target.value)}
                className="text-xs p-2 border border-gray-200 rounded-[4px] outline-none bg-white cursor-pointer hover:border-gray-300 focus:border-[#C8102E]"
              >
                <option value="">Semua</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Month dropdown */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono font-bold text-gray-400 uppercase">
                Bulan
              </label>
              <select
                value={filters.bulan}
                onChange={(e) => setFilter('bulan', e.target.value)}
                className="text-xs p-2 border border-gray-200 rounded-[4px] outline-none bg-white cursor-pointer hover:border-gray-300 focus:border-[#C8102E]"
              >
                <option value="">Semua</option>
                <option value="Desember 2025">Desember 2025</option>
                <option value="Januari 2026">Januari 2026</option>
                <option value="Mei 2026">Mei 2026</option>
              </select>
            </div>

            {/* Date Picker From / To */}
            <div className="col-span-2 flex items-center gap-2">
              <div className="flex-1 flex flex-col gap-1">
                <label className="text-[10px] font-mono font-bold text-gray-400 uppercase">
                  Tgl Dari
                </label>
                <input
                  type="date"
                  value={filters.tanggalLaporFrom}
                  onChange={(e) => setFilter('tanggalLaporFrom', e.target.value)}
                  className="w-full text-xs p-2 border border-gray-200 rounded-[4px] outline-none cursor-pointer focus:border-[#C8102E]"
                />
              </div>

              <div className="flex-1 flex flex-col gap-1">
                <label className="text-[10px] font-mono font-bold text-gray-400 uppercase">
                  Tgl Ke
                </label>
                <input
                  type="date"
                  value={filters.tanggalLaporTo}
                  onChange={(e) => setFilter('tanggalLaporTo', e.target.value)}
                  className="w-full text-xs p-2 border border-gray-200 rounded-[4px] outline-none cursor-pointer focus:border-[#C8102E]"
                />
              </div>
            </div>

          </div>
        </div>

        {/* --- INCIDENT TICKETS DATA TABLE --- */}
        <div className="bg-white rounded-[4px] border border-gray-200 shadow-sm overflow-hidden flex flex-col">

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="py-20 text-center text-sm font-semibold text-gray-500 font-mono animate-pulse">
                INITIALIZING CORE QUERY TELEMETRY RETRIEVALS...
              </div>
            ) : paginatedIncidents.length === 0 ? (
              <div className="py-20 text-center">
                <HelpCircle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <span className="text-sm font-bold text-gray-900 leading-none">
                  No ticket records matched current parameters
                </span>
                <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                  Alter search query strings or reset grid criteria filters to query additional system databases.
                </p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse bg-white font-sans text-xs">

                {/* STICKY HEADER MATRIX */}
                <thead className="bg-[#1A1C1E] sticky top-0 z-10 border-b border-gray-200 text-white select-none">
                  <tr className="uppercase tracking-widest leading-none font-mono text-[9px] font-black h-11">
                    <th className="p-3 pl-5">Nomor Tiket</th>
                    <th className="p-3">Tgl Lapor</th>
                    <th className="p-3">Stasiun</th>
                    <th className="p-3">Kategori Aset</th>
                    <th className="p-3 text-center">Prioritas</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 min-w-[200px]">Deskripsi Masalah</th>
                    <th className="p-3">Nama Teknisi</th>
                    <th className="p-3 text-center">Response</th>
                    <th className="p-3 text-center">Solving</th>
                    <th className="p-3 text-center">Eskalasi</th>
                    <th className="p-3 pr-5 text-right w-16">Aksi</th>
                  </tr>
                </thead>

                {/* ZEBRA STRIPE ROWS */}
                <tbody className="divide-y divide-gray-100 select-text">
                  {incident_log.data_incident.data.map((inc, index) => {
                    const isEven = index % 2 === 0;
                    return (
                      <tr
                        key={inc.idNumber}
                        className={`hover:bg-gray-50/70 transition-colors h-12 uppercase font-sans ${isEven ? 'bg-white' : 'bg-stone-50/50'
                          }`}
                      >

                        {/* 1. Ticket Number Monospace */}
                        <td className="p-3 pl-5 font-mono select-none" id={`td-ticket-${inc.id}`}>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-950">
                              {inc.nomor_tiket}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyTicket(inc.nomor_tiket)}
                              className="text-gray-400 hover:text-[#C8102E] transition-all cursor-pointer inline-flex items-center justify-center p-1 rounded hover:bg-gray-100"
                              title="Copy ticket number"
                            >
                              {copiedTicketNo === inc.nomor_tiket ? (
                                <Check className="w-3 h-3 text-green-600 animate-scale" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* 2. Tanggal Lapor */}
                        <td className="p-3 text-gray-600 whitespace-nowrap">
                          {inc.tanggal_lapor}
                        </td>

                        {/* 3. Stasiun Pill */}
                        <td className="p-3">
                          <span className="text-[10px] font-mono font-black border border-gray-250 bg-stone-100/80 text-gray-700 px-2 py-0.5 rounded-[4px] leading-none whitespace-nowrap">
                            {inc.stasiun_lokasi}
                          </span>
                        </td>

                        {/* 4. Kategori Aset */}
                        <td className="p-3 text-gray-900 font-medium truncate max-w-[140px]" title={inc.kategori_aset}>
                          {inc.kategori_aset}
                        </td>

                        {/* 5. Prioritas Tinted Badges */}
                        <td className="p-3 text-center">
                          {inc.prioritas === 'P1 (URGENT)' ? (
                            <span className="text-[9px] font-mono block mx-auto text-red-700 bg-[#FCEBEB] px-2 py-1 rounded-[4px] uppercase font-bold text-center leading-none">
                              P1 URGENT
                            </span>
                          ) : inc.prioritas === 'P2 (CRITICAL)' ? (
                            <span className="text-[9px] font-mono block mx-auto text-[#854F0B] bg-[#FAEEDA] px-2 py-1 rounded-[4px] uppercase font-bold text-center leading-none">
                              P2 CRITICAL
                            </span>
                          ) : (
                            <span className="text-[9px] font-mono block mx-auto text-emerald-800 bg-[#EAF3DE] px-2 py-1 rounded-[4px] uppercase font-bold text-center leading-none">
                              P3 SERIOUS
                            </span>
                          )}
                        </td>

                        {/* 6. Status Badges */}
                        <td className="p-3 text-center">
                          {inc.status_laporan === 'CLOSE' ? (
                            <span className="inline-flex items-center gap-1.5 text-[9px] font-bold font-mono text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-[4px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              <span>CLOSED</span>
                            </span>
                          ) : inc.status === 'ON PROGRESS' ? (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold font-mono text-yellow-800 bg-yellow-50 px-2 py-1 rounded-[4px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                              <ArrowUpRight className="w-3 h-3 text-yellow-500 shrink-0" />
                              <span>ESCALATED</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-[9px] font-bold font-mono text-red-700 bg-red-50 px-2.5 py-1 rounded-[4px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#C8102E]"></span>
                              <span>OPEN</span>
                            </span>
                          )}
                        </td>

                        {/* 7. Deskripsi (Truncate with hover) */}
                        <td className="p-3 text-gray-600 truncate max-w-[280px] break-all relative group select-none">
                          <span className="hover:text-gray-950 font-medium">
                            {inc.deskripsi_masalah}
                          </span>

                          {/* Hover Tooltip Popup window */}
                          <div className="absolute hidden group-hover:block bg-[#1A1C1E] text-white text-[10px] p-3 rounded-[4px] shadow-lg z-30 max-w-sm border border-neutral-800 -top-12 left-3 leading-normal font-sans tracking-wide">
                            <span className="font-bold text-orange-400 block pb-0.5">FAULT LOG DESKRIPSI:</span>
                            {inc.deskripsi_masalah}
                          </div>
                        </td>

                        {/* 8. Nama Teknisi */}
                        <td className="p-3 text-gray-800 font-medium whitespace-nowrap">
                          {inc.nama_teknisi}
                        </td>

                        {/* 9. Response Time hh:mm */}
                        <td className="p-3 text-center font-mono font-bold text-gray-600">
                          {inc.waktu_respon_teknisi}
                        </td>

                        {/* 10. Solving Time hh:mm */}
                        <td className="p-3 text-center font-mono font-bold text-gray-600">
                          {inc.waktu_selesai}
                        </td>

                        {/* 11. Status Eskalasi (nullable block) */}
                        <td className="p-3 text-center">
                          {inc.status_eskalasi ? (
                            <span className="text-[10px] bg-sky-50 border border-sky-150 text-sky-700 px-2 py-0.5 rounded-[3px] font-mono leading-none">
                              {inc.status_eskalasi}
                            </span>
                          ) : (
                            <span className="text-gray-300 font-mono">-</span>
                          )}
                        </td>

                        {/* 12. Eye icon action button */}
                        <td className="p-3 pr-5 text-right select-none">
                          <button
                            type="button"
                            onClick={() => openDrawer(inc.idNumber)}
                            className="bg-stone-100 hover:bg-[#C8102E] hover:text-white transition-all text-gray-500 p-2 rounded-[4px] cursor-pointer inline-flex items-center justify-center border border-gray-200"
                            title="See detailed information"
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

          {/* --- SERVER-SIDE STYLE PAGINATION COMPONENT --- */}
          <div className="bg-white px-6 py-4 border-t border-gray-200 flex justify-between items-center text-xs font-sans text-gray-600 select-none">

            <div>
              Menampilkan <span className="font-bold text-gray-950">{startIndex + 1}</span> s/d
              <span className="font-bold text-gray-950"> {incident_log.data_incident.last_page}</span> dari{' '}
              <span className="font-bold text-gray-950">{totalRows}</span> tiket
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={activePage === 1}
                onClick={() => handlePagination(incident_log.data_incident.from - 1)}
                className="p-1.5 border border-gray-200 rounded-[4px] bg-white text-gray-700 hover:bg-stone-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="font-mono text-[11px] font-bold text-gray-900 bg-stone-100 px-3 py-1 rounded-[4px]">
                {activePage} / {totalPages}
              </div>

              <button
                type="button"
                disabled={activePage === totalPages}
                onClick={() => handlePagination(incident_log.data_incident.from + 1)}
                className="p-1.5 border border-gray-200 rounded-[4px] bg-white text-gray-700 hover:bg-stone-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* --- RIGHT SLIDE-IN DETAIL DRAWER --- */}
      {isDrawerOpen && selectedIncident && (
        <div className="fixed inset-0 z-50 flex justify-end select-none">

          {/* Backdrop screen lock mask */}
          <div
            className="absolute inset-0 bg-neutral-900/40 backdrop-blur-xs transition-opacity cursor-pointer animate-fade-in"
            onClick={closeDrawer}
          />

          {/* Core Right Slider Drawer */}
          <div className="relative w-full max-w-lg bg-white h-full shadow-2xl overflow-y-auto flex flex-col border-l border-neutral-100 animate-slide-in">

            {/* Drawer Heading Banner with colors */}
            <div className="p-6 bg-[#1A1C1E] text-white flex justify-between items-start shrink-0">
              <div className="space-y-1">
                <span className="text-[9px] font-mono font-bold text-[#C8102E] uppercase tracking-widest block">
                  INCIDENT MANAGER DETAIL AUDIT
                </span>
                <h3 className="text-base font-black font-mono leading-none tracking-tight">
                  {selectedIncident.nomor_tiket}
                </h3>

                <div className="flex items-center gap-1.5 pt-2">
                  {/* Prioritas flag */}
                  {selectedIncident.prioritas === 'P1 (URGENT)' ? (
                    <span className="text-[9px] font-mono text-red-700 bg-[#FCEBEB] px-2 py-0.5 rounded uppercase font-bold">
                      P1 URGENT
                    </span>
                  ) : selectedIncident.prioritas === 'P2 (CRITICAL)' ? (
                    <span className="text-[9px] font-mono text-[#854F0B] bg-[#FAEEDA] px-2 py-0.5 rounded uppercase font-bold">
                      P2 CRITICAL
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono text-emerald-800 bg-[#EAF3DE] px-2 py-0.5 rounded uppercase font-bold">
                      P3 SERIOUS
                    </span>
                  )}

                  {/* Status chip */}
                  <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-black uppercase ${selectedIncident.status === 'Closed'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-250'
                    : selectedIncident.status === 'On Escalation'
                      ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                    {selectedIncident.status}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={closeDrawer}
                className="text-white/60 hover:text-white hover:bg-white/5 transition-all p-1.5 rounded-[4px] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Layout Drawer Body */}
            <div className="flex-1 p-6 space-y-6 overflow-y-auto text-xs text-gray-700 select-text">

              {/* Section 1: Info Umum */}
              <div className="space-y-3.5 pb-5 border-b border-gray-150">
                <h4 className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1 leading-none select-none">
                  <Activity className="w-3.5 h-3.5 text-gray-400" />
                  <span>Info Umum Sistem</span>
                </h4>

                <div className="grid grid-cols-2 gap-4 bg-stone-50 p-4 border border-gray-200 rounded-[4px]">
                  <div>
                    <span className="text-[9px] font-mono font-bold text-gray-400 block uppercase select-none">tanggal lapor</span>
                    <p className="font-semibold text-gray-900 mt-0.5">{selectedIncident.tanggal_lapor}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono font-bold text-gray-400 block uppercase select-none">stasiun monitor</span>
                    <p className="font-semibold text-gray-900 mt-0.5">{selectedIncident.stasiun}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono font-bold text-gray-400 block uppercase select-none">kategori aset</span>
                    <p className="font-semibold text-[#C8102E] mt-0.5 uppercase">{selectedIncident.kategori_aset}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono font-bold text-gray-400 block uppercase select-none">bulan slip</span>
                    <p className="font-semibold text-gray-900 mt-0.5">{selectedIncident.bulan}</p>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-gray-150/50">
                    <span className="text-[9px] font-mono font-bold text-gray-400 block uppercase select-none">pelapor</span>
                    <p className="font-semibold text-gray-900 mt-0.5 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-stone-400" />
                      {selectedIncident.nama_pelapor} (Receiver Dispatcher: {selectedIncident.nama_penerima_laporan})
                    </p>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-gray-150/50">
                    <span className="text-[9px] font-mono font-bold text-gray-400 block uppercase select-none">deskripsi masalah</span>
                    <p className="text-gray-900 mt-1 leading-relaxed font-sans bg-white p-3 border border-gray-150 rounded-[3.5px]">
                      {selectedIncident.deskripsi_masalah}
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 2: Timeline with visual steps wrapper */}
              <div className="space-y-4 pb-5 border-b border-gray-150">
                <h4 className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1 leading-none select-none">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <span>SLA Response Timeline</span>
                </h4>

                {/* Timeline flow */}
                <div className="space-y-4 pl-4 relative before:absolute before:left-[10px] before:top-2 before:bottom-2 before:w-[1.5px] before:bg-gray-200">

                  {/* Step 1: Melapor */}
                  <div className="relative pl-6">
                    <div className="absolute left-[2.5px] top-1 w-[16px] h-[16px] rounded-full bg-red-50 border-2 border-[#C8102E] flex items-center justify-center shrink-0 z-10">
                      <div className="w-2 h-2 rounded-full bg-[#C8102E]"></div>
                    </div>
                    <div className="flex justify-between items-baseline font-mono text-[9px]">
                      <span className="uppercase font-bold text-gray-950 font-sans text-xs">Waktu Melapor (Tele-log)</span>
                      <span className="text-gray-400 font-bold">{new Date(selectedIncident.waktu_melapor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">{new Date(selectedIncident.waktu_melapor).toLocaleDateString()}</p>
                  </div>

                  {/* Step 2: Respon */}
                  <div className="relative pl-6">
                    <div className="absolute left-[2.5px] top-1 w-[16px] h-[16px] rounded-full bg-orange-50 border-2 border-orange-500 flex items-center justify-center shrink-0 z-10">
                      <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    </div>
                    <div className="flex justify-between items-baseline font-mono text-[9px]">
                      <span className="uppercase font-bold text-gray-950 font-sans text-xs">Waktu Respon (SLA Gateway)</span>
                      <span className="text-gray-400 font-bold">{new Date(selectedIncident.respon_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className='text-[.5rem]'>Response Date {new Date(selectedIncident.respon_time).toLocaleDateString()}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">Response Time: <span className="text-[#C8102E] font-bold font-mono text-[10px]">{CountSLAResponse(selectedIncident.waktu_melapor, selectedIncident.respon_time)}</span></p>
                  </div>

                  {/* Step 3: Selesai */}
                  <div className="relative pl-6">
                    <div className={`absolute left-[2.5px] top-1 w-[16px] h-[16px] rounded-full flex items-center justify-center shrink-0 z-10 ${selectedIncident.waktu_selesai
                      ? 'bg-emerald-50 border-2 border-emerald-600'
                      : 'bg-stone-50 border-2 border-gray-300'
                      }`}>
                      <div className={`w-2 h-2 rounded-full ${selectedIncident.waktu_selesai ? 'bg-emerald-600' : 'bg-gray-300'}`}></div>
                    </div>
                    <div className="flex justify-between items-baseline font-mono text-[9px]">
                      <span className="uppercase font-bold text-gray-950 font-sans text-xs">Waktu Selesai (Clearance Audit)</span>

                      <span className="text-gray-400 font-bold">

                        {selectedIncident.waktu_selesai
                          ? new Date(selectedIncident.waktu_selesai).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : 'ONGOING'}
                      </span>
                    </div>
                    <p className='text-[.5rem]'>Response Date {new Date(selectedIncident.waktu_selesai).toLocaleDateString()}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {selectedIncident.waktu_selesai ? (
                        <>
                          Solving Time:{' '}
                          <span className="text-emerald-700 font-bold font-mono text-[10px]">
                            {selectedIncident.solving_time}
                          </span>
                        </>
                      ) : (
                        <span className="text-gray-400 italic font-medium">Currently under diagnostic repairs</span>
                      )}
                    </p>
                  </div>

                </div>
              </div>

              {/* Section 3: Penanganan */}
              <div className="space-y-3.5 pb-5">
                <h4 className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1 leading-none select-none">
                  <UserCheck className="w-3.5 h-3.5 text-gray-400" />
                  <span>Teknisi & Administrasi Penanganan</span>
                </h4>

                <div className="grid grid-cols-2 gap-4 bg-stone-50 p-4 border border-gray-200 rounded-[4px]">
                  <div>
                    <span className="text-[9px] font-mono font-bold text-gray-400 block uppercase select-none">nama teknisi</span>
                    <p className="font-semibold text-gray-900 mt-0.5">{selectedIncident.nama_teknisi}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono font-bold text-gray-400 block uppercase select-none">wr doc id reference</span>
                    <p className="font-mono text-gray-900 font-semibold mt-0.5">
                      {selectedIncident.wr_doc_no || 'Pending Creation'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono font-bold text-gray-400 block uppercase select-none">eskalasi status</span>
                    <p className="font-semibold text-gray-900 mt-0.5">
                      {selectedIncident.status_eskalasi ? (
                        <span className="text-[9px] bg-sky-50 border border-sky-150 text-sky-700 px-2 py-0.5 rounded-[3px] font-mono">
                          {selectedIncident.status_eskalasi}
                        </span>
                      ) : (
                        'No escalation'
                      )}
                    </p>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono font-bold text-gray-400 block uppercase select-none">merged document code</span>
                    <p className="font-mono text-gray-900 font-semibold mt-0.5">
                      {selectedIncident.merged_doc_id || '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 4: Dokumen Link */}
              {selectedIncident.merged_doc_url && (
                <div className="bg-[#C8102E]/5 border border-[#C8102E]/20 p-4 rounded-[4px] flex items-center justify-between font-sans shadow-sm select-none">
                  <div className="space-y-0.5 max-w-[280px]">
                    <span className="font-bold text-[#C8102E] block uppercase text-[10px] tracking-wide">
                      Unduh Berkas Laporan Terpadu
                    </span>
                    <p className="text-[10px] text-gray-500 leading-normal">
                      Unduh berkas PDF gabungan yang berisi form melapor, formulir penanganan, serta foto bukti dilapangan.
                    </p>
                  </div>

                  <a
                    href={selectedIncident.merged_doc_url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 bg-[#C8102E] hover:bg-[#b00d25] text-white font-bold rounded-[4px] text-[10px] flex items-center gap-1.5 transition-colors uppercase font-mono shadow-xs"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Lihat Laporan</span>
                  </a>
                </div>
              )}

            </div>

            {/* Close action at bottom of drawer */}
            <div className="p-4 border-t border-gray-150 bg-stone-50 flex justify-end shrink-0 select-none">
              <button
                type="button"
                onClick={closeDrawer}
                className="px-4.5 py-2.5 bg-gray-100 hover:bg-gray-200 border border-gray-250 text-gray-700 text-xs font-black rounded-[4px] cursor-pointer transition-all uppercase tracking-wider"
              >
                Close Drawer
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- CREATE NEW INCIDENT MODAL OVERLAY --- */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4">

          {/* Backdrop lock */}
          <div
            className="absolute inset-0 bg-neutral-900/60 backdrop-blur-xs transition-opacity cursor-pointer animate-fade-in"
            onClick={closeCreateModal}
          />

          {/* Core modal element */}
          <div className="relative bg-white rounded-[4px] border border-gray-200 w-full max-w-lg shadow-2xl overflow-hidden flex flex-col z-20 animate-scale">

            {/* Modal Heading banner */}
            <div className="px-6 py-4 bg-[#1A1C1E] text-white flex justify-between items-center border-b border-white/10 select-none">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-[#C8102E] rounded-[3px] flex items-center justify-center font-bold italic text-sm text-white shrink-0">
                  K
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-xs font-bold tracking-tight text-white uppercase font-mono">
                    Buat Tiket Gangguan Baru
                  </span>
                  <span className="text-[8px] text-white/50 font-mono tracking-widest mt-1">
                    KCIC TICKET CREATOR SERVICE
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={closeCreateModal}
                className="text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Scroll Area */}
            <form
              onSubmit={handleFormSubmit(onSubmit)}
              className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs text-gray-700"
            >

              {/* Row 1: Tanggal Lapor + Pelapor */}
              <div className="grid grid-cols-2 gap-4">

                {/* Tanggal Lapor Required */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono font-bold text-gray-400 uppercase select-none">
                    Tanggal Lapor *
                  </label>
                  <Controller
                    name="tanggal_lapor"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="date"
                        {...field}
                        className={`w-full p-2.5 rounded-[4px] border outline-none bg-stone-50 text-gray-950 transition-all font-sans cursor-pointer ${errors.tanggal_lapor
                          ? 'border-red-500 bg-red-50/10'
                          : 'border-gray-200 focus:border-[#C8102E] focus:ring-1 focus:ring-[#C8102E]'
                          }`}
                      />
                    )}
                  />
                  {errors.tanggal_lapor && (
                    <span className="text-[10px] text-[#C8102E] font-medium flex items-center gap-0.5 mt-0.5 select-none">
                      <AlertCircle className="w-3 h-3" /> {errors.tanggal_lapor.message}
                    </span>
                  )}
                </div>

                {/* Nama Pelapor Required */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono font-bold text-gray-400 uppercase select-none">
                    Nama Pelapor *
                  </label>
                  <Controller
                    name="nama_pelapor"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="text"
                        placeholder="e.g. Andi Wijaya"
                        {...field}
                        className={`w-full p-2.5 rounded-[4px] border outline-none bg-white text-gray-950 transition-all font-sans select-text ${errors.nama_pelapor
                          ? 'border-red-500 bg-red-50/10'
                          : 'border-gray-200 focus:border-[#C8102E] focus:ring-1 focus:ring-[#C8102E]'
                          }`}
                      />
                    )}
                  />
                  {errors.nama_pelapor && (
                    <span className="text-[10px] text-[#C8102E] font-medium flex items-center gap-0.5 mt-0.5 select-none">
                      <AlertCircle className="w-3 h-3" /> {errors.nama_pelapor.message}
                    </span>
                  )}
                </div>

              </div>

              {/* Row 2: Stasiun + Kategori Dropdown Required */}
              <div className="grid grid-cols-2 gap-4">

                {/* Stasiun Required dropdown */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono font-bold text-gray-400 uppercase select-none">
                    Stasiun *
                  </label>
                  <Controller
                    name="stasiun"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className={`w-full p-2.5 rounded-[4px] border outline-none bg-white text-gray-950 transition-all cursor-pointer font-sans ${errors.stasiun
                          ? 'border-red-500 bg-red-50/10'
                          : 'border-gray-200 focus:border-[#C8102E] focus:ring-1 focus:ring-[#C8102E]'
                          }`}
                      >
                        <option value="">-- PILIH STASIUN --</option>
                        {INCIDENT_STATIONS.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                  {errors.stasiun && (
                    <span className="text-[10px] text-[#C8102E] font-medium flex items-center gap-0.5 mt-0.5 select-none">
                      <AlertCircle className="w-3 h-3" /> {errors.stasiun.message}
                    </span>
                  )}
                </div>

                {/* Kategori asset Required dropdown */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono font-bold text-gray-400 uppercase select-none">
                    Kategori Aset *
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Controller
                        name="kategori_aset"
                        control={control}
                        render={({ field }) => (
                          <select
                            {...field}
                            className={`w-full p-2.5 rounded-[4px] border outline-none bg-white text-gray-950 transition-all cursor-pointer font-sans ${errors.kategori_aset
                              ? 'border-red-500 bg-red-50/10'
                              : 'border-gray-200 focus:border-[#C8102E] focus:ring-1 focus:ring-[#C8102E]'
                              }`}
                          >
                            <option value="">-- PILIH KATEGORI --</option>
                            {categories.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                        )}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsCategoryModalOpen(true)}
                      className="px-3.5 bg-stone-100 hover:bg-[#C8102E] hover:text-white transition-all text-gray-600 rounded-[4px] border border-gray-200 cursor-pointer flex items-center justify-center"
                      title="Tambah Kategori Baru"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {errors.kategori_aset && (
                    <span className="text-[10px] text-[#C8102E] font-medium flex items-center gap-0.5 mt-0.5 select-none">
                      <AlertCircle className="w-3 h-3" /> {errors.kategori_aset.message}
                    </span>
                  )}
                </div>

              </div>

              {/* Deskripsi Masalah Required text-area */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono font-bold text-gray-400 uppercase select-none">
                  Deskripsi Masalah *
                </label>
                <Controller
                  name="deskripsi_masalah"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      placeholder="Uraikan detail kegagalan komponen teknis..."
                      rows={3}
                      {...field}
                      className={`w-full p-2.5 rounded-[4px] border outline-none bg-white text-gray-950 transition-all font-sans select-text ${errors.deskripsi_masalah
                        ? 'border-red-500 bg-red-50/10'
                        : 'border-gray-200 focus:border-[#C8102E] focus:ring-1 focus:ring-[#C8102E]'
                        }`}
                    />
                  )}
                />
                {errors.deskripsi_masalah && (
                  <span className="text-[10px] text-[#C8102E] font-medium flex items-center gap-0.5 mt-0.5 select-none">
                    <AlertCircle className="w-3 h-3" /> {errors.deskripsi_masalah.message}
                  </span>
                )}
              </div>

              {/* Prioritas with color indicators Radio Button controls */}
              <div className="flex flex-col gap-1.5 pt-1 select-none">
                <label className="text-[10px] font-mono font-bold text-gray-400 uppercase">
                  Prioritas Gangguan (SLA Severity) *
                </label>
                <Controller
                  name="prioritas"
                  control={control}
                  render={({ field }) => (
                    <div className="flex gap-4 pt-1">

                      {/* P1 */}
                      <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold">
                        <input
                          type="radio"
                          value="P1 (URGENT)"
                          checked={field.value === 'P1 (URGENT)'}
                          onChange={() => field.onChange('P1 (URGENT)')}
                          className="w-4 h-4 text-[#C8102E] border-gray-300 focus:ring-[#C8102E]"
                        />
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#C8102E]" />
                          <span>P1 (URGENT)</span>
                        </span>
                      </label>

                      {/* P2 */}
                      <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold">
                        <input
                          type="radio"
                          value="P2 (CRITICAL)"
                          checked={field.value === 'P2 (CRITICAL)'}
                          onChange={() => field.onChange('P2 (CRITICAL)')}
                          className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-[#C8102E]"
                        />
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                          <span>P2 (CRITICAL)</span>
                        </span>
                      </label>

                      {/* P3 */}
                      <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold">
                        <input
                          type="radio"
                          value="P3 (SERIOUS)"
                          checked={field.value === 'P3 (SERIOUS)'}
                          onChange={() => field.onChange('P3 (SERIOUS)')}
                          className="w-4 h-4 text-green-600 border-gray-300 focus:ring-[#C8102E]"
                        />
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                          <span>P3 (SERIOUS)</span>
                        </span>
                      </label>

                    </div>
                  )}
                />
              </div>

              {/* Row 4: Optional Penerima Laporan + Teknisi */}
              <div className="grid grid-cols-2 gap-4 pt-1">

                {/* Penerima Laporan */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono font-bold text-gray-400 uppercase select-none">
                    Penerima Laporan (Optional)
                  </label>
                  <Controller
                    name="nama_penerima_laporan"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="text"
                        placeholder="Sarah Jane"
                        {...field}
                        className="w-full p-2.5 rounded-[4px] border border-gray-200 outline-none bg-white text-gray-950 transition-all font-sans focus:border-[#C8102E] focus:ring-1 focus:ring-[#C8102E] select-text"
                      />
                    )}
                  />
                </div>

                {/* Nama Teknisi */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono font-bold text-gray-400 uppercase select-none">
                    Teknisi Lapangan (Optional)
                  </label>
                  <Controller
                    name="nama_teknisi"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="text"
                        placeholder="e.g. Budi Santoso"
                        {...field}
                        className="w-full p-2.5 rounded-[4px] border border-gray-200 outline-none bg-white text-gray-950 transition-all font-sans focus:border-[#C8102E] focus:ring-1 focus:ring-[#C8102E] select-text"
                      />
                    )}
                  />
                </div>

              </div>

              {/* Server POST database simulated trail */}
              <div className="p-3 bg-stone-50 border border-gray-200 text-[10px] text-gray-500 space-y-0.5 leading-relaxed rounded-[4px] select-none">
                <span className="font-bold font-mono uppercase text-gray-400 block text-[9px] tracking-wide">
                  SERVER REST API DATA TRAIL
                </span>
                <p>
                  Clicking "Simpan Tiket" initiates a transaction request modeled after <code className="bg-stone-150 p-0.5 rounded font-mono">POST /api/incidents</code>. If validated, the server writes back the ticket number and fires Supabase real-time notifications.
                </p>
              </div>

              {/* Footer action buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-150 select-none">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="px-4.5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-[4px] cursor-pointer transition-colors uppercase tracking-wider text-[10px]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createIncidentMutation.isPending}
                  className="px-5 py-2.5 bg-[#C8102E] hover:bg-[#b00d25] text-white font-bold rounded-[4px] flex items-center gap-1.5 transition-colors cursor-pointer uppercase tracking-wider text-[10px] disabled:opacity-50"
                >
                  {createIncidentMutation.isPending ? 'Storing...' : 'Simpan Tiket'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* --- CREATE NEW CATEGORY MODAL OVERLAY --- */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4">

          {/* Backdrop lock */}
          <div
            className="absolute inset-0 bg-neutral-900/60 backdrop-blur-xs transition-opacity cursor-pointer animate-fade-in"
            onClick={() => {
              setIsCategoryModalOpen(false);
              setNewCategoryName('');
              setCategoryError('');
            }}
          />

          {/* Core modal element */}
          <div className="relative bg-white rounded-[4px] border border-gray-200 w-full max-w-sm shadow-2xl overflow-hidden flex flex-col z-20 animate-scale">

            {/* Modal Heading banner */}
            <div className="px-6 py-4 bg-[#1A1C1E] text-white flex justify-between items-center border-b border-white/10 select-none">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-[#C8102E] rounded-[3px] flex items-center justify-center font-bold italic text-sm text-white shrink-0">
                  C
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-xs font-bold tracking-tight text-white uppercase font-mono">
                    Tambah Kategori Baru
                  </span>
                  <span className="text-[8px] text-white/50 font-mono tracking-widest mt-1">
                    KCIC CATEGORY REGISTER
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCategoryModalOpen(false);
                  setNewCategoryName('');
                  setCategoryError('');
                }}
                className="text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <div className="p-6 space-y-4 text-xs text-gray-700">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono font-bold text-gray-400 uppercase select-none">
                  Nama Kategori Baru *
                </label>
                <input
                  type="text"
                  placeholder="Contoh: PDP, LCD, dll."
                  value={newCategoryName}
                  onChange={(e) => {
                    setNewCategoryName(e.target.value);
                    if (categoryError) setCategoryError('');
                  }}
                  className={`w-full p-2.5 rounded-[4px] border outline-none bg-white text-gray-950 transition-all font-sans select-text ${categoryError
                    ? 'border-red-500 bg-red-50/10'
                    : 'border-gray-200 focus:border-[#C8102E] focus:ring-1 focus:ring-[#C8102E]'
                    }`}
                />
                {categoryError && (
                  <span className="text-[10px] text-[#C8102E] font-medium flex items-center gap-0.5 mt-0.5 select-none">
                    <AlertCircle className="w-3 h-3" /> {categoryError}
                  </span>
                )}
              </div>

              {/* Footer action buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-150 select-none">
                <button
                  type="button"
                  onClick={() => {
                    setIsCategoryModalOpen(false);
                    setNewCategoryName('');
                    setCategoryError('');
                  }}
                  className="px-4.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-[4px] cursor-pointer transition-colors uppercase tracking-wider text-[10px]"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const trimmed = newCategoryName.trim();
                    if (!trimmed) {
                      setCategoryError('Nama kategori tidak boleh kosong');
                      return;
                    }
                    if (categories.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
                      setCategoryError('Kategori ini sudah terdaftar');
                      return;
                    }
                    addCategory(trimmed);
                    setIsCategoryModalOpen(false);
                    setNewCategoryName('');
                    setCategoryError('');
                  }}
                  className="px-5 py-2 bg-[#C8102E] hover:bg-[#b00d25] text-white font-bold rounded-[4px] flex items-center gap-1.5 transition-colors cursor-pointer uppercase tracking-wider text-[10px]"
                >
                  Tambah Kategori
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
