package controllers

import (
	"net/http"

	"sihelp-backend/config"
	"sihelp-backend/models"
	"sihelp-backend/utils"

	"github.com/labstack/echo/v4"
)

type GetCategoriesRequest struct {
	Search string `json:"search"`
}

func GetCategories(c echo.Context) error {
	var req GetCategoriesRequest
	c.Bind(&req)

	query := config.DB
	if req.Search != "" {
		query = query.Where("name LIKE ?", "%"+req.Search+"%")
	}

	var categories []models.TicketCategory
	if err := query.Find(&categories).Error; err != nil {
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

type IDCategoryRequest struct {
	ID uint `json:"id"`
}

func GetCategoryDetail(c echo.Context) error {
	var req IDCategoryRequest
	if err := c.Bind(&req); err != nil {
		return utils.SendError(c, http.StatusBadRequest, "Invalid request payload", nil)
	}

	var category models.TicketCategory
	if err := config.DB.First(&category, req.ID).Error; err != nil {
		return utils.SendError(c, http.StatusNotFound, "Category not found", nil)
	}
	return utils.SendSuccess(c, http.StatusOK, "Category retrieved successfully", category)
}

type UpdateCategoryRequest struct {
	ID   uint   `json:"id"`
	Name string `json:"name"`
}

func UpdateCategory(c echo.Context) error {
	var req UpdateCategoryRequest
	if err := c.Bind(&req); err != nil {
		return utils.SendError(c, http.StatusBadRequest, "Invalid request payload", nil)
	}

	var category models.TicketCategory
	if err := config.DB.First(&category, req.ID).Error; err != nil {
		return utils.SendError(c, http.StatusNotFound, "Category not found", nil)
	}

	category.Name = req.Name
	if err := config.DB.Save(&category).Error; err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "Failed to update category", err.Error())
	}

	return utils.SendSuccess(c, http.StatusOK, "Category updated successfully", category)
}

func DeleteCategory(c echo.Context) error {
	var req IDCategoryRequest
	if err := c.Bind(&req); err != nil {
		return utils.SendError(c, http.StatusBadRequest, "Invalid request payload", nil)
	}

	if err := config.DB.Delete(&models.TicketCategory{}, req.ID).Error; err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "Failed to delete category", nil)
	}
	return utils.SendSuccess(c, http.StatusOK, "Category deleted successfully", nil)
}
