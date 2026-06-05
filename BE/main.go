package main

import (
	"log"

	"sihelp-backend/config"
	"sihelp-backend/controllers"
	"sihelp-backend/middlewares"
	"sihelp-backend/models"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	// Initialize database connection
	config.ConnectDB()

	// Auto-migrate the database schema
	err := config.DB.AutoMigrate(
		&models.Role{},
		&models.User{},
		&models.TicketCategory{},
		&models.Ticket{},
		&models.TicketAssignment{},
		&models.TicketComment{},
		&models.AuditLog{},
	)
	if err != nil {
		log.Fatal("Failed to auto-migrate database:", err)
	}

	// Run Seeders
	models.SeedData(config.DB)

	// Create a new Echo instance
	e := echo.New()

	// Global Middleware
	e.Use(middlewares.CustomLogger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{
			"http://localhost:5173",
			"http://100.73.16.92:5173",
			"http://192.168.1.3:5173",
			"https://sihelp.whaleestudio.my.id",
		},
		AllowMethods: []string{echo.GET, echo.POST, echo.PUT, echo.PATCH, echo.DELETE},
	}))

	// Routes
	e.GET("/", func(c echo.Context) error {
		return c.JSON(200, map[string]interface{}{
			"success": true,
			"message": "Welcome to SIHELP API",
			"data":    nil,
		})
	})

	api := e.Group("/api")

	// Auth Routes
	api.POST("/login", controllers.Login)
	api.POST("/logout", controllers.Logout)

	// Protected Routes
	protected := api.Group("")
	protected.Use(middlewares.AuthMiddleware())

	// Profile
	protected.GET("/profile", controllers.Profile)

	// User Management Routes (Admin Only)
	users := protected.Group("/users")
	users.Use(middlewares.RoleMiddleware(middlewares.RoleAdmin))
	users.GET("", controllers.GetUsers)
	users.POST("", controllers.CreateUser)
	users.GET("/:id", controllers.GetUser)
	users.PUT("/:id", controllers.UpdateUser)
	users.DELETE("/:id", controllers.DeleteUser)

	// Category Routes (Admin Only for mutation)
	categories := protected.Group("/categories")
	categories.GET("", controllers.GetCategories)
	categories.POST("", controllers.CreateCategory, middlewares.RoleMiddleware(middlewares.RoleAdmin))
	categories.PUT("/:id", controllers.UpdateCategory, middlewares.RoleMiddleware(middlewares.RoleAdmin))
	categories.DELETE("/:id", controllers.DeleteCategory, middlewares.RoleMiddleware(middlewares.RoleAdmin))

	// Ticket Routes
	tickets := protected.Group("/tickets")
	tickets.GET("", controllers.GetTickets)
	tickets.POST("", controllers.CreateTicket, middlewares.RoleMiddleware(middlewares.RoleUser, middlewares.RoleAdmin))
	tickets.GET("/:id", controllers.GetTicket)
	tickets.PUT("/:id", controllers.UpdateTicket, middlewares.RoleMiddleware(middlewares.RoleAdmin))
	tickets.PATCH("/:id/status", controllers.UpdateTicketStatus, middlewares.RoleMiddleware(middlewares.RoleAdmin, middlewares.RolePetugas))
	tickets.PATCH("/:id/assign", controllers.AssignTicket, middlewares.RoleMiddleware(middlewares.RoleAdmin))
	tickets.DELETE("/:id", controllers.DeleteTicket, middlewares.RoleMiddleware(middlewares.RoleAdmin))

	// Comment Routes
	tickets.GET("/:id/comments", controllers.GetComments)
	tickets.POST("/:id/comments", controllers.CreateComment)

	// Audit Logs (Admin & Pimpinan Only)
	audit := protected.Group("/audit-logs")
	audit.Use(middlewares.RoleMiddleware(middlewares.RoleAdmin, middlewares.RolePimpinan))
	audit.GET("", controllers.GetAuditLogs)

	// Dashboard Routes (Admin & Pimpinan)
	dashboard := protected.Group("/dashboard")
	dashboard.Use(middlewares.RoleMiddleware(middlewares.RoleAdmin, middlewares.RolePimpinan))
	dashboard.GET("/summary", controllers.GetDashboardSummary)
	dashboard.GET("/tickets-by-status", controllers.GetTicketsByStatus)
	dashboard.GET("/tickets-by-category", controllers.GetTicketsByCategory)
	dashboard.GET("/tickets-by-priority", controllers.GetTicketsByPriority)
	dashboard.GET("/tickets-monthly", controllers.GetTicketsMonthly)

	// Report Routes (Admin & Pimpinan)
	reports := protected.Group("/reports")
	reports.Use(middlewares.RoleMiddleware(middlewares.RoleAdmin, middlewares.RolePimpinan))
	reports.GET("/tickets", controllers.GetReportTickets)
	reports.GET("/tickets/summary", controllers.GetReportSummary)

	// Start server
	e.Logger.Fatal(e.Start(":8000"))
}
