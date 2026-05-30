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
         
         if($request->description){
            $query->where('nomor_tiket', 'like' . '%' . $request->description . '%');
         }

         if($request->stasiun){
            $query->where('stasiun', 'like' . '%' . $request->stasiun . '%');
         }

         if($request->status){
            $query->where('status_laporan', '=' . $request->status);
         }
         if($request->aset ){
            $query->where('kategori_aset', '=' . $request->aset);
         }
         if($request->from_date){
            $query->where('stasiun', 'like' . '%' . $request->stasiun . '%');
         }
         if($request->end_date){
            $query->where('stasiun', 'like' . '%' . $request->stasiun . '%');
         }

         $data_incident = $query->orderBy('timestamp', 'desc')
            ->paginate(20);

        $incident_log = [
            'data_incident' => $data_incident
        ];

        $data_count_status = LaporanHpio::query();
       
        //count priority 

        $total = (clone $query) -> count();

        $total_p1  = (clone $query)->where('skala_prioritas', 'P1')->count();
        $total_p2  = (clone $query)->where('skala_prioritas', 'P2')->count();
        $total_close  = (clone $query)->where('status_laporan', 'CLOSE')->count();

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
