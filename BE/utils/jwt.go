package utils

import (
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func GenerateToken(userID uint, roleID uint) (string, error) {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "supersecretkey123"
	}

	claims := jwt.MapClaims{
		"user_id": userID,
		"role_id": roleID,
		"exp":     time.Now().Add(time.Hour * 24).Unix(), // 1 day expiration
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}
