package utils

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"time"

	"sihelp-backend/config"
	"sihelp-backend/models"
)

func GenerateHash(userID uint, activity string, tableName string, recordID uint, timestamp string) string {
	data := fmt.Sprintf("%d-%s-%s-%d-%s", userID, activity, tableName, recordID, timestamp)
	hash := sha256.Sum256([]byte(data))
	return hex.EncodeToString(hash[:])
}

func LogAudit(userID uint, activity string, tableName string, recordID uint) {
	timestamp := time.Now().Format(time.RFC3339Nano)
	hashSig := GenerateHash(userID, activity, tableName, recordID, timestamp)

	logEntry := models.AuditLog{
		UserID:        userID,
		Activity:      activity,
		TableName:     tableName,
		RecordID:      recordID,
		HashSignature: hashSig,
	}
	config.DB.Create(&logEntry)
}
