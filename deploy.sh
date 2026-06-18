#!/bin/bash

# =============================================================================
# deploy.sh — smartlegal.id Deployment Script for CyberPanel VPS
# =============================================================================
# USAGE:
#   chmod +x deploy.sh          # Run once to make executable
#   ./deploy.sh                 # Run on every deployment
# =============================================================================

set -e  # Exit immediately if any command fails

# ─────────────────────────────────────────────────────────────────────────────
# CONFIGURATION — Edit these variables to match your VPS setup
# ─────────────────────────────────────────────────────────────────────────────
APP_NAME="smartlegal-id"
APP_DIR="/home/smartlegal.id/public_html"   # CyberPanel website root directory
REPO_URL="https://github.com/YOUR_USERNAME/YOUR_REPO.git"   # Your Git repository URL
BRANCH="main"                               # Git branch to deploy
NODE_VERSION="20"                           # Node.js major version
PM2_APP_NAME="smartlegal-id"               # PM2 process name
PORT=3000                                   # Port the Next.js app runs on

# ─────────────────────────────────────────────────────────────────────────────
# COLORS for readable output
# ─────────────────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

log_info()    { echo -e "${BLUE}[INFO]${NC}  $1"; }
log_success() { echo -e "${GREEN}[✓ OK]${NC}  $1"; }
log_warn()    { echo -e "${YELLOW}[WARN]${NC}  $1"; }
log_error()   { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# ─────────────────────────────────────────────────────────────────────────────
echo -e "${BOLD}"
echo "╔════════════════════════════════════════════════════════╗"
echo "║         smartlegal.id — VPS Deployment Script          ║"
echo "╚════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# ─────────────────────────────────────────────────────────────────────────────
# STEP 1: Check required tools
# ─────────────────────────────────────────────────────────────────────────────
log_info "Memeriksa tools yang diperlukan..."

command -v node  >/dev/null 2>&1 || log_error "Node.js tidak ditemukan. Install Node.js $NODE_VERSION terlebih dahulu."
command -v npm   >/dev/null 2>&1 || log_error "npm tidak ditemukan."
command -v git   >/dev/null 2>&1 || log_error "git tidak ditemukan."
command -v pm2   >/dev/null 2>&1 || { log_warn "PM2 belum terinstall. Menginstall PM2..."; npm install -g pm2; }

log_success "Semua tools tersedia."
echo "  Node.js : $(node -v)"
echo "  npm     : $(npm -v)"
echo "  PM2     : $(pm2 -v)"

# ─────────────────────────────────────────────────────────────────────────────
# STEP 2: Clone or pull latest code from Git
# ─────────────────────────────────────────────────────────────────────────────
log_info "Menyinkronkan kode dari repository..."

if [ -d "$APP_DIR/.git" ]; then
  log_info "Repository sudah ada. Melakukan git pull..."
  cd "$APP_DIR"
  git fetch origin
  git reset --hard origin/$BRANCH
  git pull origin $BRANCH
  log_success "Kode berhasil diperbarui dari branch '$BRANCH'."
else
  log_info "Repository belum ada. Melakukan git clone..."
  git clone --branch $BRANCH $REPO_URL "$APP_DIR"
  cd "$APP_DIR"
  log_success "Repository berhasil di-clone ke $APP_DIR."
fi

# ─────────────────────────────────────────────────────────────────────────────
# STEP 3: Setup .env.local
# ─────────────────────────────────────────────────────────────────────────────
log_info "Memeriksa konfigurasi .env.local..."

if [ ! -f "$APP_DIR/.env.local" ]; then
  log_warn ".env.local tidak ditemukan!"
  log_warn "Salin file .env.local ke server secara manual:"
  log_warn "  scp .env.local root@YOUR_VPS_IP:$APP_DIR/.env.local"
  log_error "Deploy dibatalkan. Tambahkan .env.local lalu jalankan ulang."
else
  log_success ".env.local ditemukan."
fi

# ─────────────────────────────────────────────────────────────────────────────
# STEP 4: Copy private-downloads folder (if not already present)
# ─────────────────────────────────────────────────────────────────────────────
log_info "Memeriksa folder private-downloads..."

if [ ! -d "$APP_DIR/private-downloads" ]; then
  log_warn "Folder private-downloads tidak ditemukan!"
  log_warn "Salin folder ini ke server secara manual:"
  log_warn "  scp -r ./private-downloads root@YOUR_VPS_IP:$APP_DIR/private-downloads"
else
  log_success "Folder private-downloads ditemukan."
fi

# ─────────────────────────────────────────────────────────────────────────────
# STEP 5: Install dependencies
# ─────────────────────────────────────────────────────────────────────────────
log_info "Menginstall dependencies npm..."

cd "$APP_DIR"
npm ci --prefer-offline --no-audit 2>/dev/null || npm install --no-audit

log_success "Dependencies berhasil diinstall."

# ─────────────────────────────────────────────────────────────────────────────
# STEP 6: Build Next.js production bundle
# ─────────────────────────────────────────────────────────────────────────────
log_info "Membangun production build Next.js..."

cd "$APP_DIR"
npm run build

log_success "Production build berhasil dibuat."

# ─────────────────────────────────────────────────────────────────────────────
# STEP 7: Start or reload app with PM2
# ─────────────────────────────────────────────────────────────────────────────
log_info "Memulai/memperbarui proses PM2..."

cd "$APP_DIR"

if pm2 list | grep -q "$PM2_APP_NAME"; then
  log_info "Proses PM2 '$PM2_APP_NAME' sudah berjalan. Melakukan reload..."
  pm2 reload "$PM2_APP_NAME" --update-env
  log_success "Proses berhasil di-reload."
else
  log_info "Memulai proses PM2 '$PM2_APP_NAME' baru..."
  pm2 start npm \
    --name "$PM2_APP_NAME" \
    --time \
    -- start -- -p $PORT
  log_success "Proses PM2 berhasil dijalankan di port $PORT."
fi

# Simpan konfigurasi PM2 agar otomatis restart saat reboot server
pm2 save

# ─────────────────────────────────────────────────────────────────────────────
# STEP 8: Setup PM2 startup (first time only)
# ─────────────────────────────────────────────────────────────────────────────
log_info "Memeriksa PM2 startup hook..."

if ! pm2 startup 2>&1 | grep -q "already"; then
  log_warn "Jalankan perintah berikut SEBAGAI ROOT untuk mengaktifkan auto-start PM2:"
  pm2 startup | tail -1
fi

# ─────────────────────────────────────────────────────────────────────────────
# STEP 9: Final status
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}${BOLD}"
echo "╔════════════════════════════════════════════════════════╗"
echo "║           ✓ DEPLOYMENT BERHASIL SELESAI!               ║"
echo "╚════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
pm2 list
echo ""
log_info "Aplikasi berjalan di: http://localhost:$PORT"
log_info "Pastikan CyberPanel Reverse Proxy sudah dikonfigurasi ke port $PORT"
log_info "Lihat DEPLOYMENT.md untuk panduan konfigurasi CyberPanel lengkap."
