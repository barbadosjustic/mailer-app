#!/usr/bin/env bash
set -e

echo "🚀 Mailer installer starting..."

# ---------- CHECK OS ----------
if [[ "$OSTYPE" != "linux-gnu"* ]]; then
  echo "❌ This installer supports Linux only"
  exit 1
fi

# ---------- INSTALL DOCKER (STABLE METHOD) ----------
if ! command -v docker &> /dev/null; then
  echo "📦 Installing Docker and dependencies..."
  
  # Update and install prerequisites
  sudo apt-get update
  sudo apt-get install -y ca-certificates curl gnupg

  # Setup GPG Key correctly (using sudo for the write process)
  sudo install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg --yes
  sudo chmod a+r /etc/apt/keyrings/docker.gpg

  # Add Repository (specifically for Ubuntu Focal/Jammy)
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

  # Install Docker Engine & Compose Plugin
  sudo apt-get update
  sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

  # Permissions
  sudo usermod -aG docker $USER
  echo "⚠️ Docker installed. You MUST log out and log back in, then re-run this script."
  exit 0
fi

# ---------- CLONE OR UPDATE ----------
APP_DIR="$HOME/mailer-app"

if [ ! -d "$APP_DIR" ]; then
  echo "📥 Cloning repository..."
  git clone https://github.com/barbadosjustic/mailer-app.git "$APP_DIR"
else
  echo "🔄 Updating repository..."
  cd "$APP_DIR"
  # Try to pull, but don't crash if no changes
  git pull || echo "No remote changes found."
fi

cd "$APP_DIR"

# ---------- ENV SETUP ----------
if [ ! -f backend/.env ]; then
  echo "🧪 Creating backend/.env"
  if [ -f backend/.env.example ]; then
    cp backend/.env.example backend/.env
    echo "⚠️ Edit backend/.env before sending email"
  else
    touch backend/.env
    echo "⚠️ No .env.example found. Created empty .env file."
  fi
fi

# ---------- START ----------
echo "🐳 Starting containers..."
# Use 'docker compose' (V2) instead of 'docker-compose' (V1)
sudo docker compose up -d --build

echo ""
echo "✅ Mailer installed successfully!"
echo "🌍 Frontend: http://localhost:8080"
echo "🔌 Backend:  http://localhost:4000"
