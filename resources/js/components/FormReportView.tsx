import { router } from '@inertiajs/react';
import {
    Search,
    ChevronLeft,
    ChevronRight,
    Eye,
    X,
    RotateCcw,
    Filter,
    FileText,
    Calendar,
    Clock,
    MapPin,
    User,
    Image as ImageIcon,
} from 'lucide-react';
import { useState } from 'react';
import { FormReportRow, FormReportPaginated, FormReportSummary } from '@/pages/form-report';

interface FormReportViewProps {
    reports: FormReportPaginated;
    locations: string[];
    filters: Record<string, string>;
    summary: FormReportSummary;
}

export default function FormReportView({ reports, locations, filters, summary }: FormReportViewProps) {
    const [localFilters, setLocalFilters] = useState<Record<string, string>>(filters || {});
    const [detailOpen, setDetailOpen] = useState(false);
    const [selected, setSelected] = useState<FormReportRow | null>(null);
    const [imgOpen, setImgOpen] = useState(false);

    const applyFilters = (overrides: Record<string, string> = {}) => {
        const merged = { ...localFilters, ...overrides };
        const cleaned: Record<string, string> = {};
        Object.entries(merged).forEach(([k, v]) => {
            if (v && v.trim() !== '') cleaned[k] = v;
        });
        router.get('/form-report', cleaned, { preserveState: true, preserveScroll: true });
    };

    const handleFilterChange = (key: string, value: string) => {
        const updated = { ...localFilters, [key]: value };
        setLocalFilters(updated);
        applyFilters(updated);
    };

    const resetFilters = () => {
        setLocalFilters({});
        router.get('/form-report', {}, { preserveState: false });
    };

    const goToPage = (page: number) => {
        applyFilters({ ...localFilters, page: String(page) });
    };

    const openDetail = (row: FormReportRow) => {
        setSelected(row);
        setDetailOpen(true);
        setImgOpen(false);
    };

    const evidenceUrl = (path: string | null) =>
        path ? `/storage/${path}` : null;

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-[#F4F5F7] overflow-hidden select-none">
            <div className="flex-1 overflow-y-auto p-8 space-y-6">

                {/* ── Header ── */}
                <div className="flex items-center justify-between pb-2 border-b border-gray-250">
                    <div>
                        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-950 m-0 leading-none">
                            Form Report
                        </h2>
                        <p className="text-[10px] text-gray-400 font-mono mt-1.5 uppercase tracking-wider">
                            Laporan form teknisi via WhatsApp
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500">LIVE DATABASE</span>
                    </div>
                </div>

                {/* ── KPI Cards ── */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white border-l-4 border-l-[#1A1C1E] border border-gray-150 rounded-[4px] p-4 flex flex-col justify-between shadow-sm">
                        <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block">Total Laporan</span>
                        <div className="flex items-baseline justify-between mt-3">
                            <span className="text-2xl font-black font-mono text-gray-950 leading-none">{summary.total}</span>
                            <FileText className="w-5 h-5 text-gray-300" />
                        </div>
                    </div>
                    <div className="bg-white border-l-4 border-l-[#C8102E] border border-gray-150 rounded-[4px] p-4 flex flex-col justify-between shadow-sm">
                        <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block">Bulan Ini</span>
                        <div className="flex items-baseline justify-between mt-3">
                            <span className="text-2xl font-black font-mono text-gray-950 leading-none">{summary.this_month}</span>
                            <Calendar className="w-5 h-5 text-red-200" />
                        </div>
                    </div>
                    <div className="bg-white border-l-4 border-l-[#3B82F6] border border-gray-150 rounded-[4px] p-4 flex flex-col justify-between shadow-sm">
                        <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block">Hari Ini</span>
                        <div className="flex items-baseline justify-between mt-3">
                            <span className="text-2xl font-black font-mono text-gray-950 leading-none">{summary.today}</span>
                            <Clock className="w-5 h-5 text-blue-200" />
                        </div>
                    </div>
                </div>

                {/* ── Filter Bar ── */}
                <div className="bg-white p-5 rounded-[4px] border border-gray-200 shadow-sm space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            <Filter className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-xs font-bold text-gray-950 uppercase tracking-wider">Filters</span>
                        </div>
                        <button
                            onClick={resetFilters}
                            className="flex items-center gap-1 text-[10px] text-[#C8102E] font-mono font-bold tracking-wider hover:underline uppercase cursor-pointer"
                        >
                            <RotateCcw className="w-3 h-3" />
                            Reset
                        </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {/* Location */}
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-mono font-bold text-gray-400 uppercase">Lokasi</label>
                            <select
                                value={localFilters.location || ''}
                                onChange={(e) => handleFilterChange('location', e.target.value)}
                                className="text-xs p-2 border border-gray-200 rounded-[4px] outline-none bg-white cursor-pointer hover:border-gray-300 focus:border-[#C8102E]"
                            >
                                <option value="">Semua</option>
                                {locations.map((l) => (
                                    <option key={l} value={l}>{l}</option>
                                ))}
                            </select>
                        </div>
                        {/* Start Date */}
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-mono font-bold text-gray-400 uppercase">Dari Tanggal</label>
                            <input
                                type="date"
                                value={localFilters.start_date || ''}
                                onChange={(e) => handleFilterChange('start_date', e.target.value)}
                                className="text-xs p-2 border border-gray-200 rounded-[4px] outline-none focus:border-[#C8102E]"
                            />
                        </div>
                        {/* End Date */}
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-mono font-bold text-gray-400 uppercase">Sampai Tanggal</label>
                            <input
                                type="date"
                                value={localFilters.end_date || ''}
                                onChange={(e) => handleFilterChange('end_date', e.target.value)}
                                className="text-xs p-2 border border-gray-200 rounded-[4px] outline-none focus:border-[#C8102E]"
                            />
                        </div>
                        {/* Search */}
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-mono font-bold text-gray-400 uppercase">Cari</label>
                            <div className="relative">
                                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Teknisi / Deskripsi..."
                                    value={localFilters.search || ''}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    className="w-full text-xs pl-7 pr-2 p-2 border border-gray-200 rounded-[4px] outline-none focus:border-[#C8102E]"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Table ── */}
                <div className="bg-white rounded-[4px] border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="overflow-x-auto">
                        {reports.data.length === 0 ? (
                            <div className="py-20 text-center">
                                <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                <span className="text-sm font-bold text-gray-900 leading-none block">
                                    Tidak ada data laporan
                                </span>
                                <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                                    Belum ada form report yang masuk atau ubah filter untuk melihat data.
                                </p>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse bg-white font-sans text-xs">
                                <thead className="bg-[#1A1C1E] sticky top-0 z-10 text-white select-none">
                                    <tr className="uppercase tracking-widest leading-none font-mono text-[9px] font-black h-11">
                                        <th className="p-3 pl-5">#</th>
                                        <th className="p-3">Nama Teknisi</th>
                                        <th className="p-3">Tanggal</th>
                                        <th className="p-3">Lokasi</th>
                                        <th className="p-3">Jam Mulai</th>
                                        <th className="p-3">Jam Selesai</th>
                                        <th className="p-3 min-w-[200px]">Deskripsi</th>
                                        <th className="p-3 text-center">Foto</th>
                                        <th className="p-3 pr-5 text-right w-14">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 select-text">
                                    {reports.data.map((row, index) => (
                                        <tr
                                            key={row.id}
                                            className={`hover:bg-gray-50/70 transition-colors h-12 font-sans ${index % 2 === 0 ? 'bg-white' : 'bg-stone-50/50'}`}
                                        >
                                            <td className="p-3 pl-5 font-mono font-bold text-gray-400 text-[10px]">
                                                {(reports.from ?? 0) + index}
                                            </td>
                                            <td className="p-3 font-medium text-gray-900 whitespace-nowrap">
                                                {row.nama_teknisi}
                                            </td>
                                            <td className="p-3 text-gray-600 whitespace-nowrap font-mono">
                                                {row.time_report}
                                            </td>
                                            <td className="p-3">
                                                {row.location ? (
                                                    <span className="text-[10px] font-mono font-black border border-gray-250 bg-stone-100/80 text-gray-700 px-2 py-0.5 rounded-[4px] leading-none whitespace-nowrap uppercase">
                                                        {row.location}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="p-3 font-mono text-gray-600">
                                                {row.start_time ?? '-'}
                                            </td>
                                            <td className="p-3 font-mono text-gray-600">
                                                {row.end_time ?? '-'}
                                            </td>
                                            <td className="p-3 text-gray-600 truncate max-w-[250px] group relative">
                                                <span className="hover:text-gray-950 font-medium">{row.description}</span>
                                                <div className="absolute hidden group-hover:block bg-[#1A1C1E] text-white text-[10px] p-3 rounded-[4px] shadow-lg z-30 max-w-sm border border-neutral-800 -top-12 left-3 leading-normal font-sans tracking-wide">
                                                    <span className="font-bold text-orange-400 block pb-0.5">DESKRIPSI:</span>
                                                    {row.description}
                                                </div>
                                            </td>
                                            <td className="p-3 text-center">
                                                {evidenceUrl(row.evidence) ? (
                                                    <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-[4px] border border-emerald-100">
                                                        <ImageIcon className="w-3 h-3" />
                                                        Ada
                                                    </span>
                                                ) : (
                                                    <span className="text-[9px] font-mono text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="p-3 pr-5 text-right select-none">
                                                <button
                                                    type="button"
                                                    onClick={() => openDetail(row)}
                                                    className="bg-stone-100 hover:bg-[#C8102E] hover:text-white transition-all text-gray-500 p-2 rounded-[4px] cursor-pointer inline-flex items-center justify-center border border-gray-200"
                                                    title="Lihat detail"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Pagination */}
                    {reports.last_page > 1 && (
                        <div className="bg-white px-6 py-4 border-t border-gray-200 flex justify-between items-center text-xs font-sans text-gray-600 select-none">
                            <div>
                                Menampilkan <span className="font-bold text-gray-950">{reports.from}</span> s/d{' '}
                                <span className="font-bold text-gray-950">{reports.to}</span> dari{' '}
                                <span className="font-bold text-gray-950">{reports.total}</span> laporan
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    disabled={reports.current_page === 1}
                                    onClick={() => goToPage(reports.current_page - 1)}
                                    className="p-1.5 border border-gray-200 rounded-[4px] bg-white text-gray-700 hover:bg-stone-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <div className="font-mono text-[11px] font-bold text-gray-900 bg-stone-100 px-3 py-1 rounded-[4px]">
                                    {reports.current_page} / {reports.last_page}
                                </div>
                                <button
                                    disabled={reports.current_page === reports.last_page}
                                    onClick={() => goToPage(reports.current_page + 1)}
                                    className="p-1.5 border border-gray-200 rounded-[4px] bg-white text-gray-700 hover:bg-stone-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Detail Drawer ── */}
            {detailOpen && selected && (
                <>
                    <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setDetailOpen(false)} />
                    <div className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col overflow-hidden">
                        {/* Drawer Header */}
                        <div className="bg-[#1A1C1E] text-white px-6 py-4 flex items-center justify-between shrink-0">
                            <div>
                                <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block">
                                    Detail Form Report
                                </span>
                                <span className="text-sm font-bold font-mono mt-1 block">
                                    #{selected.id} — {selected.nama_teknisi}
                                </span>
                            </div>
                            <button onClick={() => setDetailOpen(false)} className="text-gray-400 hover:text-white p-2 cursor-pointer transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Drawer Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">

                            {/* Evidence Image */}
                            {evidenceUrl(selected.evidence) && (
                                <div className="space-y-2">
                                    <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider block">Foto Bukti</span>
                                    <div
                                        className="cursor-zoom-in rounded-[4px] overflow-hidden border border-gray-200"
                                        onClick={() => setImgOpen(true)}
                                    >
                                        <img
                                            src={evidenceUrl(selected.evidence)!}
                                            alt="Evidence"
                                            className="w-full object-cover max-h-56 hover:opacity-90 transition-opacity"
                                        />
                                    </div>
                                    <p className="text-[9px] font-mono text-gray-400">Klik gambar untuk memperbesar</p>
                                </div>
                            )}

                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { label: 'Nama Teknisi', value: selected.nama_teknisi, icon: User },
                                    { label: 'Tanggal Laporan', value: selected.time_report, icon: Calendar },
                                    { label: 'Lokasi / Stasiun', value: selected.location ?? '-', icon: MapPin },
                                    { label: 'Jam Mulai', value: selected.start_time ?? '-', icon: Clock },
                                    { label: 'Jam Selesai', value: selected.end_time ?? '-', icon: Clock },
                                    { label: 'Dibuat Pada', value: selected.created_at, icon: Calendar },
                                ].map(({ label, value, icon: Icon }) => (
                                    <div key={label}>
                                        <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                                            <Icon className="w-3 h-3" />
                                            {label}
                                        </span>
                                        <span className="text-gray-900 font-medium">{value}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Description */}
                            <div className="bg-stone-50 border border-gray-200 rounded-[4px] p-4">
                                <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider block mb-2">Deskripsi</span>
                                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{selected.description}</p>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* ── Fullscreen image lightbox ── */}
            {imgOpen && selected && evidenceUrl(selected.evidence) && (
                <div
                    className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-6 cursor-zoom-out"
                    onClick={() => setImgOpen(false)}
                >
                    <img
                        src={evidenceUrl(selected.evidence)!}
                        alt="Evidence fullscreen"
                        className="max-w-full max-h-full rounded-[4px] shadow-2xl"
                    />
                    <button
                        className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/80 p-2 rounded-full transition-colors"
                        onClick={() => setImgOpen(false)}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
    );
}
