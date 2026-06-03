<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        \App\Models\ShiftConfig::updateOrCreate(
            ['shift_name' => 'Shift 1'],
            ['start_time' => '07:00', 'end_time' => '15:00']
        );
        \App\Models\ShiftConfig::updateOrCreate(
            ['shift_name' => 'Shift 2'],
            ['start_time' => '15:00', 'end_time' => '23:00']
        );
        \App\Models\ShiftConfig::updateOrCreate(
            ['shift_name' => 'Shift 3'],
            ['start_time' => '23:00', 'end_time' => '07:00']
        );
        \App\Models\ShiftConfig::updateOrCreate(
            ['shift_name' => 'Middle'],
            ['start_time' => '09:00', 'end_time' => '17:00']
        );
    }
}
