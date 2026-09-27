<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password - Tritama Barber</title>
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
        
        .message {
            font-size: 15px;
            color: #57534e;
            line-height: 1.6;
            margin-bottom: 32px;
            text-align: center;
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
        }
        
        .info-label {
            color: #8b5e1e;
            font-weight: 500;
        }
        
        .info-value {
            color: #8b1f3a;
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
        
        /* Security box dengan warna merah */
        .security-box {
            background: #fdf2f4;
            border-left: 4px solid #8b1f3a;
            padding: 16px 20px;
            border-radius: 0 12px 12px 0;
            margin-top: 24px;
        }
        
        .security-title {
            font-size: 13px;
            font-weight: 700;
            color: #8b1f3a;
            margin-bottom: 4px;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        
        .security-text {
            font-size: 13px;
            color: #57534e;
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
            <h1>Reset Password</h1>
            <p class="subtitle">Buat password baru untuk akun Anda</p>
            
            <div class="divider"></div>
            
            <p class="message">
                Kami menerima permintaan reset password untuk akun Anda. Klik tombol di bawah untuk melanjutkan.
            </p>
            
            <div class="info-box">
                <div class="info-row">
                    <span class="info-label">Email</span>
                    <span class="info-value">{{ $user->email }}</span>
                </div>
            </div>
            
            <a href="{{ $resetUrl }}" class="btn">RESET PASSWORD</a>
            
            <div class="security-box">
                <div class="security-title">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                    </svg>
                    Keamanan
                </div>
                <p class="security-text">Link ini berlaku 60 menit. Jika Anda tidak meminta ini, abaikan email ini.</p>
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
