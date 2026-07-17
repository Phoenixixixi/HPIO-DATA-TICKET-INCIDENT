<?php

namespace App\Http\Controllers;

use App\Models\ShiftSchedule;
use App\Models\ShiftConfig;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class ShiftScheduleController extends Controller
{
    /**
     * Display the shift schedule page for the given month.
     */
    public function index(Request $request)
    {
        // Default to current month
        $month = $request->has('month')
            ? $request->month
            : Carbon::now()->format('Y-m');

        $shifts = ShiftSchedule::where('month', $month)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        $configs = ShiftConfig::orderBy('id')->get();

        return Inertia::render('shift-schedule', [
            'shifts'  => $shifts,
            'month'   => $month,
            'configs' => $configs,
        ]);
    }

    /**
     * Update a single shift cell (day) for an employee row.
     */
    public function updateCell(Request $request, $id)
    {
        $validated = $request->validate([
            'day'   => 'required|integer|min:1|max:31',
            'shift' => 'required|string|max:50',
        ]);

        $schedule = ShiftSchedule::findOrFail($id);
        $shifts = $schedule->shifts;
        $shifts[$validated['day']] = $validated['shift'];
        $schedule->shifts = $shifts;
        $schedule->save();

        return response()->json(['success' => true, 'data' => $schedule]);
    }

    /**
     * Swap two cells (drag-and-drop between different rows/days).
     */
    public function swapCells(Request $request)
    {
        $validated = $request->validate([
            'source_id'  => 'required|integer|exists:shift_schedules,id',
            'source_day' => 'required|integer|min:1|max:31',
            'target_id'  => 'required|integer|exists:shift_schedules,id',
            'target_day' => 'required|integer|min:1|max:31',
        ]);

        $source = ShiftSchedule::findOrFail($validated['source_id']);
        $target = ShiftSchedule::findOrFail($validated['target_id']);

        $sourceShifts = $source->shifts;
        $targetShifts = $target->shifts;

        $sourceShift = $sourceShifts[$validated['source_day']] ?? 'LIBUR';
        $targetShift = $targetShifts[$validated['target_day']] ?? 'LIBUR';

        // Swap values
        $sourceShifts[$validated['source_day']] = $targetShift;
        $targetShifts[$validated['target_day']] = $sourceShift;

        $source->shifts = $sourceShifts;
        $target->shifts = $targetShifts;

        $source->save();
        $target->save();

        return response()->json([
            'success' => true,
            'source'  => $source->fresh(),
            'target'  => $target->fresh(),
        ]);
    }

    /**
     * Update sort_order for all rows (reorder employees by drag).
     */
    public function reorder(Request $request)
    {
        $validated = $request->validate([
            'order'   => 'required|array',
            'order.*' => 'integer|exists:shift_schedules,id',
        ]);

        foreach ($validated['order'] as $index => $id) {
            ShiftSchedule::where('id', $id)->update(['sort_order' => $index]);
        }

        return response()->json(['success' => true]);
    }

    /**
     * Bulk update all shifts and sort orders for the current month.
     */
    public function bulkUpdate(Request $request)
    {
        $validated = $request->validate([
            'rows' => 'required|array',
            'rows.*.id' => 'required|integer|exists:shift_schedules,id',
            'rows.*.shifts' => 'required|array',
            'rows.*.sort_order' => 'required|integer',
        ]);

        foreach ($validated['rows'] as $rowData) {
            ShiftSchedule::where('id', $rowData['id'])->update([
                'shifts' => $rowData['shifts'],
                'sort_order' => $rowData['sort_order'],
            ]);
        }

        return redirect()->back();
    }

    /**
     * Add a new employee to the schedule.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_name' => 'required|string|max:100',
            'nip'           => 'nullable|string|max:30',
            'no_hp'         => 'nullable|string|max:20',
            'month'         => 'required|date_format:Y-m',
        ]);

        $year = (int) substr($validated['month'], 0, 4);
        $month = (int) substr($validated['month'], 5, 2);
        $daysInMonth = Carbon::create($year, $month, 1)->daysInMonth;

        $initialShifts = [];
        for ($i = 1; $i <= $daysInMonth; $i++) {
            $initialShifts[$i] = 'LIBUR';
        }

        $schedule = ShiftSchedule::create([
            'employee_name' => $validated['employee_name'],
            'nip'           => $validated['nip'],
            'no_hp'         => $validated['no_hp'],
            'month'         => $validated['month'],
            'shifts'        => $initialShifts,
            'sort_order'    => ShiftSchedule::where('month', $validated['month'])->max('sort_order') + 1,
        ]);

        return redirect()->back();
    }

    /**
     * Copy all employees from previous month to a new month.
     */
    public function copyMonth(Request $request)
    {
        $validated = $request->validate([
            'from_month' => 'required|date_format:Y-m',
            'to_month'   => 'required|date_format:Y-m',
            'overwrite'  => 'boolean',
        ]);

        $existing = ShiftSchedule::where('month', $validated['to_month'])->count();
        if ($existing > 0) {
            if (empty($validated['overwrite'])) {
                return back()->withErrors(['to_month' => 'Target month already has data.']);
            }
            // Overwrite: delete existing data for target month first
            ShiftSchedule::where('month', $validated['to_month'])->delete();
        }

        $sourceRows = ShiftSchedule::where('month', $validated['from_month'])->get();

        $year = (int) substr($validated['to_month'], 0, 4);
        $month = (int) substr($validated['to_month'], 5, 2);
        $daysInMonth = Carbon::create($year, $month, 1)->daysInMonth;

        foreach ($sourceRows as $row) {
            // Start with the source shifts so the schedule is preserved.
            // Days that don't exist in the target month are dropped;
            // any extra days (target longer than source) default to LIBUR.
            $copiedShifts = [];
            for ($i = 1; $i <= $daysInMonth; $i++) {
                $copiedShifts[$i] = $row->shifts[$i] ?? 'LIBUR';
            }

            ShiftSchedule::create([
                'employee_name' => $row->employee_name,
                'nip'           => $row->nip,
                'no_hp'         => $row->no_hp,
                'month'         => $validated['to_month'],
                'shifts'        => $copiedShifts,
                'sort_order'    => $row->sort_order,
            ]);
        }

        return redirect()->route('shift-schedule', ['month' => $validated['to_month']]);
    }

    /**
     * Remove an employee row.
     */
    public function destroy($id)
    {
        ShiftSchedule::findOrFail($id)->delete();
        return response()->json(['success' => true]);
    }

    /**
     * Update shift start and end times configuration.
     */
    public function updateConfigs(Request $request)
    {
        $validated = $request->validate([
            'configs' => 'required|array',
            'configs.*.id' => 'required|integer|exists:shift_configs,id',
            'configs.*.start_time' => 'required|string',
            'configs.*.end_time' => 'required|string',
        ]);

        foreach ($validated['configs'] as $cfgData) {
            ShiftConfig::where('id', $cfgData['id'])->update([
                'start_time' => $cfgData['start_time'],
                'end_time' => $cfgData['end_time'],
            ]);
        }

        return redirect()->back();
    }
}
