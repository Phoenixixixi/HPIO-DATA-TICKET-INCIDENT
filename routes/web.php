<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Dashboard;
use App\Http\Controllers\Incident;
use App\Http\Controllers\ShiftScheduleController;
use App\Http\Controllers\WhatsAppController;



Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    //route on dashboard
    Route::get('dashboard', [Dashboard::class, 'Index'])->name('dashboard');

    Route::get('report-problem', [Dashboard::class, 'Index'])->name('report-problem');

    Route::get('incident', [Incident::class, 'Index'])->name('incident');
    

    Route::get('stations', function () {
        $today = \Carbon\Carbon::now();
        $currentMonthStr = $today->format('Y-m');
        $todayDay = $today->day;
        $shift_schedules = \App\Models\ShiftSchedule::where('month', $currentMonthStr)->get();

        return Inertia::render('stations', [
            'shift_schedules' => $shift_schedules,
            'today_day' => $todayDay,
        ]);
    })->name('stations');

    Route::get('blueprints', function () {
        return Inertia::render('blueprints');
    })->name('blueprints');

    // Shift Schedule routes
    Route::get('shift-schedule', [ShiftScheduleController::class, 'index'])->name('shift-schedule');
    Route::post('shift-schedule', [ShiftScheduleController::class, 'store'])->name('shift-schedule.store');
    Route::patch('shift-schedule/{id}/cell', [ShiftScheduleController::class, 'updateCell'])->name('shift-schedule.cell');
    Route::post('shift-schedule/swap', [ShiftScheduleController::class, 'swapCells'])->name('shift-schedule.swap');
    Route::post('shift-schedule/reorder', [ShiftScheduleController::class, 'reorder'])->name('shift-schedule.reorder');
    Route::post('shift-schedule/copy-month', [ShiftScheduleController::class, 'copyMonth'])->name('shift-schedule.copy-month');
    Route::post('shift-schedule/bulk', [ShiftScheduleController::class, 'bulkUpdate'])->name('shift-schedule.bulk');
    Route::post('shift-schedule/configs', [ShiftScheduleController::class, 'updateConfigs'])->name('shift-schedule.configs');
    Route::delete('shift-schedule/{id}', [ShiftScheduleController::class, 'destroy'])->name('shift-schedule.destroy');
    Route::post('/send-whatsapp', [WhatsAppController::class, 'send']);
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
