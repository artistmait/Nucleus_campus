FROM node:20-slim AS frontend-build

WORKDIR /frontend
COPY nucleus_frontend/package*.json ./
RUN npm ci

COPY nucleus_frontend ./
RUN npm run build

FROM node:20-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-venv \
    nginx \
    libgomp1 \
  && rm -f /etc/nginx/sites-enabled/default /etc/nginx/sites-available/default \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY nucleus_backend/package*.json ./nucleus_backend/
RUN cd nucleus_backend && npm ci --omit=dev

COPY nucleus_flask_backend/requirements.txt ./nucleus_flask_backend/requirements.txt
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN python3 - <<'PY'
from pathlib import Path
src = Path("/app/nucleus_flask_backend/requirements.txt")
data = src.read_bytes()
try:
    text = data.decode("utf-16")
except UnicodeError:
    text = data.decode("utf-8")
Path("/app/nucleus_flask_backend/requirements-utf8.txt").write_text(text, encoding="utf-8")
PY
RUN /opt/venv/bin/pip install --no-cache-dir -r /app/nucleus_flask_backend/requirements-utf8.txt

COPY nucleus_backend ./nucleus_backend
COPY nucleus_flask_backend ./nucleus_flask_backend
COPY --from=frontend-build /frontend/dist /usr/share/nginx/html
COPY nginx.single.conf /etc/nginx/conf.d/default.conf
COPY start.sh /app/start.sh

RUN mkdir -p /app/nucleus_backend/uploads \
  && chmod +x /app/start.sh

ENV NODE_ENV=production
EXPOSE 80

CMD ["/app/start.sh"]
