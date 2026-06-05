package controllers

import (
	"net/http"

	"sihelp-backend/config"
	"sihelp-backend/models"
	"sihelp-backend/utils"

	"github.com/labstack/echo/v4"
)

func GetDashboardSummary(c echo.Context) error {
	var totalUsers, totalTickets, totalCategories, totalAuditLogs int64
	var totalOpen, totalProcess, totalDone, totalRejected int64

	config.DB.Model(&models.User{}).Count(&totalUsers)
	config.DB.Model(&models.TicketCategory{}).Count(&totalCategories)
	config.DB.Model(&models.AuditLog{}).Count(&totalAuditLogs)
	config.DB.Model(&models.Ticket{}).Count(&totalTickets)

	config.DB.Model(&models.Ticket{}).Where("status = ?", "Open").Count(&totalOpen)
	config.DB.Model(&models.Ticket{}).Where("status = ?", "Diproses").Count(&totalProcess)
	config.DB.Model(&models.Ticket{}).Where("status = ?", "Selesai").Count(&totalDone)
	config.DB.Model(&models.Ticket{}).Where("status = ?", "Ditolak").Count(&totalRejected)

	data := map[string]interface{}{
		"total_users":           totalUsers,
		"total_tickets":         totalTickets,
		"total_open_tickets":    totalOpen,
		"total_process_tickets": totalProcess,
		"total_done_tickets":    totalDone,
		"total_rejected_tickets": totalRejected,
		"total_categories":      totalCategories,
		"total_audit_logs":      totalAuditLogs,
	}

	return utils.SendSuccess(c, http.StatusOK, "Dashboard summary retrieved", data)
}

func GetTicketsByStatus(c echo.Context) error {
	type Result struct {
		Status string `json:"status"`
		Count  int64  `json:"count"`
	}
	var results []Result
	config.DB.Model(&models.Ticket{}).Select("status, count(*) as count").Group("status").Scan(&results)

	return utils.SendSuccess(c, http.StatusOK, "Tickets by status retrieved", results)
}

func GetTicketsByCategory(c echo.Context) error {
	type Result struct {
		CategoryID uint   `json:"category_id"`
		Name       string `json:"name"`
		Count      int64  `json:"count"`
	}
	var results []Result
	config.DB.Model(&models.Ticket{}).
		Select("ticket_categories.id as category_id, ticket_categories.name, count(tickets.id) as count").
		Joins("JOIN ticket_categories ON ticket_categories.id = tickets.category_id").
		Group("ticket_categories.id, ticket_categories.name").
		Scan(&results)

	return utils.SendSuccess(c, http.StatusOK, "Tickets by category retrieved", results)
}

func GetTicketsByPriority(c echo.Context) error {
	type Result struct {
		Priority string `json:"priority"`
		Count    int64  `json:"count"`
	}
	var results []Result
	config.DB.Model(&models.Ticket{}).Select("priority, count(*) as count").Group("priority").Scan(&results)

	return utils.SendSuccess(c, http.StatusOK, "Tickets by priority retrieved", results)
}

func GetTicketsMonthly(c echo.Context) error {
	type Result struct {
		Month string `json:"month"`
		Count int64  `json:"count"`
	}
	var results []Result
	config.DB.Model(&models.Ticket{}).
		Select("TO_CHAR(tickets.created_at, 'YYYY-MM') as month, count(*) as count").
		Group("month").
		Order("month asc").
		Scan(&results)

	return utils.SendSuccess(c, http.StatusOK, "Tickets monthly retrieved", results)
}
