<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\LaporanHpio;
use Carbon\Carbon;

class ReportProblemController extends Controller
{
    /**
     * Menampilkan halaman Report Problem dengan data terfilter.
     * Menyediakan props yang sesuai dengan interface yang diharapkan report-problem.tsx:
     *   - laporans      : data paginated LaporanHpio
     *   - summary       : ringkasan per status, prioritas, dan stasiun
     *   - filterOptions : daftar pilihan dropdown (bulan, stasiun, kategori)
     *   - filters       : filter yang sedang aktif
     */
    public function index(Request $request)
    {
        $query = LaporanHpio::query();

        // --- Filter: Periode Preset (today / week / month / year) ---
        if ($request->period) {
            $now = Carbon::now();
            switch ($request->period) {
                case 'today':
                    $query->whereDate('tanggal_lapor', $now->toDateString());
                    break;
                case 'week':
                    $query->whereBetween('tanggal_lapor', [
                        $now->copy()->startOfWeek()->toDateString(),
                        $now->copy()->endOfWeek()->toDateString(),
                    ]);
                    break;
                case 'month':
                    $query->whereBetween('tanggal_lapor', [
                        $now->copy()->startOfMonth()->toDateString(),
                        $now->copy()->endOfMonth()->toDateString(),
                    ]);
                    break;
                case 'year':
                    $query->whereYear('tanggal_lapor', $now->year);
                    break;
            }
        }

        // --- Filter: Bulan (label teks, e.g. "Mei 2026") ---
        if ($request->bulan) {
            $query->where('bulan', $request->bulan);
        }

        // --- Filter: Stasiun ---
        if ($request->stasiun) {
            $query->where('stasiun', $request->stasiun);
        }

        // --- Filter: Kategori Aset ---
        if ($request->kategori) {
            $query->where('kategori_aset', $request->kategori);
        }

        // --- Filter: Status ---
        if ($request->status) {
            $query->where('status', $request->status);
        }

        // --- Filter: Rentang Tanggal ---
        if ($request->start_date && $request->end_date) {
            $query->whereBetween('tanggal_lapor', [
                $request->start_date,
                $request->end_date,
            ]);
        } elseif ($request->start_date) {
            $query->where('tanggal_lapor', '>=', $request->start_date);
        } elseif ($request->end_date) {
            $query->where('tanggal_lapor', '<=', $request->end_date);
        }

        // Clone query SETELAH semua filter diterapkan untuk kalkulasi summary
        $summaryQuery = clone $query;

        // Data paginated, mempertahankan query string di setiap link paginasi
        $laporans = $query
            ->orderBy('tanggal_lapor', 'desc')
            ->paginate(20)
            ->withQueryString();

        // --- Summary: agregasi berdasarkan data terfilter ---
        $allForSummary = $summaryQuery->get(['status', 'prioritas', 'stasiun']);

        $byStatus   = [];
        $byPriority = [];
        $byStation  = [];

        foreach ($allForSummary as $record) {
            // Kelompokkan per status
            $s = $record->status ?? 'Unknown';
            $byStatus[$s] = ($byStatus[$s] ?? 0) + 1;

            // Kelompokkan per prioritas
            $p = $record->prioritas ?? 'Unknown';
            $byPriority[$p] = ($byPriority[$p] ?? 0) + 1;

            // Kelompokkan per stasiun
            $st = $record->stasiun ?? 'Unknown';
            $byStation[$st] = ($byStation[$st] ?? 0) + 1;
        }

        $summary = [
            'total'       => $allForSummary->count(),
            'by_status'   => $byStatus,
            'by_priority' => $byPriority,
            'by_station'  => $byStation,
        ];

        // --- Filter Options: diambil dari seluruh data (untuk kelengkapan dropdown) ---
        $filterOptions = [
            'bulan_list'    => LaporanHpio::select('bulan')
                ->distinct()
                ->whereNotNull('bulan')
                ->where('bulan', '!=', '')
                ->orderBy('bulan')
                ->pluck('bulan')
                ->toArray(),
            'stasiun_list'  => LaporanHpio::select('stasiun')
                ->distinct()
                ->whereNotNull('stasiun')
                ->where('stasiun', '!=', '')
                ->orderBy('stasiun')
                ->pluck('stasiun')
                ->toArray(),
            'kategori_list' => LaporanHpio::select('kategori_aset')
                ->distinct()
                ->whereNotNull('kategori_aset')
                ->where('kategori_aset', '!=', '')
                ->orderBy('kategori_aset')
                ->pluck('kategori_aset')
                ->toArray(),
        ];

        // Sertakan filter yang aktif agar frontend dapat menampilkan state yang benar
        $filters = $request->only([
            'period',
            'bulan',
            'stasiun',
            'kategori',
            'start_date',
            'end_date',
            'status',
        ]);

        return inertia('report-problem', [
            'laporans'      => $laporans,
            'summary'       => $summary,
            'filterOptions' => $filterOptions,
            'filters'       => $filters,
        ]);
    }
}
