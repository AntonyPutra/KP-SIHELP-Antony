package controllers

import (
	"net/http"

	"sihelp-backend/config"
	"sihelp-backend/models"
	"sihelp-backend/utils"

	"github.com/labstack/echo/v4"
)

type ReportFilterRequest struct {
	StartDate  string `json:"start_date"`
	EndDate    string `json:"end_date"`
	Status     string `json:"status"`
	CategoryID *uint  `json:"category_id"`
	Priority   string `json:"priority"`
	AssignedTo *uint  `json:"assigned_to"`
	ReporterID *uint  `json:"reporter_id"`
}

func GetReportTickets(c echo.Context) error {
	var req ReportFilterRequest
	c.Bind(&req)

	query := config.DB.Preload("Category").Preload("User")

	if req.StartDate != "" {
		query = query.Where("created_at >= ?", req.StartDate)
	}
	if req.EndDate != "" {
		query = query.Where("created_at <= ?", req.EndDate)
	}
	if req.Status != "" {
		query = query.Where("status = ?", req.Status)
	}
	if req.CategoryID != nil {
		query = query.Where("category_id = ?", *req.CategoryID)
	}
	if req.Priority != "" {
		query = query.Where("priority = ?", req.Priority)
	}
	if req.ReporterID != nil {
		query = query.Where("user_id = ?", *req.ReporterID)
	}
	if req.AssignedTo != nil {
		query = query.Joins("JOIN ticket_assignments ON ticket_assignments.ticket_id = tickets.id").
			Where("ticket_assignments.user_id = ?", *req.AssignedTo)
	}

	var tickets []models.Ticket
	if err := query.Find(&tickets).Error; err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "Failed to fetch reports", nil)
	}

	return utils.SendSuccess(c, http.StatusOK, "Ticket reports retrieved successfully", tickets)
}

type ReportSummaryRequest struct {
	StartDate string `json:"start_date"`
	EndDate   string `json:"end_date"`
}

func GetReportSummary(c echo.Context) error {
	var req ReportSummaryRequest
	c.Bind(&req)

	var total int64
	query := config.DB.Model(&models.Ticket{})

	if req.StartDate != "" {
		query = query.Where("created_at >= ?", req.StartDate)
	}
	if req.EndDate != "" {
		query = query.Where("created_at <= ?", req.EndDate)
	}

	query.Count(&total)

	type StatusCount struct {
		Status string `json:"status"`
		Count  int64  `json:"count"`
	}
	var statusCounts []StatusCount
	query.Select("status, count(*) as count").Group("status").Scan(&statusCounts)

	type CategoryCount struct {
		CategoryID uint   `json:"category_id"`
		Name       string `json:"name"`
		Count      int64  `json:"count"`
	}
	var categoryCounts []CategoryCount
	query.Select("ticket_categories.id as category_id, ticket_categories.name, count(tickets.id) as count").
		Joins("JOIN ticket_categories ON ticket_categories.id = tickets.category_id").
		Group("ticket_categories.id, ticket_categories.name").
		Scan(&categoryCounts)

	type PriorityCount struct {
		Priority string `json:"priority"`
		Count    int64  `json:"count"`
	}
	var priorityCounts []PriorityCount
	query.Select("priority, count(*) as count").Group("priority").Scan(&priorityCounts)

	data := map[string]interface{}{
		"total_tickets": total,
		"by_status":     statusCounts,
		"by_category":   categoryCounts,
		"by_priority":   priorityCounts,
	}

	return utils.SendSuccess(c, http.StatusOK, "Report summary retrieved", data)
}
