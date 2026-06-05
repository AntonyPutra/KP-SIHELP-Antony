package controllers

import (
	"net/http"
	"strconv"

	"sihelp-backend/config"
	"sihelp-backend/middlewares"
	"sihelp-backend/models"
	"sihelp-backend/utils"

	"github.com/labstack/echo/v4"
)

func GetTickets(c echo.Context) error {
	roleID := c.Get("role_id").(uint)
	userID := c.Get("user_id").(uint)

	query := config.DB.Preload("Category").Preload("User")

	if roleID == middlewares.RoleUser {
		query = query.Where("user_id = ?", userID)
	} else if roleID == middlewares.RolePetugas {
		query = query.Joins("JOIN ticket_assignments ON ticket_assignments.ticket_id = tickets.id").
			Where("ticket_assignments.user_id = ?", userID)
	}

	if status := c.QueryParam("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	if priority := c.QueryParam("priority"); priority != "" {
		query = query.Where("priority = ?", priority)
	}
	if catID := c.QueryParam("category_id"); catID != "" {
		query = query.Where("category_id = ?", catID)
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

func GetTicket(c echo.Context) error {
	id, _ := strconv.Atoi(c.Param("id"))
	
	var ticket models.Ticket
	if err := config.DB.Preload("Category").Preload("User").First(&ticket, id).Error; err != nil {
		return utils.SendError(c, http.StatusNotFound, "Ticket not found", nil)
	}

	return utils.SendSuccess(c, http.StatusOK, "Ticket retrieved successfully", ticket)
}

type UpdateTicketRequest struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Priority    string `json:"priority"`
	CategoryID  uint   `json:"category_id"`
}

func UpdateTicket(c echo.Context) error {
	id, _ := strconv.Atoi(c.Param("id"))
	userID := c.Get("user_id").(uint)

	var ticket models.Ticket
	if err := config.DB.First(&ticket, id).Error; err != nil {
		return utils.SendError(c, http.StatusNotFound, "Ticket not found", nil)
	}

	var req UpdateTicketRequest
	if err := c.Bind(&req); err != nil {
		return utils.SendError(c, http.StatusBadRequest, "Invalid request payload", nil)
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
	Status string `json:"status"`
}

func UpdateTicketStatus(c echo.Context) error {
	id, _ := strconv.Atoi(c.Param("id"))
	userID := c.Get("user_id").(uint)

	var ticket models.Ticket
	if err := config.DB.First(&ticket, id).Error; err != nil {
		return utils.SendError(c, http.StatusNotFound, "Ticket not found", nil)
	}

	var req UpdateStatusRequest
	if err := c.Bind(&req); err != nil {
		return utils.SendError(c, http.StatusBadRequest, "Invalid request payload", nil)
	}

	ticket.Status = req.Status
	if err := config.DB.Save(&ticket).Error; err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "Failed to update ticket status", err.Error())
	}

	utils.LogAudit(userID, "UPDATE_TICKET_STATUS", "tickets", ticket.ID)
	return utils.SendSuccess(c, http.StatusOK, "Ticket status updated", ticket)
}

type AssignTicketRequest struct {
	PetugasID uint `json:"petugas_id"`
}

func AssignTicket(c echo.Context) error {
	id, _ := strconv.Atoi(c.Param("id"))
	adminID := c.Get("user_id").(uint)

	var req AssignTicketRequest
	if err := c.Bind(&req); err != nil {
		return utils.SendError(c, http.StatusBadRequest, "Invalid request payload", nil)
	}

	assignment := models.TicketAssignment{
		TicketID: uint(id),
		UserID:   req.PetugasID,
	}

	if err := config.DB.Create(&assignment).Error; err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "Failed to assign ticket", err.Error())
	}

	config.DB.Model(&models.Ticket{}).Where("id = ?", id).Update("status", "Diproses")

	utils.LogAudit(adminID, "ASSIGN_TICKET", "ticket_assignments", assignment.ID)
	return utils.SendSuccess(c, http.StatusOK, "Ticket assigned successfully", assignment)
}

func DeleteTicket(c echo.Context) error {
	id, _ := strconv.Atoi(c.Param("id"))
	adminID := c.Get("user_id").(uint)

	if err := config.DB.Delete(&models.Ticket{}, id).Error; err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "Failed to delete ticket", nil)
	}

	utils.LogAudit(adminID, "DELETE_TICKET", "tickets", uint(id))
	return utils.SendSuccess(c, http.StatusOK, "Ticket deleted successfully", nil)
}
