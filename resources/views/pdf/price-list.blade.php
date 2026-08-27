<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Price List - {{ $dokan->name }}</title>
    <style>
        @page {
            margin: 28px 32px;
        }
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 11px;
            color: #1e293b;
            margin: 0;
            padding: 0;
            line-height: 1.4;
        }

        /* Top Bar / Classic Header */
        .header-table {
            width: 100%;
            border-collapse: collapse;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 14px;
            margin-bottom: 20px;
        }
        .store-title {
            font-size: 22px;
            font-weight: bold;
            color: #0f172a;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            margin-bottom: 4px;
        }
        .store-meta {
            font-size: 10px;
            color: #475569;
            line-height: 1.5;
        }
        .doc-title {
            text-align: right;
            font-size: 18px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #047857;
        }
        .doc-meta {
            text-align: right;
            font-size: 10px;
            color: #64748b;
            margin-top: 4px;
        }

        /* Products Table */
        .product-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 5px;
        }
        .product-table th {
            background-color: #0f172a;
            color: #ffffff;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 8px 10px;
            border: 1px solid #0f172a;
        }
        .product-table td {
            padding: 9px 10px;
            border-bottom: 1px solid #e2e8f0;
            vertical-align: middle;
        }
        .product-table tr:nth-child(even) {
            background-color: #f8fafc;
        }

        /* Column Specifics */
        .col-index {
            width: 30px;
            text-align: center;
            color: #94a3b8;
            font-weight: bold;
        }
        .product-name {
            font-size: 11px;
            font-weight: bold;
            color: #0f172a;
        }
        .product-desc {
            font-size: 9px;
            color: #64748b;
            margin-top: 2px;
        }
        .packet-tag {
            display: inline-block;
            padding: 2px 7px;
            background-color: #e2e8f0;
            border-radius: 3px;
            font-size: 9.5px;
            font-weight: bold;
            color: #334155;
        }
        .price {
            text-align: right;
            font-size: 12px;
            font-weight: bold;
            color: #047857;
        }

        /* Footer */
        .footer-table {
            width: 100%;
            margin-top: 30px;
            border-top: 1px solid #e2e8f0;
            padding-top: 10px;
            font-size: 9px;
            color: #94a3b8;
        }
        .empty-state {
            text-align: center;
            padding: 40px 10px;
            color: #64748b;
            border: 1px dashed #cbd5e1;
            border-radius: 4px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    @php
        $logoSrc = null;
        if ($dokan->logo) {
            $fullPath = storage_path('app/public/' . $dokan->logo);
            if (!file_exists($fullPath)) {
                $fullPath = public_path('storage/' . $dokan->logo);
            }
            if (file_exists($fullPath)) {
                $mime = mime_content_type($fullPath) ?: 'image/png';
                $logoSrc = 'data:' . $mime . ';base64,' . base64_encode(file_get_contents($fullPath));
            }
        }
    @endphp

    <!-- Classic 2-Column Header -->
    <table class="header-table">
        <tr>
            <td style="width: 60%; vertical-align: top;">
                @if($logoSrc)
                    <img src="{{ $logoSrc }}" style="max-height: 48px; margin-bottom: 6px;" /><br>
                @endif
                <div class="store-title">{{ $dokan->name }}</div>
                <div class="store-meta">
                    @if($dokan->owner)
                        <strong>Proprietor:</strong> {{ $dokan->owner->name }}<br>
                    @endif
                    @if($dokan->location)
                        <strong>Address:</strong> {{ $dokan->location }}<br>
                    @endif
                    @if($dokan->phone || ($dokan->owner && $dokan->owner->phone))
                        <strong>Phone:</strong> {{ $dokan->phone ?? $dokan->owner->phone }}
                    @endif
                    @if($dokan->email || ($dokan->owner && $dokan->owner->email))
                        | <strong>Email:</strong> {{ $dokan->email ?? $dokan->owner->email }}
                    @endif
                </div>
            </td>
            <td style="width: 40%; vertical-align: top;">
                <div class="doc-title">Price List</div>
                <div class="doc-meta">
                    <strong>Date:</strong> {{ date('d M, Y') }}<br>
                    <strong>Currency:</strong> INR (&#8377;)<br>
                    <strong>Status:</strong> Official Catalog
                </div>
            </td>
        </tr>
    </table>

    <!-- Product List Table -->
    @if($products->isEmpty())
        <div class="empty-state">
            <strong>No products found</strong>
            <p style="margin: 4px 0 0 0;">There are currently no items listed in this catalog.</p>
        </div>
    @else
        <table class="product-table">
            <thead>
                <tr>
                    <th class="col-index">#</th>
                    <th style="text-align: left;">Item Description</th>
                    <th style="text-align: center; width: 130px;">Packaging</th>
                    <th style="text-align: right; width: 120px;">Rate (&#8377;)</th>
                </tr>
            </thead>
            <tbody>
                @foreach($products as $index => $product)
                    <tr>
                        <td class="col-index">{{ sprintf('%02d', $index + 1) }}</td>
                        <td>
                            <div class="product-name">{{ $product->name }}</div>
                            @if($product->description)
                                <div class="product-desc">{{ $product->description }}</div>
                            @endif
                        </td>
                        <td style="text-align: center;">
                            <span class="packet-tag">{{ $product->packet_size }} pcs / packet</span>
                        </td>
                        <td class="price">
                            &#8377; {{ number_format($product->selling_rate, 2) }}
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif

    <!-- Footer -->
    <table class="footer-table">
        <tr>
            <td style="text-align: left;">Generated via Dokan Sathi</td>
            <td style="text-align: right;">Prices are subject to change without prior notice.</td>
        </tr>
    </table>
</body>
</html>