package models

import (
	"log"

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
