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
		&models.TokenBlacklist{},
		&models.EmailOTP{},
	)
	if err != nil {
		log.Fatal("Failed to auto-migrate database:", err)
	}

	// Run Seeders
	models.SeedData(config.DB)
	models.SeedDemoData(config.DB)

	// Create a new Echo instance
	e := echo.New()

	// Global Middleware
	e.Use(middlewares.CustomLogger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{
			"http://localhost:5173",
			"http://localhost:5174",
			"http://localhost:5175",
			"http://localhost:3000",
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
	api.POST("/auth/login", controllers.Login)
	api.POST("/auth/logout", controllers.Logout)
	api.POST("/auth/request-otp", controllers.RequestOTP)
	api.POST("/auth/verify-otp", controllers.VerifyOTP)
	api.POST("/auth/resend-otp", controllers.ResendOTP)

	// Protected Routes
	protected := api.Group("")
	protected.Use(middlewares.AuthMiddleware())

	// Profile
	protected.POST("/auth/profile", controllers.Profile)
	protected.POST("/auth/change-password", controllers.ChangePassword)

	// User Management Routes (Admin Only)
	users := protected.Group("/users")
	users.Use(middlewares.RoleMiddleware(middlewares.RoleAdmin))
	users.POST("/list", controllers.GetUsers)
	users.POST("/create", controllers.CreateUser)
	users.POST("/detail", controllers.GetUser)
	users.POST("/update", controllers.UpdateUser)
	users.POST("/delete", controllers.DeleteUser)

	// Category Routes (Admin Only for mutation)
	categories := protected.Group("/categories")
	categories.POST("/list", controllers.GetCategories)
	categories.POST("/create", controllers.CreateCategory, middlewares.RoleMiddleware(middlewares.RoleAdmin))
	categories.POST("/detail", controllers.GetCategoryDetail)
	categories.POST("/update", controllers.UpdateCategory, middlewares.RoleMiddleware(middlewares.RoleAdmin))
	categories.POST("/delete", controllers.DeleteCategory, middlewares.RoleMiddleware(middlewares.RoleAdmin))

	// Ticket Routes
	tickets := protected.Group("/tickets")
	tickets.POST("/list", controllers.GetTickets)
	tickets.POST("/create", controllers.CreateTicket, middlewares.RoleMiddleware(middlewares.RoleUser, middlewares.RoleAdmin))
	tickets.POST("/detail", controllers.GetTicket)
	tickets.POST("/update", controllers.UpdateTicket, middlewares.RoleMiddleware(middlewares.RoleAdmin))
	tickets.POST("/update-status", controllers.UpdateTicketStatus, middlewares.RoleMiddleware(middlewares.RoleAdmin, middlewares.RolePetugas))
	tickets.POST("/assign", controllers.AssignTicket, middlewares.RoleMiddleware(middlewares.RoleAdmin))
	tickets.POST("/delete", controllers.DeleteTicket, middlewares.RoleMiddleware(middlewares.RoleAdmin))

	// Comment Routes
	comments := protected.Group("/comments")
	comments.POST("/list", controllers.GetComments)
	comments.POST("/create", controllers.CreateComment)

	// Audit Logs (Admin & Pimpinan Only)
	audit := protected.Group("/audit-logs")
	audit.Use(middlewares.RoleMiddleware(middlewares.RoleAdmin, middlewares.RolePimpinan))
	audit.POST("/list", controllers.GetAuditLogs)
	audit.POST("/detail", controllers.GetAuditLogDetail)

	// Dashboard Routes (Admin & Pimpinan)
	dashboard := protected.Group("/dashboard")
	dashboard.Use(middlewares.RoleMiddleware(middlewares.RoleAdmin, middlewares.RolePimpinan))
	dashboard.POST("/summary", controllers.GetDashboardSummary)
	dashboard.POST("/tickets-by-status", controllers.GetTicketsByStatus)
	dashboard.POST("/tickets-by-category", controllers.GetTicketsByCategory)
	dashboard.POST("/tickets-by-priority", controllers.GetTicketsByPriority)
	dashboard.POST("/tickets-monthly", controllers.GetTicketsMonthly)

	// Report Routes (Admin & Pimpinan)
	reports := protected.Group("/reports")
	reports.Use(middlewares.RoleMiddleware(middlewares.RoleAdmin, middlewares.RolePimpinan))
	reports.POST("/tickets", controllers.GetReportTickets)
	reports.POST("/tickets/summary", controllers.GetReportSummary)

	// AI Routes
	aiGroup := protected.Group("/ai")
	aiGroup.POST("/ticket-suggestion", controllers.AITicketSuggestion)
	aiGroup.POST("/ticket-summary", controllers.AITicketSummary)
	aiGroup.POST("/reply-suggestion", controllers.AIReplySuggestion)

	// Start server
	e.Logger.Fatal(e.Start(":8000"))
}
