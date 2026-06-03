<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Resources\UserCollection;
use App\Models\LaporanHpio;
use Inertia\Inertia;

class Incident extends Controller
{
    public function Index(Request $request)
    {
         $query = LaporanHpio::query();
         $countQuery = LaporanHpio::query();
         
         if($request->nomor_ticket){
            $query->where('nomor_tiket', 'like', '%' . $request->nomor_ticket . '%');
         }

         if($request->stasiun){
            $query->where('stasiun', 'like', '%' . $request->stasiun . '%');
         }

         if($request->status){
            $query->where('status', $request->status);
         }
         if($request->kategori_aset){
            $query->where('kategori_aset', $request->kategori_aset);
         }
         if($request->from_date && $request->end_date){
           $query->whereBetween('tanggal_lapor', [
            $request->from_date,
            $request->end_date
         ]);
         }

         $data_incident = $query->orderBy('tanggal_lapor', 'desc')
            ->paginate(20);

        $incident_log = [
            'data_incident' => $data_incident
        ];

        $data_count_status = LaporanHpio::query();
       
        //count priority 

        $total = (clone $countQuery) -> count();

            $total_p1 = (clone $countQuery)
            ->where('prioritas', 'like', 'P1%')
            ->count();

        $total_p2 = (clone $countQuery)
            ->where('prioritas', 'like', 'P2%')
            ->count();

        $total_p3 = (clone $countQuery)
            ->where('prioritas', 'like', 'P3%')
            ->count();

        $total_close = (clone $countQuery)
            ->where('status', 'Closed')
            ->count();

        $data_count_priority = [
            'total' => $total,
            'total_p1' => $total_p1,
            'total_p2' => $total_p2,
            'total_close' => $total_close,
        ];
        
         
         

        return Inertia::render('incident', [
            'incident_log' => $incident_log,
            'data_count' => $data_count_priority
        ]);
    }
}
