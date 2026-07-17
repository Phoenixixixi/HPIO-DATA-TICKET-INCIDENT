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
        Schema::create('stations_devices', function (Blueprint $table) {
            $table->id();
            $table->string('device_id');
            $table->string('device_name');
            $table->string('station_code');
            $table->enum('status', ['abnormal', 'process', 'normal']);

            $table->foreign('station_code')
                ->references('code')
                ->on('stations')
                ->onDelete('cascade');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('devices', function (Blueprint $table) {
            //
        });
    }
};
