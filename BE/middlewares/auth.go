package middlewares

import (
	"net/http"
	"os"
	"strings"

	"sihelp-backend/utils"

	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
)

func AuthMiddleware() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			authHeader := c.Request().Header.Get("Authorization")
			if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
				return utils.SendError(c, http.StatusUnauthorized, "Unauthorized", "Missing or invalid token format")
			}

			tokenString := strings.TrimPrefix(authHeader, "Bearer ")
			secret := os.Getenv("JWT_SECRET")
			if secret == "" {
				secret = "supersecretkey123"
			}

			token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
				return []byte(secret), nil
			})

			if err != nil || !token.Valid {
				return utils.SendError(c, http.StatusUnauthorized, "Unauthorized", "Invalid or expired token")
			}

			claims, ok := token.Claims.(jwt.MapClaims)
			if !ok {
				return utils.SendError(c, http.StatusUnauthorized, "Unauthorized", "Invalid token claims")
			}

			c.Set("user_id", uint(claims["user_id"].(float64)))
			c.Set("role_id", uint(claims["role_id"].(float64)))

			return next(c)
		}
	}
}

func RoleMiddleware(allowedRoles ...uint) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			roleID := c.Get("role_id").(uint)
			for _, allowed := range allowedRoles {
				if roleID == allowed {
					return next(c)
				}
			}
			return utils.SendError(c, http.StatusForbidden, "Forbidden", "You don't have access to this resource")
		}
	}
}

// Helper constants for Role IDs based on seeder
const (
	RoleAdmin    uint = 1
	RolePetugas  uint = 2
	RoleUser     uint = 3
	RolePimpinan uint = 4
)
