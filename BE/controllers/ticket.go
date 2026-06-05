package controllers

import (
	"net/http"

	"sihelp-backend/config"
	"sihelp-backend/middlewares"
	"sihelp-backend/models"
	"sihelp-backend/utils"

	"github.com/labstack/echo/v4"
)

type GetTicketsRequest struct {
	Search     string `json:"search"`
	Status     string `json:"status"`
	Priority   string `json:"priority"`
	CategoryID *uint  `json:"category_id"`
	AssignedTo *uint  `json:"assigned_to"`
	ReporterID *uint  `json:"reporter_id"`
}

func GetTickets(c echo.Context) error {
	roleID := c.Get("role_id").(uint)
	userID := c.Get("user_id").(uint)

	var req GetTicketsRequest
	c.Bind(&req)

	query := config.DB.Preload("Category").Preload("User")

	if roleID == middlewares.RoleUser {
		query = query.Where("user_id = ?", userID)
	} else if roleID == middlewares.RolePetugas {
		query = query.Joins("JOIN ticket_assignments ON ticket_assignments.ticket_id = tickets.id").
			Where("ticket_assignments.user_id = ?", userID)
	}

	if req.Search != "" {
		query = query.Where("title LIKE ?", "%"+req.Search+"%")
	}
	if req.Status != "" {
		query = query.Where("status = ?", req.Status)
	}
	if req.Priority != "" {
		query = query.Where("priority = ?", req.Priority)
	}
	if req.CategoryID != nil {
		query = query.Where("category_id = ?", *req.CategoryID)
	}
	if req.AssignedTo != nil {
		// Needs join if not already joined
		if roleID != middlewares.RolePetugas {
			query = query.Joins("JOIN ticket_assignments ON ticket_assignments.ticket_id = tickets.id").
				Where("ticket_assignments.user_id = ?", *req.AssignedTo)
		}
	}
	if req.ReporterID != nil {
		query = query.Where("user_id = ?", *req.ReporterID)
	}

	var tickets []models.Ticket
	if err := query.Find(&tickets).Error; err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "Failed to fetch tickets", nil)
	}

	return utils.SendSuccess(c, http.StatusOK, "Tickets retrieved successfully", tickets)
}

type CreateTicketRequest struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Priority    string `json:"priority"`
	CategoryID  uint   `json:"category_id"`
}

func CreateTicket(c echo.Context) error {
	userID := c.Get("user_id").(uint)

	var req CreateTicketRequest
	if err := c.Bind(&req); err != nil {
		return utils.SendError(c, http.StatusBadRequest, "Invalid request payload", nil)
	}

	ticket := models.Ticket{
		Title:       req.Title,
		Description: req.Description,
		Priority:    req.Priority,
		CategoryID:  req.CategoryID,
		UserID:      userID,
		Status:      "Open",
	}

	if err := config.DB.Create(&ticket).Error; err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "Failed to create ticket", err.Error())
	}

	utils.LogAudit(userID, "CREATE_TICKET", "tickets", ticket.ID)
	return utils.SendSuccess(c, http.StatusCreated, "Ticket created successfully", ticket)
}

type IDTicketRequest struct {
	ID uint `json:"id"`
}

func GetTicket(c echo.Context) error {
	var req IDTicketRequest
	if err := c.Bind(&req); err != nil {
		return utils.SendError(c, http.StatusBadRequest, "Invalid request payload", nil)
	}
	
	var ticket models.Ticket
	if err := config.DB.Preload("Category").Preload("User").First(&ticket, req.ID).Error; err != nil {
		return utils.SendError(c, http.StatusNotFound, "Ticket not found", nil)
	}

	return utils.SendSuccess(c, http.StatusOK, "Ticket retrieved successfully", ticket)
}

type UpdateTicketRequest struct {
	ID          uint   `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Priority    string `json:"priority"`
	CategoryID  uint   `json:"category_id"`
}

func UpdateTicket(c echo.Context) error {
	userID := c.Get("user_id").(uint)

	var req UpdateTicketRequest
	if err := c.Bind(&req); err != nil {
		return utils.SendError(c, http.StatusBadRequest, "Invalid request payload", nil)
	}

	var ticket models.Ticket
	if err := config.DB.First(&ticket, req.ID).Error; err != nil {
		return utils.SendError(c, http.StatusNotFound, "Ticket not found", nil)
	}

	ticket.Title = req.Title
	ticket.Description = req.Description
	ticket.Priority = req.Priority
	ticket.CategoryID = req.CategoryID

	if err := config.DB.Save(&ticket).Error; err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "Failed to update ticket", err.Error())
	}

	utils.LogAudit(userID, "UPDATE_TICKET", "tickets", ticket.ID)
	return utils.SendSuccess(c, http.StatusOK, "Ticket updated successfully", ticket)
}

type UpdateStatusRequest struct {
	ID     uint   `json:"id"`
	Status string `json:"status"`
}

func UpdateTicketStatus(c echo.Context) error {
	userID := c.Get("user_id").(uint)

	var req UpdateStatusRequest
	if err := c.Bind(&req); err != nil {
		return utils.SendError(c, http.StatusBadRequest, "Invalid request payload", nil)
	}

	var ticket models.Ticket
	if err := config.DB.First(&ticket, req.ID).Error; err != nil {
		return utils.SendError(c, http.StatusNotFound, "Ticket not found", nil)
	}

	ticket.Status = req.Status
	if err := config.DB.Save(&ticket).Error; err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "Failed to update ticket status", err.Error())
	}

	utils.LogAudit(userID, "UPDATE_TICKET_STATUS", "tickets", ticket.ID)
	return utils.SendSuccess(c, http.StatusOK, "Ticket status updated", ticket)
}

type AssignTicketRequest struct {
	TicketID uint `json:"ticket_id"`
	UserID   uint `json:"user_id"`
}

func AssignTicket(c echo.Context) error {
	adminID := c.Get("user_id").(uint)

	var req AssignTicketRequest
	if err := c.Bind(&req); err != nil {
		return utils.SendError(c, http.StatusBadRequest, "Invalid request payload", nil)
	}

	assignment := models.TicketAssignment{
		TicketID: req.TicketID,
		UserID:   req.UserID,
	}

	if err := config.DB.Create(&assignment).Error; err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "Failed to assign ticket", err.Error())
	}

	config.DB.Model(&models.Ticket{}).Where("id = ?", req.TicketID).Update("status", "Diproses")

	utils.LogAudit(adminID, "ASSIGN_TICKET", "ticket_assignments", assignment.ID)
	return utils.SendSuccess(c, http.StatusOK, "Ticket assigned successfully", assignment)
}

func DeleteTicket(c echo.Context) error {
	adminID := c.Get("user_id").(uint)

	var req IDTicketRequest
	if err := c.Bind(&req); err != nil {
		return utils.SendError(c, http.StatusBadRequest, "Invalid request payload", nil)
	}

	if err := config.DB.Delete(&models.Ticket{}, req.ID).Error; err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "Failed to delete ticket", nil)
	}

	utils.LogAudit(adminID, "DELETE_TICKET", "tickets", req.ID)
	return utils.SendSuccess(c, http.StatusOK, "Ticket deleted successfully", nil)
}
