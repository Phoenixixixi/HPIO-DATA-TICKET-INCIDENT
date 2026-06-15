<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

// Mark existing migrations as "ran" (batch 1) so artisan migrate won't try to re-run them
$existing = [
    '0001_01_01_000001_create_cache_table',
    '0001_01_01_000002_create_jobs_table',
];

foreach ($existing as $migration) {
    $already = DB::table('migrations')->where('migration', $migration)->first();
    if (!$already) {
        DB::table('migrations')->insert([
            'migration' => $migration,
            'batch'     => 1,
        ]);
        echo "Marked: $migration\n";
    } else {
        echo "Already exists: $migration\n";
    }
}

echo "Done.\n";
