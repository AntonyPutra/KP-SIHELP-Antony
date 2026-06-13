package controllers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	"sihelp-backend/config"
	"sihelp-backend/models"
	"sihelp-backend/utils"

	"github.com/labstack/echo/v4"
)

func isAIAvailable() bool {
	enabled := os.Getenv("AI_FEATURE_ENABLED")
	if enabled != "true" {
		return false
	}
	provider := os.Getenv("AI_PROVIDER")
	switch provider {
	case "ollama":
		return true // doesn't require key strictly, fallback handled by API call
	case "groq":
		return os.Getenv("GROQ_API_KEY") != ""
	case "openrouter":
		return os.Getenv("OPENROUTER_API_KEY") != ""
	default: // gemini
		return os.Getenv("GEMINI_API_KEY") != ""
	}
}

func handleAIError(c echo.Context, statusCode int, err error) error {
	switch statusCode {
	case 429:
		return utils.SendError(c, 429, "Kuota AI habis atau rate limit tercapai", nil)
	case 401, 403:
		return utils.SendError(c, statusCode, "Konfigurasi provider AI tidak valid atau tidak memiliki akses", nil)
	case http.StatusGatewayTimeout:
		return utils.SendError(c, 504, "Layanan AI tidak merespons tepat waktu", nil)
	default:
		return utils.SendError(c, 500, "Gagal memproses AI", nil)
	}
}

type TicketSuggestionRequest struct {
	Title        string `json:"title"`
	Description  string `json:"description"`
	CategoryHint string `json:"category_hint"`
	PriorityHint string `json:"priority_hint"`
}

type TicketSuggestionResponse struct {
	ImprovedTitle       string   `json:"improved_title"`
	ImprovedDescription string   `json:"improved_description"`
	SuggestedCategory   string   `json:"suggested_category"`
	SuggestedPriority   string   `json:"suggested_priority"`
	Summary             string   `json:"summary"`
	RecommendedSteps    []string `json:"recommended_steps"`
}

func AITicketSuggestion(c echo.Context) error {
	if !isAIAvailable() {
		return utils.SendError(c, http.StatusServiceUnavailable, "Fitur AI belum dikonfigurasi", nil)
	}

	var req TicketSuggestionRequest
	if err := c.Bind(&req); err != nil {
		return utils.SendError(c, http.StatusBadRequest, "Invalid request payload", nil)
	}

	prompt := fmt.Sprintf(`Anda adalah asisten helpdesk internal SIHELP.
Bantu rapikan tiket berikut.
Judul Asli: %s
Deskripsi Asli: %s
Kategori Hint: %s
Prioritas Hint: %s

Kamu wajib membalas hanya JSON valid. Jangan gunakan markdown. Jangan beri penjelasan. Jangan awali dengan kata Baik atau Berikut. Respons harus dimulai dengan karakter { dan diakhiri dengan karakter }. Gunakan key persis sesuai schema yang diminta. Jangan mengganti nama key.
Format JSON yang diharapkan:
{
  "improved_title": "string",
  "improved_description": "string",
  "suggested_category": "string",
  "suggested_priority": "Low|Medium|High|Critical",
  "summary": "string",
  "recommended_steps": ["string"]
}`, req.Title, req.Description, req.CategoryHint, req.PriorityHint)

	provider, err := utils.GetAIProvider()
	if err != nil || provider == nil {
		return utils.SendError(c, http.StatusInternalServerError, "Provider AI tidak dikonfigurasi dengan benar", nil)
	}

	content, statusCode, err := provider.GenerateContent(prompt)
	if err != nil {
		return handleAIError(c, statusCode, err)
	}

	var rawData map[string]interface{}
	if err := utils.ParseAIJSON(content, &rawData); err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "Format respons AI tidak valid", nil)
	}

	if val, ok := rawData["recommended_category"]; ok && rawData["suggested_category"] == nil {
		rawData["suggested_category"] = val
	}
	if val, ok := rawData["recommended_categories"]; ok && rawData["suggested_category"] == nil {
		rawData["suggested_category"] = val
	}
	if val, ok := rawData["priority"]; ok && rawData["suggested_priority"] == nil {
		rawData["suggested_priority"] = val
	}
	if sp, ok := rawData["suggested_priority"]; ok {
		switch fmt.Sprintf("%v", sp) {
		case "1": rawData["suggested_priority"] = "Low"
		case "2": rawData["suggested_priority"] = "Medium"
		case "3": rawData["suggested_priority"] = "High"
		case "4": rawData["suggested_priority"] = "Critical"
		}
	}
	if steps, ok := rawData["recommended_steps"].([]interface{}); ok {
		var newSteps []string
		for _, step := range steps {
			switch v := step.(type) {
			case string:
				newSteps = append(newSteps, v)
			case map[string]interface{}:
				if text, ok := v["summary"].(string); ok {
					newSteps = append(newSteps, text)
				} else if text, ok := v["content"].(string); ok {
					newSteps = append(newSteps, text)
				} else if text, ok := v["text"].(string); ok {
					newSteps = append(newSteps, text)
				} else {
					b, _ := json.Marshal(v)
					newSteps = append(newSteps, string(b))
				}
			}
		}
		rawData["recommended_steps"] = newSteps
	}

	var aiData TicketSuggestionResponse
	b, _ := json.Marshal(rawData)
	json.Unmarshal(b, &aiData)

	return utils.SendSuccess(c, http.StatusOK, "AI ticket suggestion generated", aiData)
}

type AITicketRequest struct {
	TicketID uint `json:"ticket_id"`
}

type TicketSummaryResponse struct {
	Summary               string `json:"summary"`
	RootCausePrediction   string `json:"root_cause_prediction"`
	RecommendedNextAction string `json:"recommended_next_action"`
	RiskLevel             string `json:"risk_level"`
}

func AITicketSummary(c echo.Context) error {
	if !isAIAvailable() {
		return utils.SendError(c, http.StatusServiceUnavailable, "Fitur AI belum dikonfigurasi", nil)
	}

	var req AITicketRequest
	if err := c.Bind(&req); err != nil {
		return utils.SendError(c, http.StatusBadRequest, "Invalid request payload", nil)
	}

	var ticket models.Ticket
	if err := config.DB.Preload("Category").Preload("User").First(&ticket, req.TicketID).Error; err != nil {
		return utils.SendError(c, http.StatusNotFound, "Ticket not found", nil)
	}

	var comments []models.TicketComment
	config.DB.Preload("User").Where("ticket_id = ?", req.TicketID).Find(&comments)

	sanitizedData := utils.SanitizeTicketForAI(ticket, comments)
	jsonData, _ := json.Marshal(sanitizedData)

	prompt := fmt.Sprintf(`Anda adalah asisten helpdesk internal SIHELP.
Berikut adalah data tiket beserta komentar riwayat penanganan:
%s

Buatlah ringkasan teknis.
Kamu wajib membalas hanya JSON valid. Jangan gunakan markdown. Jangan beri penjelasan. Jangan awali dengan kata Baik atau Berikut. Respons harus dimulai dengan karakter { dan diakhiri dengan karakter }. Gunakan key persis sesuai schema yang diminta. Jangan mengganti nama key.
Format JSON yang diharapkan:
{
  "summary": "string",
  "root_cause_prediction": "string",
  "recommended_next_action": "string",
  "risk_level": "Low|Medium|High"
}`, string(jsonData))

	provider, err := utils.GetAIProvider()
	if err != nil || provider == nil {
		return utils.SendError(c, http.StatusInternalServerError, "Provider AI tidak dikonfigurasi dengan benar", nil)
	}

	content, statusCode, err := provider.GenerateContent(prompt)
	if err != nil {
		return handleAIError(c, statusCode, err)
	}

	var aiData TicketSummaryResponse
	if err := utils.ParseAIJSON(content, &aiData); err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "Format respons AI tidak valid", nil)
	}

	return utils.SendSuccess(c, http.StatusOK, "AI ticket summary generated", aiData)
}

type ReplySuggestionRequest struct {
	TicketID uint   `json:"ticket_id"`
	Tone     string `json:"tone"`
}

type ReplySuggestionResponse struct {
	Reply string `json:"reply"`
}

func AIReplySuggestion(c echo.Context) error {
	if !isAIAvailable() {
		return utils.SendError(c, http.StatusServiceUnavailable, "Fitur AI belum dikonfigurasi", nil)
	}

	var req ReplySuggestionRequest
	if err := c.Bind(&req); err != nil {
		return utils.SendError(c, http.StatusBadRequest, "Invalid request payload", nil)
	}

	if req.Tone == "" {
		req.Tone = "professional"
	}

	var ticket models.Ticket
	if err := config.DB.Preload("Category").Preload("User").First(&ticket, req.TicketID).Error; err != nil {
		return utils.SendError(c, http.StatusNotFound, "Ticket not found", nil)
	}

	var comments []models.TicketComment
	config.DB.Preload("User").Where("ticket_id = ?", req.TicketID).Find(&comments)

	sanitizedData := utils.SanitizeTicketForAI(ticket, comments)
	jsonData, _ := json.Marshal(sanitizedData)

	prompt := fmt.Sprintf(`Anda adalah asisten helpdesk internal SIHELP.
Data tiket:
%s

Buatkan rekomendasi balasan (reply) untuk tiket ini dengan nada (tone) %s.
Kamu wajib membalas hanya JSON valid. Jangan gunakan markdown. Jangan beri penjelasan. Jangan awali dengan kata Baik atau Berikut. Respons harus dimulai dengan karakter { dan diakhiri dengan karakter }. Gunakan key persis sesuai schema yang diminta. Jangan mengganti nama key.
Format JSON yang diharapkan:
{
  "reply": "string"
}`, string(jsonData), req.Tone)

	provider, err := utils.GetAIProvider()
	if err != nil || provider == nil {
		return utils.SendError(c, http.StatusInternalServerError, "Provider AI tidak dikonfigurasi dengan benar", nil)
	}

	content, statusCode, err := provider.GenerateContent(prompt)
	if err != nil {
		return handleAIError(c, statusCode, err)
	}

	var aiData ReplySuggestionResponse
	if err := utils.ParseAIJSON(content, &aiData); err != nil {
		return utils.SendError(c, http.StatusInternalServerError, "Format respons AI tidak valid", nil)
	}

	return utils.SendSuccess(c, http.StatusOK, "AI reply suggestion generated", aiData)
}
