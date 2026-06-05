package controllers

import (
	"net/http"

	"sihelp-backend/config"
	"sihelp-backend/models"
	"sihelp-backend/utils"

	"github.com/labstack/echo/v4"
)

func GetAuditLogs(c echo.Context) error {
	var logs []models.AuditLog
	if err := config.DB.Preload("User").Order("created_at desc").Find(&logs).Error; err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "Failed to fetch audit logs", nil)
	}
	return utils.SendSuccess(c, http.StatusOK, "Audit logs retrieved successfully", logs)
}
