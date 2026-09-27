#!/bin/bash

# Health check script - jalankan via cron setiap menit
# crontab -e
# * * * * * /home/rangga-egha/Documents/barbershop-pos/health-check.sh

BACKEND_URL="http://192.168.100.27:8000/api/settings/public"
FRONTEND_URL="http://192.168.100.27:3000/login"
LOG_FILE="/tmp/health-check.log"

# Cek backend
if ! curl -s "$BACKEND_URL" > /dev/null 2>&1; then
    echo "$(date): Backend is down, restarting..." >> "$LOG_FILE"
    pkill -f "php artisan serve" 2>/dev/null
    cd /home/rangga-egha/Documents/barbershop-pos/backend
    nohup php artisan serve --host=0.0.0.0 --port=8000 > /tmp/backend.log 2>&1 &
    sleep 3
fi

# Cek frontend
if ! curl -s "$FRONTEND_URL" > /dev/null 2>&1; then
    echo "$(date): Frontend is down, restarting..." >> "$LOG_FILE"
    pkill -f "vite" 2>/dev/null
    cd /home/rangga-egha/Documents/barbershop-pos/frontend
    nohup npm run dev > /tmp/frontend.log 2>&1 &
    sleep 3
fi
