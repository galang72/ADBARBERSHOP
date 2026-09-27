<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pembayaran Gaji</title>
    <style>
        /* Tema Tritama Barber - Merah, Emas */
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: Arial, Helvetica, sans-serif;
            background-color: #fdf2f4;
            color: #1c1917;
            line-height: 1.6;
        }
        
        .container {
            max-width: 580px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 18px;
            overflow: hidden;
            box-shadow: 0 4px 24px rgba(139, 31, 58, 0.08);
            border: 1px solid #fce7eb;
        }
        
        /* Header dengan gradient */
        .header {
            background: linear-gradient(135deg, #8b1f3a 0%, #771d35 100%);
            padding: 32px 48px;
            text-align: center;
        }
        
        .header .logo {
            margin-bottom: 16px;
        }
        
        .header .logo img {
            width: 80px;
            height: 80px;
            object-fit: cover;
            border-radius: 50%;
            border: 3px solid #c9942e;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        
        .header .brand-name {
            font-size: 18px;
            font-weight: bold;
            color: #ffffff;
            letter-spacing: 2px;
            text-transform: uppercase;
        }
        
        .content {
            padding: 48px;
        }
        
        /* Success badge dengan warna emas */
        .success-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: linear-gradient(135deg, #c9942e 0%, #b07a23 100%);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 24px;
        }
        
        h1 {
            font-size: 28px;
            font-weight: 600;
            text-align: center;
            margin-bottom: 12px;
            color: #8b1f3a;
            letter-spacing: -0.021em;
        }
        
        .subtitle {
            text-align: center;
            color: #78716c;
            font-size: 15px;
            margin-bottom: 40px;
        }
        
        .divider {
            height: 2px;
            background: linear-gradient(90deg, transparent, #c9942e, transparent);
            margin: 32px 0;
        }
        
        /* Period box dengan warna cream/gold */
        .period-box {
            background: linear-gradient(135deg, #fdf9ed 0%, #f8f0d5 100%);
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 32px;
            text-align: center;
            border: 1px solid #e6ca79;
        }
        
        .period-label {
            font-size: 13px;
            color: #8b5e1e;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
            font-weight: 600;
        }
        
        .period-value {
            font-size: 24px;
            font-weight: 700;
            color: #8b1f3a;
        }
        
        .info-box {
            background: #fafaf9;
            border-radius: 12px;
            padding: 20px 24px;
            margin-bottom: 32px;
            border: 1px solid #e7e5e4;
        }
        
        .info-row {
            display: flex;
            justify-content: space-between;
            font-size: 15px;
            padding: 10px 0;
        }
        
        .info-row:not(:last-child) {
            border-bottom: 1px solid #e7e5e4;
        }
        
        .info-label {
            color: #78716c;
            font-weight: 500;
        }
        
        .info-value {
            color: #1c1917;
            font-weight: 600;
        }
        
        /* Button dengan warna emas/gold */
        .btn {
            display: inline-block;
            width: 100%;
            background: linear-gradient(135deg, #c9942e 0%, #b07a23 100%) !important;
            color: #ffffff !important;
            text-decoration: none;
            padding: 16px 24px;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 700;
            text-align: center;
            border: none;
            box-sizing: border-box;
            box-shadow: 0 4px 12px rgba(201, 148, 46, 0.3);
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        /* Note box dengan warna emas */
        .note-box {
            background: #fdf9ed;
            border-left: 4px solid #c9942e;
            padding: 16px 20px;
            border-radius: 0 12px 12px 0;
            margin-top: 24px;
        }
        
        .note-text {
            font-size: 13px;
            color: #57534e;
            line-height: 1.5;
        }
        
        .note-text strong {
            color: #8b5e1e;
        }
        
        /* Footer */
        .footer {
            text-align: center;
            padding: 32px 48px;
            background: linear-gradient(135deg, #8b1f3a 0%, #771d35 100%);
        }
        
        .footer-text {
            font-size: 12px;
            color: #fce7eb;
            line-height: 1.5;
        }
        
        .footer-text strong {
            color: #c9942e;
            font-size: 14px;
        }
        
        @media (max-width: 600px) {
            .container { margin: 0; border-radius: 0; }
            .content { padding: 32px 24px; }
            .header { padding: 24px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header dengan Logo -->
        <div class="header">
            <div class="logo">
                <img src="https://i.imgur.com/8zD3W3y.png" alt="Tritama Barber" width="80" height="80" style="display:block;margin:0 auto;">
            </div>
            <div class="brand-name">TRITAMA BARBER</div>
        </div>
        
        <div class="content">
            <div style="text-align: center;">
                <div class="success-badge">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <path d="M5 13l4 4L19 7"/>
                    </svg>
                    Pembayaran Berhasil
                </div>
            </div>
            
            <h1>Gaji Telah Dibayar</h1>
            <p class="subtitle">Pembayaran gaji Anda telah diproses dan ditransfer</p>
            
            <div class="divider"></div>
            
            <div class="period-box">
                <div class="period-label">Periode Gaji</div>
                <div class="period-value">{{ $slip->period_name }}</div>
            </div>
            
            <div class="info-box">
                <div class="info-row">
                    <span class="info-label">Nama Penerima</span>
                    <span class="info-value">{{ $slip->barber->name }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Tanggal Pembayaran</span>
                    <span class="info-value">{{ $slip->paid_at->format('d F Y') }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Dibayarkan Oleh</span>
                    <span class="info-value">{{ $slip->paid_by }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Metode</span>
                    <span class="info-value">Transfer Bank</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Status</span>
                    <span class="info-value" style="color: #c9942e; font-weight: 700;">✓ Lunas</span>
                </div>
            </div>
            
            <a href="{{ $viewUrl }}" class="btn">LIHAT SLIP GAJI</a>
            
            <div class="note-box">
                <p class="note-text">
                    <strong>Informasi Penting:</strong> Rincian lengkap nominal gaji tersedia di slip gaji PDF yang dapat diunduh melalui tombol di atas. Simpan dokumen ini untuk arsip Anda.
                </p>
            </div>
        </div>
        
        <div class="footer">
            <p class="footer-text">
                <strong>TRITAMA BARBER</strong><br>
                Email dikirim secara otomatis &middot; {{ date('Y') }}
            </p>
        </div>
    </div>
</body>
</html>
