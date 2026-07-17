<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FormReport extends Model
{
    protected $table = 'form_report';

    protected $fillable = [
        'nama_teknisi',
        'time_report',
        'location',
        'description',
        'start_time',
        'end_time',
        'evidence',
    ];

    protected $casts = [
        'time_report' => 'date',
    ];

    public function station()
    {
        return $this->belongsTo(Station::class, 'location', 'code');
    }
}
