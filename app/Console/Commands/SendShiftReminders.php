<?php

namespace App\Console\Commands;

use App\Models\ShiftSchedule;
use App\Models\ShiftConfig;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SendShiftReminders extends Command
{
    protected $signature = 'app:send-shift-reminders';
    protected $description = 'Send WhatsApp reminders via WAHA 10 and 5 minutes before shift start/end (Supports Double Shifts)';

    private function resolveShiftConfig(string $shiftCode, array $configsByName): ?array
    {
        $code = strtoupper(trim($shiftCode));

        if ($code === 'SM' || str_ends_with($code, ' M')) {
            return $configsByName['Middle'] ?? null;
        }

        if (str_ends_with($code, '3') || str_ends_with($code, ' 3')) {
            return $configsByName['Shift 3'] ?? null;
        }

        if (str_ends_with($code, '2')) {
            return $configsByName['Shift 2'] ?? null;
        }

        if (str_ends_with($code, '1')) {
            return $configsByName['Shift 1'] ?? null;
        }

        return null;
    }

    private function todayAt(string $timeStr, Carbon $baseDate): Carbon
    {
        [$h, $m] = explode(':', $timeStr);
        return $baseDate->copy()->setHour((int)$h)->setMinute((int)$m)->setSecond(0);
    }

    private function sendWhatsApp(string $phone, string $message): void
    {
        $wahaUrl   = config('services.waha.url');
        $session   = config('services.waha.session', 'default');
        $apiKey    = config('services.waha.api_key');

        $phone = preg_replace('/[^0-9]/', '', $phone);
        if (str_starts_with($phone, '0')) {
            $phone = '62' . substr($phone, 1);
        }
        $chatId = $phone . '@c.us';

        $headers = ['Content-Type' => 'application/json'];
        if ($apiKey) {
            $headers['X-Api-Key'] = $apiKey;
        }

        try {
            $response = Http::withHeaders($headers)
                ->post("{$wahaUrl}/api/sendText", [
                    'session'  => $session,
                    'chatId'   => $chatId,
                    'text'     => $message,
                ]);

            if ($response->successful()) {
                Log::info("[ShiftReminder] Sent to {$chatId}: {$message}");
                $this->info("✅  Sent to {$phone}: {$message}");
            } else {
                Log::warning("[ShiftReminder] Failed ({$response->status()}) to {$chatId}: " . $response->body());
                $this->warn("⚠️  Failed ({$response->status()}) to {$phone}");
            }
        } catch (\Exception $e) {
            Log::error("[ShiftReminder] Exception sending to {$chatId}: " . $e->getMessage());
            $this->error("❌  Exception: " . $e->getMessage());
        }
    }

    public function handle(): void
    {
        $now = Carbon::now('Asia/Jakarta');
        $this->line("🕐  Running shift reminders at " . $now->format('H:i'));

        // Load all shift configs
        $rawConfigs     = ShiftConfig::all();
        $configsByName  = [];
        foreach ($rawConfigs as $cfg) {
            $configsByName[$cfg->shift_name] = [
                'start' => $cfg->start_time,
                'end'   => $cfg->end_time,
            ];
        }

        if (empty($configsByName)) {
            $this->warn('No shift configs found. Exiting.');
            return;
        }

        // Kita siapkan data penanggalan untuk "Hari Ini" dan "Hari Kemarin"
        $daysToCheck = [
            'kemarin' => [
                'date'  => $now->copy()->subDay(),
                'day'   => $now->copy()->subDay()->dayOfWeekIso,
                'month' => $now->copy()->subDay()->format('Y-m'),
            ],
            'hari_ini' => [
                'date'  => $now->copy(),
                'day'   => $now->dayOfWeekIso,
                'month' => $now->format('Y-m'),
            ]
        ];

        // Loop dua kali: pertama cek sisa shift kemarin, kedua cek shift hari ini
        foreach ($daysToCheck as $key => $target) {
            
            $schedules = ShiftSchedule::where('month', $target['month'])
                ->whereNotNull('no_hp')
                ->where('no_hp', '!=', '')
                ->get();

            if ($schedules->isEmpty()) {
                continue;
            }

            foreach ($schedules as $schedule) {
                $shiftCode = $schedule->shifts[$target['day']] ?? null;

                if (!$shiftCode || strtoupper($shiftCode) === 'LIBUR') {
                    continue;
                }

                $config = $this->resolveShiftConfig($shiftCode, $configsByName);
                if (!$config) {
                    continue;
                }

                // Waktu start & end dikalkulasi berdasarkan tanggal shift tersebut dimulai
                $startTime = $this->todayAt($config['start'], $target['date']);
                $endTime   = $this->todayAt($config['end'], $target['date']);

                // Handle jika shift melewati tengah malam (seperti Shift 3)
                if ($endTime->lte($startTime)) {
                    $endTime->addDay();
                }

                $employeeName = $schedule->employee_name;
                $phone        = $schedule->no_hp;

                $triggers = [
                    [
                        'target'  => $startTime->copy()->subMinutes(10),
                        'message' => "⏰ Halo *{$employeeName}*, shift kamu *{$shiftCode}* akan dimulai dalam *10 menit* (jam {$config['start']}). nenek nenek bawa piranha, jangan lupa absen ya! 🚄",
                    ],
                    [
                        'target'  => $startTime->copy()->subMinutes(30),
                        'message' => "⏰ Halo *{$employeeName}*, shift kamu *{$shiftCode}* akan dimulai dalam *30 menit* (jam {$config['start']}). hayo jangan lupa absen ya nanti justif loh hihihi  🚄",
                    ],
                    [
                        'target'  => $startTime->copy()->subMinutes(5),
                        'message' => "🔔 Halo *{$employeeName}*, shift kamu *{$shiftCode}* akan dimulai dalam *5 menit* (jam {$config['start']}). ayo lima menit lagi ini absen, jangan sia siakan waktu, waktu lebih berharga daripada emas anjay! 🚄",
                    ],
                    [
                        'target'  => $endTime->copy()->subMinutes(10),
                        'message' => "⏰ Halo *{$employeeName}*, shift kamu *{$shiftCode}* akan selesai dalam *10 menit* (jam {$config['end']}). mari pulang marilah pulang jangan lupa absen gess. 🚄",
                    ],
                    [
                        'target'  => $endTime->copy()->subMinutes(5),
                        'message' => "🔔 Halo *{$employeeName}*, shift kamu *{$shiftCode}* akan selesai dalam *5 menit* (jam {$config['end']}). 5 menit lagi pulang, jangan lupa absen sebelum pulang WOYY! 🚄",
                    ],
                ];

                foreach ($triggers as $trigger) {
                    /** @var Carbon $targetTime */
                    $targetTime = $trigger['target'];

                    // FIX: Cocokkan tanggal, jam, dan menit agar tidak salah kirim beda hari!
                    if ($now->format('Y-m-d H:i') === $targetTime->format('Y-m-d H:i')) {
                        $this->sendWhatsApp($phone, $trigger['message']);
                    }
                }
            }
        }

        $this->info('✅  Shift reminder check completed.');
    }
}