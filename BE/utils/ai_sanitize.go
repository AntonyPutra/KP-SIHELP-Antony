package utils

import (
	"sihelp-backend/models"
)

// SanitizeTicketForAI returns a map with only non-sensitive ticket fields.
func SanitizeTicketForAI(ticket models.Ticket, comments []models.TicketComment) map[string]interface{} {
	sanitizedComments := make([]map[string]interface{}, 0)
	for _, c := range comments {
		sanitizedComments = append(sanitizedComments, map[string]interface{}{
			"id":         c.ID,
			"user_name":  c.User.Name,
			"comment":    c.Comment,
			"created_at": c.CreatedAt,
		})
	}

	return map[string]interface{}{
		"id":          ticket.ID,
		"title":       ticket.Title,
		"description": ticket.Description,
		"status":      ticket.Status,
		"priority":    ticket.Priority,
		"category":    ticket.Category.Name,
		"user_name":   ticket.User.Name, // avoid sending email or password
		"created_at":  ticket.CreatedAt,
		"comments":    sanitizedComments,
	}
}
