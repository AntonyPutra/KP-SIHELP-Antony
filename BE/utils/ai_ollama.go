package utils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"
)

type OllamaProvider struct{}

type OllamaMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type OllamaRequest struct {
	Model    string          `json:"model"`
	Messages []OllamaMessage `json:"messages"`
	Format   string          `json:"format,omitempty"`
	Stream   bool            `json:"stream"`
}

type OllamaResponse struct {
	Message OllamaMessage `json:"message"`
}

func (p *OllamaProvider) GenerateContent(prompt string) (string, int, error) {
	baseURL := os.Getenv("OLLAMA_BASE_URL")
	model := os.Getenv("OLLAMA_MODEL")
	if baseURL == "" {
		baseURL = "http://host.docker.internal:11434"
	}
	if model == "" {
		model = "llama3.2"
	}

	timeoutStr := os.Getenv("AI_REQUEST_TIMEOUT_SECONDS")
	timeoutSec := 60
	if timeoutStr != "" {
		if val, err := strconv.Atoi(timeoutStr); err == nil {
			timeoutSec = val
		}
	}

	url := fmt.Sprintf("%s/api/chat", baseURL)

	reqBody := OllamaRequest{
		Model: model,
		Messages: []OllamaMessage{
			{Role: "user", Content: prompt},
		},
		Format: "json",
		Stream: false,
	}

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return "", http.StatusInternalServerError, err
	}

	client := &http.Client{
		Timeout: time.Duration(timeoutSec) * time.Second,
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return "", http.StatusInternalServerError, err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		if os.IsTimeout(err) || strings.Contains(err.Error(), "timeout") || strings.Contains(err.Error(), "deadline") {
			return "", http.StatusGatewayTimeout, err
		}
		// If Ollama is not accessible (connection refused, etc)
		return "", http.StatusServiceUnavailable, fmt.Errorf("Provider AI Ollama tidak dapat diakses: %v", err)
	}
	defer resp.Body.Close()

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", http.StatusInternalServerError, err
	}

	if resp.StatusCode != http.StatusOK {
		return "", resp.StatusCode, fmt.Errorf("ollama api error: status %d, body: %s", resp.StatusCode, string(bodyBytes))
	}

	var ollamaResp OllamaResponse
	if err := json.Unmarshal(bodyBytes, &ollamaResp); err != nil {
		return "", http.StatusInternalServerError, err
	}

	if ollamaResp.Message.Content != "" {
		return ollamaResp.Message.Content, http.StatusOK, nil
	}

	return "", http.StatusInternalServerError, fmt.Errorf("unexpected empty response from ollama")
}
