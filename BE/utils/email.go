package utils

import (
	"crypto/tls"
	"fmt"
	"net/smtp"
	"os"
	"strings"
)

// SendOTPEmail sends an OTP email using standard library net/smtp
func SendOTPEmail(to, otp, purpose string) error {
	host := os.Getenv("SMTP_HOST")
	port := os.Getenv("SMTP_PORT")
	username := os.Getenv("SMTP_USERNAME")
	password := os.Getenv("SMTP_PASSWORD")
	fromName := os.Getenv("SMTP_FROM_NAME")
	fromEmail := os.Getenv("SMTP_FROM_EMAIL")

	if host == "" || port == "" || username == "" || password == "" {
		return fmt.Errorf("SMTP configuration is missing")
	}

	auth := smtp.PlainAuth("", username, password, host)

	subject := "Kode OTP Login SIHELP"
	if purpose != "login" {
		subject = "Kode OTP SIHELP"
	}

	body := fmt.Sprintf(`
	<html>
	<body>
		<h2>Halo!</h2>
		<p>Berikut adalah kode OTP Anda untuk %s SIHELP:</p>
		<h1 style="background: #f4f4f4; padding: 10px; width: fit-content; letter-spacing: 5px; border-radius: 5px;">%s</h1>
		<p>Kode ini berlaku selama 5 menit. Jangan berikan kode ini kepada siapapun.</p>
		<br/>
		<p>Terima kasih,</p>
		<p>%s</p>
	</body>
	</html>
	`, purpose, otp, fromName)

	headers := make(map[string]string)
	headers["From"] = fmt.Sprintf("%s <%s>", fromName, fromEmail)
	headers["To"] = to
	headers["Subject"] = subject
	headers["MIME-version"] = "1.0"
	headers["Content-Type"] = "text/html; charset=\"UTF-8\""

	var message strings.Builder
	for k, v := range headers {
		message.WriteString(fmt.Sprintf("%s: %s\r\n", k, v))
	}
	message.WriteString("\r\n" + body)

	// Since we're using generic standard library, many modern SMTP like Gmail require STARTTLS or implicit TLS.
	// We'll use standard dial, if port is 465 it's implicit TLS. Otherwise STARTTLS.
	if port == "465" {
		tlsconfig := &tls.Config{
			InsecureSkipVerify: false,
			ServerName:         host,
		}
		conn, err := tls.Dial("tcp", host+":"+port, tlsconfig)
		if err != nil {
			return err
		}
		c, err := smtp.NewClient(conn, host)
		if err != nil {
			return err
		}
		if err = c.Auth(auth); err != nil {
			return err
		}
		if err = c.Mail(fromEmail); err != nil {
			return err
		}
		if err = c.Rcpt(to); err != nil {
			return err
		}
		w, err := c.Data()
		if err != nil {
			return err
		}
		_, err = w.Write([]byte(message.String()))
		if err != nil {
			return err
		}
		err = w.Close()
		if err != nil {
			return err
		}
		return c.Quit()
	}

	// Default: STARTTLS for port 587
	return smtp.SendMail(host+":"+port, auth, fromEmail, []string{to}, []byte(message.String()))
}
