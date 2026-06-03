<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class WhatsAppController extends Controller
{
    public function send(Request $request)
    {
        $request->validate([
            'phone' => ['required'],
            'message' => ['required'],
        ]);

        $phone = preg_replace('/[^0-9]/', '', $request->phone);

        if (str_starts_with($phone, '0')) {
            $phone = '62' . substr($phone, 1);
        }

        $chatId = $phone . '@c.us';

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
            'X-Api-Key' => config('services.waha.api_key'),
        ])->post(
            config('services.waha.url') . '/api/sendText',
            [
                'session' => config('services.waha.session'),
                'chatId' => $chatId,
                'text' => $request->message,
            ]
        );
        

        if ($response->successful()) {
            return redirect->back();
        }

        return response()->json([
            'success' => false,
            'message' => 'Gagal mengirim pesan',
            'error' => $response->body(),
        ], $response->status());
    }
}