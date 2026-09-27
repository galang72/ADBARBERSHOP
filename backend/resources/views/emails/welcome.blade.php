<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Selamat Datang - Tritama Barber</title>
    <style>
        /* Tema Tritama Barber - Merah, Emas */
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: Arial, Helvetica, sans-serif;
            background-color: #fdf2f4;
            color: #1c1917;
            line-height: 1.6;
            -webkit-font-smoothing: antialiased;
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
        
        .greeting {
            font-size: 17px;
            color: #8b1f3a;
            margin-bottom: 16px;
            font-weight: 600;
        }
        
        .message {
            font-size: 15px;
            color: #57534e;
            line-height: 1.6;
            margin-bottom: 32px;
        }
        
        /* Info box dengan warna cream */
        .info-box {
            background: linear-gradient(135deg, #fdf9ed 0%, #f8f0d5 100%);
            border-radius: 12px;
            padding: 20px 24px;
            margin-bottom: 32px;
            border: 1px solid #e6ca79;
        }
        
        .info-row {
            display: flex;
            justify-content: space-between;
            font-size: 14px;
            padding: 10px 0;
        }
        
        .info-row:not(:last-child) {
            border-bottom: 1px solid #e6ca79;
        }
        
        .info-label {
            color: #8b5e1e;
            font-weight: 500;
        }
        
        .info-value {
            color: #8b1f3a;
            font-weight: 600;
        }
        
        /* Role badge dengan warna emas */
        .role-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            background: linear-gradient(135deg, #c9942e 0%, #b07a23 100%);
            color: #ffffff;
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
        
        /* Features dengan warna emas */
        .features {
            margin-top: 32px;
            background: #fafaf9;
            border-radius: 12px;
            padding: 24px;
            border: 1px solid #e7e5e4;
        }
        
        .features-title {
            font-size: 14px;
            font-weight: 700;
            color: #8b1f3a;
            margin-bottom: 16px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .feature-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 0;
            font-size: 14px;
            color: #57534e;
            border-bottom: 1px solid #e7e5e4;
        }
        
        .feature-item:last-child {
            border-bottom: none;
        }
        
        .feature-icon {
            width: 8px;
            height: 8px;
            background: linear-gradient(135deg, #c9942e 0%, #b07a23 100%);
            border-radius: 50%;
            flex-shrink: 0;
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
            <h1>Selamat Datang</h1>
            <p class="subtitle">Akun Anda telah aktif</p>
            
            <div class="divider"></div>
            
            <p class="greeting">Halo, {{ $user->name }}</p>
            <p class="message">
                Akun Anda telah berhasil dibuat dan siap digunakan. Silakan login untuk mengakses dashboard.
            </p>
            
            <div class="info-box">
                <div class="info-row">
                    <span class="info-label">Email</span>
                    <span class="info-value">{{ $user->email }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Peran</span>
                    <span class="info-value">
                        <span class="role-badge">{{ ucfirst($user->role) }}</span>
                    </span>
                </div>
            </div>
            
            <a href="{{ $loginUrl }}" class="btn">LOGIN KE DASHBOARD</a>
            
            <div class="features">
                <p class="features-title">Fitur Tersedia</p>
                @if($user->role === 'admin')
                    <div class="feature-item"><div class="feature-icon"></div>Kelola pengguna dan tim</div>
                    <div class="feature-item"><div class="feature-icon"></div>Laporan penjualan & analitik</div>
                    <div class="feature-item"><div class="feature-icon"></div>Pengaturan sistem</div>
                @elseif($user->role === 'cashier')
                    <div class="feature-item"><div class="feature-icon"></div>Proses transaksi</div>
                    <div class="feature-item"><div class="feature-icon"></div>Kelola pembayaran</div>
                    <div class="feature-item"><div class="feature-icon"></div>Riwayat transaksi</div>
                @else
                    <div class="feature-item"><div class="feature-icon"></div>Kelola jadwal & antrian</div>
                    <div class="feature-item"><div class="feature-icon"></div>Update status layanan</div>
                    <div class="feature-item"><div class="feature-icon"></div>Lihat ringkasan pekerjaan</div>
                @endif
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
