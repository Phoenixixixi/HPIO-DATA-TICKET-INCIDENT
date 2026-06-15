import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    MouseSensor,
    TouchSensor,
    closestCenter,
    useSensor,
    useSensors,
    PointerSensor,
    useDraggable,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { router } from '@inertiajs/react';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Copy,
    GripVertical,
    Phone,
    Plus,
    Trash2,
    UserPlus,
    X,
    Clock,
} from 'lucide-react';
import { useCallback, useMemo, useState, useEffect } from 'react';
import { ShiftRow, ShiftConfig } from '@/pages/shift-schedule';

// ─── constants ───────────────────────────────────────────────────────────────

const SHIFT_OPTIONS = [
    'LIBUR', 'PDG1', 'PDG2', 'PDG M',
    'TGR1', 'TGR2',
    'HLM+KRW1', 'HLM+KRW2',
    'SM', 'S2', 'S3',
    'OCC M', 'OCC 3',
];

const SHIFT_COLORS: Record<string, string> = {
    LIBUR: 'bg-red-50 text-[#C8102E] border-red-200',
    PDG1: 'bg-blue-50 text-blue-700 border-blue-200',
    PDG2: 'bg-blue-100 text-blue-800 border-blue-200',
    'PDG M': 'bg-cyan-50 text-cyan-700 border-cyan-200',
    TGR1: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    TGR2: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'HLM+KRW1': 'bg-purple-50 text-purple-700 border-purple-200',
    'HLM+KRW2': 'bg-purple-100 text-purple-800 border-purple-200',
    SM: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    S2: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    S3: 'bg-teal-50 text-teal-700 border-teal-200',
    'OCC M': 'bg-amber-50 text-amber-700 border-amber-200',
    'OCC 3': 'bg-orange-50 text-orange-700 border-orange-200',
};

const getShiftClass = (shift: string) =>
    SHIFT_COLORS[shift] ?? 'bg-gray-100 text-gray-700 border-gray-200';

function getDaysInMonth(monthStr: string) {
    const [year, month] = monthStr.split('-');
    return new Date(parseInt(year), parseInt(month), 0).getDate();
}

function formatMonth(monthStr: string) {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
}

function addMonths(monthStr: string, months: number) {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1 + months, 1);
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${y}-${m}`;
}

function getDayName(day: number) {
    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
    return days[day - 1] || '';
}

function DraggableLegend({ shift }: { shift: string }) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `legend-${shift}`,
        data: { type: 'legend', shift },
    });

    return (
        <button
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            className={`cursor-grab active:cursor-grabbing rounded-[3px] px-1.5 py-0.5 text-[9px] font-mono font-bold border transition-transform hover:scale-105 ${getShiftClass(shift)} ${isDragging ? 'opacity-50' : ''}`}
        >
            {shift}
        </button>
    );
}

// ─── Shift Cell (draggable + droppable) ───────────────────────────────────────

interface CellId {
    rowId: number;
    day: number;
}

function encodeCellId(rowId: number, day: number) {
    return `${rowId}::${day}`;
}

function decodeCellId(id: string): CellId {
    const [rowId, day] = id.split('::');
    return { rowId: parseInt(rowId, 10), day: parseInt(day, 10) };
}

interface ShiftCellProps {
    rowId: number;
    day: number;
    shift: string;
    onEdit: (rowId: number, day: number, current: string) => void;
    disabled?: boolean;
}

function ShiftCell({ rowId, day, shift, onEdit, disabled }: ShiftCellProps) {
    const id = encodeCellId(rowId, day);
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
    };

    return (
        <td className="px-1 py-1 text-center min-w-[70px] border-x border-gray-100 bg-white" ref={setNodeRef} style={style}>
            <div
                className={`
                    inline-flex cursor-grab items-center justify-center rounded-[3px] border px-1.5 py-1
                    text-[10px] font-mono font-bold tracking-wide transition-all duration-150
                    hover:scale-105 active:cursor-grabbing w-full
                    ${getShiftClass(shift)}
                    ${isDragging ? 'shadow-md scale-105 z-50 relative' : ''}
                `}
                {...attributes}
                {...listeners}
                onDoubleClick={() => !disabled && onEdit(rowId, day, shift)}
                title="Drag to swap • Double-click to edit"
            >
                {shift || '-'}
            </div>
        </td>
    );
}

// ─── Sortable Row ─────────────────────────────────────────────────────────────

interface SortableRowProps {
    row: ShiftRow;
    days: number[];
    onEdit: (rowId: number, day: number, current: string) => void;
    onDelete: (id: number) => void;
    index: number;
    sendWA: (id: number) => void;
}

function SortableRow({ row, days, onEdit, onDelete, index, sendWA, }: SortableRowProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: `row-${row.id}`,
    });
    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    };


    return (
        <tr
            ref={setNodeRef}
            style={style}
            className={`border-b border-gray-200 transition-colors bg-white hover:bg-gray-50`}
        >
            {/* Drag handle and fixed Employee name area */}
            <td className="sticky left-0 bg-white z-10 px-2 py-2 border-r border-gray-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] group">
                <div className="flex items-center gap-2">
                    <button
                        className="cursor-grab text-gray-400 hover:text-gray-600 active:cursor-grabbing"
                        {...attributes}
                        {...listeners}
                    >
                        <GripVertical size={14} />
                    </button>
                    <div>
                        <div className="text-[11px] font-bold text-gray-900 whitespace-nowrap">
                            {row.employee_name}
                        </div>
                        <div className="text-[9px] font-mono text-gray-500 whitespace-nowrap">
                            {row.nip ?? '-'} {row.no_hp ? `• ${row.no_hp}` : ''}
                        </div>
                    </div>
                </div>
            </td>

            {/* Shift cells */}
            {days.map((day) => (
                <ShiftCell
                    key={day}
                    rowId={row.id}
                    day={day}
                    shift={row.shifts?.[day] || 'LIBUR'}
                    onEdit={onEdit}
                />
            ))}

            {/* Delete */}
            <td className="px-2 text-center sticky right-0 bg-white border-l border-gray-200 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                <button
                    onClick={() => onDelete(row.id)}
                    className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600 transition"
                    title="Hapus karyawan"
                >
                    <Trash2 size={13} />
                </button>
            </td>
            <td className="px-2 text-center sticky right-0 bg-white border-l border-gray-200 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                <button
                    onClick={() => sendWA(row.no_hp)}
                    className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600 transition"
                    title="Hapus karyawan"
                >
                    <Phone size={13} />

                </button>
            </td>
        </tr>
    );
}

// ─── Edit Cell Modal ──────────────────────────────────────────────────────────

interface EditModalProps {
    editing: { rowId: number; day: number; current: string } | null;
    onClose: () => void;
    onSave: (shift: string) => void;
}

function EditModal({ editing, onClose, onSave }: EditModalProps) {
    const [custom, setCustom] = useState('');
    if (!editing) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="w-[340px] rounded-[4px] border border-gray-200 bg-white p-5 shadow-xl">
                <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-2">
                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                        Edit Shift — Tanggal <span className="text-[#C8102E]">{editing.day}</span>
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={16} />
                    </button>
                </div>

                <div className="mb-4 grid grid-cols-3 gap-2">
                    {SHIFT_OPTIONS.map((s) => (
                        <button
                            key={s}
                            onClick={() => onSave(s)}
                            className={`
                                rounded-[3px] px-2 py-1.5 text-[10px] font-mono font-bold transition-all hover:scale-105 border
                                ${getShiftClass(s)}
                                ${editing.current === s ? 'ring-2 ring-[#C8102E] ring-offset-1' : ''}
                            `}
                        >
                            {s}
                        </button>
                    ))}
                </div>

                <div className="flex gap-2 pt-2 border-t border-gray-100">
                    <input
                        className="flex-1 rounded-[4px] border border-gray-300 bg-gray-50 px-3 py-1.5 text-xs text-gray-900 outline-none focus:border-[#C8102E] focus:ring-1 focus:ring-[#C8102E]"
                        placeholder="Custom code..."
                        value={custom}
                        onChange={(e) => setCustom(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && custom.trim() && onSave(custom.trim())}
                    />
                    <button
                        disabled={!custom.trim()}
                        onClick={() => onSave(custom.trim())}
                        className="rounded-[4px] bg-[#C8102E] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#b00d25] disabled:opacity-50"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Configs Modal ──────────────────────────────────────────────────────────

interface ConfigsModalProps {
    open: boolean;
    configs: ShiftConfig[];
    onClose: () => void;
}

function ConfigsModal({ open, configs, onClose }: ConfigsModalProps) {
    const [localConfigs, setLocalConfigs] = useState<ShiftConfig[]>(configs);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (configs) {
            setLocalConfigs(configs);
        }
    }, [configs]);

    if (!open) return null;

    const handleTimeChange = (id: number, field: 'start_time' | 'end_time', value: string) => {
        setLocalConfigs((prev) =>
            prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
        );
    };

    const handleSave = () => {
        setSaving(true);
        router.post('/shift-schedule/configs', { configs: localConfigs }, {
            preserveState: true,
            onSuccess: () => {
                onClose();
            },
            onFinish: () => setSaving(false),
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="w-[450px] rounded-[4px] border border-gray-200 bg-white p-5 shadow-xl">
                <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-2">
                    <h3 className="flex items-center gap-2 text-xs font-bold text-gray-900 uppercase tracking-wider">
                        <Clock size={16} className="text-[#C8102E]" /> Konfigurasi Jam Shift
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
                </div>
                <div className="space-y-4">
                    {localConfigs.map((cfg) => (
                        <div key={cfg.id} className="grid grid-cols-12 gap-3 items-center border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                            <div className="col-span-4">
                                <span className="text-[11px] font-bold text-gray-800">{cfg.shift_name}</span>
                            </div>
                            <div className="col-span-4">
                                <label className="block text-[8px] font-mono font-bold text-gray-400 uppercase mb-0.5">Start Time</label>
                                <input
                                    type="time"
                                    className="w-full rounded-[4px] border border-gray-300 bg-gray-50 px-2 py-1 text-xs font-mono text-gray-900 outline-none focus:border-[#C8102E] focus:ring-1 focus:ring-[#C8102E]"
                                    value={cfg.start_time}
                                    onChange={(e) => handleTimeChange(cfg.id, 'start_time', e.target.value)}
                                />
                            </div>
                            <div className="col-span-4">
                                <label className="block text-[8px] font-mono font-bold text-gray-400 uppercase mb-0.5">End Time</label>
                                <input
                                    type="time"
                                    className="w-full rounded-[4px] border border-gray-300 bg-gray-50 px-2 py-1 text-xs font-mono text-gray-900 outline-none focus:border-[#C8102E] focus:ring-1 focus:ring-[#C8102E]"
                                    value={cfg.end_time}
                                    onChange={(e) => handleTimeChange(cfg.id, 'end_time', e.target.value)}
                                />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-5 flex gap-2">
                    <button onClick={onClose} className="flex-1 rounded-[4px] border border-gray-300 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50">
                        Batal
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 rounded-[4px] bg-[#C8102E] py-2 text-xs font-bold text-white hover:bg-[#b00d25] disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                        {saving ? 'Menyimpan...' : 'Simpan Jam Shift'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Add Employee Modal ───────────────────────────────────────────────────────

interface AddEmployeeModalProps {
    open: boolean;
    month: string;
    onClose: () => void;
    onAdd: (name: string, nip: string, noHp: string) => void;
}

function AddEmployeeModal({ open, onClose, onAdd }: AddEmployeeModalProps) {
    const [name, setName] = useState('');
    const [nip, setNip] = useState('');
    const [noHp, setNoHp] = useState('');

    if (!open) return null;

    const handleSubmit = () => {
        if (!name.trim()) return;
        onAdd(name.trim(), nip.trim(), noHp.trim());
        setName(''); setNip(''); setNoHp('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="w-[360px] rounded-[4px] border border-gray-200 bg-white p-5 shadow-xl">
                <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-2">
                    <h3 className="flex items-center gap-2 text-xs font-bold text-gray-900 uppercase tracking-wider">
                        <UserPlus size={16} className="text-[#C8102E]" /> Tambah Karyawan
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
                </div>
                <div className="space-y-3">
                    {[
                        { label: 'Nama Karyawan *', value: name, set: setName, placeholder: 'Nama lengkap' },
                        { label: 'NIP', value: nip, set: setNip, placeholder: '040 4 25 05 xxx' },
                        { label: 'No HP', value: noHp, set: setNoHp, placeholder: '081234567890' },
                    ].map(({ label, value, set, placeholder }) => (
                        <div key={label}>
                            <label className="mb-1 block text-[10px] font-mono font-bold text-gray-500 uppercase">{label}</label>
                            <input
                                className="w-full rounded-[4px] border border-gray-300 bg-gray-50 px-3 py-2 text-xs text-gray-900 outline-none focus:border-[#C8102E] focus:ring-1 focus:ring-[#C8102E]"
                                placeholder={placeholder}
                                value={value}
                                onChange={(e) => set(e.target.value)}
                            />
                        </div>
                    ))}
                </div>
                <div className="mt-5 flex gap-2">
                    <button onClick={onClose} className="flex-1 rounded-[4px] border border-gray-300 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50">
                        Batal
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!name.trim()}
                        className="flex-1 rounded-[4px] bg-[#C8102E] py-2 text-xs font-bold text-white hover:bg-[#b00d25] disabled:opacity-50"
                    >
                        Tambah
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface ShiftScheduleViewProps {
    shifts: ShiftRow[];
    month: string;
    configs: ShiftConfig[];
}

export default function ShiftScheduleView({ shifts: initialShifts, month, configs }: ShiftScheduleViewProps) {
    const [rows, setRows] = useState<ShiftRow[]>(initialShifts);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [editing, setEditing] = useState<{ rowId: number; day: number; current: string } | null>(null);
    const [addOpen, setAddOpen] = useState(false);
    const [configsOpen, setConfigsOpen] = useState(false);
    const [saving, setSaving] = useState<string | null>(null);
    const [isDirty, setIsDirty] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } }),
    );

    const daysCount = 7;
    const daysArray = useMemo(() => Array.from({ length: daysCount }, (_, i) => i + 1), []);

    const rowIds = rows.map((r) => `row-${r.id}`);
    const cellIds = rows.flatMap((r) => daysArray.map((d) => encodeCellId(r.id, d)));

    // ── month navigation ──
    const navigateMonth = (delta: number) => {
        if (isDirty && !confirm('Ada perubahan yang belum disimpan. Yakin ingin pindah bulan?')) return;
        const newMonth = addMonths(month, delta);
        router.get('/shift-schedule', { month: newMonth }, { preserveState: false });
    };

    const handleBulkSave = () => {
        setSaving('bulk');
        router.post('/shift-schedule/bulk', { rows }, {
            preserveState: true,
            onSuccess: () => setIsDirty(false),
            onFinish: () => setSaving(null),
        });
    };

    // ── drag start ──
    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(String(event.active.id));
    };

    // ── drag end ──
    const handleDragEnd = useCallback((event: DragEndEvent) => {
        setActiveId(null);
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const activeStr = String(active.id);
        const overStr = String(over.id);

        // Row reorder
        if (activeStr.startsWith('row-') && overStr.startsWith('row-')) {
            const oldIndex = rows.findIndex((r) => `row-${r.id}` === activeStr);
            const newIndex = rows.findIndex((r) => `row-${r.id}` === overStr);
            if (oldIndex === -1 || newIndex === -1) return;
            const reordered = arrayMove(rows, oldIndex, newIndex);
            setRows(reordered);
            setIsDirty(true);
            return;
        }

        // Legend drop
        if (activeStr.startsWith('legend-') && !overStr.startsWith('row-')) {
            const shift = active.data.current?.shift;
            if (!shift) return;
            const tgt = decodeCellId(overStr);

            setRows((prev) =>
                prev.map((r) => (r.id === tgt.rowId ? { ...r, shifts: { ...r.shifts, [tgt.day]: shift } } : r))
            );
            setIsDirty(true);
            return;
        }

        // Cell swap
        if (!activeStr.startsWith('row-') && !overStr.startsWith('row-')) {
            const src = decodeCellId(activeStr);
            const tgt = decodeCellId(overStr);

            setRows((prev) => {
                return prev.map((r) => {
                    const srcRow = prev.find((x) => x.id === src.rowId);
                    const tgtRow = prev.find((x) => x.id === tgt.rowId);
                    if (!srcRow || !tgtRow) return r;
                    const srcVal = srcRow.shifts[src.day] || 'LIBUR';
                    const tgtVal = tgtRow.shifts[tgt.day] || 'LIBUR';

                    if (r.id === src.rowId) {
                        return { ...r, shifts: { ...r.shifts, [src.day]: tgtVal } };
                    }
                    if (r.id === tgt.rowId) {
                        return { ...r, shifts: { ...r.shifts, [tgt.day]: srcVal } };
                    }
                    return r;
                });
            });
            setIsDirty(true);
        }
    }, [rows]);

    // ── cell double-click edit ──
    const handleOpenEdit = (rowId: number, day: number, current: string) => {
        setEditing({ rowId, day, current });
    };

    const handleSaveEdit = (shift: string) => {
        if (!editing) return;
        const { rowId, day } = editing;
        setEditing(null);

        setRows((prev) =>
            prev.map((r) => (r.id === rowId ? { ...r, shifts: { ...r.shifts, [day]: shift } } : r)),
        );
        setIsDirty(true);
    };

    // ── add employee ──
    const handleAddEmployee = (name: string, nip: string, noHp: string) => {
        setAddOpen(false);
        router.post('/shift-schedule', {
            employee_name: name,
            nip: nip || null,
            no_hp: noHp || null,
            month: month,
        }, {
            preserveState: false,
        });
    };

    // ── delete employee ──
    const handleDelete = (id: number) => {
        if (!confirm('Hapus karyawan ini dari jadwal bulan ini?')) return;
        setRows((prev) => prev.filter((r) => r.id !== id));
        router.delete(`/shift-schedule/${id}`, { preserveState: true });
    };

    const sendWhatsapp = (employeeId: number) => {
        router.post(
            `/send-whatsapp`,
            { phone: employeeId, message: 'Hello Testing from HPIO Schedule Dashboard' },
            {
                preserveScroll: true,
                onSuccess: () => {
                    alert('Pesan berhasil dikirim');
                },
                onError: () => {
                    alert('Gagal mengirim pesan');
                },
            }
        );
    };

    const activeCellShift = activeId && activeId.startsWith('legend-')
        ? activeId.replace('legend-', '')
        : activeId && !activeId.startsWith('row-')
            ? (() => {
                const { rowId, day } = decodeCellId(activeId);
                return rows.find((r) => r.id === rowId)?.shifts[day] || 'LIBUR';
            })()
            : null;

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-[#F4F5F7] overflow-hidden select-none">
            <div className="flex-1 overflow-hidden p-8 space-y-6 flex flex-col">

                {/* ── Header ── */}
                <div className="flex items-center justify-between pb-2 border-b border-gray-250">
                    <div>
                        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-950 m-0 leading-none">
                            Monthly Shift Schedule
                        </h2>
                        <p className="text-[10px] text-gray-400 font-mono mt-1.5 uppercase tracking-wider">
                            Periode: {formatMonth(month)}
                        </p>
                    </div>

                    <div className="flex items-center gap-3 select-none">
                        <div className="flex items-center gap-1 bg-white border border-gray-250 rounded-[4px] p-0.5">
                            <button
                                onClick={() => navigateMonth(-1)}
                                className="px-2 py-1.5 text-gray-400 hover:text-gray-700 transition"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="min-w-[130px] text-center text-[11px] font-bold text-gray-800 uppercase tracking-wider">
                                {formatMonth(month)}
                            </span>
                            <button
                                onClick={() => navigateMonth(1)}
                                className="px-2 py-1.5 text-gray-400 hover:text-gray-700 transition"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>

                        <button
                            onClick={() => {
                                const nextMonth = addMonths(month, 1);
                                if (confirm(`Copy karyawan ke bulan ${nextMonth}? Shift akan direset LIBUR.`)) {
                                    router.post('/shift-schedule/copy-month', {
                                        from_month: month,
                                        to_month: nextMonth,
                                    }, { preserveState: false });
                                }
                            }}
                            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-250 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-[4px] transition-colors shadow-sm"
                        >
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Next Month</span>
                        </button>

                        <button
                            onClick={() => setConfigsOpen(true)}
                            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-250 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-[4px] transition-colors shadow-sm"
                        >
                            <Clock className="w-3.5 h-3.5 text-gray-500" />
                            <span>Konfigurasi Jam Shift</span>
                        </button>

                        {isDirty && (
                            <button
                                onClick={handleBulkSave}
                                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-[4px] transition-colors shadow-sm uppercase tracking-wide animate-pulse"
                            >
                                Simpan Perubahan
                            </button>
                        )}

                        <button
                            onClick={() => setAddOpen(true)}
                            className="flex items-center gap-1.5 px-4.5 py-2 bg-[#C8102E] hover:bg-[#b00d25] text-white text-xs font-bold rounded-[4px] transition-colors shadow-sm uppercase tracking-wide"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Tambah Karyawan</span>
                        </button>
                    </div>
                </div>

                {/* ── Table Container ── */}
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <div className="bg-white rounded-[4px] border border-gray-200 shadow-sm flex flex-col flex-1 min-h-0">
                        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-2 items-center justify-between shrink-0">
                            <div className="flex gap-2 flex-wrap items-center">
                                <span className="text-[10px] font-mono font-bold text-gray-400 uppercase mr-2 flex items-center">Legend (Drag to assign):</span>
                                {SHIFT_OPTIONS.map((s) => (
                                    <DraggableLegend key={s} shift={s} />
                                ))}
                            </div>
                            {saving && (
                                <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono">
                                    <span className="inline-block h-2 w-2 animate-spin rounded-full border border-[#C8102E] border-t-transparent" />
                                    SAVING...
                                </div>
                            )}
                        </div>

                        <div className="overflow-auto relative flex-1 min-h-0">
                            <SortableContext items={[...rowIds, ...cellIds]} strategy={verticalListSortingStrategy}>
                                <table className="w-max table-fixed text-left border-collapse min-w-full">
                                    <thead className="bg-[#1A1C1E] text-white sticky top-0 z-20">
                                        <tr className="uppercase tracking-widest leading-none font-mono text-[9px] font-black h-10">
                                            <th className="sticky left-0 bg-[#1A1C1E] z-30 px-3 min-w-[200px] border-r border-gray-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)]">
                                                Nama Karyawan
                                            </th>
                                            {daysArray.map((day) => (
                                                <th key={day} className="px-2 text-center w-[90px] border-x border-gray-800 sticky top-0 bg-[#1A1C1E] z-20">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className="text-[10px] font-bold">{getDayName(day)}</span>
                                                    </div>
                                                </th>
                                            ))}
                                            <th className="sticky right-0 bg-[#1A1C1E] z-30 px-2 w-[50px] border-l border-gray-800 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.5)]">
                                            </th>
                                            <th className="sticky right-0 bg-[#1A1C1E] z-30 px-2 w-[50px] border-l border-gray-800 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.5)]">
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {rows.length === 0 ? (
                                            <tr>
                                                <td colSpan={daysCount + 2} className="py-20 text-center">
                                                    <span className="text-sm font-bold text-gray-900 leading-none block mb-1">
                                                        No shift data for {formatMonth(month)}
                                                    </span>
                                                    <button
                                                        onClick={() => setAddOpen(true)}
                                                        className="text-xs text-[#C8102E] font-bold uppercase hover:underline"
                                                    >
                                                        Tambah Karyawan Baru
                                                    </button>
                                                </td>
                                            </tr>
                                        ) : (
                                            rows.map((row, i) => (
                                                <SortableRow
                                                    key={row.id}
                                                    row={row}
                                                    days={daysArray}
                                                    onEdit={handleOpenEdit}
                                                    onDelete={handleDelete}
                                                    index={i}
                                                    sendWA={sendWhatsapp}
                                                />
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </SortableContext>

                            <DragOverlay modifiers={[restrictToWindowEdges]}>
                                {activeCellShift ? (
                                    <div
                                        className={`
                                            cursor-grabbing rounded-[3px] border px-1.5 py-1 text-[10px] font-mono font-bold
                                            shadow-2xl ${getShiftClass(activeCellShift)}
                                        `}
                                        style={{ minWidth: '70px', textAlign: 'center' }}
                                    >
                                        {activeCellShift}
                                    </div>
                                ) : null}
                            </DragOverlay>
                        </div>
                    </div>
                </DndContext>
            </div>
            <EditModal editing={editing} onClose={() => setEditing(null)} onSave={handleSaveEdit} />
            <AddEmployeeModal open={addOpen} month={month} onClose={() => setAddOpen(false)} onAdd={handleAddEmployee} />
            <ConfigsModal open={configsOpen} configs={configs} onClose={() => setConfigsOpen(false)} />
        </div>
    );
}
