<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LaporanHpio extends Model
{
   protected $table = 'laporan_hpio';

    protected $primaryKey = 'idNumber';

    protected $keyType = 'string';

    public $incrementing = false;

    public $timestamps = false;

    protected $fillable = [
        'idNumber',
        'timestamp',
        'nomor_tiket',
        'tanggal_lapor',
        'nama_pelapor',
        'nama_penerima_laporan',
        'stasiun_lokasi',
        'kategori_aset',
        'equipment',
        'deskripsi_masalah',
        'skala_prioritas',
        'status_laporan',
        'nama_teknisi',
        'waktu_melapor',
        'waktu_respon_teknisi',
        'waktu_selesai',
        'respon_time',
        'solving_time',
        'wr_doc_nomor',
        'status_eskalasi',
        'bulan',
    ];
}
