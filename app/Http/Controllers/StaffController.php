<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class StaffController extends Controller
{
    /**
     * Display a listing of staff members for the current Dokan.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        if (!$user->isOwner()) {
            abort(403, 'Only store owners can manage store staff.');
        }

        $dokan = $user->currentDokan();
        if (!$dokan) {
            abort(404, 'No store found.');
        }

        $staff = User::where('dokan_id', $dokan->id)
            ->orWhere('id', $dokan->owner_id)
            ->orderBy('role', 'asc')
            ->orderBy('name', 'asc')
            ->get();

        return Inertia::render('staff/index', [
            'staff' => $staff,
            'dokan' => $dokan,
        ]);
    }

    /**
     * Store a newly created staff member in storage.
     */
    public function store(Request $request)
    {
        $user = $request->user();
        if (!$user->isOwner()) {
            abort(403, 'Only store owners can add staff members.');
        }

        $dokan = $user->currentDokan();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'nullable|string|max:20',
            'password' => 'required|string|min:8',
            'role' => ['required', 'integer', Rule::in([User::ROLE_ADMIN, User::ROLE_EMPLOYEE])],
        ]);

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'dokan_id' => $dokan->id,
        ]);

        return redirect()->back()->with('success', 'Staff member added successfully!');
    }

    /**
     * Update the specified staff member in storage.
     */
    public function update(Request $request, User $staff)
    {
        $user = $request->user();
        if (!$user->isOwner()) {
            abort(403, 'Only store owners can modify staff details.');
        }

        $dokan = $user->currentDokan();
        if ($staff->dokan_id !== $dokan->id && $staff->id !== $dokan->owner_id) {
            abort(403, 'Unauthorized staff modification.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($staff->id)],
            'phone' => 'nullable|string|max:20',
            'password' => 'nullable|string|min:8',
            'role' => ['required', 'integer', Rule::in([User::ROLE_ADMIN, User::ROLE_EMPLOYEE])],
        ]);

        $updateData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'role' => $validated['role'],
        ];

        if (!empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $staff->update($updateData);

        return redirect()->back()->with('success', 'Staff member updated successfully!');
    }

    /**
     * Remove the specified staff member from storage.
     */
    public function destroy(Request $request, User $staff)
    {
        $user = $request->user();
        if (!$user->isOwner()) {
            abort(403, 'Only store owners can remove staff members.');
        }

        $dokan = $user->currentDokan();

        if ($staff->id === $dokan->owner_id || $staff->id === $user->id) {
            return redirect()->back()->with('error', 'The primary store owner account cannot be deleted.');
        }

        if ($staff->dokan_id !== $dokan->id) {
            abort(403, 'Unauthorized action.');
        }

        $staff->delete();

        return redirect()->back()->with('success', 'Staff member removed successfully!');
    }
}
