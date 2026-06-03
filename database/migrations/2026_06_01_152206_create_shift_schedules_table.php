<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shift_schedules', function (Blueprint $table) {
            $table->id();
            $table->string('employee_name');
            $table->string('nip')->nullable();
            $table->string('no_hp')->nullable();
            $table->string('month'); // Format: YYYY-MM
            $table->jsonb('shifts'); // JSON array of shifts, e.g. {"1": "LIBUR", "2": "PDG1", ...}
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shift_schedules');
    }
};
