<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Dashboard;
use App\Http\Controllers\Incident;



Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    //route on dashboard
    Route::get('dashboard', [Dashboard::class, 'Index'])->name('dashboard');

    Route::get('report-problem', [Dashboard::class, 'Index'])->name('report-problem');

    Route::get('incident', [Incident::class, 'Index'])->name('incident');
    

    Route::get('stations', function () {
        return Inertia::render('stations');
    })->name('stations');

    Route::get('blueprints', function () {
        return Inertia::render('blueprints');
    })->name('blueprints');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
