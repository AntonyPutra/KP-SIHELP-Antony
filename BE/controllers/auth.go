package controllers

import (
	"net/http"
	"os"
	"strings"
	"time"

	"sihelp-backend/config"
	"sihelp-backend/models"
	"sihelp-backend/utils"

	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
)

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func Login(c echo.Context) error {
	var req LoginRequest
	if err := c.Bind(&req); err != nil {
		return utils.SendError(c, http.StatusBadRequest, "Invalid request payload", nil)
	}

	var user models.User
	if err := config.DB.Where("email = ?", req.Email).First(&user).Error; err != nil {
		return utils.SendError(c, http.StatusUnauthorized, "Invalid email or password", nil)
	}

	if !utils.CheckPasswordHash(req.Password, user.Password) {
		return utils.SendError(c, http.StatusUnauthorized, "Invalid email or password", nil)
	}

	token, err := utils.GenerateToken(user.ID, user.RoleID)
	if err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "Failed to generate token", nil)
	}

	return utils.SendSuccess(c, http.StatusOK, "Login successful", map[string]interface{}{
		"token": token,
		"user": map[string]interface{}{
			"id":    user.ID,
			"name":  user.Name,
			"email": user.Email,
			"role":  user.RoleID,
		},
	})
}

func Profile(c echo.Context) error {
	userID := c.Get("user_id").(uint)

	var user models.User
	if err := config.DB.Preload("Role").First(&user, userID).Error; err != nil {
		return utils.SendError(c, http.StatusNotFound, "User not found", nil)
	}

	return utils.SendSuccess(c, http.StatusOK, "Profile retrieved successfully", user)
}

func Logout(c echo.Context) error {
	authHeader := c.Request().Header.Get("Authorization")
	if authHeader != "" && strings.HasPrefix(authHeader, "Bearer ") {
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		
		secret := os.Getenv("JWT_SECRET")
		if secret == "" {
			secret = "supersecretkey123"
		}
		
		token, _ := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
			return []byte(secret), nil
		})
		
		var expiredAt time.Time
		if token != nil {
			if claims, ok := token.Claims.(jwt.MapClaims); ok {
				if exp, ok := claims["exp"].(float64); ok {
					expiredAt = time.Unix(int64(exp), 0)
				}
			}
		}
		
		if expiredAt.IsZero() {
			expiredAt = time.Now().Add(24 * time.Hour) // fallback
		}
		
		blacklist := models.TokenBlacklist{
			Token:     tokenString,
			ExpiredAt: expiredAt,
			CreatedAt: time.Now(),
		}
		config.DB.Create(&blacklist)
	}

	return utils.SendSuccess(c, http.StatusOK, "Logout successful", map[string]interface{}{})
}

type ChangePasswordRequest struct {
	OldPassword     string `json:"old_password"`
	NewPassword     string `json:"new_password"`
	ConfirmPassword string `json:"confirm_password"`
}

func ChangePassword(c echo.Context) error {
	var req ChangePasswordRequest
	if err := c.Bind(&req); err != nil {
		return utils.SendError(c, http.StatusBadRequest, "Invalid request payload", nil)
	}

	if req.NewPassword != req.ConfirmPassword {
		return utils.SendError(c, http.StatusBadRequest, "Konfirmasi password tidak cocok", nil)
	}

	if len(req.NewPassword) < 8 {
		return utils.SendError(c, http.StatusBadRequest, "Password baru minimal 8 karakter", nil)
	}

	userID := c.Get("user_id").(uint)
	var user models.User
	if err := config.DB.First(&user, userID).Error; err != nil {
		return utils.SendError(c, http.StatusNotFound, "User not found", nil)
	}

	if !utils.CheckPasswordHash(req.OldPassword, user.Password) {
		return utils.SendError(c, http.StatusBadRequest, "Kata sandi lama tidak sesuai.", nil)
	}

	hash, err := utils.HashPassword(req.NewPassword)
	if err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "Failed to hash new password", nil)
	}

	user.Password = hash
	if err := config.DB.Save(&user).Error; err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "Failed to update password", nil)
	}

	return utils.SendSuccess(c, http.StatusOK, "Password berhasil diubah", nil)
}
