# REPORT REVISION NOTES

Dokumen ini berisi daftar bagian pada `Laporan_Kerja_Praktik.md` (dan dokumen terkait) yang harus direvisi karena tidak sesuai dengan implementasi aktual pada sistem SIHELP.

## Daftar Ketidaksesuaian yang Ditemukan (Baseline)

1. **Tabel 3.20 Pengujian Ganti Kata Sandi**
   - **Klaim Laporan:** Seluruh skenario pengujian Ganti Kata Sandi berhasil.
   - **Fakta Aktual:** Fitur Ganti Kata Sandi belum dibuat. UI `Profile` pada Navbar belum dihubungkan ke aksi apa pun, dan endpoint backend belum ada. (Status Baseline: **FAIL**)

2. **Klaim "Seluruh Fitur Berhasil" di Bab 3.5 & 4.1**
   - **Klaim Laporan:** Seluruh fitur telah diuji dan berfungsi 100%.
   - **Fakta Aktual:** Belum bisa diklaim 100% sukses sebelum *patch* Ganti Kata Sandi diimplementasikan dan *automation test* lainnya diselesaikan.

3. **Durasi OTP (Menunggu Konfirmasi Lanjutan)**
   - Perlu dicek kembali durasi OTP yang dikonfigurasi di backend (`otp.go`), apakah 5 menit atau 10 menit. Laporan harus menyesuaikan nilai di kode.

4. **Role & Hak Akses (Menunggu Pengujian Lanjutan)**
   - Jika laporan mengklaim Petugas bisa melihat Audit Logs (atau sebaliknya), harus diselaraskan dengan fungsi *middleware* aktual di backend (saat ini Audit Logs hanya untuk Admin & Pimpinan).

5. **Endpoint AI di Sequence Diagram**
   - Jika laporan menggunakan URL endpoint pihak ketiga (misalnya Groq / OpenAI), pastikan *sequence diagram* mencerminkan endpoint lokal backend SIHELP (`/api/ai/ticket-suggestion`, dll) yang bertindak sebagai *proxy* ke layanan AI tersebut.
