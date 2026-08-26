<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateInvestmentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return !$this->user()->isEmployee();
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
            'investor_name' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0.01',
            'investment_date' => 'required|date',
            'payment_method' => 'nullable|string|max:100',
            'note' => 'nullable|string|max:1000',
            'dokan_id' => [
                'required',
                Rule::exists('dokans', 'id')->where(function ($query) use ($currentDokanId) {
                    return $query->where('id', $currentDokanId);
                }),
            ],
        ];
    }
}
