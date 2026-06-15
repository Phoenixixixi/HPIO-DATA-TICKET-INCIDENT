<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\LaporanHpio;
use App\Models\ShiftSchedule;
use Carbon\Carbon;

class Dashboard extends Controller
{
    public function Index(Request $request, LaporanHpio $laporan_hpio)
    {
        $monthParam = $request->query('month');
        if ($monthParam) {
            try {
                $currentMonthStart = Carbon::parse($monthParam)->startOfMonth();
                $currentMonthEnd = Carbon::parse($monthParam)->endOfMonth();
            } catch (\Exception $e) {
                $currentMonthStart = Carbon::now()->startOfMonth();
                $currentMonthEnd = Carbon::now()->endOfMonth();
            }
        } else {
            $currentMonthStart = Carbon::now()->startOfMonth();
            $currentMonthEnd = Carbon::now()->endOfMonth();
        }

        $baseQuery = $laporan_hpio::whereBetween('tanggal_lapor', [
            $currentMonthStart,
            $currentMonthEnd
        ]);

        // 1. Fetch all database records for incidents/laporan
        $db_incidents = (clone $baseQuery)
        ->orderBy('created_at', 'desc')
        ->get();

        // 2. Map the database records to the UI's Incident interface shape
        $mapped_incidents = $db_incidents->map(function ($item) {
            // Map DB status to UI status
            $status = 'Open';
            $status_upper = strtoupper(trim($item->status));
            if ($status_upper === 'CLOSE' || $status_upper === 'SELESAI' || $status_upper === 'DONE' || $status_upper === 'CLOSED') {
                $status = 'Closed';
            } elseif ($status_upper === 'ON PROGRESS' || $status_upper === 'PROSES' || $status_upper === 'PROGRESS') {
                $status = 'On Progress'; 
            } elseif ($status_upper === 'ON ESCALATION' || $status_upper === 'ESCALATION') {
                $status = 'On Escalation';
            } elseif ($status_upper === 'OPEN') {
                $status = 'Open';
            }

            // Map DB priority to UI priority
            $priority = 'P3 (SERIOUS)';
            $prio_upper = strtoupper($item->prioritas);
            if ($prio_upper === 'P1' || str_contains($prio_upper, 'URGENT') || str_contains($prio_upper, 'TINGGI')) {
                $priority = 'P1 (URGENT)';
            } elseif ($prio_upper === 'P2' || str_contains($prio_upper, 'CRITICAL') || str_contains($prio_upper, 'SEDANG')) {
                $priority = 'P2 (CRITICAL)';
            }

            return [
                'id' => $item->id,
                'nomor_tiket' => $item->nomor_tiket,
                'tanggal_lapor' => $item->tanggal_lapor,
                'nama_pelapor' => $item->nama_pelapor,
                'nama_penerima_laporan' => $item->nama_penerima_laporan,
                'stasiun' => $item->stasiun,
                'kategori_aset' => $item->kategori_aset,
                'deskripsi_masalah' => $item->deskripsi_masalah,
                'prioritas' => $priority,
                'status' => $status,
                'nama_teknisi' => $item->nama_teknisi,
                'waktu_melapor' => $item->waktu_melapor,
                'waktu_respon' => $item->waktu_respon,
                'waktu_selesai' => $item->waktu_selesai,
                'response_time' => $item->response_time,
                'solving_time' => $item->solving_time,
                'wr_doc_no' => $item->wr_doc_no,
                'status_eskalasi' => $item->status_eskalasi,
                'bulan' => $item->bulan,
                'merged_doc_id' => $item->merged_doc_id,
                'merged_doc_url' => $item->merged_doc_url,
            ];
        });

        // 3. Count only active or open incidents from database (for Open Orders KPI)
       $data_open = (clone $baseQuery)
         ->where('status', 'Open')
         ->count();

        // 4. Group by category for category chart
        $data_perangkat = (clone $baseQuery)->selectRaw('kategori_aset, COUNT(*) as total')
            ->groupBy('kategori_aset')
            ->get();

        //5.count station
        $data_station_count = (clone $baseQuery)->selectRaw('stasiun, COUNT(*) as total')
            ->groupBy('stasiun')
            ->get();


        $currentMonthStr = $currentMonthStart->format('Y-m');
        $shift_schedules = ShiftSchedule::where('month', $currentMonthStr)->get();

        $data_dashboard = [
            'data_perangkat' => $data_perangkat,
            'data_open' => $data_open,
            'incidents' => $mapped_incidents,
            'month_start' => $currentMonthStart,
            'month_end' => $currentMonthEnd,
            'data_station_count' => $data_station_count,
            'shift_schedules' => $shift_schedules,
            'today_day' => Carbon::now()->day,
        ];
        


        return inertia('dashboard', [
            'data_dashboard' => $data_dashboard
        ]);
    }
}