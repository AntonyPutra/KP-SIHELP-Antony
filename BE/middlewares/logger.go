package middlewares

import (
	"bufio"
	"bytes"
	"fmt"
	"io"
	"net"
	"net/http"
	"strings"
	"time"

	"sihelp-backend/utils"

	"github.com/labstack/echo/v4"
)

type bodyDumpResponseWriter struct {
	io.Writer
	http.ResponseWriter
}

func (w *bodyDumpResponseWriter) WriteHeader(code int) {
	w.ResponseWriter.WriteHeader(code)
}

func (w *bodyDumpResponseWriter) Write(b []byte) (int, error) {
	return w.Writer.Write(b)
}

func (w *bodyDumpResponseWriter) Flush() {
	w.ResponseWriter.(http.Flusher).Flush()
}

func (w *bodyDumpResponseWriter) Hijack() (net.Conn, *bufio.ReadWriter, error) {
	return w.ResponseWriter.(http.Hijacker).Hijack()
}

func CustomLogger() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			start := time.Now()

			req := c.Request()
			reqID := fmt.Sprintf("REQ-%s-%04d", time.Now().Format("20060102-150405"), time.Now().Nanosecond()%10000)

			// Read request body
			var reqBody []byte
			if req.Body != nil {
				reqBody, _ = io.ReadAll(req.Body)
				req.Body = io.NopCloser(bytes.NewBuffer(reqBody))
			}

			// Intercept response
			resBody := new(bytes.Buffer)
			mw := io.MultiWriter(c.Response().Writer, resBody)
			writer := &bodyDumpResponseWriter{Writer: mw, ResponseWriter: c.Response().Writer}
			c.Response().Writer = writer

			// Execute handler
			err := next(c)
			if err != nil {
				c.Error(err)
			}

			duration := time.Since(start).Milliseconds()
			status := c.Response().Status

			userID := "-"
			if uid := c.Get("user_id"); uid != nil {
				userID = fmt.Sprintf("%v", uid)
			}
			roleID := "-"
			if rid := c.Get("role_id"); rid != nil {
				roleID = fmt.Sprintf("%v", rid)
			}

			headerStr := utils.SanitizeHeaders(req.Header)
			reqStr := utils.SanitizeJSON(reqBody)
			if reqStr == "" {
				reqStr = "{}"
			}
			resStr := utils.SanitizeJSON(resBody.Bytes())
			if resStr == "" {
				resStr = "{}"
			}

			isError := status >= 400

			var sb strings.Builder
			sb.WriteString("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")
			if isError {
				sb.WriteString("❌ API REQUEST ERROR\n")
			} else {
				sb.WriteString("🚀 START API REQUEST\n")
			}
			sb.WriteString("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n")

			sb.WriteString("🆔 Request ID:\n")
			sb.WriteString(reqID + "\n\n")

			sb.WriteString("🌐 URL Endpoint:\n")
			sb.WriteString(fmt.Sprintf("%s %s %s\n", req.Method, req.URL.String(), req.Proto))
			sb.WriteString("Host: " + req.Host + "\n\n")

			sb.WriteString("📌 Client Info:\n")
			sb.WriteString("IP Address : " + c.RealIP() + "\n")
			sb.WriteString("User Agent : " + req.UserAgent() + "\n")
			sb.WriteString("User ID    : " + userID + "\n")
			sb.WriteString("Role       : " + roleID + "\n\n")

			sb.WriteString("📥 Header Request:\n")
			sb.WriteString(headerStr + "\n\n")

			sb.WriteString("📦 Request Body:\n")
			sb.WriteString(reqStr + "\n\n")

			sb.WriteString("📤 Response Body:\n")
			sb.WriteString(resStr + "\n\n")

			sb.WriteString("📊 Response Info:\n")
			sb.WriteString(fmt.Sprintf("Status Code : %d\n", status))
			sb.WriteString(fmt.Sprintf("Duration    : %dms\n\n", duration))

			if isError {
				var errMsg string
				if err != nil {
					errMsg = err.Error()
				} else {
					errMsg = "Client or Server Error"
				}
				sb.WriteString("⚠️ Error Message:\n")
				sb.WriteString(errMsg + "\n\n")
				sb.WriteString("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")
				sb.WriteString("❌ END API REQUEST\n")
			} else {
				sb.WriteString("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")
				sb.WriteString("✅ END API REQUEST\n")
			}
			sb.WriteString("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")

			fmt.Print(sb.String())

			return nil
		}
	}
}
