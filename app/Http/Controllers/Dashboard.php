<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\LaporanHpio;
use Carbon\Carbon;

class Dashboard extends Controller
{
    public function Index(Request $request, LaporanHpio $laporan_hpio)
    {
        $currentMonthStart = Carbon::now()->startOfMonth();
        $currentMonthEnd = Carbon::now()->endOfMonth();

        $baseQuery = $laporan_hpio::whereBetween('tanggal_lapor', [
            $currentMonthStart,
            $currentMonthEnd
        ]);

        // 1. Fetch all database records for incidents/laporan
        $db_incidents = (clone $baseQuery)
        ->orderBy('timestamp', 'desc')
        ->get();

        // 2. Map the database records to the UI's Incident interface shape
        $mapped_incidents = $db_incidents->map(function ($item) {
            // Map DB status to UI status
            $status = 'Open';
            $status_upper = strtoupper($item->status_laporan);
            if ($status_upper === 'CLOSE' || $status_upper === 'SELESAI' || $status_upper === 'DONE') {
                $status = 'Closed';
            } elseif ($status_upper === 'ON PROGRESS' || $status_upper === 'PROSES' || $status_upper === 'ESCALATION') {
                $status = 'On Escalation';
            }

            // Map DB priority to UI priority
            $priority = 'P3 (SERIOUS)';
            $prio_upper = strtoupper($item->skala_prioritas);
            if ($prio_upper === 'P1' || str_contains($prio_upper, 'URGENT') || str_contains($prio_upper, 'TINGGI')) {
                $priority = 'P1 (URGENT)';
            } elseif ($prio_upper === 'P2' || str_contains($prio_upper, 'CRITICAL') || str_contains($prio_upper, 'SEDANG')) {
                $priority = 'P2 (CRITICAL)';
            }

            return [
                'id' => $item->idNumber,
                'timestamp' => $item->timestamp,
                'nomor_tiket' => $item->nomor_tiket,
                'tanggal_lapor' => $item->tanggal_lapor,
                'nama_pelapor' => $item->nama_pelapor,
                'nama_penerima_laporan' => $item->nama_penerima_laporan,
                'stasiun' => $item->stasiun_lokasi,
                'kategori_aset' => $item->kategori_aset,
                'deskripsi_masalah' => $item->deskripsi_masalah,
                'prioritas' => $priority,
                'status' => $status,
                'nama_teknisi' => $item->nama_teknisi,
                'waktu_melapor' => $item->waktu_melapor,
                'waktu_respon' => $item->waktu_respon_teknisi,
                'waktu_selesai' => $item->waktu_selesai,
                'response_time' => $item->respon_time,
                'solving_time' => $item->solving_time,
                'wr_doc_no' => $item->wr_doc_nomor,
                'status_eskalasi' => $item->status_eskalasi,
                'bulan' => $item->bulan,
            ];
        });

        // 3. Count only active or open incidents from database (for Open Orders KPI)
        $data_open = (clone $baseQuery)->whereIn('status_laporan', ['OPEN', 'BARU'])->count();

        // 4. Group by category for category chart
        $data_perangkat = (clone $baseQuery)->selectRaw('kategori_aset, COUNT(*) as total')
            ->groupBy('kategori_aset')
            ->get();

        //5.count station
        $data_station_count = (clone $baseQuery)->selectRaw('stasiun_lokasi, COUNT(*) as total')
            ->groupBy('stasiun_lokasi')
            ->get();


        $data_dashboard = [
            'data_perangkat' => $data_perangkat,
            'data_open' => $data_open,
            'incidents' => $mapped_incidents,
            'month_start' => $currentMonthStart,
            'month_end' => $currentMonthEnd,
            'data_station_count' => $data_station_count,
        ];
        


        return inertia('dashboard', [
            'data_dashboard' => $data_dashboard
        ]);
    }
}