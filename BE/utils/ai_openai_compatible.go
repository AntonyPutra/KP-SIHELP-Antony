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

type OpenAICompatibleProvider struct {
	BaseURL string
	APIKey  string
	Model   string
}

type OpenAIMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type OpenAIRequest struct {
	Model       string          `json:"model"`
	Messages    []OpenAIMessage `json:"messages"`
	Temperature float64         `json:"temperature"`
}

type OpenAIResponse struct {
	Choices []struct {
		Message OpenAIMessage `json:"message"`
	} `json:"choices"`
}

func (p *OpenAICompatibleProvider) GenerateContent(prompt string) (string, int, error) {
	timeoutStr := os.Getenv("AI_REQUEST_TIMEOUT_SECONDS")
	timeoutSec := 20
	if timeoutStr != "" {
		if val, err := strconv.Atoi(timeoutStr); err == nil {
			timeoutSec = val
		}
	}

	url := fmt.Sprintf("%s/chat/completions", p.BaseURL)

	reqBody := OpenAIRequest{
		Model: p.Model,
		Messages: []OpenAIMessage{
			{Role: "user", Content: prompt},
		},
		Temperature: 0.2,
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
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", p.APIKey))

	resp, err := client.Do(req)
	if err != nil {
		if os.IsTimeout(err) || strings.Contains(err.Error(), "timeout") || strings.Contains(err.Error(), "deadline") {
			return "", http.StatusGatewayTimeout, err
		}
		return "", http.StatusInternalServerError, err
	}
	defer resp.Body.Close()

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", http.StatusInternalServerError, err
	}

	if resp.StatusCode != http.StatusOK {
		return "", resp.StatusCode, fmt.Errorf("openai-compatible api error: status %d, body: %s", resp.StatusCode, string(bodyBytes))
	}

	var openaiResp OpenAIResponse
	if err := json.Unmarshal(bodyBytes, &openaiResp); err != nil {
		return "", http.StatusInternalServerError, err
	}

	if len(openaiResp.Choices) > 0 && openaiResp.Choices[0].Message.Content != "" {
		return openaiResp.Choices[0].Message.Content, http.StatusOK, nil
	}

	return "", http.StatusInternalServerError, fmt.Errorf("unexpected empty response from openai-compatible provider")
}
