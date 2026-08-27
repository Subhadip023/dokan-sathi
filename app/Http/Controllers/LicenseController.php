<?php

namespace App\Http\Controllers;

use App\Models\License;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LicenseController extends Controller
{
    /**
     * Display a listing of dokan licenses.
     */
    public function index(Request $request): Response
    {
        $dokan = $request->user()->currentDokan();
        if (!$dokan) {
            abort(404, 'No store found.');
        }

        $licenses = License::where('dokan_id', $dokan->id)
            ->latest('id')
            ->get();

        return Inertia::render('license/index', [
            'licenses' => $licenses,
        ]);
    }

    /**
     * Store a newly created license in storage.
     */
    public function store(Request $request)
    {
        $dokan = $request->user()->currentDokan();
        if (!$dokan) {
            abort(404, 'No store found.');
        }

        $validated = $request->validate([
            'name'      => 'required|string|max:255',
            'number'    => 'required|string|max:255',
            'is_active' => 'boolean',
        ]);

        License::create([
            'dokan_id'  => $dokan->id,
            'name'      => $validated['name'],
            'number'    => $validated['number'],
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return redirect()->back()->with('success', 'License added successfully.');
    }

    /**
     * Update the specified license in storage.
     */
    public function update(Request $request, License $license)
    {
        $dokan = $request->user()->currentDokan();
        if (!$dokan || $license->dokan_id !== $dokan->id) {
            abort(403);
        }

        $validated = $request->validate([
            'name'      => 'required|string|max:255',
            'number'    => 'required|string|max:255',
            'is_active' => 'boolean',
        ]);

        $license->update([
            'name'      => $validated['name'],
            'number'    => $validated['number'],
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return redirect()->back()->with('success', 'License updated successfully.');
    }

    /**
     * Remove the specified license from storage.
     */
    public function destroy(Request $request, License $license)
    {
        $dokan = $request->user()->currentDokan();
        if (!$dokan || $license->dokan_id !== $dokan->id) {
            abort(403);
        }

        $license->delete();

        return redirect()->back()->with('success', 'License deleted successfully.');
    }
}
