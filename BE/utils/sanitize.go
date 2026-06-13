package utils

import (
	"encoding/json"
	"fmt"
	"strings"
)

var sensitiveKeys = []string{
	"password", "token", "access_token", "refresh_token",
	"authorization", "authorization-customer", "otp", "pin",
	"signature", "x-signature", "secret", "client_secret",
	"accountno", "accountnumber", "amount", "balance", "availablebalance",
	"otp_session_token", "reset_password_token", "smtp_password",
	"gemini_api_key", "ai_prompt", "ai_response", "prompt", "gemini_response",
	"groq_api_key", "openrouter_api_key", "api_key",
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

func CompactHeaders(headers map[string][]string) string {
	var result strings.Builder
	keysToKeep := []string{"Content-Type", "Authorization", "Origin"}
	found := false
	for _, k := range keysToKeep {
		// HTTP headers are usually stored capitalized in Go (e.g. Content-Type)
		// but checking case-insensitively is safer.
		var headerVal []string
		var ok bool
		if headerVal, ok = headers[k]; !ok {
			if headerVal, ok = headers[strings.ToLower(k)]; !ok {
				continue
			}
		}

		if !found {
			result.WriteString("🔐 Headers:\n")
			found = true
		}
		val := strings.Join(headerVal, ", ")
		if isSensitive(k) {
			val = "[REDACTED]"
		}
		result.WriteString(fmt.Sprintf("%-13s : %s\n", k, val))
	}
	if !found {
		return ""
	}
	return strings.TrimRight(result.String(), "\n")
}

func CompactRequestBody(data []byte) string {
	if len(data) == 0 {
		return "{}"
	}
	sanitized := SanitizeJSON(data)
	if len(sanitized) > 1200 {
		return sanitized[:1200] + "\n... [TRUNCATED]"
	}
	return sanitized
}

func CompactResponse(data []byte) string {
	if len(data) == 0 {
		return "{}"
	}

	var parsed map[string]interface{}
	if err := json.Unmarshal(data, &parsed); err != nil {
		res := string(data)
		if len(res) > 1200 {
			return res[:1200] + "\n... [TRUNCATED]"
		}
		return res
	}

	sanitizeMap(parsed)

	var sb strings.Builder
	if success, ok := parsed["success"]; ok {
		sb.WriteString(fmt.Sprintf("success : %v\n", success))
	}
	if msg, ok := parsed["message"]; ok {
		sb.WriteString(fmt.Sprintf("message : %v\n", msg))
	}

	if dataField, ok := parsed["data"]; ok && dataField != nil {
		if slice, isSlice := dataField.([]interface{}); isSlice {
			sb.WriteString(fmt.Sprintf("items   : %d\n\n", len(slice)))

			previewCount := len(slice)
			if previewCount > 2 {
				previewCount = 2
			}
			if previewCount > 0 {
				sb.WriteString("preview:\n[\n")
				for i := 0; i < previewCount; i++ {
					itemMap, isMap := slice[i].(map[string]interface{})
					if isMap {
						compactItem := make(map[string]interface{})
						keysToKeep := []string{"id", "title", "name", "status", "priority", "email", "created_at", "activity", "table_name", "record_id"}
						for _, k := range keysToKeep {
							if val, exists := itemMap[k]; exists {
								compactItem[k] = val
							}
						}
						if hash, exists := itemMap["hash_signature"]; exists {
							hashStr := fmt.Sprintf("%v", hash)
							if len(hashStr) > 12 {
								compactItem["hash_signature"] = hashStr[:12] + "..."
							} else {
								compactItem["hash_signature"] = hashStr
							}
						}

						itemJSON, _ := json.MarshalIndent(compactItem, "  ", "  ")
						sb.WriteString("  " + strings.TrimSpace(string(itemJSON)))
						if i < previewCount-1 || len(slice) > previewCount {
							sb.WriteString(",\n")
						} else {
							sb.WriteString("\n")
						}
					}
				}
				if len(slice) > previewCount {
					sb.WriteString("  ...\n")
				}
				sb.WriteString("]")
			}
		} else {
			dataJSON, _ := json.MarshalIndent(dataField, "", "  ")
			sb.WriteString("data:\n")
			sb.WriteString(string(dataJSON))
		}
	} else if errs, ok := parsed["errors"]; ok && errs != nil {
		errJSON, _ := json.MarshalIndent(errs, "", "  ")
		sb.WriteString("errors:\n")
		sb.WriteString(string(errJSON))
	} else {
		// Just output fields that are not success or message
		otherFields := make(map[string]interface{})
		for k, v := range parsed {
			if k != "success" && k != "message" {
				otherFields[k] = v
			}
		}
		if len(otherFields) > 0 {
			fullJSON, _ := json.MarshalIndent(otherFields, "", "  ")
			sb.WriteString("data:\n")
			sb.WriteString(string(fullJSON))
		}
	}

	resStr := strings.TrimSpace(sb.String())
	if resStr == "" {
		resStr = "{}"
	}
	if len(resStr) > 1200 {
		return resStr[:1200] + "\n... [TRUNCATED]"
	}
	return resStr
}
