package controllers

import (
	"net/http"

	"sihelp-backend/config"
	"sihelp-backend/models"
	"sihelp-backend/utils"

	"github.com/labstack/echo/v4"
)

type GetUsersRequest struct {
	Search string `json:"search"`
	RoleID *uint  `json:"role_id"`
}

func GetUsers(c echo.Context) error {
	var req GetUsersRequest
	c.Bind(&req)

	query := config.DB.Preload("Role")
	if req.Search != "" {
		query = query.Where("name LIKE ? OR email LIKE ?", "%"+req.Search+"%", "%"+req.Search+"%")
	}
	if req.RoleID != nil {
		query = query.Where("role_id = ?", *req.RoleID)
	}

	var users []models.User
	if err := query.Find(&users).Error; err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "Failed to fetch users", nil)
	}
	return utils.SendSuccess(c, http.StatusOK, "Users retrieved successfully", users)
}

type IDRequest struct {
	ID uint `json:"id"`
}

func GetUser(c echo.Context) error {
	var req IDRequest
	if err := c.Bind(&req); err != nil {
		return utils.SendError(c, http.StatusBadRequest, "Invalid request payload", nil)
	}

	var user models.User
	if err := config.DB.Preload("Role").First(&user, req.ID).Error; err != nil {
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
	ID     uint   `json:"id"`
	Name   string `json:"name"`
	Email  string `json:"email"`
	RoleID uint   `json:"role_id"`
}

func UpdateUser(c echo.Context) error {
	var req UpdateUserRequest
	if err := c.Bind(&req); err != nil {
		return utils.SendError(c, http.StatusBadRequest, "Invalid request payload", nil)
	}

	var user models.User
	if err := config.DB.First(&user, req.ID).Error; err != nil {
		return utils.SendError(c, http.StatusNotFound, "User not found", nil)
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
	var req IDRequest
	if err := c.Bind(&req); err != nil {
		return utils.SendError(c, http.StatusBadRequest, "Invalid request payload", nil)
	}

	if err := config.DB.Delete(&models.User{}, req.ID).Error; err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "Failed to delete user", nil)
	}
	return utils.SendSuccess(c, http.StatusOK, "User deleted successfully", nil)
}
