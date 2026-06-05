package controllers

import (
	"net/http"

	"sihelp-backend/config"
	"sihelp-backend/models"
	"sihelp-backend/utils"

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
	return utils.SendSuccess(c, http.StatusOK, "Logout successful", nil)
}
