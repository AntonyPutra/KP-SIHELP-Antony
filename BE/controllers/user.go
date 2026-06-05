package controllers

import (
	"net/http"
	"strconv"

	"sihelp-backend/config"
	"sihelp-backend/models"
	"sihelp-backend/utils"

	"github.com/labstack/echo/v4"
)

func GetUsers(c echo.Context) error {
	var users []models.User
	if err := config.DB.Preload("Role").Find(&users).Error; err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "Failed to fetch users", nil)
	}
	return utils.SendSuccess(c, http.StatusOK, "Users retrieved successfully", users)
}

func GetUser(c echo.Context) error {
	id, _ := strconv.Atoi(c.Param("id"))
	var user models.User
	if err := config.DB.Preload("Role").First(&user, id).Error; err != nil {
		return utils.SendError(c, http.StatusNotFound, "User not found", nil)
	}
	return utils.SendSuccess(c, http.StatusOK, "User retrieved successfully", user)
}

type CreateUserRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
	RoleID   uint   `json:"role_id"`
}

func CreateUser(c echo.Context) error {
	var req CreateUserRequest
	if err := c.Bind(&req); err != nil {
		return utils.SendError(c, http.StatusBadRequest, "Invalid request payload", nil)
	}

	hash, err := utils.HashPassword(req.Password)
	if err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "Failed to hash password", nil)
	}

	user := models.User{
		Name:     req.Name,
		Email:    req.Email,
		Password: hash,
		RoleID:   req.RoleID,
	}

	if err := config.DB.Create(&user).Error; err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "Failed to create user", err.Error())
	}

	return utils.SendSuccess(c, http.StatusCreated, "User created successfully", user)
}

type UpdateUserRequest struct {
	Name   string `json:"name"`
	Email  string `json:"email"`
	RoleID uint   `json:"role_id"`
}

func UpdateUser(c echo.Context) error {
	id, _ := strconv.Atoi(c.Param("id"))
	var user models.User
	if err := config.DB.First(&user, id).Error; err != nil {
		return utils.SendError(c, http.StatusNotFound, "User not found", nil)
	}

	var req UpdateUserRequest
	if err := c.Bind(&req); err != nil {
		return utils.SendError(c, http.StatusBadRequest, "Invalid request payload", nil)
	}

	user.Name = req.Name
	user.Email = req.Email
	user.RoleID = req.RoleID

	if err := config.DB.Save(&user).Error; err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "Failed to update user", err.Error())
	}

	return utils.SendSuccess(c, http.StatusOK, "User updated successfully", user)
}

func DeleteUser(c echo.Context) error {
	id, _ := strconv.Atoi(c.Param("id"))
	if err := config.DB.Delete(&models.User{}, id).Error; err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "Failed to delete user", nil)
	}
	return utils.SendSuccess(c, http.StatusOK, "User deleted successfully", nil)
}
