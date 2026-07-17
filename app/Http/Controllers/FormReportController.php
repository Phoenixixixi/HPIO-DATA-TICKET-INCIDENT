<?php

namespace App\Http\Controllers;

use App\Models\FormReport;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Carbon\Carbon;

class FormReportController extends Controller
{
    /**
     * Dashboard: show all form reports.
     */
    public function index(Request $request)
    {
        $query = FormReport::query();

        if ($request->filled('location')) {
            $query->where('location', $request->location);
        }

        if ($request->filled('start_date')) {
            $query->where('time_report', '>=', $request->start_date);
        }

        if ($request->filled('end_date')) {
            $query->where('time_report', '<=', $request->end_date);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nama_teknisi', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $reports = $query->orderBy('time_report', 'desc')
                         ->orderBy('id', 'desc')
                         ->paginate(20)
                         ->withQueryString();

        $locations = FormReport::select('location')
            ->distinct()
            ->whereNotNull('location')
            ->orderBy('location')
            ->pluck('location')
            ->toArray();

        $filters = $request->only(['location', 'start_date', 'end_date', 'search']);

        $summary = [
            'total'        => FormReport::count(),
            'this_month'   => FormReport::whereMonth('time_report', now()->month)
                                        ->whereYear('time_report', now()->year)
                                        ->count(),
            'today'        => FormReport::whereDate('time_report', today())->count(),
        ];

        return Inertia::render('form-report', [
            'reports'   => $reports,
            'locations' => $locations,
            'filters'   => $filters,
            'summary'   => $summary,
        ]);
    }

    /**
     * Webhook endpoint: receive POST from Waha (WhatsApp HTTP API).
     *
     * Expected payload (multipart/form-data OR JSON with base64 images):
     * The message text must contain the word "form" (case-insensitive).
     * At least 1 image, at most 4 images are required.
     * Only the FIRST image is saved to disk (compressed).
     *
     * Waha sends webhook events as JSON. Media messages include a `media` object.
     * We listen for `message` events where:
     *   - message.body includes "form" (case-insensitive keyword trigger)
     *   - message.hasMedia === true
     *   - message.type === 'image'
     *
     * The payload structure from Waha webhook:
     * {
     *   "event": "message",
     *   "session": "...",
     *   "payload": {
     *     "id": "...",
     *     "from": "...",
     *     "body": "Form Padalarang ...",
     *     "hasMedia": true,
     *     "type": "image",
     *     "_data": {
     *       "caption": "Form Padalarang nama: John ...",
     *       ...
     *     },
     *     "mediaUrl": "http://waha-host/api/.../download",   // some Waha builds
     *     "media": {
     *       "url": "...",
     *       "mimetype": "image/jpeg",
     *       "filename": "...",
     *       "data": "<base64>"   // if Waha is configured to inline media
     *     }
     *   }
     * }
     *
     * Alternatively, Waha may send multipart/form-data with uploaded files
     * under keys image_1 … image_4.
     *
     * This controller handles BOTH formats.
     */
    public function webhook(Request $request)
    {
        // ── 1. Determine message text ──────────────────────────────────────
        // Support both Waha JSON webhook envelope and direct POST.
        $body = $request->input('payload.body')
             ?? $request->input('payload._data.caption')
             ?? $request->input('body')
             ?? $request->input('caption')
             ?? '';

        // ── 2. Keyword gate: must contain "form" ───────────────────────────
        if (!Str::contains(strtolower($body), 'form')) {
            return response()->json([
                'success' => false,
                'message' => 'Ignored: message does not contain keyword "form".',
            ], 200); // return 200 so Waha does not retry
        }

        // ── 3. Collect images ──────────────────────────────────────────────
        // Priority: uploaded files (image_1 … image_4) → base64 inline media
        $imageFiles = [];

        // a) Multipart uploaded files
        for ($i = 1; $i <= 4; $i++) {
            if ($request->hasFile("image_{$i}")) {
                $imageFiles[] = ['type' => 'upload', 'file' => $request->file("image_{$i}")];
            }
        }

        // Also accept generic key "images[]"
        if ($request->hasFile('images')) {
            foreach ((array) $request->file('images') as $f) {
                if (count($imageFiles) < 4) {
                    $imageFiles[] = ['type' => 'upload', 'file' => $f];
                }
            }
        }

        // b) Base64 inline from Waha JSON
        if (empty($imageFiles)) {
            $mediaData = $request->input('payload.media.data')
                      ?? $request->input('media.data')
                      ?? null;
            if ($mediaData) {
                $imageFiles[] = ['type' => 'base64', 'data' => $mediaData];
            }
        }

        // ── 4. Validate image count (1 – 4) ───────────────────────────────
        $imageCount = count($imageFiles);
        if ($imageCount < 1 || $imageCount > 4) {
            return response()->json([
                'success' => false,
                'message' => "Validation failed: expected 1–4 images, got {$imageCount}.",
            ], 200);
        }

        // ── 5. Parse text fields from message body ─────────────────────────
        // Expected format (flexible line-by-line or pipe-separated):
        //   Form <location>
        //   Nama Teknisi: John Doe
        //   Tanggal: 2026-07-17
        //   Mulai: 08:00
        //   Selesai: 10:00
        //   Keterangan: Perbaikan TVM rusak
        $parsed = self::parseMessageBody($body);

        // ── 6. Save first image (compressed) ──────────────────────────────
        $evidencePath = null;
        $firstImage = $imageFiles[0];

        try {
            $filename  = 'form_' . now()->format('Ymd_His') . '_' . Str::random(6) . '.jpg';
            $directory = 'form_reports';
            $fullDir   = storage_path("app/public/{$directory}");

            if (!is_dir($fullDir)) {
                mkdir($fullDir, 0755, true);
            }

            $fullPath = "{$fullDir}/{$filename}";

            if ($firstImage['type'] === 'upload') {
                // Read uploaded file bytes, compress via GD
                $imgResource = self::compressImageFromPath($firstImage['file']->getRealPath(), $fullPath);
            } else {
                // Decode base64
                $imageData   = base64_decode($firstImage['data']);
                $tmpPath     = sys_get_temp_dir() . '/' . Str::random(12) . '.jpg';
                file_put_contents($tmpPath, $imageData);
                $imgResource = self::compressImageFromPath($tmpPath, $fullPath);
                @unlink($tmpPath);
            }

            $evidencePath = "{$directory}/{$filename}";

        } catch (\Throwable $e) {
            // Image compression failed — log but still save record without evidence
            \Log::warning('FormReport image compression failed: ' . $e->getMessage());
            $evidencePath = null;
        }

        // ── 7. Persist to database ─────────────────────────────────────────
        $report = FormReport::create([
            'nama_teknisi' => $parsed['nama_teknisi'] ?? 'Unknown',
            'time_report'  => $parsed['time_report']  ?? now()->toDateString(),
            'location'     => $parsed['location']     ?? null,
            'description'  => $parsed['description']  ?? $body,
            'start_time'   => $parsed['start_time']   ?? null,
            'end_time'     => $parsed['end_time']      ?? null,
            'evidence'     => $evidencePath,
        ]);

        return response()->json([
            'success' => true,
            'id'      => $report->id,
            'message' => 'Form report saved successfully.',
        ], 201);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    /**
     * Parse structured fields from message body text.
     * Handles both "Key: Value" line format and inline patterns.
     */
    private static function parseMessageBody(string $text): array
    {
        $result = [];
        $lines  = preg_split('/\r?\n|\|/', $text);

        // Location: extract from first line "Form <location>"
        if (preg_match('/\bform\s+([A-Za-z0-9\s\-]+)/i', $text, $m)) {
            $result['location'] = strtoupper(trim($m[1]));
        }

        foreach ($lines as $line) {
            $line = trim($line);
            if (!$line || !str_contains($line, ':')) {
                continue;
            }

            [$key, $val] = array_map('trim', explode(':', $line, 2));
            $keyNorm = strtolower(str_replace([' ', '_'], '', $key));

            switch ($keyNorm) {
                case 'namateknisi':
                case 'teknisi':
                case 'nama':
                    $result['nama_teknisi'] = $val;
                    break;

                case 'tanggal':
                case 'date':
                case 'timereport':
                    try {
                        $result['time_report'] = Carbon::parse($val)->toDateString();
                    } catch (\Throwable) {
                        $result['time_report'] = now()->toDateString();
                    }
                    break;

                case 'mulai':
                case 'start':
                case 'starttime':
                case 'jammulai':
                    $result['start_time'] = $val;
                    break;

                case 'selesai':
                case 'end':
                case 'endtime':
                case 'jamselesai':
                    $result['end_time'] = $val;
                    break;

                case 'keterangan':
                case 'deskripsi':
                case 'description':
                case 'uraian':
                    $result['description'] = $val;
                    break;

                case 'lokasi':
                case 'location':
                case 'stasiun':
                    $result['location'] = strtoupper($val);
                    break;
            }
        }

        return $result;
    }

    /**
     * Compress an image from $sourcePath and write JPEG to $destPath.
     * Uses GD (always available in PHP) — no extra packages needed.
     * Target: max 1280px wide, 80% JPEG quality.
     */
    private static function compressImageFromPath(string $sourcePath, string $destPath): bool
    {
        $info = @getimagesize($sourcePath);
        if (!$info) {
            throw new \RuntimeException("Cannot read image: {$sourcePath}");
        }

        $mime = $info['mime'];
        $src  = match ($mime) {
            'image/jpeg' => @imagecreatefromjpeg($sourcePath),
            'image/png'  => @imagecreatefrompng($sourcePath),
            'image/webp' => @imagecreatefromwebp($sourcePath),
            'image/gif'  => @imagecreatefromgif($sourcePath),
            default      => throw new \RuntimeException("Unsupported image type: {$mime}"),
        };

        if (!$src) {
            throw new \RuntimeException("GD failed to load image: {$sourcePath}");
        }

        $origW = imagesx($src);
        $origH = imagesy($src);

        $maxW = 1280;
        if ($origW > $maxW) {
            $newW = $maxW;
            $newH = (int) round($origH * ($maxW / $origW));
        } else {
            $newW = $origW;
            $newH = $origH;
        }

        $dst = imagecreatetruecolor($newW, $newH);

        // Preserve transparency for PNG
        if ($mime === 'image/png') {
            imagealphablending($dst, false);
            imagesavealpha($dst, true);
            $transparent = imagecolorallocatealpha($dst, 255, 255, 255, 127);
            imagefilledrectangle($dst, 0, 0, $newW, $newH, $transparent);
        }

        imagecopyresampled($dst, $src, 0, 0, 0, 0, $newW, $newH, $origW, $origH);
        $result = imagejpeg($dst, $destPath, 80);

        imagedestroy($src);
        imagedestroy($dst);

        return $result;
    }
}
