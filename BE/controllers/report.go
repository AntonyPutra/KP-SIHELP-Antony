package controllers

import (
	"net/http"

	"sihelp-backend/config"
	"sihelp-backend/models"
	"sihelp-backend/utils"

	"github.com/labstack/echo/v4"
)

func GetReportTickets(c echo.Context) error {
	query := config.DB.Preload("Category").Preload("User")

	if start := c.QueryParam("start_date"); start != "" {
		query = query.Where("created_at >= ?", start)
	}
	if end := c.QueryParam("end_date"); end != "" {
		query = query.Where("created_at <= ?", end)
	}
	if status := c.QueryParam("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	if catID := c.QueryParam("category_id"); catID != "" {
		query = query.Where("category_id = ?", catID)
	}
	if priority := c.QueryParam("priority"); priority != "" {
		query = query.Where("priority = ?", priority)
	}
	if reporter := c.QueryParam("reporter_id"); reporter != "" {
		query = query.Where("user_id = ?", reporter)
	}
	if assignedTo := c.QueryParam("assigned_to"); assignedTo != "" {
		query = query.Joins("JOIN ticket_assignments ON ticket_assignments.ticket_id = tickets.id").
			Where("ticket_assignments.user_id = ?", assignedTo)
	}

	var tickets []models.Ticket
	if err := query.Find(&tickets).Error; err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "Failed to fetch reports", nil)
	}

	return utils.SendSuccess(c, http.StatusOK, "Ticket reports retrieved successfully", tickets)
}

func GetReportSummary(c echo.Context) error {
	var total int64
	query := config.DB.Model(&models.Ticket{})

	if start := c.QueryParam("start_date"); start != "" {
		query = query.Where("created_at >= ?", start)
	}
	if end := c.QueryParam("end_date"); end != "" {
		query = query.Where("created_at <= ?", end)
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
