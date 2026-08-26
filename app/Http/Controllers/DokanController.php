<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class DokanController extends Controller
{
    /**
     * Show the form for editing the current Dokan settings.
     */
    public function edit(Request $request)
    {
        $user = $request->user();
        if (!$user->isOwner()) {
            abort(403, 'Only store owners can modify store settings.');
        }

        $dokan = $user->currentDokan();

        return Inertia::render('dokan/edit', [
            'dokan' => $dokan,
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
            ],
        ]);
    }

    /**
     * Update the current Dokan details (name, slug, phone, email, location, description, logo).
     */
    public function update(Request $request)
    {
        $user = $request->user();
        if (!$user->isOwner()) {
            abort(403, 'Only store owners can modify store settings.');
        }

        $dokan = $user->currentDokan();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:dokans,slug,' . ($dokan?->id ?? 0),
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'location' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:1000',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
            'remove_logo' => 'nullable|boolean',
        ]);

        if ($dokan) {
            $slug = !empty($validated['slug'])
                ? \Illuminate\Support\Str::slug($validated['slug'])
                : \Illuminate\Support\Str::slug($validated['name']);

            $updateData = [
                'name' => $validated['name'],
                'slug' => $slug,
                'phone' => $validated['phone'] ?? null,
                'email' => $validated['email'] ?? null,
                'location' => $validated['location'] ?? null,
                'description' => $validated['description'] ?? null,
            ];

            if ($request->boolean('remove_logo')) {
                if ($dokan->logo && Storage::disk('public')->exists($dokan->logo)) {
                    Storage::disk('public')->delete($dokan->logo);
                }
                $updateData['logo'] = null;
            } elseif ($request->hasFile('logo')) {
                if ($dokan->logo && Storage::disk('public')->exists($dokan->logo)) {
                    Storage::disk('public')->delete($dokan->logo);
                }
                $path = $request->file('logo')->store('dokans/logos', 'public');
                $updateData['logo'] = $path;
            }

            $dokan->update($updateData);
        }

        if (!empty($validated['phone'])) {
            $user->update([
                'phone' => $validated['phone'],
            ]);
        }

        return redirect()->back()->with('success', 'Store details updated successfully!');
    }
}
