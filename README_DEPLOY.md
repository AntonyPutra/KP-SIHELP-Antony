# SIHELP Deployment Guide

## Cara Menjalankan Lokal (Development)
1. Jalankan database: `docker compose up -d sihelp_postgres` (pastikan mapping port aktif, misal 5433:5432).
2. Jalankan backend: `cd BE && go run main.go`
3. Jalankan frontend: `cd FE && npm run dev`

## Cara Build & Deploy ke Server (Ubuntu / Tailscale)
Proyek ini menggunakan Docker Compose untuk memudahkan *deployment*.

1. **Copy project ke server**
   Copy seluruh folder project ini ke server tujuan (`/home/repo/SIHELP`).
2. **Masuk ke folder project di server**
   ```bash
   cd /home/repo/SIHELP
   ```
3. **Jalankan Deployment**
   ```bash
   docker compose down
   docker compose up -d --build
   ```
4. **Cek Status Container**
   ```bash
   docker ps
   ```

## Cara Melihat Log
Untuk melihat *log* dari masing-masing servis (Berguna untuk melihat *Custom Logger* backend):
```bash
docker compose logs -f sihelp_backend
docker compose logs -f sihelp_frontend
```

## Cara Restart Aplikasi
Jika ada perubahan kode atau konfigurasi:
```bash
docker compose restart
```
Atau jika ingin *rebuild*:
```bash
docker compose up -d --build
```

## Akun Default Login
- **Email**: admin@sihelp.local
- **Password**: admin123
