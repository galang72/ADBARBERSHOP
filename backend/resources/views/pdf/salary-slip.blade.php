<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Slip Gaji - {{ $slip->barber->name }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: "Times New Roman", Times, serif;
            font-size: 12pt;
            line-height: 1.5;
            color: #000;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            border-bottom: 3px double #000;
            padding-bottom: 10px;
            margin-bottom: 15px;
        }
        
        .company-logo {
            margin-bottom: 5px;
            line-height: 0;
        }
        
        .company-name {
            font-size: 18pt;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 3px;
            margin-bottom: 5px;
        }
        
        .company-address {
            font-size: 10pt;
            color: #333;
        }
        
        .doc-title {
            font-size: 14pt;
            font-weight: bold;
            text-decoration: underline;
            margin-top: 15px;
        }
        
        .doc-info {
            text-align: right;
            margin-bottom: 15px;
            font-size: 11pt;
        }
        
        .section-title {
            font-size: 12pt;
            font-weight: bold;
            margin: 15px 0 10px 0;
            text-transform: uppercase;
            border-bottom: 2px solid #000;
            padding-bottom: 5px;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        
        table, th, td {
            border: 1px solid #000;
        }
        
        th {
            background-color: #f0f0f0;
            padding: 8px;
            font-size: 10pt;
            text-align: center;
            font-weight: bold;
        }
        
        td {
            padding: 8px;
            font-size: 11pt;
        }
        
        .text-right {
            text-align: right;
        }
        
        .summary-box {
            width: 60%;
            margin-left: auto;
            margin-top: 15px;
            border: 2px solid #000;
        }
        
        .summary-box td {
            padding: 10px;
            border: 1px solid #000;
        }
        
        .summary-label {
            font-weight: bold;
            background-color: #f5f5f5;
        }
        
        .total-row {
            font-weight: bold;
            font-size: 12pt;
            background-color: #e8e8e8;
        }
        
        .signature-section {
            margin-top: 40px;
            width: 100%;
        }
        
        .signature-table {
            width: 100%;
            border: none;
        }
        
        .signature-table td {
            width: 50%;
            text-align: center;
            padding: 10px;
            border: none;
        }
        
        .signature-line {
            border-top: 1px solid #000;
            width: 200px;
            margin: 60px auto 5px auto;
            padding-top: 5px;
        }
        
        .footer {
            margin-top: 30px;
            padding-top: 10px;
            border-top: 1px solid #ccc;
            text-align: center;
            font-size: 9pt;
            color: #666;
            font-style: italic;
        }
        
        .watermark {
            position: fixed;
            top: 40%;
            left: 30%;
            transform: rotate(-45deg);
            font-size: 60pt;
            color: rgba(0, 128, 0, 0.1);
            font-weight: bold;
            letter-spacing: 10px;
            z-index: -1;
        }
        
        .watermark-brand {
            position: fixed;
            top: 55%;
            left: 20%;
            transform: rotate(-45deg);
            font-size: 40pt;
            color: rgba(0, 0, 0, 0.05);
            font-weight: bold;
            letter-spacing: 8px;
            z-index: -1;
        }
    </style>
</head>
<body>
    <!-- Watermark Brand - selalu tampil -->
    <div class="watermark-brand">TRITAMA BARBER</div>
    
    @if($slip->status === 'paid')
    <!-- Watermark Lunas - hanya saat paid -->
    <div class="watermark">LUNAS</div>
    @endif
    
    <!-- Header -->
    <div class="header">
        <div class="company-logo">
            <img src="{{ public_path('assets/logo.png') }}" style="width: 140px; height: 140px; object-fit: contain;">
        </div>
        <div class="company-name">TRITAMA BARBER</div>
        <div class="company-address">
            Sistem Manajemen Penggajian Karyawan<br>
            Telp: (021) 1234-5678 | Email: info@tritamabarber.com
        </div>
        <div class="doc-title">SLIP GAJI</div>
        <div style="font-style: italic; margin-top: 5px;">Periode: {{ $slip->period_name }}</div>
    </div>
    
    <!-- Info -->
    <div class="doc-info">
        Nomor: SLIP/{{ $slip->year }}/{{ str_pad($slip->month, 2, '0', STR_PAD_LEFT) }}/{{ str_pad($slip->id, 4, '0', STR_PAD_LEFT) }}<br>
        Tanggal: {{ now()->format('d F Y') }}
    </div>
    
    <!-- Identitas -->
    <div class="section-title">A. IDENTITAS KARYAWAN</div>
    <table>
        <tr>
            <td style="width: 35%;">Nama Lengkap</td>
            <td style="width: 65%;"><strong>{{ $slip->barber->name }}</strong></td>
        </tr>
        <tr>
            <td>Jabatan</td>
            <td>Barber / Tukang Cukur</td>
        </tr>
        <tr>
            <td>Email</td>
            <td>{{ $slip->barber->email }}</td>
        </tr>
        <tr>
            <td>Telepon</td>
            <td>{{ $slip->barber->phone ?? '-' }}</td>
        </tr>
        <tr>
            <td>Status</td>
            <td><strong>{{ $slip->status === 'draft' ? 'MENUNGGU PERSETUJUAN' : ($slip->status === 'approved' ? 'DISETUJUI' : 'LUNAS') }}</strong></td>
        </tr>
    </table>
    
    <!-- Pendapatan -->
    <div class="section-title">B. RINCIAN PENDAPATAN</div>
    <table>
        <thead>
            <tr>
                <th style="width: 8%;">NO</th>
                <th style="width: 42%;">URAIAN</th>
                <th style="width: 25%;">JUMLAH</th>
                <th style="width: 25%;">TOTAL</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td style="text-align: center;">1</td>
                <td>Gaji Pokok</td>
                <td></td>
                <td class="text-right"><strong>Rp {{ number_format($slip->base_salary, 0, ',', '.') }}</strong></td>
            </tr>
            <tr>
                <td style="text-align: center;">2</td>
                <td>Komisi ({{ $slip->barber->commission_rate }}% dari penjualan)</td>
                <td></td>
                <td class="text-right"><strong>Rp {{ number_format($slip->commission_total, 0, ',', '.') }}</strong></td>
            </tr>
            @if($slip->bonus > 0)
            <tr>
                <td style="text-align: center;">3</td>
                <td>Bonus</td>
                <td></td>
                <td class="text-right"><strong>Rp {{ number_format($slip->bonus, 0, ',', '.') }}</strong></td>
            </tr>
            @endif
            @if($slip->overtime > 0)
            <tr>
                <td style="text-align: center;">{{ $slip->bonus > 0 ? '4' : '3' }}</td>
                <td>Tunjangan Lembur</td>
                <td></td>
                <td class="text-right"><strong>Rp {{ number_format($slip->overtime, 0, ',', '.') }}</strong></td>
            </tr>
            @endif
        </tbody>
    </table>
    
    <!-- Potongan -->
    @if($slip->total_deduction > 0)
    <div class="section-title">C. RINCIAN POTONGAN</div>
    <table>
        <thead>
            <tr>
                <th style="width: 8%;">NO</th>
                <th style="width: 67%;">URAIAN</th>
                <th style="width: 25%;">JUMLAH</th>
            </tr>
        </thead>
        <tbody>
            @if($slip->deduction_late > 0)
            <tr>
                <td style="text-align: center;">1</td>
                <td>Potongan Keterlambatan</td>
                <td class="text-right" style="color: #c00;">(Rp {{ number_format($slip->deduction_late, 0, ',', '.') }})</td>
            </tr>
            @endif
            @if($slip->deduction_absence > 0)
            <tr>
                <td style="text-align: center;">{{ $slip->deduction_late > 0 ? '2' : '1' }}</td>
                <td>Potongan Ketidakhadiran</td>
                <td class="text-right" style="color: #c00;">(Rp {{ number_format($slip->deduction_absence, 0, ',', '.') }})</td>
            </tr>
            @endif
            @if($slip->deduction_other > 0)
            <tr>
                <td style="text-align: center;">{{ ($slip->deduction_late > 0 ? 1 : 0) + ($slip->deduction_absence > 0 ? 1 : 0) + 1 }}</td>
                <td>Potongan Lainnya {{ $slip->deduction_note ? '(' . $slip->deduction_note . ')' : '' }}</td>
                <td class="text-right" style="color: #c00;">(Rp {{ number_format($slip->deduction_other, 0, ',', '.') }})</td>
            </tr>
            @endif
        </tbody>
    </table>
    @endif
    
    <!-- Ringkasan -->
    <div class="section-title">D. RINGKASAN</div>
    <table class="summary-box">
        <tr>
            <td class="summary-label">Jumlah Pendapatan</td>
            <td class="text-right">Rp {{ number_format($slip->total_income, 0, ',', '.') }}</td>
        </tr>
        @if($slip->total_deduction > 0)
        <tr>
            <td class="summary-label">Jumlah Potongan</td>
            <td class="text-right" style="color: #c00;">(Rp {{ number_format($slip->total_deduction, 0, ',', '.') }})</td>
        </tr>
        @endif
        <tr class="total-row">
            <td class="summary-label">GAJI BERSIH</td>
            <td class="text-right"><strong>Rp {{ number_format($slip->net_salary, 0, ',', '.') }}</strong></td>
        </tr>
    </table>
    
    <!-- Performa -->
    <div class="section-title" style="margin-top: 20px;">E. PERFORMA BULANAN</div>
    <table>
        <thead>
            <tr>
                <th>TOTAL PELANGGAN</th>
                <th>TOTAL LAYANAN</th>
                <th>TOTAL PENJUALAN</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td style="text-align: center;">{{ $slip->total_customers }} Orang</td>
                <td style="text-align: center;">{{ $slip->total_services }} Layanan</td>
                <td style="text-align: center;">Rp {{ number_format($slip->total_transaction_amount, 0, ',', '.') }}</td>
            </tr>
        </tbody>
    </table>
    
    <!-- Catatan -->
    @if($slip->note)
    <div style="margin: 15px 0; padding: 10px; border: 1px solid #999; background-color: #fafafa;">
        <strong>Catatan:</strong> {{ $slip->note }}
    </div>
    @endif
    
    <!-- Tanda Tangan -->
    <table class="signature-table">
        <tr>
            <td>
                <div>Diterima oleh,</div>
                <div class="signature-line"></div>
                <div><strong>{{ $slip->barber->name }}</strong></div>
                <div>Karyawan</div>
            </td>
            <td>
                <div>Disetujui oleh,</div>
                <div class="signature-line"></div>
                <div><strong>{{ $slip->status === 'paid' ? $slip->paid_by : '_________________' }}</strong></div>
                <div>Management</div>
            </td>
        </tr>
    </table>
    
    <!-- Footer -->
    <div class="footer">
        <strong>TRITAMA BARBER</strong><br>
        Dokumen ini digenerate secara elektronik oleh sistem.<br>
        Slip gaji ini sah dan mengikat tanpa memerlukan tanda tangan basah.<br>
        Dicetak pada: {{ now()->format('d F Y H:i:s') }}
    </div>
</body>
</html>
