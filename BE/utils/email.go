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
	<!DOCTYPE html>
	<html>
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>OTP Verification</title>
		<style>
			body { margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
			.wrapper { width: 100%%; table-layout: fixed; background-color: #f8fafc; padding: 32px 0; }
			.main-card { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); overflow: hidden; }
			.header { padding: 24px 32px 16px 32px; border-bottom: 1px solid #f1f5f9; }
			.logo-img { width: 140px; height: auto; display: block; }
			.badge { display: inline-block; background-color: #e0f2fe; color: #0284c7; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 6px 12px; border-radius: 99px; }
			.content { padding: 24px 32px; text-align: left; }
			.greeting { color: #0f172a; font-size: 20px; font-weight: 700; margin: 0 0 8px 0; }
			.description { color: #475569; font-size: 14px; line-height: 1.5; margin: 0 0 24px 0; }
			.otp-container { background: linear-gradient(135deg, #f0f9ff 0%%, #e0f2fe 100%%); border: 1px solid #bae6fd; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px; }
			.otp-code { color: #0c4a6e; font-size: 42px; font-weight: 800; letter-spacing: 14px; margin: 0; margin-right: -14px; }
			.warning-box { background-color: #fff1f2; border-left: 3px solid #f43f5e; padding: 12px 16px; border-radius: 0 8px 8px 0; margin-bottom: 0; }
			.warning-text { color: #9f1239; font-size: 13px; line-height: 1.4; margin: 0; }
			.footer { background-color: #f8fafc; padding: 16px 32px; border-top: 1px solid #e2e8f0; }
			.footer-brand { color: #94a3b8; font-size: 16px; font-weight: 800; letter-spacing: 1px; margin: 0; }
			.footer-text { color: #94a3b8; font-size: 12px; margin: 0; }
		</style>
	</head>
	<body>
		<table class="wrapper" width="100%%" cellpadding="0" cellspacing="0" role="presentation">
			<tr>
				<td align="center">
					<table class="main-card" width="100%%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px;">
						<tr>
							<td class="header">
								<table width="100%%" cellpadding="0" cellspacing="0" role="presentation">
									<tr>
										<td align="left" valign="middle" width="50%%">
											<img src="https://i.imgur.com/UJduqPR.png" alt="SIHELP Logo" class="logo-img">
										</td>
										<td align="right" valign="middle" width="50%%">
											<div class="badge">Secure %s Verification</div>
										</td>
									</tr>
								</table>
							</td>
						</tr>
						<tr>
							<td class="content">
								<h2 class="greeting">Halo! 👋</h2>
								<p class="description">Berikut adalah kode <strong>One-Time Password (OTP)</strong> Anda untuk masuk ke sistem SIHELP. Mohon masukkan kode ini untuk melanjutkan:</p>
								
								<div class="otp-container">
									<p class="otp-code">%s</p>
								</div>

								<div class="warning-box">
									<p class="warning-text"><strong>⚠️ Keamanan:</strong> Kode ini berlaku selama <strong>5 menit</strong>. Jangan pernah membagikan kode ini kepada siapa pun untuk alasan keamanan.</p>
								</div>
							</td>
						</tr>
						<tr>
							<td class="footer">
								<table width="100%%" cellpadding="0" cellspacing="0" role="presentation">
									<tr>
										<td align="left" valign="middle">
											<p class="footer-brand">SIHELP v1.0</p>
										</td>
										<td align="right" valign="middle">
											<p class="footer-text">Email ini dikirim otomatis, mohon tidak dibalas.</p>
										</td>
									</tr>
								</table>
							</td>
						</tr>
					</table>
				</td>
			</tr>
		</table>
	</body>
	</html>
	`, strings.ToUpper(purpose), otp)

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
