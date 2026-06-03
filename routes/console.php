<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// ── Shift Reminder Scheduler ────────────────────────────────────────────────
// Sends WhatsApp reminders via WAHA 10 & 5 mins before shift start/end.
// Requires: php artisan schedule:work (local) or system cron in production.
Schedule::command('app:send-shift-reminders')->everyMinute();
