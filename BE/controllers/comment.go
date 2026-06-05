package controllers

import (
	"net/http"

	"sihelp-backend/config"
	"sihelp-backend/models"
	"sihelp-backend/utils"

	"github.com/labstack/echo/v4"
)

type TicketIDRequest struct {
	TicketID uint `json:"ticket_id"`
}

func GetComments(c echo.Context) error {
	var req TicketIDRequest
	if err := c.Bind(&req); err != nil {
		return utils.SendError(c, http.StatusBadRequest, "Invalid request payload", nil)
	}

	var comments []models.TicketComment
	if err := config.DB.Where("ticket_id = ?", req.TicketID).Preload("User").Find(&comments).Error; err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "Failed to fetch comments", nil)
	}

	return utils.SendSuccess(c, http.StatusOK, "Comments retrieved successfully", comments)
}

type CreateCommentRequest struct {
	TicketID uint   `json:"ticket_id"`
	Comment  string `json:"comment"`
}

func CreateComment(c echo.Context) error {
	userID := c.Get("user_id").(uint)

	var req CreateCommentRequest
	if err := c.Bind(&req); err != nil {
		return utils.SendError(c, http.StatusBadRequest, "Invalid request payload", nil)
	}

	comment := models.TicketComment{
		TicketID: req.TicketID,
		UserID:   userID,
		Comment:  req.Comment,
	}

	if err := config.DB.Create(&comment).Error; err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "Failed to create comment", err.Error())
	}

	utils.LogAudit(userID, "ADD_COMMENT", "ticket_comments", comment.ID)
	return utils.SendSuccess(c, http.StatusCreated, "Comment created successfully", comment)
}
