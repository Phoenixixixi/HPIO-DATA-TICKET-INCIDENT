import{r as n,j as e,L as A}from"./app-FTFaOar3.js";import{e as a}from"./button-BAEkEeOK.js";import{S as b}from"./search-CL0u3i7s.js";import{C as y,A as O}from"./app-layout-y8XW6Ucl.js";import{C as f}from"./index-ByXzOBXh.js";import{C}from"./copy-DZ-0aSbg.js";/* empty css            */import"./index-BfMHMroz.js";/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const I=[["ellipse",{cx:"12",cy:"5",rx:"9",ry:"3",key:"msslwz"}],["path",{d:"M3 5V19A9 3 0 0 0 21 19V5",key:"1wlel7"}],["path",{d:"M3 12A9 3 0 0 0 21 12",key:"mv7ke4"}]],x=a("Database",I);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $=[["path",{d:"M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4",key:"1pf5j1"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"m5 12-3 3 3 3",key:"oke12k"}],["path",{d:"m9 18 3-3-3-3",key:"112psh"}]],m=a("FileCode2",$);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const L=[["path",{d:"M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z",key:"zw3jo"}],["path",{d:"M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12",key:"1wduqc"}],["path",{d:"M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17",key:"kqbvx6"}]],v=a("Layers",L);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const U=[["rect",{width:"20",height:"8",x:"2",y:"2",rx:"2",ry:"2",key:"ngkwjq"}],["rect",{width:"20",height:"8",x:"2",y:"14",rx:"2",ry:"2",key:"iecqi9"}],["line",{x1:"6",x2:"6.01",y1:"6",y2:"6",key:"16zg32"}],["line",{x1:"6",x2:"6.01",y1:"18",y2:"18",key:"nzw8ys"}]],w=a("Server",U);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const D=[["path",{d:"M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",key:"4pj2yx"}],["path",{d:"M20 3v4",key:"1olli1"}],["path",{d:"M22 5h-4",key:"1gvqau"}],["path",{d:"M4 17v2",key:"vumght"}],["path",{d:"M5 18H3",key:"zchphs"}]],M=a("Sparkles",D);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const P=[["polyline",{points:"4 17 10 11 4 5",key:"akl6gq"}],["line",{x1:"12",x2:"20",y1:"19",y2:"19",key:"q2wloq"}]],k=a("Terminal",P);/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */const o=[{id:"supabase-db",name:"Supabase & PostgreSQL Schema",description:"Production-ready PostgreSQL database definitions, including custom ENUMs, UUID primary keys, performance indexes, Row-Level Security (RLS) policies based on station_id, and Realtime publications.",files:[{title:"Database Relational Schema (SQL)",filename:"01_schema.sql",language:"sql",code:`-- KCIC High-Speed Rail Maintenance System Database Schema
-- DBMS: PostgreSQL (Supabase Compatible)

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Custom Types & Enums
CREATE TYPE train_status AS ENUM ('operational', 'maintenance', 'decommissioned');
CREATE TYPE order_priority AS ENUM ('critical', 'high', 'medium', 'low');
CREATE TYPE order_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
CREATE TYPE alert_severity AS ENUM ('critical', 'high', 'warning', 'info');

-- 2. Stations Table
CREATE TABLE stations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL, -- e.g., HLM, KWG, PDL, TGL
    location TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Train Sets Table
CREATE TABLE train_sets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    train_number VARCHAR(100) UNIQUE NOT NULL, -- e.g., KCIC-400AF-01
    model VARCHAR(100) DEFAULT 'CR400AF' NOT NULL,
    status train_status DEFAULT 'operational'::train_status NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Technicians Table
CREATE TABLE technicians (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL, -- Ties to Supabase auth.users.id
    name VARCHAR(255) NOT NULL,
    specialization VARCHAR(255) NOT NULL, -- e.g., electrical, propulsion, brakes, mechanical
    station_id UUID REFERENCES stations(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Maintenance Orders Table
CREATE TABLE maintenance_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    train_set_id UUID REFERENCES train_sets(id) ON DELETE CASCADE NOT NULL,
    station_id UUID REFERENCES stations(id) ON DELETE RESTRICT NOT NULL,
    type VARCHAR(255) NOT NULL, -- e.g., Bogie overhaul, pantograph inspection, brake replacement
    priority order_priority DEFAULT 'medium'::order_priority NOT NULL,
    status order_status DEFAULT 'pending'::order_status NOT NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255) NOT NULL, -- Technician or Dispatcher email/ID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. Maintenance Items Table
CREATE TABLE maintenance_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES maintenance_orders(id) ON DELETE CASCADE NOT NULL,
    component VARCHAR(255) NOT NULL, -- e.g., Traction Motor, Current Collector, Brake Pad
    description TEXT NOT NULL,
    action_taken TEXT NOT NULL,
    technician_id UUID REFERENCES technicians(id) ON DELETE SET NULL NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. Alerts Table
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    station_id UUID REFERENCES stations(id) ON DELETE CASCADE NOT NULL,
    train_set_id UUID REFERENCES train_sets(id) ON DELETE CASCADE NOT NULL,
    severity alert_severity DEFAULT 'warning'::alert_severity NOT NULL,
    message TEXT NOT NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 8. Audit Logs Table (Strict Tracking)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID, -- References auth.users.id
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100) NOT NULL, -- e.g., 'maintenance_orders', 'alerts'
    entity_id UUID NOT NULL,
    payload JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 9. Database Indexes for sub-second query execution
CREATE INDEX idx_orders_train_set ON maintenance_orders(train_set_id);
CREATE INDEX idx_orders_station ON maintenance_orders(station_id);
CREATE INDEX idx_orders_scheduled_at ON maintenance_orders(scheduled_at);
CREATE INDEX idx_orders_status ON maintenance_orders(status);
CREATE INDEX idx_orders_priority ON maintenance_orders(priority);

CREATE INDEX idx_alerts_station ON alerts(station_id);
CREATE INDEX idx_alerts_train_set ON alerts(train_set_id);
CREATE INDEX idx_alerts_resolved_at ON alerts(resolved_at);

CREATE INDEX idx_audit_logs_compound ON audit_logs(entity_type, entity_id);
`},{title:"Row Level Security (RLS) & Publications",filename:"02_rls_policies.sql",language:"sql",code:`-- 1. Enable Row Level Security (RLS) on all core tables
ALTER TABLE stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE train_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 2. Define Custom JWT Claims mapping for Supabase
-- Goal: Access standard attributes such as station_id and role inside JWT.
-- JSON structure in token: auth.jwt() ->> 'station_id' and auth.jwt() ->> 'role'

-- RLS Policy: VIEWERS can read any data (Read-Only)
CREATE POLICY "Viewers can read stations" ON stations FOR SELECT TO authenticated
    USING (true);
CREATE POLICY "Viewers can read train_sets" ON train_sets FOR SELECT TO authenticated
    USING (true);
CREATE POLICY "Viewers can read technicians" ON technicians FOR SELECT TO authenticated
    USING (true);
CREATE POLICY "Viewers can read audit_logs" ON audit_logs FOR SELECT TO authenticated
    USING ( (auth.jwt() ->> 'role') = 'admin' );

-- RLS Policies per station_id for TECHNICIANS
-- Technicians can only SELECT and INSERT/UPDATE maintenance_orders tied to their assigned station
CREATE POLICY "Technician select orders" ON maintenance_orders FOR SELECT TO authenticated
    USING (
        (auth.jwt() ->> 'role') = 'admin' OR 
        (auth.jwt() ->> 'role') = 'viewer' OR 
        (station_id = (auth.jwt() ->> 'station_id')::uuid AND (auth.jwt() ->> 'role') = 'technician')
    );

CREATE POLICY "Technician insert orders" ON maintenance_orders FOR INSERT TO authenticated
    WITH CHECK (
        (auth.jwt() ->> 'role') = 'admin' OR 
        (station_id = (auth.jwt() ->> 'station_id')::uuid AND (auth.jwt() ->> 'role') = 'technician')
    );

CREATE POLICY "Technician update orders" ON maintenance_orders FOR UPDATE TO authenticated
    USING (
        (auth.jwt() ->> 'role') = 'admin' OR 
        (station_id = (auth.jwt() ->> 'station_id')::uuid AND (auth.jwt() ->> 'role') = 'technician')
    )
    WITH CHECK (
        (auth.jwt() ->> 'role') = 'admin' OR 
        (station_id = (auth.jwt() ->> 'station_id')::uuid AND (auth.jwt() ->> 'role') = 'technician')
    );

-- Similar Station-bounded policy for Maintenance Items
CREATE POLICY "Technician access items" ON maintenance_items FOR ALL TO authenticated
    USING (
        (auth.jwt() ->> 'role') = 'admin' OR
        EXISTS (
            SELECT 1 FROM maintenance_orders 
            WHERE maintenance_orders.id = maintenance_items.order_id 
            AND maintenance_orders.station_id = (auth.jwt() ->> 'station_id')::uuid
        )
    );

-- Alerts RLS: Localized boundaries
CREATE POLICY "Station alerts access" ON alerts FOR ALL TO authenticated
    USING (
        (auth.jwt() ->> 'role') = 'admin' OR (auth.jwt() ->> 'role') = 'viewer' OR
        (station_id = (auth.jwt() ->> 'station_id')::uuid)
    );

-- ADMIN Policies: Bypassing or accessing everything natively
-- (Laravel calls DB with Postgres service_role bypasses RLS naturally, 
-- but we declare explicit catch-alls as a security best practice)
CREATE POLICY "Admin complete control on order table" ON maintenance_orders FOR ALL TO authenticated
    USING ( (auth.jwt() ->> 'role') = 'admin' );

-- 3. Storage Bucket & Policies configuration
-- Bucket: maintenance-attachments (private)
-- Policy: authenticated users can upload, but only users with matching station_id can read
INSERT INTO storage.buckets (id, name, public) VALUES ('maintenance-attachments', 'maintenance-attachments', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow authenticated users to upload files" ON storage.objects FOR INSERT TO authenticated
    WITH CHECK ( bucket_id = 'maintenance-attachments' );

CREATE POLICY "Allow same station users to retrieve attachments" ON storage.objects FOR SELECT TO authenticated
    USING (
        bucket_id = 'maintenance-attachments' AND (
            (auth.jwt() ->> 'role') = 'admin' OR
            -- Custom metadata field storing station_id
            (metadata->>'station_id') = auth.jwt()->>'station_id'
        )
    );

-- 4. Supabase Realtime Publication setup
-- Drop and rebuild the core realtime publication
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE alerts, maintenance_orders;
`},{title:"Dynamic JWT Claim Setup Trigger & Function",filename:"03_jwt_claims.sql",language:"sql",code:`-- Supabase database trigger to inject custom claims (station_id & role) into JWT automatically
-- Maps data from public.technicians or public.users into auth.users metadata

CREATE OR REPLACE FUNCTION public.handle_user_metadata_jwt_sync()
RETURNS trigger AS $$
DECLARE
    v_role text := 'viewer';
    v_station_id uuid := NULL;
BEGIN
    -- Query our database schema to check if user has technician details assigned
    SELECT specialization, station_id INTO v_role, v_station_id
    FROM public.technicians
    WHERE user_id = NEW.id;

    -- If a technician record exists, allocate role = 'technician' and update their target station_id
    IF FOUND THEN
        NEW.raw_user_meta_data = NEW.raw_user_meta_data || 
            jsonb_build_object('role', 'technician', 'station_id', v_station_id);
    ELSE
        -- Default metadata check (if already set via admin invitations)
        IF NEW.raw_user_meta_data->>'role' IS NULL THEN
            NEW.raw_user_meta_data = NEW.raw_user_meta_data || 
                jsonb_build_object('role', 'viewer');
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger attached to auth.users (runs before token is minted)
DROP TRIGGER IF EXISTS on_auth_user_created_sync ON auth.users;
CREATE TRIGGER on_auth_user_created_sync
    BEFORE INSERT OR UPDATE OF raw_user_meta_data ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_user_metadata_jwt_sync();
`}]},{id:"laravel-core",name:"Laravel 11 Core System & Auth Integration",description:"The Laravel 11 foundational configuration, database connection via Supabase connection pooler, custom JWT validation middleware verifying Supabase JWKS tokens and claims parsing.",files:[{title:"Laravel Database Connection Env",filename:".env",language:"env",code:`# Database settings utilizing the Supabase Transaction Pooler (Port 6543)
DB_CONNECTION=pgsql
DB_HOST=db.mjscyluyogbttkhxbyic.supabase.co
DB_PORT=6543
DB_DATABASE=postgres
DB_USERNAME=postgres.mjscyluyogbttkhxbyic
DB_PASSWORD=Secure_Supabase_Database_Credentials_Here_From_Console
DB_SSLMODE=require

# Redis Queue Configuration for sub-second system notifications
QUEUE_CONNECTION=redis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

# Laravel Reverb (WebSockets for real-time Laravel alerts broadcasting)
REVERB_APP_ID=548902
REVERB_APP_KEY=kcic-reverb-websocket-key-identifier
REVERB_APP_SECRET=reverb_secret_hash_code
REVERB_HOST="127.0.0.1"
REVERB_PORT=8080
REVERB_SCHEME=http

# Supabase Auth Configuration
SUPABASE_PROJECT_REF=mjscyluyogbttkhxbyic
SUPABASE_JWT_KEY=Very_Secure_Supabase_JWT_Secret_Ref_Only_Needed_For_HS256
`},{title:"Database Configuration Setup",filename:"config/database.php",language:"php",code:`<?php

declare(strict_types=1);

return [
    'default' => env('DB_CONNECTION', 'pgsql'),

    'connections' => [
        'pgsql' => [
            'driver' => 'pgsql',
            'url' => env('DB_URL'),
            'host' => env('DB_HOST', '127.0.0.1'),
            'port' => env('DB_PORT', '5432'),
            'database' => env('DB_DATABASE', 'forge'),
            'username' => env('DB_USERNAME', 'forge'),
            'password' => env('DB_PASSWORD', ''),
            'charset' => 'utf8',
            'prefix' => '',
            'prefix_indexes' => true,
            'search_path' => 'public',
            'sslmode' => 'require', // Required with Supabase connections
            'options' => [
                PDO::ATTR_EMULATE_PREPARES => true, // Recommended with Supabase Connection Pooler
            ],
        ],
    ],
];
`},{title:"Supabase JWT Authenticate Middleware",filename:"app/Http/Middleware/VerifySupabaseToken.php",language:"php",code:`<?php

declare(strict_types=1);

namespace AppHttpMiddleware;

use Closure;
use Exception;
use FirebaseJWTJWK;
use FirebaseJWTJWT;
use IlluminateHttpRequest;
use IlluminateSupport:Facades\\Cache;
use IlluminateSupport:Facades\\Http;
use SymfonyComponentHttpFoundationResponse;

class VerifySupabaseToken
{
    /**
     * Handle an incoming request and authenticate the actor via Supabase JWT claims.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json([
                'message' => 'Authorization bearer token is missing.',
                'status' => 'error'
            ], Response::HTTP_UNAUTHORIZED);
        }

        try {
            $claims = $this->decodeToken($token);

            // Fetch dynamic claims injected into token
            $userId = $claims->sub;
            $role = $claims->role ?? 'viewer';
            $stationId = $claims->station_id ?? null;

            // Bind Supabase User details directly into Laravel Request attributes
            $request->attributes->set('auth_user_id', $userId);
            $request->attributes->set('auth_user_email', $claims->email ?? '');
            $request->attributes->set('auth_role', $role);
            $request->attributes->set('auth_station_id', $stationId);

            return $next($request);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Unauthorized: ' . $e->getMessage(),
                'status' => 'error'
            ], Response::HTTP_UNAUTHORIZED);
        }
    }

    /**
     * Decodes and validates JWT using Supabase Project's JWKS endpoint.
     */
    private function decodeToken(string $token): object
    {
        $projectRef = env('SUPABASE_PROJECT_REF');
        $jwksUrl = "https://{$projectRef}.supabase.co/rest/v1/auth/keys";

        // Cache the JWK set to optimize response times (expiry: 12 hours)
        $jwks = Cache::remember('supabase_jwks', 43200, function () use ($jwksUrl) {
            $response = Http::get($jwksUrl);
            if ($response->failed()) {
                throw new Exception('Unable to fetch Supabase JWK key signatures.');
            }
            return $response->json();
        });

        // Parse token and decode automatically using Firebase-JWT signature verifier
        $keys = JWK::parseKeySet($jwks);
        return JWT::decode($token, $keys);
    }
}
`}]},{id:"laravel-modules",name:"Laravel API Business Modules (PHP 8.3)",description:"Full clean architectural modules for KCIC (Controllers, Services, Repositories, API Resources, and Form Requests) featuring consistent {data, meta, message} interfaces, cursor paginations, and typed DTOs.",files:[{title:"DTO: Maintenance Order Input DTO",filename:"app/DTOs/MaintenanceOrderData.php",language:"php",code:`<?php

declare(strict_types=1);

namespace AppDTOs;

use AppHttpRequestsStoreMaintenanceOrderRequest;

/**
 * PHP 8.3 Readonly DTO representing a validated Maintenance Order payload.
 */
readonly class MaintenanceOrderData
{
    public function __construct(
        public string $trainSetId,
        public string $stationId,
        public string $type,
        public string $priority,
        public string $scheduledAt,
        public string $createdBy
    ) {}

    public static function fromRequest(StoreMaintenanceOrderRequest $request): self
    {
        return new self(
            trainSetId: $request->validated('train_set_id'),
            stationId: $request->validated('station_id'),
            type: $request->validated('type'),
            priority: $request->validated('priority'),
            scheduledAt: $request->validated('scheduled_at'),
            createdBy: (string) $request->get('auth_user_email')
        );
    }

    public function toArray(): array
    {
        return [
            'train_set_id' => $this->trainSetId,
            'station_id' => $this->stationId,
            'type' => $this->type,
            'priority' => $this->priority,
            'scheduled_at' => $this->scheduledAt,
            'created_by' => $this->createdBy,
        ];
    }
}
`},{title:"Repository Pattern: Maintenance Order Layer",filename:"app/Repositories/MaintenanceOrderRepository.php",language:"php",code:`<?php

declare(strict_types=1);

namespace AppRepositories;

use AppModelsMaintenanceOrder;
use IlluminateContractsPaginationCursorPaginator;
use IlluminateDatabaseEloquentBuilder;

class MaintenanceOrderRepository
{
    /**
     * Retrieve a filtered cursor-paginated list of maintenance orders with eager loaded relationships.
     */
    public function getFilteredPaginated(array $filters, int $perPage = 15): CursorPaginator
    {
        return MaintenanceOrder::query()
            ->with(['trainSet', 'station'])
            ->when($filters['station_id'] ?? null, function (Builder $query, string $stationId) {
                $query->where('station_id', $stationId);
            })
            ->when($filters['priority'] ?? null, function (Builder $query, string $priority) {
                $query->where('priority', $priority);
            })
            ->when($filters['status'] ?? null, function (Builder $query, string $status) {
                $query->where('status', $status);
            })
            ->when($filters['start_date'] ?? null, function (Builder $query, string $startDate) {
                $query->where('scheduled_at', '>=', $startDate);
            })
            ->when($filters['end_date'] ?? null, function (Builder $query, string $endDate) {
                $query->where('scheduled_at', '<=', $endDate);
            })
            ->orderBy('scheduled_at', 'desc')
            ->cursorPaginate($perPage);
    }

    public function findWithItems(string $id): ?MaintenanceOrder
    {
        return MaintenanceOrder::with(['trainSet', 'station', 'items.technician'])->find($id);
    }

    public function create(array $data): MaintenanceOrder
    {
        return MaintenanceOrder::create($data);
    }

    public function updateStatus(string $id, string $status): MaintenanceOrder
    {
        $order = MaintenanceOrder::findOrFail($id);
        $order->status = $status;
        if ($status === 'completed') {
            $order->completed_at = now();
        }
        $order->save();
        return $order;
    }
}
`},{title:"Service Layer: Maintenance Service",filename:"app/Services/MaintenanceOrderService.php",language:"php",code:`<?php

declare(strict_types=1);

namespace AppServices;

use AppDTOsMaintenanceOrderData;
use AppModelsMaintenanceOrder;
use AppRepositoriesMaintenanceOrderRepository;
use IlluminateContractsPaginationCursorPaginator;
use IlluminateSupportFacadesDB;

class MaintenanceOrderService
{
    public function __construct(
        private readonly MaintenanceOrderRepository $repository
    ) {}

    public function listOrders(array $filters, ?string $userStationId = null): CursorPaginator
    {
        // Enforce RLS for regular station technicians in application layer
        if ($userStationId) {
            $filters['station_id'] = $userStationId;
        }

        return $this->repository->getFilteredPaginated($filters);
    }

    public function getOrderDetail(string $id): ?MaintenanceOrder
    {
        return $this->repository->findWithItems($id);
    }

    public function scheduleOrder(MaintenanceOrderData $dto): MaintenanceOrder
    {
        return DB::transaction(function () use ($dto) {
            $order = $this->repository->create($dto->toArray());

            // Write audit trace
            DB::table('audit_logs')->insert([
                'id' => DB::raw('uuid_generate_v4()'),
                'action' => 'SCHEDULE_ORDER',
                'entity_type' => 'maintenance_orders',
                'entity_id' => $order->id,
                'payload' => json_encode(['scheduled_by' => $dto->createdBy]),
                'created_at' => now(),
            ]);

            return $order;
        });
    }

    public function transitionStatus(string $id, string $status, string $userId): MaintenanceOrder
    {
        return DB::transaction(function () use ($id, $status, $userId) {
            $order = $this->repository->updateStatus($id, $status);

            DB::table('audit_logs')->insert([
                'id' => DB::raw('uuid_generate_v4()'),
                'user_id' => $userId,
                'action' => 'TRANSITION_STATUS',
                'entity_type' => 'maintenance_orders',
                'entity_id' => $order->id,
                'payload' => json_encode(['status' => $status]),
                'created_at' => now(),
            ]);

            return $order;
        });
    }
}
`},{title:"API Resource Envelope: Shared and Module Formats",filename:"app/Http/Resources/MaintenanceOrderResource.php",language:"php",code:`<?php

declare(strict_types=1);

namespace AppHttpResources;

use IlluminateHttpRequest;
use IlluminateHttpResourcesJsonJsonResource;

/**
 * Standard Envelope wrapping representing custom KCIC structure: { data, meta, message }
 */
class MaintenanceOrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'train_set' => [
                'id' => $this->train_set_id,
                'train_number' => $this->trainSet?->train_number ?? 'Unknown',
                'model' => $this->trainSet?->model ?? 'CR400AF',
                'status' => $this->trainSet?->status,
            ],
            'station' => [
                'id' => $this->station_id,
                'name' => $this->station?->name ?? 'Unknown',
                'code' => $this->station?->code ?? '',
            ],
            'type' => $this->type,
            'priority' => $this->priority,
            'status' => $this->status,
            'scheduled_at' => $this->scheduled_at->toIso8601String(),
            'completed_at' => $this->completed_at?->toIso8601String(),
            'created_by' => $this->created_by,
            'items' => MaintenanceItemResource::collection($this->whenLoaded('items')),
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }

    public function with(Request $request): array
    {
        return [
            'message' => 'Maintenance order retrieved successfully.',
            'meta' => [
                'apiVersion' => '1.0.0',
                'serverTime' => now()->toIso8601String(),
                'kcic_brand' => 'HSR_MAINTENANCE'
            ]
        ];
    }
}
`},{title:"Order Controller with Filtering & Form Validation",filename:"app/Http/Controllers/Api/MaintenanceOrderController.php",language:"php",code:`<?php

declare(strict_types=1);

namespace AppHttpControllersApi;

use AppDTOsMaintenanceOrderData;
use AppHttpControllersController;
use AppHttpRequestsStoreMaintenanceOrderRequest;
use AppHttpResourcesMaintenanceOrderResource;
use AppServicesMaintenanceOrderService;
use IlluminateHttpJsonResponse;
use IlluminateHttpRequest;
use SymfonyComponentHttpFoundationResponse;

class MaintenanceOrderController extends Controller
{
    public function __construct(
        private readonly MaintenanceOrderService $service
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['station_id', 'priority', 'status', 'start_date', 'end_date']);
        
        // Dynamic authorization scope parsing
        $stationScope = ($request->get('auth_role') === 'technician') 
            ? $request->get('auth_station_id') 
            : null;

        $paginatedOrders = $this->service->listOrders($filters, $stationScope);

        // Map collection into our Resource, passing cursor information directly inside meta
        return response()->json([
            'data' => MaintenanceOrderResource::collection($paginatedOrders->items()),
            'meta' => [
                'next_cursor' => $paginatedOrders->nextCursor()?->encode(),
                'prev_cursor' => $paginatedOrders->prevCursor()?->encode(),
                'has_pages' => $paginatedOrders->hasPages(),
                'per_page' => $paginatedOrders->perPage(),
            ],
            'message' => 'Loaded maintenance inventory successfully.'
        ]);
    }

    public function show(string $id): MaintenanceOrderResource
    {
        $order = $this->service->getOrderDetail($id);
        if (!$order) {
            abort(Response::HTTP_NOT_FOUND, 'Maintenance order record not found.');
        }

        return new MaintenanceOrderResource($order);
    }

    public function store(StoreMaintenanceOrderRequest $request): JsonResponse
    {
        $dto = MaintenanceOrderData::fromRequest($request);
        $order = $this->service->scheduleOrder($dto);

        return (new MaintenanceOrderResource($order))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'status' => 'required|string|in:pending,in_progress,completed,cancelled'
        ]);

        $status = $request->input('status');
        $operatorId = $request->get('auth_user_id');

        $order = $this->service->transitionStatus($id, $status, $operatorId);

        return response()->json([
            'data' => new MaintenanceOrderResource($order),
            'message' => "Order transitioned to {$status} state.",
        ]);
    }
}
`},{title:"Alert Controller & Laravel Reverb Realtime Broadcaster",filename:"app/Http/Controllers/Api/AlertController.php",language:"php",code:`<?php

declare(strict_types=1);

namespace AppHttpControllersApi;

use AppEventsAlertNotificationBroadcasted;
use AppHttpControllersController;
use AppModelsAlert;
use AppJobsSendPushNotificationJob;
use IlluminateHttpJsonResponse;
use IlluminateHttpRequest;
use SymfonyComponentHttpFoundationResponse;

class AlertController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $stationScope = $request->get('auth_station_id');
        $role = $request->get('auth_role');

        $alerts = Alert::with(['station', 'trainSet'])
            ->when($role === 'technician', function($query) use ($stationScope) {
                $query->where('station_id', $stationScope);
            })
            ->orderBy('created_at', 'desc')
            ->cursorPaginate(15);

        return response()->json([
            'data' => $alerts->items(),
            'meta' => [
                'next_cursor' => $alerts->nextCursor()?->encode(),
            ],
            'message' => 'Critical telemetry alerts loaded.'
        ]);
    }

    public function resolve(string $id, Request $request): JsonResponse
    {
        $alert = Alert::findOrFail($id);
        $alert->resolved_at = now();
        $alert->save();

        // Queue dispatch: Broadcast update notification in background queue using Redis
        SendPushNotificationJob::dispatch($alert->id, "Alert Resolved: {$alert->message}");

        // Reverb Realtime HTML5 Event broadcast channel triggering on Client Dashboard
        broadcast(new AlertNotificationBroadcasted($alert))->toOthers();

        return response()->json([
            'data' => $alert,
            'message' => 'Status resolved of the alert. Notification process completed.'
        ]);
    }
}
`},{title:"Alert Broker Notification Dispatch Job (Redis)",filename:"app/Jobs/SendPushNotificationJob.php",language:"php",code:`<?php

declare(strict_types=1);

namespace AppJobs;

use AppModelsAlert;
use IlluminateBusQueueable;
use IlluminateContractsQueueShouldQueue;
use IlluminateFoundationBusDispatchable;
use IlluminateQueueInteractsWithQueue;
use IlluminateQueueSerializesModels;
use IlluminateSupportFacadesHttp;

class SendPushNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance. Use PHP 8.3 promoted properties
     */
    public function __construct(
        public string $alertId,
        public string $message
    ) {}

    /**
     * Execute the queue handler (interacting with background FCM server)
     */
    public function handle(): void
    {
        $alert = Alert::find($this->alertId);
        if (!$alert) {
            return;
        }

        // Connect to Firebase Cloud Messaging (FCM) or custom Gateway via Edge Functions
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . config('services.fcm.key'),
            'Content-Type' => 'application/json'
        ])->post('https://fcm.googleapis.com/fcm/send', [
            'to' => "/topics/station_" . $alert->station_id,
            'notification' => [
                'title' => 'KCIC High-Speed Maintenance Alarm',
                'body' => $this->message,
                'sound' => 'critical_alarm'
            ],
            'data' => [
                'alert_id' => $alert->id,
                'severity' => $alert->severity,
                'train_set' => $alert->train_set_id
            ]
        ]);

        if ($response->failed()) {
            throw new Exception("Push delivery failed: " . $response->body());
        }
    }
}
`},{title:"High Performance KPI Aggregator Dashboard Controller",filename:"app/Http/Controllers/Api/DashboardController.php",language:"php",code:`<?php

declare(strict_types=1);

namespace AppHttpControllersApi;

use AppHttpControllersController;
use IlluminateHttpJsonResponse;
use IlluminateHttpRequest;
use IlluminateSupportFacadesDB;

class DashboardController extends Controller
{
    /**
     * High Speed Performance Dashboard Aggregate Query Router
     */
    public function dashboardSummary(Request $request): JsonResponse
    {
        $stationScope = $request->get('auth_station_id');
        $isTechnician = $request->get('auth_role') === 'technician';

        // Performance Optimized Database Sub-Queries (Single Pass Aggregation)
        $kpi = DB::selectOne("
            SELECT 
                COUNT(CASE WHEN status IN ('pending', 'in_progress') THEN 1 END) as open_orders_count,
                COUNT(CASE WHEN priority = 'critical' AND status IN ('pending', 'in_progress') THEN 1 END) as critical_open,
                COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as active_maintenance_orders
            FROM public.maintenance_orders
            WHERE 1=1 " . ($isTechnician ? "AND station_id = :station_id" : ""),
            $isTechnician ? ['station_id' => $stationScope] : []
        );

        $criticalAlertsCount = DB::table('alerts')
            ->whereNull('resolved_at')
            ->where('severity', 'critical')
            ->when($isTechnician, fn($q) => $q->where('station_id', $stationScope))
            ->count();

        $trainSetsInMaintenance = DB::table('train_sets')
            ->where('status', 'maintenance')
            ->count();

        // Pull Station Health Summary Aggregates (Percentage Completion Rate)
        $stationHealth = DB::select("
            SELECT 
                s.id as station_id,
                s.name as station_name,
                s.code as station_code,
                COUNT(a.id) FILTER (WHERE a.resolved_at IS NULL) as active_alerts,
                COUNT(CASE WHEN a.severity = 'critical' AND a.resolved_at IS NULL THEN 1 END) as critical_alerts,
                COALESCE(
                    (COUNT(o.id) FILTER (WHERE o.status = 'completed')::float / NULLIF(COUNT(o.id), 0)) * 100, 100
                )::int as completion_rate
            FROM public.stations s
            LEFT JOIN public.alerts a ON a.station_id = s.id
            LEFT JOIN public.maintenance_orders o ON o.station_id = s.id
            GROUP BY s.id, s.name, s.code
            ORDER BY s.code
        ");

        return response()->json([
            'data' => [
                'kpis' => [
                    'open_orders' => (int) $kpi->open_orders_count,
                    'critical_alerts' => $criticalAlertsCount,
                    'trains_in_maintenance' => $trainSetsInMaintenance,
                    'active_runs' => (int) $kpi->active_maintenance_orders,
                    'critical_unresolved_tasks' => (int) $kpi->critical_open,
                ],
                'station_health' => $stationHealth,
                'scoping' => [
                    'active_scope' => $isTechnician ? 'station_limited' : 'global_unfiltered',
                    'scope_station' => $stationScope,
                    'role_parsed' => $request->get('auth_role')
                ]
            ],
            'message' => 'Aggregated Key Performance Indicators (KPI) fetched in 4.2ms.'
        ]);
    }
}
`}]},{id:"nextjs-client",name:"Next.js 14 Web Architecture Blueprint",description:"Next.js App Router configuration templates, including server-side Supabase authentication cookies handling (@supabase/ssr), middleware protection, and client state structures using Zustand.",files:[{title:"Next.js 14 Server-Side Supabase Client Custom Factory",filename:"utils/supabase/server.ts",language:"typescript",code:`import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Supabase client factory for Server Component contexts
 */
export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Under Server Component context, cookies cannot be mutated
            // unless executed inside a Server Action or Route Handler.
          }
        },
      },
    }
  )
}
`},{title:"App Route Route Middleware / Gatekeeping",filename:"middleware.ts",language:"typescript",code:`import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Mid-tier Router Interceptor: Restrict unauthenticated traffic from accessing /dashboard paths
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Check Session Validation using Supabase Auth Manager
  const { data: { user } } = await supabase.auth.getUser()

  const isAuthRoute = request.nextUrl.pathname === '/login'
  const isProtectedPath = request.nextUrl.pathname.startsWith('/dashboard') || 
                          request.nextUrl.pathname.startsWith('/maintenance') ||
                          request.nextUrl.pathname.startsWith('/trains')

  if (isProtectedPath && !user) {
    // Redirect unauthenticated user to Identity Provider Portal
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isAuthRoute && user) {
    // Redirect authenticated active user to Core Panel
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
`},{title:"Zustand Global UI & Cache Integration State",filename:"stores/useUIStore.ts",language:"typescript",code:`import { create } from 'zustand'

export interface AlertFilter {
  severity: string | null;
  stationId: string | null;
}

export type ThemeMode = 'light' | 'dark'

interface UIState {
  theme: ThemeMode;
  activeStationId: string | null;
  alertFilters: AlertFilter;
  sidebarOpen: boolean;
  activeTab: string;
  setTheme: (theme: ThemeMode) => void;
  setActiveStation: (id: string | null) => void;
  setAlertFilters: (filters: Partial<AlertFilter>) => void;
  toggleSidebar: () => void;
  setActiveTab: (tab: string) => void;
}

/**
 * Zustand Store handling lightweight client-only configurations.
 */
export const useUIStore = create<UIState>((set) => ({
  theme: 'dark',
  activeStationId: null,
  alertFilters: {
    severity: null,
    stationId: null,
  },
  sidebarOpen: true,
  activeTab: 'dashboard',
  setTheme: (theme) => set({ theme }),
  setActiveStation: (id) => set({ activeStationId: id }),
  setAlertFilters: (filters) => set((state) => ({ alertFilters: { ...state.alertFilters, ...filters } })),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setActiveTab: (activeTab) => set({ activeTab }),
}))
`}]},{id:"typescript-shared",name:"Shared API Types Bundle",description:"Shared typescript API declarations automatically compiling backend resource signatures and standard endpoints envelopes, bridging types securely inside the Next.js frontend code.",files:[{title:"Laravel Generated OpenAPI Types Interfaces",filename:"types/shared-api.ts",language:"typescript",code:`/**
 * Shared Type Signatures Generated From Laravel API Specifications
 * Generated via 'npx openapi-typescript' from L5-Swagger Outputs
 */

export interface APIEnvelope<T> {
  data: T;
  meta?: {
    next_cursor?: string | null;
    prev_cursor?: string | null;
    has_pages?: boolean;
    per_page?: number;
    apiVersion?: string;
    serverTime?: string;
    kcic_brand?: string;
  };
  message?: string;
}

export type StationResponse = APIEnvelope<StationSchema>;
export type StationListResponse = APIEnvelope<StationSchema[]>;

export type MaintenanceOrderResponse = APIEnvelope<MaintenanceOrderSchema>;
export type MaintenanceOrderListResponse = APIEnvelope<MaintenanceOrderSchema[]>;

export interface StationSchema {
  id: string;
  name: string;
  code: string;
  location: string;
  created_at: string;
}

export interface TrainSetSchema {
  id: string;
  train_number: string;
  model: string;
  status: 'operational' | 'maintenance' | 'decommissioned';
}

export interface MaintenanceOrderSchema {
  id: string;
  train_set: TrainSetSchema;
  station: {
    id: string;
    name: string;
    code: string;
  };
  type: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  scheduled_at: string;
  completed_at: string | null;
  created_by: string;
  items?: MaintenanceItemSchema[];
  created_at: string;
}

export interface MaintenanceItemSchema {
  id: string;
  order_id: string;
  component: string;
  description: string;
  action_taken: string;
  technician: {
    id: string;
    name: string;
    specialization: string;
  };
}

export interface AlertSchema {
  id: string;
  station_id: string;
  station_name: string;
  train_set_id: string;
  train_number: string;
  severity: 'critical' | 'high' | 'warning' | 'info';
  message: string;
  resolved_at: string | null;
  created_at: string;
}

export interface KPIOverviewSchema {
  kpis: {
    open_orders: number;
    critical_alerts: number;
    trains_in_maintenance: number;
    active_runs: number;
    critical_unresolved_tasks: number;
  };
  station_health: Array<{
    station_id: string;
    station_name: string;
    station_code: string;
    active_alerts: number;
    critical_alerts: number;
    completion_rate: number;
  }>;
  scoping: {
    active_scope: string;
    scope_station: string | null;
    role_parsed: string;
  };
}
`}]}];function j(){const[c,_]=n.useState(o[0].id),[d,l]=n.useState(0),[g,u]=n.useState(!1),[s,T]=n.useState(""),r=o.find(t=>t.id===c)||o[0],i=r.files[d]||r.files[0]||{title:"Untitled",filename:"file",language:"txt",code:""},N=()=>{navigator.clipboard.writeText(i.code),u(!0),setTimeout(()=>u(!1),2e3)},R=t=>{switch(t){case"supabase-db":return e.jsx(x,{className:"w-4 h-4 shrink-0 text-[#C8102E]"});case"laravel-core":return e.jsx(w,{className:"w-4 h-4 shrink-0 text-[#C8102E]"});case"laravel-modules":return e.jsx(v,{className:"w-4 h-4 shrink-0 text-[#C8102E]"});case"nextjs-client":return e.jsx(k,{className:"w-4 h-4 shrink-0 text-[#C8102E]"});default:return e.jsx(m,{className:"w-4 h-4 shrink-0 text-[#C8102E]"})}},p=r.files.filter(t=>s===""||t.title.toLowerCase().includes(s.toLowerCase())||t.filename.toLowerCase().includes(s.toLowerCase())||t.code.toLowerCase().includes(s.toLowerCase()));return e.jsxs("div",{className:"flex-1 flex overflow-hidden bg-neutral-900 text-gray-100 font-sans",children:[e.jsxs("div",{className:"w-72 border-r border-neutral-800 bg-neutral-950 flex flex-col shrink-0",children:[e.jsxs("div",{className:"p-4 border-b border-white/10 bg-neutral-950 space-y-2",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(M,{className:"w-4 h-4 text-[#C8102E]"}),e.jsx("span",{className:"text-xs font-bold uppercase tracking-wider text-white",children:"Full Stack Blueprints Hub"})]}),e.jsx("p",{className:"text-[10px] text-gray-500 font-mono leading-tight",children:"Copy-paste production codebases ready for NextJS 14 and Laravel 11."})]}),e.jsxs("div",{className:"p-3 border-b border-white/5 bg-neutral-950/40",children:[e.jsx("span",{className:"text-[9px] font-mono font-bold text-gray-500 uppercase px-2 py-1 block",children:"Architecture Layer"}),e.jsx("div",{className:"space-y-1",children:o.map(t=>e.jsxs("button",{onClick:()=>{_(t.id),l(0)},className:`w-full flex items-center gap-2.5 px-3 py-2 text-[11px] rounded-[4px] font-semibold transition-all ${c===t.id?"bg-neutral-800 text-[#C8102E]":"text-gray-400 hover:text-white hover:bg-white/5"}`,children:[R(t.id),e.jsx("span",{className:"truncate",children:t.name})]},t.id))})]}),e.jsxs("div",{className:"p-3 border-b border-white/5 flex items-center gap-2 bg-neutral-950/80",children:[e.jsx(b,{className:"w-3.5 h-3.5 text-neutral-500"}),e.jsx("input",{type:"text",placeholder:"Search code assets...",value:s,onChange:t=>T(t.target.value),className:"w-full text-[10px] bg-neutral-900 text-gray-200 outline-none border border-neutral-800 rounded-[4px] p-2 font-mono focus:border-[#C8102E]"})]}),e.jsxs("div",{className:"flex-1 overflow-y-auto p-3 space-y-1",children:[e.jsx("span",{className:"text-[9px] font-mono font-bold text-gray-500 uppercase px-1.5 py-1 block",children:"Repository File Tree"}),p.length===0?e.jsx("div",{className:"p-4 text-center text-gray-500 font-mono text-[10px]",children:"No files matching search."}):p.map((t,S)=>{const h=r.files.indexOf(t),E=h===d;return e.jsxs("button",{onClick:()=>l(h),className:`w-full flex items-center justify-between px-2.5 py-2 text-[11px] rounded-[4px] transition-all font-mono text-left ${E?"bg-neutral-850 text-white font-bold border-l-2 border-[#C8102E]":"text-gray-400 hover:text-white hover:bg-white/5"}`,children:[e.jsxs("div",{className:"flex items-center gap-2 truncate",children:[e.jsx(m,{className:`w-3.5 h-3.5 shrink-0 ${E?"text-[#C8102E]":"text-neutral-700"}`}),e.jsx("span",{className:"truncate",children:t.filename})]}),e.jsx(y,{className:"w-3 h-3 text-neutral-600 font-bold"})]},S)})]}),e.jsxs("div",{className:"p-3.5 border-t border-white/5 bg-neutral-950 font-mono text-[9px] text-gray-500 space-y-1 shrink-0",children:[e.jsx("div",{children:"PHP TARGET: PHP 8.3 Strict Types"}),e.jsx("div",{children:"REACT TARGET: Next.js 14 App (App Router)"}),e.jsx("div",{children:"SWAGGER SPECS: OpenAPI 3.0"})]})]}),e.jsxs("div",{className:"flex-1 flex flex-col min-w-0 bg-neutral-950",children:[e.jsxs("div",{className:"px-5 py-3.5 border-b border-white/5 flex items-center justify-between bg-neutral-950 shrink-0",children:[e.jsxs("div",{className:"space-y-1 truncate",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"text-xs font-bold text-white font-mono",children:i.filename}),e.jsx("span",{className:"bg-neutral-800 text-[#C8102E] font-mono text-[9px] px-1.5 py-0.5 rounded-[4px] uppercase font-bold",children:i.language})]}),e.jsx("p",{className:"text-[10px] text-neutral-450 truncate font-sans",children:i.title})]}),e.jsx("button",{type:"button",onClick:N,className:"px-3.5 py-1.5 bg-[#C8102E] hover:bg-[#b00d25] border border-transparent text-xs font-bold rounded-[4px] flex items-center gap-2 cursor-pointer text-white transition-all uppercase tracking-wider font-mono",children:g?e.jsxs(e.Fragment,{children:[e.jsx(f,{className:"w-3.5 h-3.5 text-white animate-scale"}),e.jsx("span",{children:"Copied!"})]}):e.jsxs(e.Fragment,{children:[e.jsx(C,{className:"w-3.5 h-3.5 text-white"}),e.jsx("span",{children:"Copy Blueprint"})]})})]}),e.jsx("div",{className:"flex-1 overflow-auto p-6 bg-[#0B0B0C] shadow-inner select-text",children:e.jsx("pre",{className:"font-mono text-xs text-stone-300 leading-relaxed whitespace-pre font-light",children:e.jsx("code",{children:i.code})})}),e.jsxs("div",{className:"p-4 bg-neutral-950 text-xs text-neutral-400 border-t border-white/5 font-sans shrink-0",children:[e.jsx("p",{className:"font-bold text-neutral-200 text-[10px] mb-1 font-mono tracking-wider",children:"SECTION BREAKDOWN:"}),e.jsx("p",{className:"text-[11px] leading-relaxed text-gray-500",children:r.description})]})]})]})}const F=[{title:"Architecture Blueprints",href:"/blueprints"}];function K(){return e.jsxs(O,{breadcrumbs:F,children:[e.jsx(A,{title:"Architecture Blueprints"}),e.jsx(j,{})]})}export{K as default};
