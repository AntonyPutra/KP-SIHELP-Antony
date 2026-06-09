package controllers

import (
	"fmt"
	"net/http"
	"time"

	"sihelp-backend/config"
	"sihelp-backend/models"
	"sihelp-backend/utils"

	"github.com/labstack/echo/v4"
)

type RequestOTPPayload struct {
	Email   string `json:"email"`
	Purpose string `json:"purpose"`
}

func RequestOTP(c echo.Context) error {
	var req RequestOTPPayload
	if err := c.Bind(&req); err != nil {
		return utils.SendError(c, http.StatusBadRequest, "Invalid request payload", nil)
	}

	if req.Purpose != "login" {
		return utils.SendError(c, http.StatusBadRequest, "Invalid purpose", nil)
	}

	var user models.User
	if err := config.DB.Where("email = ?", req.Email).First(&user).Error; err != nil {
		return utils.SendError(c, http.StatusNotFound, "User not found", nil)
	}

	otpSessionToken, err := utils.GenerateSecureToken()
	if err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "Failed to generate token", nil)
	}
	otpSessionTokenHash := utils.HashToken(otpSessionToken)

	otpStr, err := utils.GenerateOTP()
	if err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "Failed to generate OTP", nil)
	}
	otpHash, err := utils.HashOTP(otpStr)
	if err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "Failed to hash OTP", nil)
	}

	// Supersede existing pending OTPs
	config.DB.Model(&models.EmailOTP{}).
		Where("user_id = ? AND purpose = ? AND status = ?", user.ID, req.Purpose, "pending").
		Update("status", "superseded")

	newOTP := models.EmailOTP{
		UserID:          user.ID,
		Email:           user.Email,
		OTPSessionToken: otpSessionTokenHash,
		OTP:             otpHash,
		Purpose:         req.Purpose,
		Status:          "pending",
		Attempts:        0,
		ResendCount:     0,
		LastSentAt:      time.Now(),
		ExpiredAt:       time.Now().Add(5 * time.Minute),
		CreatedAt:       time.Now(),
	}

	if err := config.DB.Create(&newOTP).Error; err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "Failed to create OTP record", nil)
	}

	// Send Email
	err = utils.SendOTPEmail(user.Email, otpStr, req.Purpose)
	if err != nil {
		config.DB.Model(&newOTP).Update("status", "failed")
		return utils.SendError(c, http.StatusInternalServerError, "Failed to send email", nil)
	}

	// Audit Log
	logAudit(user.ID, "REQUEST_OTP", "email_otps", newOTP.ID)

	return utils.SendSuccess(c, http.StatusOK, "OTP sent successfully", map[string]interface{}{
		"otp_session_token": otpSessionToken,
	})
}

type VerifyOTPPayload struct {
	OTPSessionToken string `json:"otp_session_token"`
	OTP             string `json:"otp"`
	Purpose         string `json:"purpose"`
}

func VerifyOTP(c echo.Context) error {
	var req VerifyOTPPayload
	if err := c.Bind(&req); err != nil {
		return utils.SendError(c, http.StatusBadRequest, "Invalid request payload", nil)
	}

	if req.Purpose != "login" {
		return utils.SendError(c, http.StatusBadRequest, "Invalid purpose", nil)
	}

	sessionHash := utils.HashToken(req.OTPSessionToken)

	var otpRecord models.EmailOTP
	if err := config.DB.Preload("User").Where("otp_session_token = ?", sessionHash).First(&otpRecord).Error; err != nil {
		return utils.SendError(c, http.StatusNotFound, "OTP session not found", nil)
	}

	// Check status
	if otpRecord.Status == "verified" {
		return utils.SendError(c, http.StatusBadRequest, "OTP already used", nil)
	}
	if otpRecord.Status == "expired" || time.Now().After(otpRecord.ExpiredAt) {
		if otpRecord.Status != "expired" {
			config.DB.Model(&otpRecord).Update("status", "expired")
			logAudit(otpRecord.UserID, "OTP_EXPIRED", "email_otps", otpRecord.ID)
		}
		return utils.SendError(c, http.StatusBadRequest, "OTP has expired", nil)
	}
	if otpRecord.Status == "blocked" {
		return utils.SendError(c, http.StatusForbidden, "OTP is blocked due to too many attempts", nil)
	}
	if otpRecord.Status == "superseded" {
		return utils.SendError(c, http.StatusBadRequest, "OTP has been superseded", nil)
	}
	if otpRecord.Status != "pending" {
		return utils.SendError(c, http.StatusBadRequest, "Invalid OTP status", nil)
	}

	// Check attempts
	if otpRecord.Attempts >= 3 {
		config.DB.Model(&otpRecord).Update("status", "blocked")
		logAudit(otpRecord.UserID, "OTP_BLOCKED", "email_otps", otpRecord.ID)
		return utils.SendError(c, http.StatusForbidden, "Too many failed attempts. Session blocked.", nil)
	}

	// Verify Hash
	if !utils.CheckOTPHash(req.OTP, otpRecord.OTP) {
		otpRecord.Attempts++
		status := "pending"
		if otpRecord.Attempts >= 3 {
			status = "blocked"
		}
		config.DB.Model(&otpRecord).Updates(map[string]interface{}{
			"attempts": otpRecord.Attempts,
			"status":   status,
		})
		
		logAudit(otpRecord.UserID, "VERIFY_OTP_FAILED", "email_otps", otpRecord.ID)
		
		if status == "blocked" {
			logAudit(otpRecord.UserID, "OTP_BLOCKED", "email_otps", otpRecord.ID)
			return utils.SendError(c, http.StatusForbidden, "Too many failed attempts. Session blocked.", nil)
		}
		return utils.SendError(c, http.StatusBadRequest, "Invalid OTP", nil)
	}

	// Success
	config.DB.Model(&otpRecord).Update("status", "verified")
	logAudit(otpRecord.UserID, "VERIFY_OTP_SUCCESS", "email_otps", otpRecord.ID)

	// Issue JWT if login
	if req.Purpose == "login" {
		token, err := utils.GenerateToken(otpRecord.User.ID, otpRecord.User.RoleID)
		if err != nil {
			return utils.SendError(c, http.StatusInternalServerError, "Failed to generate token", nil)
		}

		return utils.SendSuccess(c, http.StatusOK, "Login successful", map[string]interface{}{
			"token": token,
			"user": map[string]interface{}{
				"id":    otpRecord.User.ID,
				"name":  otpRecord.User.Name,
				"email": otpRecord.User.Email,
				"role":  otpRecord.User.RoleID,
			},
		})
	}

	return utils.SendSuccess(c, http.StatusOK, "OTP verified", nil)
}

type ResendOTPPayload struct {
	OTPSessionToken string `json:"otp_session_token"`
	Purpose         string `json:"purpose"`
}

func ResendOTP(c echo.Context) error {
	var req ResendOTPPayload
	if err := c.Bind(&req); err != nil {
		return utils.SendError(c, http.StatusBadRequest, "Invalid request payload", nil)
	}

	sessionHash := utils.HashToken(req.OTPSessionToken)

	var otpRecord models.EmailOTP
	if err := config.DB.Where("otp_session_token = ?", sessionHash).First(&otpRecord).Error; err != nil {
		return utils.SendError(c, http.StatusNotFound, "OTP session not found", nil)
	}

	if otpRecord.Status != "pending" && otpRecord.Status != "expired" {
		return utils.SendError(c, http.StatusBadRequest, "Cannot resend OTP for this session status", nil)
	}

	if otpRecord.ResendCount >= 3 {
		config.DB.Model(&otpRecord).Update("status", "blocked")
		logAudit(otpRecord.UserID, "OTP_BLOCKED", "email_otps", otpRecord.ID)
		return utils.SendError(c, http.StatusForbidden, "Maximum resend limit reached", nil)
	}

	timeSinceLastSent := time.Since(otpRecord.LastSentAt)
	if timeSinceLastSent < 60*time.Second {
		return utils.SendError(c, http.StatusTooManyRequests, "Please wait before requesting a new OTP", map[string]interface{}{
			"retry_after_seconds": int(60 - timeSinceLastSent.Seconds()),
		})
	}

	// Create new session
	otpSessionToken, err := utils.GenerateSecureToken()
	if err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "Failed to generate token", nil)
	}
	otpSessionTokenHash := utils.HashToken(otpSessionToken)

	otpStr, err := utils.GenerateOTP()
	if err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "Failed to generate OTP", nil)
	}
	otpHash, err := utils.HashOTP(otpStr)
	if err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "Failed to hash OTP", nil)
	}

	// Supersede old
	config.DB.Model(&otpRecord).Update("status", "superseded")

	newOTP := models.EmailOTP{
		UserID:          otpRecord.UserID,
		Email:           otpRecord.Email,
		OTPSessionToken: otpSessionTokenHash,
		OTP:             otpHash,
		Purpose:         req.Purpose,
		Status:          "pending",
		Attempts:        0,
		ResendCount:     otpRecord.ResendCount + 1,
		LastSentAt:      time.Now(),
		ExpiredAt:       time.Now().Add(5 * time.Minute),
		CreatedAt:       time.Now(),
	}

	if err := config.DB.Create(&newOTP).Error; err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "Failed to create OTP record", nil)
	}

	// Send Email
	err = utils.SendOTPEmail(newOTP.Email, otpStr, req.Purpose)
	if err != nil {
		config.DB.Model(&newOTP).Update("status", "failed")
		return utils.SendError(c, http.StatusInternalServerError, "Failed to send email", nil)
	}

	logAudit(newOTP.UserID, "RESEND_OTP", "email_otps", newOTP.ID)

	return utils.SendSuccess(c, http.StatusOK, "OTP resent successfully", map[string]interface{}{
		"otp_session_token": otpSessionToken,
	})
}

func logAudit(userID uint, activity string, tableName string, recordID uint) {
	config.DB.Create(&models.AuditLog{
		UserID:        userID,
		Activity:      activity,
		TableName:     tableName,
		RecordID:      recordID,
		HashSignature: utils.HashToken(fmt.Sprintf("%d-%s", recordID, activity)),
		CreatedAt:     time.Now(),
	})
}
