#!/usr/bin/env bash
set -e

echo "🚀 Mailer installer starting..."

# ---------- CHECK OS ----------
if [[ "$OSTYPE" != "linux-gnu"* ]]; then
  echo "❌ This installer supports Linux only"
  exit 1
fi

# ---------- CHECK DOCKER ----------
if ! command -v docker &> /dev/null; then
  echo "📦 Installing Docker..."
  curl -fsSL https://get.docker.com | bash
  sudo usermod -aG docker $USER
  echo "⚠️ Log out and log back in, then re-run installer"
  exit 0
fi

# ---------- CHECK DOCKER COMPOSE ----------
if ! docker compose version &> /dev/null; then
  echo "📦 Installing Docker Compose plugin..."
  sudo apt update
  sudo apt install -y docker-compose-plugin
fi

# ---------- CLONE OR UPDATE ----------
APP_DIR="$HOME/mailer"

if [ ! -d "$APP_DIR" ]; then
  echo "📥 Cloning repository..."
  git clone https://github.com/YOUR_ORG/mailer.git "$APP_DIR"
else
  echo "🔄 Updating repository..."
  cd "$APP_DIR"
  git pull
fi

cd "$APP_DIR"

# ---------- ENV SETUP ----------
if [ ! -f backend/.env ]; then
  echo "🧪 Creating backend/.env"
  cp backend/.env.example backend/.env
  echo "⚠️ Edit backend/.env before sending email"
fi

# ---------- START ----------
echo "🐳 Starting containers..."
docker compose up -d --build

echo ""
echo "✅ Mailer installed successfully!"
echo "🌍 Frontend: http://localhost:8080"
echo "🔌 Backend:  http://localhost:4000"

