<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $currentDokanId = $this->user()->currentDokan()?->id;

        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'reorder_level' => 'required|integer|min:0',
            'purchased_packets' => 'required|integer|min:0',
            'packet_size' => 'required|integer|min:1',
            'cost_rate' => 'required|numeric|min:0',
            'selling_rate' => 'required|numeric|min:0',
            'dokan_id' => [
                'required',
                Rule::exists('dokans', 'id')->where(function ($query) use ($currentDokanId) {
                    return $query->where('id', $currentDokanId);
                }),
            ],
        ];
    }
}
