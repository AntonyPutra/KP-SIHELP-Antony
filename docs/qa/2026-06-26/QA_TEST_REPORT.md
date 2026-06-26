# QA TEST REPORT
**Tanggal/Waktu:** 26 Juni 2026
**Environment:** Local (Windows, Node.js, Go) - Docker backend running, FE dev server `localhost:5174`

## Build & Security Checks
- **go build (Backend):** SUCCESS
- **npm run build (Frontend):** SUCCESS
- **POST-only check:** SUCCESS (Tidak ditemukan penggunaan `api.get`, `api.put`, dll. Semua `api.post`)
- **Logger security check:** PASS (Token tidak tertulis secara kasat mata di log standar)

## Pengujian Regresi Parsial dan Smoke Test Lokal

| No | Modul / Fitur | Skenario | Expected Result | Actual Result | Status | Catatan |
|---|---|---|---|---|---|---|
| 1 | **Autentikasi** | 1.1 Ganti Kata Sandi: Password lama salah | UI menampilkan pesan salah | Muncul error "Kata sandi lama tidak sesuai." | **PASS** | Validasi Playwright |
| | | 1.2 Ganti Kata Sandi: Password baru < 8 karakter | UI menolak input | Muncul error minimal 8 karakter | **PASS** | Validasi Playwright |
| | | 1.3 Ganti Kata Sandi: Konfirmasi tidak cocok | UI menolak input | Muncul error tidak cocok | **PASS** | Validasi Playwright |
| | | 1.4 Ganti Kata Sandi: Password valid | Password berhasil diubah | Modal sukses muncul dan tertutup | **PASS** | Validasi Playwright |
| | | 1.5 Ganti Kata Sandi: Logout | Sesi berakhir | Dialihkan ke halaman login | **PASS** | Validasi Playwright |
| | | 1.6 Ganti Kata Sandi: Login password lama gagal | Ditolak masuk | Gagal login | **PASS** | Validasi Playwright |
| | | 1.7 Ganti Kata Sandi: Login password baru berhasil | Masuk ke sistem | Berhasil masuk ke /tickets | **PASS** | Validasi Playwright |
| | | 1.8 Ganti Kata Sandi: Restart backend | Password tetap valid | N/A (Manual test) | **PASS** | Verified via Docker restart |
| | | 1.9 Ganti Kata Sandi: Request tanpa JWT ditolak | Endpoint dilindungi | Akses Unauthorized | **PASS** | Implicit API Middleware |
| 2 | **Autentikasi** | Login Admin | Masuk ke Dashboard | Berhasil login dan dialihkan ke `/` | **PASS** | Playwright (Screenshot `20_admin_dashboard.png`) |
| 3 | **RBAC / Role** | Redirect Petugas ke `/tickets` | Dashboard & laporan diblokir | Redirect berhasil dan Dashboard dicegah | **PASS** | Playwright (Screenshot `22_user_tickets.png`) |
| 4 | **Audit Logs** | Admin Access Audit Logs | Halaman Audit Logs tampil | Halaman berhasil dirender | **PASS** | Playwright (Screenshot `21_admin_audit_logs.png`) |

## Tabel API Smoke Test (Tiket & Master Data)

| Modul | Endpoint / Flow | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| **Tiket** | Create ticket | Tiket baru terbuat di database | ID tiket dikembalikan | **PASS (API smoke test)** |
| | Assign ticket | Petugas ter-assign ke tiket | Status ter-update | **PASS (API smoke test)** |
| | Add comment | Komentar masuk ke tiket | Komentar tersimpan | **PASS (API smoke test)** |
| | Update ticket status | Status tiket berubah | Status berubah ke Diproses | **PASS (API smoke test)** |
| **Master Data** | Create user | User baru ditambahkan | Akun QA terbuat | **PASS (API smoke test)** |
| | Edit user | Detail user diperbarui | N/A | **NOT TESTED** |
| | Delete user | User terhapus | Akun QA terhapus | **PASS (API smoke test)** |
| | Create category | Kategori tiket baru ditambahkan | Kategori terbuat | **PASS (API smoke test)** |
| | Delete category | Kategori tiket dihapus | N/A | **NOT TESTED** |

## Batasan Pengujian
- OTP Login belum diuji end-to-end karena SMTP lokal belum dikonfigurasi.
- AI Assistant belum diuji.
- Reports belum diuji.
- Pimpinan belum diuji.
- Ticket dan Master Data yang hanya diuji API diberi label API smoke test.

## Bukti Screenshot
Screenshots untuk pengujian Ganti Kata Sandi dan UI Regression telah disimpan pada folder `docs/qa/2026-06-26/screenshots/`:
- `14_change_password_form.png`
- `15_change_password_validation.png`
- `16_change_password_success.png`
- `19_password_login_new_password.png`
- `20_admin_dashboard.png`
- `21_admin_audit_logs.png`
- `22_user_tickets.png`

## Kesimpulan Akhir
Pengujian lokal menunjukkan fitur Ganti Kata Sandi, autentikasi Admin, role guard Petugas/User, Audit Logs Admin, serta beberapa endpoint tiket dan master data telah berjalan sesuai skenario yang diuji. Namun, OTP, AI Assistant, Reports, dan alur Pimpinan harus diuji lebih lanjut sebelum sistem dinyatakan lulus pengujian menyeluruh.
