# SIHELP API Documentation

## Base URL
* **Local**: `http://localhost:8000`
* **Tailscale**: `http://100.73.16.92:8000`
* **Domain**: `https://api.whaleestudio.my.id`

## Authentication
API ini menggunakan Bearer Token untuk endpoint yang diproteksi.
Header yang digunakan:
```
Authorization: Bearer <token>
Content-Type: application/json
```

## Standard Response
Semua response dibungkus menggunakan format JSON standar:

**Success Response:**
```json
{
  "success": true,
  "message": "Pesan sukses",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Pesan error",
  "errors": { ... }
}
```

> **Catatan Penting**: 
> Demi keseragaman request dan mempermudah testing di Postman, **semua endpoint aplikasi menggunakan method POST**. ID maupun filter parameter dikirimkan di dalam JSON Body Request, bukan di URL param atau Query String.

---

## 1. Auth API

### Login
`POST /api/auth/login`
**Request Body:**
```json
{
  "email": "admin@sihelp.local",
  "password": "admin123"
}
```

### Profile
`POST /api/auth/profile`
**Request Body:** `{}`

### Logout
`POST /api/auth/logout`
**Request Body:** `{}`

---

## 2. User API (Admin Only)

### List Users
`POST /api/users/list`
**Request Body:**
```json
{
  "search": "",
  "role_id": null
}
```

### Create User
`POST /api/users/create`
**Request Body:**
```json
{
  "name": "Budi Santoso",
  "email": "budi@sihelp.local",
  "password": "password123",
  "role_id": 2
}
```

### Detail User
`POST /api/users/detail`
**Request Body:**
```json
{
  "id": 1
}
```

### Update User
`POST /api/users/update`
**Request Body:**
```json
{
  "id": 1,
  "name": "Super Administrator",
  "email": "admin@sihelp.local",
  "role_id": 1
}
```

### Delete User
`POST /api/users/delete`
**Request Body:**
```json
{
  "id": 2
}
```

---

## 3. Category API

### List Categories
`POST /api/categories/list`
**Request Body:**
```json
{
  "search": ""
}
```

### Create Category (Admin Only)
`POST /api/categories/create`
**Request Body:**
```json
{
  "name": "Jaringan"
}
```

### Detail Category
`POST /api/categories/detail`
**Request Body:**
```json
{
  "id": 1
}
```

### Update Category (Admin Only)
`POST /api/categories/update`
**Request Body:**
```json
{
  "id": 1,
  "name": "Jaringan"
}
```

### Delete Category (Admin Only)
`POST /api/categories/delete`
**Request Body:**
```json
{
  "id": 1
}
```

---

## 4. Ticket API

### List Tickets
`POST /api/tickets/list`
**Request Body:**
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

### Create Ticket
`POST /api/tickets/create`
**Request Body:**
```json
{
  "title": "Internet kantor tidak stabil",
  "description": "Koneksi internet sering terputus sejak pagi.",
  "category_id": 1,
  "priority": "High"
}
```

### Detail Ticket
`POST /api/tickets/detail`
**Request Body:**
```json
{
  "id": 1
}
```

### Update Ticket (Admin Only)
`POST /api/tickets/update`
**Request Body:**
```json
{
  "id": 1,
  "title": "Internet kantor tidak stabil",
  "description": "Koneksi internet sering terputus sejak pagi.",
  "category_id": 1,
  "priority": "High"
}
```

### Update Ticket Status (Admin & Petugas)
`POST /api/tickets/update-status`
**Request Body:**
```json
{
  "id": 1,
  "status": "Diproses"
}
```

### Assign Ticket (Admin Only)
`POST /api/tickets/assign`
**Request Body:**
```json
{
  "ticket_id": 1,
  "user_id": 2
}
```

### Delete Ticket (Admin Only)
`POST /api/tickets/delete`
**Request Body:**
```json
{
  "id": 1
}
```

---

## 5. Comment API

### List Comments
`POST /api/comments/list`
**Request Body:**
```json
{
  "ticket_id": 1
}
```

### Create Comment
`POST /api/comments/create`
**Request Body:**
```json
{
  "ticket_id": 1,
  "comment": "Laporan sudah diterima dan sedang diperiksa."
}
```

---

## 6. Dashboard API (Admin & Pimpinan)

### Summary
`POST /api/dashboard/summary`
**Request Body:** `{}`

### Tickets by Status
`POST /api/dashboard/tickets-by-status`
**Request Body:** `{}`

### Tickets by Category
`POST /api/dashboard/tickets-by-category`
**Request Body:** `{}`

### Tickets by Priority
`POST /api/dashboard/tickets-by-priority`
**Request Body:** `{}`

### Tickets Monthly
`POST /api/dashboard/tickets-monthly`
**Request Body:** `{}`

---

## 7. Report API (Admin & Pimpinan)

### Filter Tickets
`POST /api/reports/tickets`
**Request Body:**
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

### Report Summary
`POST /api/reports/tickets/summary`
**Request Body:**
```json
{
  "start_date": "",
  "end_date": ""
}
```

---

## 8. Audit Log API (Admin & Pimpinan)

### List Audit Logs
`POST /api/audit-logs/list`
**Request Body:**
```json
{
  "search": "",
  "user_id": null,
  "table_name": "",
  "start_date": "",
  "end_date": ""
}
```

### Detail Audit Log
`POST /api/audit-logs/detail`
**Request Body:**
```json
{
  "id": 1
}
```

---

## 9. Role Access Matrix

| Role | Deskripsi Hak Akses |
|------|--------------------|
| **Admin** | Memiliki akses penuh (CRUD) ke seluruh data sistem, termasuk pengguna, kategori, audit logs, mengubah status, serta menugaskan tiket (Assign Ticket). |
| **Petugas** | Hanya bisa melihat daftar tiket yang ditugaskan kepada dirinya dan mengubah status tiket menjadi Diproses/Selesai/Ditolak. |
| **User** | Hanya bisa melihat, membuat, dan membalas komentar tiket miliknya sendiri. |
| **Pimpinan** | Memiliki hak baca (Read-Only) untuk laporan dashboard, report ticket, serta audit logs tanpa bisa melakukan perubahan. |

---

## 10. Example cURL

### 1. Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
-H "Content-Type: application/json" \
-d '{"email":"admin@sihelp.local","password":"admin123"}'
```

### 2. List Users
```bash
curl -X POST http://localhost:8000/api/users/list \
-H "Content-Type: application/json" \
-H "Authorization: Bearer <TOKEN>" \
-d '{}'
```

### 3. Create Ticket
```bash
curl -X POST http://localhost:8000/api/tickets/create \
-H "Content-Type: application/json" \
-H "Authorization: Bearer <TOKEN>" \
-d '{
  "title": "Internet Mati",
  "description": "Wifi ruang meeting tidak terkoneksi",
  "category_id": 1,
  "priority": "High"
}'
```

### 4. Assign Ticket
```bash
curl -X POST http://localhost:8000/api/tickets/assign \
-H "Content-Type: application/json" \
-H "Authorization: Bearer <TOKEN>" \
-d '{"ticket_id": 1, "user_id": 2}'
```

### 5. Update Status Ticket
```bash
curl -X POST http://localhost:8000/api/tickets/update-status \
-H "Content-Type: application/json" \
-H "Authorization: Bearer <TOKEN>" \
-d '{"id": 1, "status": "Diproses"}'
```

### 6. List Audit Logs
```bash
curl -X POST http://localhost:8000/api/audit-logs/list \
-H "Content-Type: application/json" \
-H "Authorization: Bearer <TOKEN>" \
-d '{}'
```
