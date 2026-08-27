<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSaleRequest extends FormRequest
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
            'sale_date' => 'required|date',
            'customer_id' => [
                'nullable',
                Rule::exists('coustomers', 'id')->where(function ($query) {
                    return $query->where('dokan_id', $this->dokan_id);
                }),
            ],
            'items' => 'required|array|min:1',
            'items.*.product_id' => [
                'required',
                Rule::exists('products', 'id')->where(function ($query) {
                    return $query->where('dokan_id', $this->dokan_id);
                }),
            ],
            'items.*.qty' => 'required|integer|min:1',
            'items.*.discount' => 'nullable|numeric|min:0',
            'order_discount' => 'nullable|numeric|min:0',
            'payment_status' => 'nullable|string|in:full_paid,partially_paid,credit',
            'paid_amount' => 'nullable|numeric|min:0',
            'dokan_id' => [
                'required',
                Rule::exists('dokans', 'id')->where(function ($query) use ($currentDokanId) {
                    return $query->where('id', $currentDokanId);
                }),
            ],
        ];
    }
}
