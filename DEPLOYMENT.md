# 🚀 Panduan Deployment smartlegal.id ke VPS CyberPanel

Panduan lengkap untuk melakukan deployment aplikasi Next.js smartlegal.id ke server VPS dengan CyberPanel.

---

## 📋 Prasyarat

Pastikan hal berikut sudah disiapkan sebelum deployment:

| Kebutuhan | Keterangan |
|-----------|------------|
| VPS aktif | Ubuntu 20.04 / 22.04 LTS (recommended) |
| CyberPanel | Sudah terinstall dengan website domain dikonfigurasi |
| Domain | Sudah diarahkan ke IP VPS (DNS propagated) |
| SSH Access | Akses root/sudo ke server |
| Git Repository | Kode project sudah di-push ke GitHub/GitLab |
| MongoDB Atlas | Connection string siap (atau MongoDB lokal di VPS) |
| Midtrans Account | Server Key & Client Key dari dashboard Midtrans |

---

## 🔧 FASE 1 — Persiapan Server (Lakukan Sekali)

### 1.1 — Akses Server via SSH
```bash
ssh root@YOUR_VPS_IP
```

### 1.2 — Install Node.js 20 LTS
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v   # Harus menampilkan v20.x.x
npm -v    # Harus menampilkan versi npm
```

### 1.3 — Install PM2 (Process Manager)
```bash
npm install -g pm2
pm2 -v
```

### 1.4 — Setup PM2 Auto-Restart saat Reboot
```bash
pm2 startup
# Salin & jalankan perintah yang ditampilkan oleh pm2 startup
```

### 1.5 — Buat Website di CyberPanel
1. Buka CyberPanel: `https://YOUR_VPS_IP:8090`
2. Login dengan kredensial admin.
3. Masuk ke **Websites → Create Website**.
4. Isi domain, email, aktifkan **Let's Encrypt SSL**.
5. Klik **Create Website**.

---

## 🗂️ FASE 2 — Upload Kode ke Server

### 2.1 — Clone Repository ke Server
```bash
cd /home/smartlegal.id/public_html
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git .
```

### 2.2 — Upload File Sensitif via SCP (dari Mac/PC lokal)

> **PENTING**: File `.env.local` dan folder `private-downloads` TIDAK ada di Git.
> Harus diupload manual dari komputer lokal Anda.

Dari terminal **komputer lokal** Anda:

```bash
# Upload file .env.local
scp /path/to/paid-download-document/.env.local \
    root@YOUR_VPS_IP:/home/smartlegal.id/public_html/.env.local

# Upload folder private-downloads (berisi file ZIP dokumen legal)
scp -r /path/to/paid-download-document/private-downloads \
    root@YOUR_VPS_IP:/home/smartlegal.id/public_html/private-downloads
```

---

## 🔐 FASE 3 — Konfigurasi .env.local di Server

```bash
nano /home/smartlegal.id/public_html/.env.local
```

Isi semua variabel dengan nilai produksi yang benar:

```env
# MongoDB — Gunakan MongoDB Atlas untuk produksi
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/smartlegal?retryWrites=true&w=majority

# Midtrans — Gunakan Production Keys untuk live
MIDTRANS_SERVER_KEY=Mid-server-YOUR_PRODUCTION_SERVER_KEY
MIDTRANS_IS_PRODUCTION=true
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=Mid-client-YOUR_PRODUCTION_CLIENT_KEY

# Admin Dashboard Credentials
ADMIN_USERNAME=your_secure_admin_username
ADMIN_PASSWORD=your_very_secure_password_here
```

---

## 🚀 FASE 4 — Jalankan deploy.sh

### 4.1 — Edit Konfigurasi deploy.sh
```bash
nano /home/smartlegal.id/public_html/deploy.sh
```

Ubah bagian CONFIGURATION:
```bash
APP_DIR="/home/smartlegal.id/public_html"
REPO_URL="https://github.com/YOUR_USERNAME/YOUR_REPO.git"
BRANCH="main"
PORT=3000
```

### 4.2 — Jalankan Script Deployment
```bash
cd /home/smartlegal.id/public_html
chmod +x deploy.sh
./deploy.sh
```

---

## 🔄 FASE 5 — Konfigurasi Reverse Proxy di CyberPanel

Next.js berjalan di port `3000`. CyberPanel (OpenLiteSpeed) perlu diarahkan ke port tersebut.

### Via CyberPanel UI
1. Login ke CyberPanel → **Websites → List Websites**
2. Klik **Manage** pada `smartlegal.id`
3. Pilih **vHost Conf** atau **Rewrite Rules**
4. Tambahkan konfigurasi berikut:

```nginx
extProcessor smartlegal {
  type                    proxy
  address                 127.0.0.1:3000
  maxConns                100
  pcKeepAliveTimeout      60
  initTimeout             60
  retryTimeout            0
  respBuffer              0
}

context / {
  type                    proxy
  handler                 smartlegal
  addDefaultCharset       off
}
```

### Restart OpenLiteSpeed
```bash
/usr/local/lsws/bin/lswsctrl restart
```

---

## ✅ FASE 6 — Verifikasi Deployment

```bash
pm2 status                              # Cek status proses
pm2 logs smartlegal-id --lines 50      # Cek log
curl http://localhost:3000              # Test lokal
```

Buka browser: `https://smartlegal.id`

---

## 🔁 Update Deployment Berikutnya

Setiap kali push kode baru ke GitHub:

```bash
ssh root@YOUR_VPS_IP
cd /home/smartlegal.id/public_html
./deploy.sh
```

---

## 🛠️ Perintah PM2 Berguna

```bash
pm2 status                          # Lihat semua proses
pm2 logs smartlegal-id             # Lihat log realtime
pm2 restart smartlegal-id          # Restart proses
pm2 stop smartlegal-id             # Hentikan proses
pm2 monit                          # Dashboard monitoring PM2
```

---

## 🔍 Troubleshooting

| Masalah | Solusi |
|---------|--------|
| `MONGODB_URI is not defined` | Pastikan `.env.local` sudah ada dan diisi |
| Port 3000 tidak bisa diakses | `ufw allow 3000` |
| PM2 crash loop | `pm2 logs smartlegal-id --lines 100` |
| SSL tidak aktif | Aktifkan Let's Encrypt di CyberPanel |
| Download ZIP gagal | Pastikan folder `private-downloads` sudah diupload ke VPS |
| Midtrans "Transaction not found" | Pastikan `MIDTRANS_IS_PRODUCTION=true` dan Production Key |
