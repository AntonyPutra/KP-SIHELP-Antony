# SIHELP API Documentation

## 1. Overview
SIHELP adalah sistem helpdesk dan ticketing layanan berbasis web. API ini dirancang untuk melayani aplikasi SIHELP secara seragam melalui arsitektur POST-Only, dimana seluruh *request* (termasuk list data, detail, penciptaan, pengubahan, dan penghapusan) menggunakan method POST dan *JSON payload*.

## 2. Base URL
API ini dapat diakses pada *environment* berikut:
- **Local:** `http://localhost:8000`
- **Tailscale:** `http://100.73.16.92:8000`
- **Domain:** `https://api.whaleestudio.my.id`

Pada Postman Collection yang disediakan, gunakan *variable* `{{base_url}}`.

## 3. Authentication
Sebagian besar *endpoint* dalam aplikasi ini dilindungi dan mewajibkan pengguna untuk melakukan autentikasi. Autentikasi dilakukan menggunakan **Bearer Token** (berbasis JWT).

Cara mendapatkan token:
1. Kirim *request* `POST /api/auth/login` menggunakan email dan *password*.
2. Jika berhasil, server akan merespon dengan mengembalikan *token*.
3. Simpan token ini dan sertakan di bagian *Header* setiap *request* yang membutuhkan autentikasi dengan format: `Authorization: Bearer <token>`.

## 4. Standard Headers
Sertakan *header* berikut untuk setiap *request* (kecuali *endpoint* otentikasi login yang tidak membutuhkan *Authorization*):
```http
Content-Type: application/json
Authorization: Bearer {{token}}
```

## 5. Standard Response Format
Semua respon JSON mematuhi struktur standar aplikasi.

**Success Response Example:**
```json
{
  "success": true,
  "message": "Success",
  "data": {}
}
```

**Error Response Example:**
```json
{
  "success": false,
  "message": "Error",
  "errors": {}
}
```

## 6. Role Access
Sistem menerapkan kendali akses berbasis *Role-Based Access Control* (RBAC) dengan tingkatan:

| Role ID | Role | Deskripsi Akses |
| :--- | :--- | :--- |
| `1` | **Admin** | Akses penuh (*Full access*). Dapat mengelola pengguna, kategori, serta tiket. |
| `2` | **Petugas** | Dapat mengelola tiket yang ditugaskan, membalas komentar, dan merubah status. |
| `3` | **User** | Akses terbatas. Hanya dapat membuat tiket dan melihat tiket miliknya sendiri. |
| `4` | **Pimpinan** | Akses terbatas hanya untuk melihat *Dashboard* dan *Reports* (Read-Only). |

## 7. Endpoint Documentation

### Auth API

#### POST `/api/auth/login`
- **Auth Required:** No
- **Role Access:** Public
- **Request Body:**
  ```json
  {
    "email": "admin@sihelp.local",
    "password": "admin123"
  }
  ```
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "token": "eyJhbG..."
    }
  }
  ```

#### POST `/api/auth/profile`
- **Auth Required:** Yes
- **Role Access:** All Roles
- **Request Body:** `{}`
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "Profile retrieved successfully",
    "data": {
      "id": 1,
      "name": "Super Administrator"
    }
  }
  ```

#### POST `/api/auth/logout`
- **Auth Required:** Yes
- **Role Access:** All Roles
- **Request Body:** `{}`

#### POST `/api/auth/request-otp`
- **Auth Required:** No
- **Role Access:** Public
- **Request Body:**
  ```json
  {
    "email": "admin@sihelp.local",
    "purpose": "login"
  }
  ```
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "OTP sent successfully",
    "data": {
      "otp_session_token": "a1b2c3d4..."
    }
  }
  ```

#### POST `/api/auth/verify-otp`
- **Auth Required:** No
- **Role Access:** Public
- **Request Body:**
  ```json
  {
    "otp_session_token": "a1b2c3d4...",
    "otp": "123456",
    "purpose": "login"
  }
  ```
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "token": "eyJhbG..."
    }
  }
  ```

#### POST `/api/auth/resend-otp`
- **Auth Required:** No
- **Role Access:** Public
- **Request Body:**
  ```json
  {
    "otp_session_token": "a1b2c3d4...",
    "purpose": "login"
  }
  ```
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "OTP resent successfully",
    "data": {
      "otp_session_token": "x9y8z7..."
    }
  }
  ```

---

### User API

#### POST `/api/users/list`
- **Auth Required:** Yes
- **Role Access:** Admin
- **Request Body:**
  ```json
  {
    "search": "",
    "role_id": null
  }
  ```

#### POST `/api/users/create`
- **Auth Required:** Yes
- **Role Access:** Admin
- **Request Body:**
  ```json
  {
    "name": "Demo User",
    "email": "demo.user@sihelp.local",
    "password": "password123",
    "role_id": 3
  }
  ```

#### POST `/api/users/detail`
- **Auth Required:** Yes
- **Role Access:** Admin
- **Request Body:** `{"id": 1}`

#### POST `/api/users/update`
- **Auth Required:** Yes
- **Role Access:** Admin
- **Request Body:**
  ```json
  {
    "id": 1,
    "name": "Super Administrator",
    "email": "admin@sihelp.local",
    "role_id": 1
  }
  ```

#### POST `/api/users/delete`
- **Auth Required:** Yes
- **Role Access:** Admin
- **Request Body:** `{"id": 6}`

---

### Category API

#### POST `/api/categories/list`
- **Auth Required:** Yes
- **Role Access:** All Roles (Users for reporting tickets)
- **Request Body:** `{"search": ""}`

#### POST `/api/categories/create`
- **Auth Required:** Yes
- **Role Access:** Admin
- **Request Body:** `{"name": "Testing Category"}`

#### POST `/api/categories/detail`
- **Auth Required:** Yes
- **Role Access:** Admin, Petugas
- **Request Body:** `{"id": 1}`

#### POST `/api/categories/update`
- **Auth Required:** Yes
- **Role Access:** Admin
- **Request Body:** `{"id": 1, "name": "Jaringan"}`

#### POST `/api/categories/delete`
- **Auth Required:** Yes
- **Role Access:** Admin
- **Request Body:** `{"id": 7}`

---

### Ticket API

#### POST `/api/tickets/list`
- **Auth Required:** Yes
- **Role Access:** All Roles (Filtered based on Role)
- **Request Body:**
  ```json
  {
    "search": "",
    "status": "",
    "priority": "",
    "category_id": null,
    "assigned_to": null,
    "reporter_id": null
  }
  ```

#### POST `/api/tickets/create`
- **Auth Required:** Yes
- **Role Access:** All Roles
- **Request Body:**
  ```json
  {
    "title": "Internet kantor tidak stabil",
    "description": "Koneksi internet sering terputus sejak pagi.",
    "category_id": 1,
    "priority": "High"
  }
  ```

#### POST `/api/tickets/detail`
- **Auth Required:** Yes
- **Role Access:** All Roles (If owned or Admin/Petugas)
- **Request Body:** `{"id": 1}`

#### POST `/api/tickets/update`
- **Auth Required:** Yes
- **Role Access:** Admin, Petugas, Owner
- **Request Body:**
  ```json
  {
    "id": 1,
    "title": "Internet kantor tidak stabil",
    "description": "Koneksi internet sering terputus sejak pagi.",
    "category_id": 1,
    "priority": "High"
  }
  ```

#### POST `/api/tickets/update-status`
- **Auth Required:** Yes
- **Role Access:** Admin, Petugas
- **Request Body:**
  ```json
  {
    "id": 1,
    "status": "Diproses"
  }
  ```

#### POST `/api/tickets/assign`
- **Auth Required:** Yes
- **Role Access:** Admin
- **Request Body:**
  ```json
  {
    "ticket_id": 1,
    "user_id": 2
  }
  ```

#### POST `/api/tickets/delete`
- **Auth Required:** Yes
- **Role Access:** Admin
- **Request Body:** `{"id": 12}`

---

### Comment API

#### POST `/api/comments/list`
- **Auth Required:** Yes
- **Role Access:** All Roles
- **Request Body:** `{"ticket_id": 1}`

#### POST `/api/comments/create`
- **Auth Required:** Yes
- **Role Access:** All Roles
- **Request Body:**
  ```json
  {
    "ticket_id": 1,
    "comment": "Laporan sudah diterima dan sedang diperiksa."
  }
  ```

---

### Dashboard API

#### POST `/api/dashboard/summary`
- **Auth Required:** Yes
- **Role Access:** Admin, Pimpinan, Petugas
- **Request Body:** `{}`

#### POST `/api/dashboard/tickets-by-status`
- **Auth Required:** Yes
- **Role Access:** Admin, Pimpinan, Petugas
- **Request Body:** `{}`

#### POST `/api/dashboard/tickets-by-category`
- **Auth Required:** Yes
- **Role Access:** Admin, Pimpinan, Petugas
- **Request Body:** `{}`

#### POST `/api/dashboard/tickets-by-priority`
- **Auth Required:** Yes
- **Role Access:** Admin, Pimpinan, Petugas
- **Request Body:** `{}`

#### POST `/api/dashboard/tickets-monthly`
- **Auth Required:** Yes
- **Role Access:** Admin, Pimpinan, Petugas
- **Request Body:** `{}`

---

### Report API

#### POST `/api/reports/tickets`
- **Auth Required:** Yes
- **Role Access:** Admin, Pimpinan
- **Request Body:**
  ```json
  {
    "start_date": "",
    "end_date": "",
    "status": "",
    "category_id": null,
    "priority": "",
    "assigned_to": null,
    "reporter_id": null
  }
  ```

#### POST `/api/reports/tickets/summary`
- **Auth Required:** Yes
- **Role Access:** Admin, Pimpinan
- **Request Body:**
  ```json
  {
    "start_date": "",
    "end_date": ""
  }
  ```

---

### Audit Log API

#### POST `/api/audit-logs/list`
- **Auth Required:** Yes
- **Role Access:** Admin
- **Request Body:**
  ```json
  {
    "search": "",
    "user_id": null,
    "table_name": "",
    "start_date": "",
    "end_date": ""
  }
  ```

#### POST `/api/audit-logs/detail`
- **Auth Required:** Yes
- **Role Access:** Admin
- **Request Body:** `{"id": 1}`

---

### AI Assistant API

Fitur AI Assistant SIHELP mendukung *multi-provider*. Berikut provider yang didukung:
- Gemini
- Ollama
- Groq
- OpenRouter

**Contoh Konfigurasi Provider (via .env):**
```env
AI_PROVIDER=ollama
AI_FEATURE_ENABLED=true
AI_REQUEST_TIMEOUT_SECONDS=60

GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.0-flash

OLLAMA_BASE_URL=http://host.docker.internal:11434
OLLAMA_MODEL=llama3.2

GROQ_API_KEY=
GROQ_BASE_URL=https://api.groq.com/openai/v1
GROQ_MODEL=

OPENROUTER_API_KEY=
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=
```

#### POST `/api/ai/ticket-suggestion`
- **Auth Required:** Yes
- **Role Access:** All Roles
- **Request Body:**
  ```json
  {
    "title": "Internet kantor tidak stabil",
    "description": "Koneksi sering putus setiap 10 menit",
    "category_hint": "",
    "priority_hint": ""
  }
  ```

#### POST `/api/ai/ticket-summary`
- **Auth Required:** Yes
- **Role Access:** All Roles
- **Request Body:**
  ```json
  {
    "ticket_id": 1
  }
  ```

#### POST `/api/ai/reply-suggestion`
- **Auth Required:** Yes
- **Role Access:** All Roles
- **Request Body:**
  ```json
  {
    "ticket_id": 1,
    "tone": "professional"
  }
  ```

---

## 8. Example Curl

**Login:**
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sihelp.local","password":"admin123"}'
```

**Get Profile:**
```bash
curl -X POST http://localhost:8000/api/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN_HERE>" \
  -d '{}'
```

**List Users:**
```bash
curl -X POST http://localhost:8000/api/users/list \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN_HERE>" \
  -d '{"search":""}'
```

**Create Ticket:**
```bash
curl -X POST http://localhost:8000/api/tickets/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN_HERE>" \
  -d '{"title":"Login error","description":"Can not access my account","category_id":1,"priority":"Medium"}'
```

**Update Ticket Status:**
```bash
curl -X POST http://localhost:8000/api/tickets/update-status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN_HERE>" \
  -d '{"id":1,"status":"Diproses"}'
```

**Assign Ticket:**
```bash
curl -X POST http://localhost:8000/api/tickets/assign \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN_HERE>" \
  -d '{"ticket_id":1,"user_id":2}'
```

**Dashboard Summary:**
```bash
curl -X POST http://localhost:8000/api/dashboard/summary \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN_HERE>" \
  -d '{}'
```

**List Audit Logs:**
```bash
curl -X POST http://localhost:8000/api/audit-logs/list \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN_HERE>" \
  -d '{"search":""}'
```

## 9. Postman Usage Guide

Untuk menguji API melalui Postman, ikuti langkah berikut:

1. Buka aplikasi Postman.
2. Klik tombol **Import**.
3. Pilih dan *import* file `SIHELP.postman_collection.json` (Collection) dan `SIHELP.postman_environment.json` (Environment).
4. Pastikan untuk mengaktifkan/pilih *environment* **SIHELP Environment** dari *dropdown environment* di pojok kanan atas Postman.
5. Eksekusi *request* pertama yaitu **Login** (berada di dalam folder *Auth*).
6. Script pada Postman akan secara otomatis menyimpan token ke *environment variable* `{{token}}`.
7. Setelah itu, seluruh endpoint lain dapat dieksekusi tanpa perlu memberikan otorisasi manual.

## 10. Security Notes

Fitur keamanan SIHELP:
- **Password Hashing:** Semua password di-enkripsi di *database* menggunakan mekanisme **bcrypt**.
- **JSON Web Token (JWT):** Autentikasi sepenuhnya dilakukan berbasis JWT dengan masa aktif (*expiry*) tertentu.
- **Logger Masking:** Data sensitif (*password*, *token*, dsb) disamarkan/ditutupi saat dicatat pada server logger.
- **Audit Logs:** Jejak manipulasi data ditandai (*signed*) menggunakan **SHA256**.
- Semua integrasi aplikasi berbasis layanan *Bearer Token* dan memvalidasi tipe Hak Akses (Role-Based).
