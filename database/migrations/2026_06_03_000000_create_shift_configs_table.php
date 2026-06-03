<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('shift_configs', function (Blueprint $table) {
            $table->id();
            $table->string('shift_name')->unique(); // e.g. 'Shift 1', 'Shift 2', 'Shift 3', 'Middle'
            $table->string('start_time'); // e.g. '07:00'
            $table->string('end_time'); // e.g. '15:00'
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shift_configs');
    }
};
