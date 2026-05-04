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
        return [
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:1',
            'quantity' => 'required|integer|min:1',
            'description' => 'nullable|string',
            'reorder_level' => 'required|integer|min:0',
            'dokan_id' => [
                'required',
                    Rule::exists('dokans', 'id')->where(function ($query) {
                        return $query->where('owner_id', $this->user()->id);
                        }),
                    ],
        ];
    }
}
