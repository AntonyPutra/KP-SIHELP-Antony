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

			if req.Method == http.MethodOptions {
				fmt.Printf("↪ OPTIONS %s %d %dms\n", req.URL.Path, status, duration)
				return nil
			}

			headerStr := utils.CompactHeaders(req.Header)
			reqStr := utils.CompactRequestBody(reqBody)
			resStr := utils.CompactResponse(resBody.Bytes())

			isError := status >= 400

			var sb strings.Builder
			sb.WriteString("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")
			if isError {
				sb.WriteString(fmt.Sprintf("❌ %s %s %d %dms\n", req.Method, req.URL.Path, status, duration))
			} else {
				sb.WriteString(fmt.Sprintf("🚀 %s %s %d %dms\n", req.Method, req.URL.Path, status, duration))
			}
			sb.WriteString("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n")

			if headerStr != "" {
				sb.WriteString(headerStr + "\n\n")
			}

			sb.WriteString("📦 Request:\n")
			sb.WriteString(reqStr + "\n\n")

			sb.WriteString("📤 Response:\n")
			sb.WriteString(resStr + "\n\n")

			if isError {
				var errMsg string
				if err != nil {
					errMsg = err.Error()
				} else {
					errMsg = "Client or Server Error"
				}
				sb.WriteString("⚠️ Error:\n")
				sb.WriteString(errMsg + "\n\n")
				sb.WriteString("❌ END\n")
			} else {
				sb.WriteString("✅ END\n")
			}
			sb.WriteString("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")

			fmt.Print(sb.String())

			return nil
		}
	}
}
