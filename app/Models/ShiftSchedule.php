<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShiftSchedule extends Model
{
    protected $table = 'shift_schedules';

    protected $fillable = [
        'employee_name',
        'nip',
        'no_hp',
        'month',
        'shifts',
        'sort_order',
    ];

    protected $casts = [
        'shifts' => 'array',
    ];
}
