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
        Schema::create('form_report', function (Blueprint $table) {
            $table->id();
            $table->string('nama_teknisi');
            $table->timestamps();
            $table->date('time_report');

            $table->string('location');

            $table->foreign('location')
                ->references('code')
                ->on('stations')
                ->onDelete('cascade');
            $table->text('description');
            $table->time('start_time');
            $table->time('end_time');
            $table->string('evidence')->nullable();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('form_report', function (Blueprint $table) {
            //
        });
    }
};
