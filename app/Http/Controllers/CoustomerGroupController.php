<?php

namespace App\Http\Controllers;

use App\Models\CoustomerGroup;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CoustomerGroupController extends Controller
{
    /**
     * Store a newly created customer group.
     */
    public function store(Request $request)
    {
        $dokan = $request->user()->currentDokan();
        if (!$dokan) {
            abort(404, 'No store found.');
        }

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('coustomer_groups')->where('dokan_id', $dokan->id),
            ],
            'discount_type' => 'required|integer|in:1,2,3',
            'discount_value' => 'required|numeric|min:0',
            'is_active' => 'boolean',
        ]);

        $group = CoustomerGroup::create([
            'dokan_id' => $dokan->id,
            'name' => $validated['name'],
            'discount_type' => $validated['discount_type'],
            'discount_value' => $validated['discount_value'],
            'is_active' => $request->boolean('is_active', true),
        ]);

        return redirect()->back()->with('success', "Customer group '{$group->name}' created successfully.");
    }

    /**
     * Update the specified customer group.
     */
    public function update(Request $request, CoustomerGroup $coustomer_group)
    {
        $dokan = $request->user()->currentDokan();
        if (!$dokan || $coustomer_group->dokan_id !== $dokan->id) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('coustomer_groups')->where('dokan_id', $dokan->id)->ignore($coustomer_group->id),
            ],
            'discount_type' => 'required|integer|in:1,2,3',
            'discount_value' => 'required|numeric|min:0',
            'is_active' => 'boolean',
        ]);

        $coustomer_group->update([
            'name' => $validated['name'],
            'discount_type' => $validated['discount_type'],
            'discount_value' => $validated['discount_value'],
            'is_active' => $request->boolean('is_active', true),
        ]);

        return redirect()->back()->with('success', "Customer group '{$coustomer_group->name}' updated successfully.");
    }

    /**
     * Remove the specified customer group.
     */
    public function destroy(Request $request, CoustomerGroup $coustomer_group)
    {
        $dokan = $request->user()->currentDokan();
        if (!$dokan || $coustomer_group->dokan_id !== $dokan->id) {
            abort(403, 'Unauthorized action.');
        }

        $name = $coustomer_group->name;
        $coustomer_group->delete();

        return redirect()->back()->with('success', "Customer group '{$name}' deleted successfully.");
    }
}
