<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Invoice #INV-{{ sprintf('%05d', $firstSale->id) }} - {{ $dokan->name }}</title>
  <style>
    @page {
      size: A4;
      margin: 24px 30px;
    }
    body {
      font-family: 'DejaVu Sans', sans-serif;
      margin: 0;
      padding: 0;
      color: #1e293b;
      background: #ffffff;
      font-size: 10.5px;
      line-height: 1.4;
    }
    
    /* Header */
    .header-table {
      width: 100%;
      border-collapse: collapse;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 8px;
      margin-bottom: 12px;
    }
    .memo-tag {
      font-size: 8.5px;
      font-weight: bold;
      letter-spacing: 1.5px;
      color: #64748b;
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    .store-name {
      font-size: 20px;
      font-weight: bold;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0;
    }
    .store-desc {
      font-size: 9.5px;
      color: #475569;
      margin: 2px 0;
    }
    .store-meta {
      font-size: 9px;
      color: #334155;
      margin-top: 4px;
      line-height: 1.4;
    }

    /* Info Table */
    .info-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 14px;
    }
    .info-table td {
      vertical-align: top;
      font-size: 10px;
      line-height: 1.45;
    }
    .info-block-title {
      font-size: 8.5px;
      font-weight: bold;
      text-transform: uppercase;
      color: #64748b;
      letter-spacing: 0.5px;
      margin-bottom: 3px;
    }
    .party-name {
      font-size: 12px;
      font-weight: bold;
      color: #0f172a;
    }

    /* Items Table */
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 6px;
    }
    .items-table th {
      background-color: #0f172a;
      color: #ffffff;
      font-size: 9.5px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 6px 8px;
      border: 1px solid #0f172a;
    }
    .items-table td {
      border: 1px solid #cbd5e1;
      padding: 6px 8px;
      vertical-align: middle;
      font-size: 10px;
    }
    .items-table tr:nth-child(even) td {
      background-color: #f8fafc;
    }
    .text-right {
      text-align: right;
    }
    .text-center {
      text-align: center;
    }
    .product-title {
      font-weight: bold;
      color: #0f172a;
    }
    .product-sub {
      font-size: 8.5px;
      color: #64748b;
      margin-top: 1px;
    }

    /* Totals */
    .calc-row td {
      border: 1px solid #cbd5e1;
      padding: 5px 8px;
      background-color: #ffffff !important;
    }
    .grand-total-row td {
      border: 1px solid #0f172a;
      background-color: #f1f5f9 !important;
      font-size: 11px;
      font-weight: bold;
      color: #0f172a;
      padding: 7px 8px;
    }

    /* In Words Banner */
    .words-banner {
      margin-top: 10px;
      padding: 6px 10px;
      background-color: #f8fafc;
      border-left: 3px solid #0f172a;
      font-size: 9.5px;
    }

    /* Footer & Signatures */
    .footer-table {
      width: 100%;
      margin-top: 28px;
      border-collapse: collapse;
      page-break-inside: avoid;
    }
    .footer-table td {
      vertical-align: bottom;
      font-size: 9.5px;
    }
    .terms-box {
      font-size: 8.5px;
      color: #64748b;
      line-height: 1.4;
    }
    .sig-box {
      text-align: center;
      width: 180px;
    }
    .sig-line {
      border-top: 1px dashed #94a3b8;
      margin-top: 45px;
      padding-top: 4px;
      font-size: 9px;
      font-weight: bold;
      color: #334155;
    }
  </style>
</head>
<body>

@php
    $grossSubtotal = $sales->sum(fn($s) => $s->qty * $s->rate);
    $totalDiscount = $sales->sum('discount');
    $grandTotal = $sales->sum('total_amount');
    $customer = $firstSale->customer;
    $activeLicenses = $dokan->licenses ? $dokan->licenses->where('is_active', true) : collect();

    if (!function_exists('convertNumberToWords')) {
        function convertNumberToWords($number) {
            $number = round($number, 2);
            $words = [
                0 => 'Zero', 1 => 'One', 2 => 'Two', 3 => 'Three', 4 => 'Four',
                5 => 'Five', 6 => 'Six', 7 => 'Seven', 8 => 'Eight', 9 => 'Nine',
                10 => 'Ten', 11 => 'Eleven', 12 => 'Twelve', 13 => 'Thirteen',
                14 => 'Fourteen', 15 => 'Fifteen', 16 => 'Sixteen', 17 => 'Seventeen',
                18 => 'Eighteen', 19 => 'Nineteen', 20 => 'Twenty', 30 => 'Thirty',
                40 => 'Forty', 50 => 'Fifty', 60 => 'Sixty', 70 => 'Seventy',
                80 => 'Eighty', 90 => 'Ninety'
            ];

            $digits = ['', 'Hundred', 'Thousand', 'Lakh', 'Crore'];
            $no = floor($number);
            $point = round($number - $no, 2) * 100;
            $hundred = null;
            $digits_length = strlen($no);
            $i = 0;
            $str = [];

            while ($i < $digits_length) {
                $divider = ($i == 2) ? 10 : 100;
                $number = floor($no % $divider);
                $no = floor($no / $divider);
                $i += ($divider == 10) ? 1 : 2;
                if ($number) {
                    $plural = (($counter = count($str)) && $number > 9) ? '' : null;
                    $hundred = ($counter == 1 && $str[0]) ? ' and ' : null;
                    $str[] = ($number < 21) ? $words[$number] . ' ' . $digits[$counter] . $plural . ' ' . $hundred
                        : $words[floor($number / 10) * 10] . ' ' . $words[$number % 10] . ' ' . $digits[$counter] . $plural . ' ' . $hundred;
                } else {
                    $str[] = null;
                }
            }

            $Rupees = implode('', array_reverse($str));
            $paise = ($point > 0) ? " and " . ($words[$point / 10 * 10] ?? $words[floor($point / 10) * 10] . ' ' . $words[$point % 10]) . ' Paise' : '';
            return trim($Rupees ? $Rupees . 'Rupees' . $paise . ' Only' : 'Zero Rupees Only');
        }
    }

    $amountInWords = convertNumberToWords($grandTotal);

    $invPaymentStatus = $firstSale->payment_status ?? 'full_paid';
    $invPaidAmount = $sales->sum('paid_amount');
    $invDueAmount = $sales->sum('due_amount');
    if ($invPaymentStatus === 'full_paid' || $invDueAmount <= 0) {
        $invStatusLabel = 'FULL PAID';
        $invStatusColor = '#047857';
        $invPaidAmount = $grandTotal;
        $invDueAmount = 0;
    } elseif ($invPaymentStatus === 'credit' || $invPaidAmount <= 0) {
        $invStatusLabel = 'CREDIT / DUE';
        $invStatusColor = '#dc2626';
        $invPaidAmount = 0;
        $invDueAmount = $grandTotal;
    } else {
        $invStatusLabel = 'PARTIALLY PAID';
        $invStatusColor = '#d97706';
    }
@endphp

  <!-- Header -->
  <table class="header-table">
    <tr>
      <td style="width: 70%; vertical-align: top;">
        <div class="memo-tag">Tax / Retail Invoice</div>
        <h1 class="store-name">{{ $dokan->name }}</h1>
        @if($dokan->description)
          <div class="store-desc">{{ $dokan->description }}</div>
        @endif
        @if($dokan->location)
          <div class="store-desc">{{ $dokan->location }}</div>
        @endif
        <div class="store-meta">
          @if($dokan->phone || ($dokan->owner && $dokan->owner->phone))
            <strong>Phone:</strong> {{ $dokan->phone ?? $dokan->owner->phone }}
          @endif
          @if($dokan->email || ($dokan->owner && $dokan->owner->email))
            | <strong>Email:</strong> {{ $dokan->email ?? $dokan->owner->email }}
          @endif
          @if($activeLicenses->count() > 0)
            <br>
            @foreach($activeLicenses as $lic)
              <strong>{{ $lic->name }}:</strong> {{ $lic->number }}@if(!$loop->last) &bull; @endif
            @endforeach
          @endif
        </div>
      </td>
      <td style="width: 30%; text-align: right; vertical-align: top;">
        <div style="font-size: 16px; font-weight: bold; color: #047857; text-transform: uppercase;">Invoice</div>
        <div style="font-size: 10px; color: #475569; margin-top: 4px;">
          <strong>Invoice No:</strong> #TS/{{ date('Y') }}/{{ sprintf('%03d', $firstSale->id) }}<br>
          <strong>Date:</strong> {{ date('d M, Y', strtotime($firstSale->sale_date)) }}<br>
          <strong>Status:</strong> <span style="color: {{ $invStatusColor }}; font-weight: bold;">{{ $invStatusLabel }}</span>
        </div>
      </td>
    </tr>
  </table>

  <!-- Billing Info -->
  <table class="info-table">
    <tr>
      <td style="width: 55%; padding-right: 15px;">
        <div class="info-block-title">Billed To</div>
        <div class="party-name">{{ $customer ? ($customer->shop_name ? $customer->shop_name . ' (' . $customer->name . ')' : $customer->name) : 'Walk-in Customer' }}</div>
        @if($customer && $customer->phone)
          <div><strong>Phone:</strong> {{ $customer->phone }}</div>
        @endif
        @if($customer && $customer->email)
          <div><strong>Email:</strong> {{ $customer->email }}</div>
        @endif
      </td>
      <td style="width: 45%; padding-left: 15px; border-left: 1px solid #e2e8f0;">
        <div class="info-block-title">Payment Overview</div>
        <div><strong>Payment Status:</strong> <span style="color: {{ $invStatusColor }}; font-weight: bold;">{{ $invStatusLabel }}</span></div>
        <div><strong>Paid Amount:</strong> &#8377; {{ number_format($invPaidAmount, 2) }}</div>
        @if($invDueAmount > 0)
          <div><strong>Remaining Due:</strong> <span style="color: #dc2626; font-weight: bold;">&#8377; {{ number_format($invDueAmount, 2) }}</span></div>
        @endif
      </td>
    </tr>
  </table>

  <!-- Line Items -->
  <table class="items-table">
    <thead>
      <tr>
        <th style="width: 6%;" class="text-center">#</th>
        <th style="width: 46%;">Description of Goods</th>
        <th style="width: 16%;" class="text-center">Quantity</th>
        <th style="width: 16%;" class="text-right">Rate (&#8377;)</th>
        <th style="width: 16%;" class="text-right">Amount (&#8377;)</th>
      </tr>
    </thead>
    <tbody>
      @foreach($sales as $index => $sale)
        <tr>
          <td class="text-center" style="color: #64748b; font-weight: bold;">{{ sprintf('%02d', $index + 1) }}</td>
          <td>
            <div class="product-title">{{ $sale->product ? $sale->product->name : 'Deleted Item' }}</div>
            @if($sale->product && $sale->product->description)
              <div class="product-sub">{{ $sale->product->description }}</div>
            @endif
          </td>
          <td class="text-center">
            <strong>{{ $sale->qty }}</strong> pkt{{ $sale->qty > 1 ? 's' : '' }}
            <div class="product-sub">({{ $sale->qty * $sale->packet_size }} pcs)</div>
          </td>
          <td class="text-right">&#8377; {{ number_format($sale->rate, 2) }}</td>
          <td class="text-right">&#8377; {{ number_format($sale->qty * $sale->rate, 2) }}</td>
        </tr>
      @endforeach

      <!-- Subtotal -->
      <tr class="calc-row">
        <td colspan="3" style="border: none;"></td>
        <td class="text-right" style="font-weight: bold; color: #475569;">Sub Total:</td>
        <td class="text-right" style="font-weight: bold;">&#8377; {{ number_format($grossSubtotal, 2) }}</td>
      </tr>

      <!-- Discount -->
      @if($totalDiscount > 0)
        <tr class="calc-row">
          <td colspan="3" style="border: none;"></td>
          <td class="text-right" style="font-weight: bold; color: #d97706;">Discount:</td>
          <td class="text-right" style="font-weight: bold; color: #d97706;">- &#8377; {{ number_format($totalDiscount, 2) }}</td>
        </tr>
      @endif

      <!-- Grand Total -->
      <tr class="grand-total-row">
        <td colspan="3" style="border: none; background-color: transparent !important;"></td>
        <td class="text-right">Grand Total:</td>
        <td class="text-right">&#8377; {{ number_format($grandTotal, 2) }}</td>
      </tr>
    </tbody>
  </table>

  <!-- Amount in Words -->
  <div class="words-banner">
    <strong>Amount in Words:</strong> {{ $amountInWords }}
  </div>

  <!-- Footer / Signatures -->
  <table class="footer-table">
    <tr>
      <td style="width: 55%; vertical-align: bottom;">
        <div class="terms-box">
          <strong>Terms & Conditions:</strong><br>
          1. Goods once sold will not be taken back or exchanged.<br>
          2. All disputes are subject to local jurisdiction only.<br>
          3. This is a computer-generated invoice.
        </div>
      </td>
      <td style="width: 45%; vertical-align: bottom; text-align: right;">
        <div style="display: inline-block; text-align: center; width: 160px; float: right;">
          <div style="font-size: 10px; font-weight: bold; color: #0f172a; margin-bottom: 40px;">For {{ $dokan->name }}</div>
          <div class="sig-line">Authorized Signatory</div>
        </div>
      </td>
    </tr>
  </table>

</body>
</html>