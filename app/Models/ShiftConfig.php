<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShiftConfig extends Model
{
    protected $table = 'shift_configs';

    protected $fillable = [
        'shift_name',
        'start_time',
        'end_time',
    ];
}
