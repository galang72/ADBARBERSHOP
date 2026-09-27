#!/bin/bash

# Script untuk menjalankan backend dan frontend
# Usage: ./start-servers.sh

echo "🚀 Starting BarberShop POS Servers..."

# Kill existing processes
echo "🧹 Cleaning up old processes..."
pkill -f "php artisan serve" 2>/dev/null
pkill -f "vite" 2>/dev/null
sleep 2

# Start Backend
echo "📡 Starting Backend (Laravel)..."
cd /home/rangga-egha/Documents/barbershop-pos/backend
nohup php artisan serve --host=0.0.0.0 --port=8000 > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"

# Wait for backend to be ready
echo "⏳ Waiting for backend to be ready..."
for i in {1..30}; do
    if curl -s http://192.168.100.27:8000/api/settings/public > /dev/null 2>&1; then
        echo "   ✅ Backend is ready!"
        break
    fi
    sleep 1
done

# Start Frontend
echo "🎨 Starting Frontend (Vite)..."
cd /home/rangga-egha/Documents/barbershop-pos/frontend
nohup npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   Frontend PID: $BACKEND_PID"

# Wait for frontend to be ready
echo "⏳ Waiting for frontend to be ready..."
for i in {1..30}; do
    if curl -s http://192.168.100.27:3000/login > /dev/null 2>&1; then
        echo "   ✅ Frontend is ready!"
        break
    fi
    sleep 1
done

echo ""
echo "========================================"
echo "✅ SERVERS ARE RUNNING!"
echo "========================================"
echo "📡 Backend:  http://192.168.100.27:8000"
echo "🎨 Frontend: http://192.168.100.27:3000"
echo "========================================"
echo ""
echo "To check status:"
echo "  curl http://192.168.100.27:8000/api/settings/public"
echo "  curl http://192.168.100.27:3000/login"
echo ""
echo "To view logs:"
echo "  tail -f /tmp/backend.log"
echo "  tail -f /tmp/frontend.log"
echo ""
echo "To stop servers:"
echo "  pkill -f 'php artisan serve'"
echo "  pkill -f 'vite'"
