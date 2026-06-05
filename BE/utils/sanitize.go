package utils

import (
	"encoding/json"
	"strings"
)

var sensitiveKeys = []string{
	"password", "token", "access_token", "refresh_token",
	"authorization", "authorization-customer", "otp", "pin",
	"signature", "x-signature", "secret", "client_secret",
	"accountno", "accountnumber", "amount", "balance", "availablebalance",
}

func isSensitive(key string) bool {
	lowerKey := strings.ToLower(key)
	for _, s := range sensitiveKeys {
		if lowerKey == s {
			return true
		}
	}
	return false
}

func SanitizeJSON(data []byte) string {
	if len(data) == 0 {
		return ""
	}

	var parsed map[string]interface{}
	if err := json.Unmarshal(data, &parsed); err != nil {
		// Not a JSON object, try array or return as is
		return string(data)
	}

	sanitizeMap(parsed)

	result, err := json.MarshalIndent(parsed, "", "  ")
	if err != nil {
		return string(data)
	}
	return string(result)
}

func sanitizeMap(m map[string]interface{}) {
	for k, v := range m {
		if isSensitive(k) {
			m[k] = "[REDACTED]"
		} else if subMap, ok := v.(map[string]interface{}); ok {
			sanitizeMap(subMap)
		} else if subSlice, ok := v.([]interface{}); ok {
			for _, item := range subSlice {
				if itemMap, ok := item.(map[string]interface{}); ok {
					sanitizeMap(itemMap)
				}
			}
		}
	}
}

func SanitizeHeaders(headers map[string][]string) string {
	var result strings.Builder
	result.WriteString("{\n")
	first := true
	for k, v := range headers {
		if !first {
			result.WriteString(",\n")
		}
		first = false
		val := strings.Join(v, ", ")
		if isSensitive(k) {
			val = "[REDACTED]"
		}
		result.WriteString("  \"" + k + "\": \"" + val + "\"")
	}
	result.WriteString("\n}")
	return result.String()
}
