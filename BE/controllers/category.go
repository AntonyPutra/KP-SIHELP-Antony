package controllers

import (
	"net/http"
	"strconv"

	"sihelp-backend/config"
	"sihelp-backend/models"
	"sihelp-backend/utils"

	"github.com/labstack/echo/v4"
)

func GetCategories(c echo.Context) error {
	var categories []models.TicketCategory
	if err := config.DB.Find(&categories).Error; err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "Failed to fetch categories", nil)
	}
	return utils.SendSuccess(c, http.StatusOK, "Categories retrieved successfully", categories)
}

type CreateCategoryRequest struct {
	Name string `json:"name"`
}

func CreateCategory(c echo.Context) error {
	var req CreateCategoryRequest
	if err := c.Bind(&req); err != nil {
		return utils.SendError(c, http.StatusBadRequest, "Invalid request payload", nil)
	}

	category := models.TicketCategory{Name: req.Name}
	if err := config.DB.Create(&category).Error; err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "Failed to create category", err.Error())
	}

	return utils.SendSuccess(c, http.StatusCreated, "Category created successfully", category)
}

func UpdateCategory(c echo.Context) error {
	id, _ := strconv.Atoi(c.Param("id"))
	var category models.TicketCategory
	if err := config.DB.First(&category, id).Error; err != nil {
		return utils.SendError(c, http.StatusNotFound, "Category not found", nil)
	}

	var req CreateCategoryRequest
	if err := c.Bind(&req); err != nil {
		return utils.SendError(c, http.StatusBadRequest, "Invalid request payload", nil)
	}

	category.Name = req.Name
	if err := config.DB.Save(&category).Error; err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "Failed to update category", err.Error())
	}

	return utils.SendSuccess(c, http.StatusOK, "Category updated successfully", category)
}

func DeleteCategory(c echo.Context) error {
	id, _ := strconv.Atoi(c.Param("id"))
	if err := config.DB.Delete(&models.TicketCategory{}, id).Error; err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "Failed to delete category", nil)
	}
	return utils.SendSuccess(c, http.StatusOK, "Category deleted successfully", nil)
}
