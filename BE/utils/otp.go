package utils

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"math/big"

	"golang.org/x/crypto/bcrypt"
)

// GenerateOTP generates a random 6-digit numeric string
func GenerateOTP() (string, error) {
	const letters = "0123456789"
	otp := make([]byte, 6)
	for i := range otp {
		num, err := rand.Int(rand.Reader, big.NewInt(int64(len(letters))))
		if err != nil {
			return "", err
		}
		otp[i] = letters[num.Int64()]
	}
	return string(otp), nil
}

// HashOTP hashes the OTP using bcrypt
func HashOTP(otp string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(otp), 10)
	return string(bytes), err
}

// CheckOTPHash compares a plain OTP with its bcrypt hash
func CheckOTPHash(otp, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(otp))
	return err == nil
}

// GenerateSecureToken generates a cryptographically secure 32-byte token
func GenerateSecureToken() (string, error) {
	b := make([]byte, 32)
	_, err := rand.Read(b)
	if err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(b), nil
}

// HashToken hashes a token using SHA256
func HashToken(token string) string {
	hash := sha256.Sum256([]byte(token))
	return hex.EncodeToString(hash[:])
}
