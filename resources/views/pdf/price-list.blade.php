<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Price List - {{ $dokan->name }}</title>
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 11px;
            color: #1f2937;
            margin: 0;
            padding: 10px;
        }
        .header-card {
            background-color: #065f46;
            color: #ffffff;
            padding: 16px 20px;
            border-radius: 6px;
            margin-bottom: 15px;
        }
        .store-name {
            font-size: 22px;
            font-weight: bold;
            text-transform: uppercase;
            margin: 0 0 6px 0;
            letter-spacing: 0.5px;
        }
        .store-details {
            font-size: 11px;
            color: #d1fae5;
            line-height: 1.4;
        }
        .table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        .table th {
            background-color: #f3f4f6;
            color: #374151;
            font-size: 10px;
            text-transform: uppercase;
            font-weight: bold;
            padding: 8px 10px;
            border-bottom: 2px solid #d1d5db;
            text-align: left;
        }
        .table td {
            padding: 8px 10px;
            border-bottom: 1px solid #e5e7eb;
            vertical-align: middle;
        }
        .product-name {
            font-weight: bold;
            font-size: 12px;
            color: #111827;
        }
        .product-desc {
            font-size: 9px;
            color: #6b7280;
        }
        .packet-badge {
            background-color: #f3f4f6;
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 10px;
            font-family: monospace;
            border: 1px solid #e5e7eb;
        }
        .price {
            font-size: 14px;
            font-weight: bold;
            color: #047857;
            text-align: right;
            font-family: 'DejaVu Sans', sans-serif;
        }
        .footer {
            margin-top: 25px;
            text-align: center;
            font-size: 9px;
            color: #9ca3af;
        }
    </style>
</head>
<body>
    <div class="header-card">
        @if($dokan->logo && file_exists(public_path('storage/' . $dokan->logo)))
            <img src="{{ public_path('storage/' . $dokan->logo) }}" style="width: 48px; height: 48px; border-radius: 6px; float: right; object-fit: cover;" />
        @endif
        <div class="store-name">{{ $dokan->name }}</div>
        <div class="store-details">
            @if($dokan->owner)
                Owner: <strong>{{ $dokan->owner->name }}</strong> &nbsp;&bull;&nbsp;
            @endif
            @if($dokan->location)
                Address: {{ $dokan->location }} &nbsp;&bull;&nbsp;
            @endif
            @if($dokan->phone || ($dokan->owner && $dokan->owner->phone))
                Contact: <strong>{{ $dokan->phone ?? $dokan->owner->phone }}</strong> &nbsp;&bull;&nbsp;
            @endif
            @if($dokan->email || ($dokan->owner && $dokan->owner->email))
                Email: <strong>{{ $dokan->email ?? $dokan->owner->email }}</strong> &nbsp;&bull;&nbsp;
            @endif
            Date: <strong>{{ date('d M Y') }}</strong>
        </div>
        <div style="clear: both;"></div>
    </div>

    <table class="table">
        <thead>
            <tr>
                <th style="width: 25px;">#</th>
                <th>Product Description</th>
                <th style="text-align: center; width: 130px;">Packet Size</th>
                <th style="text-align: right; width: 140px;">Selling Rate</th>
            </tr>
        </thead>
        <tbody>
            @foreach($products as $index => $product)
                <tr>
                    <td style="color: #9ca3af; font-family: monospace;">{{ $index + 1 }}</td>
                    <td>
                        <div class="product-name">{{ $product->name }}</div>
                        @if($product->description)
                            <div class="product-desc">{{ $product->description }}</div>
                        @endif
                    </td>
                    <td style="text-align: center;">
                        <span class="packet-badge">{{ $product->packet_size }} pcs / packet</span>
                    </td>
                    <td class="price">
                        &#8377;{{ number_format($product->selling_rate, 2) }}
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        Official Store Selling Rate Catalog &bull; Generated via Dokan Sathi
    </div>
</body>
</html>
