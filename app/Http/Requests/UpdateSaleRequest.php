<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSaleRequest extends FormRequest
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
            'sale_date' => 'required|date',
            'customer_id' => [
                'nullable',
                Rule::exists('coustomers', 'id')->where(function ($query) {
                    return $query->where('dokan_id', $this->dokan_id);
                }),
            ],
            'product_id' => [
                'required',
                Rule::exists('products', 'id')->where(function ($query) {
                    return $query->where('dokan_id', $this->dokan_id);
                }),
            ],
            'qty' => 'required|integer|min:1',
            'discount' => 'nullable|numeric|min:0',
            'dokan_id' => [
                'required',
                Rule::exists('dokans', 'id')->where(function ($query) {
                    return $query->where('owner_id', $this->user()->id);
                }),
            ],
        ];
    }
}
