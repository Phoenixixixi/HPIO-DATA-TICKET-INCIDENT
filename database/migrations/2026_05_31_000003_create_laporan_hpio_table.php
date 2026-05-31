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
        Schema::create('laporan_hpio', function (Blueprint $table) {
            $table->string('idNumber')->primary();
            $table->string('timestamp')->nullable();
            $table->string('nomor_tiket')->nullable();
            $table->timestamp('tanggal_lapor')->nullable();
            $table->string('nama_pelapor')->nullable();
            $table->string('nama_penerima_laporan')->nullable();
            $table->string('stasiun_lokasi')->nullable();
            $table->string('kategori_aset')->nullable();
            $table->string('equipment')->nullable();
            $table->text('deskripsi_masalah')->nullable();
            $table->string('skala_prioritas')->nullable();
            $table->string('status_laporan')->nullable();
            $table->string('nama_teknisi')->nullable();
            $table->string('waktu_melapor')->nullable();
            $table->string('waktu_respon_teknisi')->nullable();
            $table->string('waktu_selesai')->nullable();
            $table->string('respon_time')->nullable();
            $table->string('solving_time')->nullable();
            $table->string('wr_doc_nomor')->nullable();
            $table->string('status_eskalasi')->nullable();
            $table->string('bulan')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('laporan_hpio');
    }
};
