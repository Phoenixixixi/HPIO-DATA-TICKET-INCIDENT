<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LaporanHpio extends Model
{
    protected $table = 'incidents';

    protected $primaryKey = 'id';

    protected $keyType = 'string';

    public $incrementing = false;

    public $timestamps = true;

    protected $fillable = [
        'id',
        'nomor_tiket',
        'tanggal_lapor',
        'nama_pelapor',
        'nama_penerima_laporan',
        'stasiun',
        'kategori_aset',
        'deskripsi_masalah',
        'prioritas',
        'status',
        'nama_teknisi',
        'waktu_melapor',
        'waktu_respon',
        'waktu_selesai',
        'response_time',
        'solving_time',
        'wr_doc_no',
        'status_eskalasi',
        'bulan',
        'merged_doc_id',
        'merged_doc_url',
    ];
}
