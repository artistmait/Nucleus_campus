#!/bin/sh
set -e

cd /app/nucleus_flask_backend
/opt/venv/bin/python app.py &
cd /app
node /app/nucleus_backend/server.js &

exec nginx -g 'daemon off;'
