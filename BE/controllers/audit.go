package controllers

import (
	"net/http"

	"sihelp-backend/config"
	"sihelp-backend/models"
	"sihelp-backend/utils"

	"github.com/labstack/echo/v4"
)

type AuditLogFilterRequest struct {
	Search    string `json:"search"`
	UserID    *uint  `json:"user_id"`
	TableName string `json:"table_name"`
	StartDate string `json:"start_date"`
	EndDate   string `json:"end_date"`
}

func GetAuditLogs(c echo.Context) error {
	var req AuditLogFilterRequest
	c.Bind(&req)

	query := config.DB.Preload("User").Order("created_at desc")

	if req.Search != "" {
		query = query.Where("activity LIKE ?", "%"+req.Search+"%")
	}
	if req.UserID != nil {
		query = query.Where("user_id = ?", *req.UserID)
	}
	if req.TableName != "" {
		query = query.Where("table_name = ?", req.TableName)
	}
	if req.StartDate != "" {
		query = query.Where("created_at >= ?", req.StartDate)
	}
	if req.EndDate != "" {
		query = query.Where("created_at <= ?", req.EndDate)
	}

	var logs []models.AuditLog
	if err := query.Find(&logs).Error; err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "Failed to fetch audit logs", nil)
	}
	return utils.SendSuccess(c, http.StatusOK, "Audit logs retrieved successfully", logs)
}

type IDAuditLogRequest struct {
	ID uint `json:"id"`
}

func GetAuditLogDetail(c echo.Context) error {
	var req IDAuditLogRequest
	if err := c.Bind(&req); err != nil {
		return utils.SendError(c, http.StatusBadRequest, "Invalid request payload", nil)
	}

	var logEntry models.AuditLog
	if err := config.DB.Preload("User").First(&logEntry, req.ID).Error; err != nil {
		return utils.SendError(c, http.StatusNotFound, "Audit log not found", nil)
	}

	return utils.SendSuccess(c, http.StatusOK, "Audit log retrieved successfully", logEntry)
}
