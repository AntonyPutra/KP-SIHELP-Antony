package models

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"log"
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func SeedData(db *gorm.DB) {
	roles := []Role{
		{ID: 1, Name: "Admin"},
		{ID: 2, Name: "Petugas"},
		{ID: 3, Name: "User"},
		{ID: 4, Name: "Pimpinan"},
	}

	for _, role := range roles {
		var existing Role
		if err := db.Where("id = ?", role.ID).First(&existing).Error; err != nil {
			db.Create(&role)
			log.Printf("Seeded role: %s\n", role.Name)
		}
	}

	var admin User
	if err := db.Where("email = ?", "admin@sihelp.local").First(&admin).Error; err != nil {
		hash, _ := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
		admin = User{
			Name:     "Super Administrator",
			Email:    "admin@sihelp.local",
			Password: string(hash),
			RoleID:   1, // Admin
		}
		db.Create(&admin)
		log.Println("Seeded admin user: admin@sihelp.local")
	}
}

// localHash for demo seeder to avoid import cycle with utils
func localHash(userID uint, activity string, tableName string, recordID uint, timestamp string) string {
	data := fmt.Sprintf("%d-%s-%s-%d-%s", userID, activity, tableName, recordID, timestamp)
	hash := sha256.Sum256([]byte(data))
	return hex.EncodeToString(hash[:])
}

func logDemoAudit(db *gorm.DB, userID uint, activity string, tableName string, recordID uint, t time.Time) {
	timestamp := t.Format(time.RFC3339Nano)
	hashSig := localHash(userID, activity, tableName, recordID, timestamp)
	logEntry := AuditLog{
		UserID:        userID,
		Activity:      activity,
		TableName:     tableName,
		RecordID:      recordID,
		HashSignature: hashSig,
		CreatedAt:     t,
	}
	db.Create(&logEntry)
}

func SeedDemoData(db *gorm.DB) {
	var count int64
	db.Model(&Ticket{}).Count(&count)
	if count > 0 {
		log.Println("Demo data already exists, skipping...")
		return
	}

	log.Println("Starting to seed demo data...")

	now := time.Now()

	// 1. Users
	usersData := []struct {
		Name     string
		Email    string
		Password string
		RoleID   uint
	}{
		{"Budi Santoso", "petugas@sihelp.local", "petugas123", 2},
		{"Sari Teknisi", "teknisi@sihelp.local", "petugas123", 2},
		{"Andi Pratama", "user@sihelp.local", "user123", 3},
		{"Rina Lestari", "rina@sihelp.local", "user123", 3},
		{"Kepala Divisi", "pimpinan@sihelp.local", "pimpinan123", 4},
	}

	usersMap := make(map[string]uint)
	// get admin
	var admin User
	db.Where("email = ?", "admin@sihelp.local").First(&admin)
	usersMap["admin@sihelp.local"] = admin.ID

	for _, u := range usersData {
		var existing User
		if err := db.Where("email = ?", u.Email).First(&existing).Error; err != nil {
			hash, _ := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
			newUser := User{
				Name:      u.Name,
				Email:     u.Email,
				Password:  string(hash),
				RoleID:    u.RoleID,
				CreatedAt: now.AddDate(0, -3, 0),
			}
			db.Create(&newUser)
			usersMap[newUser.Email] = newUser.ID
			logDemoAudit(db, newUser.ID, "User Login (Demo)", "users", newUser.ID, now.AddDate(0, -3, 1))
		} else {
			usersMap[existing.Email] = existing.ID
		}
	}

	// 2. Categories
	categories := []string{"Jaringan", "Hardware", "Software", "Akun", "API Issue", "Fasilitas", "Lainnya"}
	catMap := make(map[string]uint)
	for _, c := range categories {
		var cat TicketCategory
		if err := db.Where("name = ?", c).First(&cat).Error; err != nil {
			cat = TicketCategory{Name: c}
			db.Create(&cat)
		}
		catMap[cat.Name] = cat.ID
	}

	// 3. Tickets
	type ticketSeed struct {
		Title      string
		Desc       string
		Cat        string
		Pri        string
		Stat       string
		RepEmail   string
		AssignTo   string
		MonthsAgo  int
		Comment    string
	}

	tickets := []ticketSeed{
		{"Internet kantor tidak stabil", "Koneksi sering terputus sejak pagi.", "Jaringan", "High", "Open", "user@sihelp.local", "", 0, ""},
		{"Laptop inventaris lambat saat membuka aplikasi", "Butuh waktu 10 menit untuk buka browser.", "Hardware", "Medium", "Diproses", "rina@sihelp.local", "petugas@sihelp.local", 1, "Masalah sedang ditangani oleh petugas."},
		{"Error saat login aplikasi internal", "Pesan error invalid credentials padahal benar.", "Software", "High", "Selesai", "user@sihelp.local", "teknisi@sihelp.local", 2, "Perbaikan sudah dilakukan, mohon dicek kembali."},
		{"Reset password akun pengguna", "Lupa password untuk masuk email.", "Akun", "Low", "Selesai", "rina@sihelp.local", "petugas@sihelp.local", 3, "Tiket ditutup karena kendala sudah selesai."},
		{"Response API balance inquiry tidak sesuai", "Terdapat selisih pada payload response.", "API Issue", "Critical", "Diproses", "user@sihelp.local", "teknisi@sihelp.local", 0, "Perlu pengecekan ulang pada request dan response API."},
		{"Printer ruang administrasi tidak terdeteksi", "Driver tidak merespon di semua PC.", "Hardware", "Medium", "Open", "rina@sihelp.local", "", 1, ""},
		{"Permintaan instalasi software pendukung", "Butuh instalasi MS Office baru.", "Software", "Low", "Selesai", "user@sihelp.local", "petugas@sihelp.local", 2, "Laporan sudah diterima dan sedang diperiksa."},
		{"Endpoint API timeout pada environment staging", "Request lebih dari 30 detik selalu RTO.", "API Issue", "High", "Diproses", "rina@sihelp.local", "teknisi@sihelp.local", 1, "Masalah sedang ditangani oleh petugas."},
		{"Kabel jaringan ruang meeting bermasalah", "Kabel LAN putus digigit tikus.", "Jaringan", "Medium", "Selesai", "user@sihelp.local", "petugas@sihelp.local", 0, "Perbaikan sudah dilakukan, mohon dicek kembali."},
		{"Permintaan akses sistem laporan", "Membutuhkan role viewer di BI dashboard.", "Akun", "Medium", "Open", "rina@sihelp.local", "", 2, ""},
		{"AC ruang kerja tidak menyala", "Sudah dilaporkan ke GA tapi belum ada respon.", "Fasilitas", "Low", "Ditolak", "user@sihelp.local", "", 1, "Bukan wewenang IT, harap teruskan ke GA."},
		{"Validasi payload request API gagal", "Tipe data mismatch pada field amount.", "API Issue", "Critical", "Selesai", "rina@sihelp.local", "teknisi@sihelp.local", 0, "Tiket ditutup karena kendala sudah selesai."},
	}

	for _, ts := range tickets {
		tDate := now.AddDate(0, -ts.MonthsAgo, -ts.MonthsAgo) // Shift days slightly for variation
		reporterID := usersMap[ts.RepEmail]

		tk := Ticket{
			Title:       ts.Title,
			Description: ts.Desc,
			Status:      ts.Stat,
			Priority:    ts.Pri,
			CategoryID:  catMap[ts.Cat],
			UserID:      reporterID,
			CreatedAt:   tDate,
			UpdatedAt:   tDate,
		}
		db.Create(&tk)

		logDemoAudit(db, reporterID, "Membuat Tiket Baru", "tickets", tk.ID, tDate)

		if ts.AssignTo != "" {
			assigneeID := usersMap[ts.AssignTo]
			db.Create(&TicketAssignment{
				TicketID: tk.ID,
				UserID:   assigneeID,
			})
			assignDate := tDate.Add(time.Hour * 1)
			logDemoAudit(db, admin.ID, "Assign Tiket ke Petugas", "ticket_assignments", tk.ID, assignDate)
		}

		if ts.Comment != "" {
			// Random author: either the assignee or admin
			authorID := admin.ID
			if ts.AssignTo != "" {
				authorID = usersMap[ts.AssignTo]
			}
			commentDate := tDate.Add(time.Hour * 2)
			db.Create(&TicketComment{
				TicketID:  tk.ID,
				UserID:    authorID,
				Comment:   ts.Comment,
				CreatedAt: commentDate,
			})
			logDemoAudit(db, authorID, "Menambahkan Komentar pada Tiket", "ticket_comments", tk.ID, commentDate)
		}

		// Update audit log for status change
		if ts.Stat == "Diproses" || ts.Stat == "Selesai" || ts.Stat == "Ditolak" {
			logDemoAudit(db, admin.ID, "Update Status Tiket menjadi "+ts.Stat, "tickets", tk.ID, tDate.Add(time.Hour*3))
		}
	}

	log.Println("Demo data seeded successfully")
}

