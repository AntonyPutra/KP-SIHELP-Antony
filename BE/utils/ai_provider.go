package utils

import (
	"encoding/json"
	"os"
	"strings"
)

type AIProvider interface {
	GenerateContent(prompt string) (string, int, error)
}

func GetAIProvider() (AIProvider, error) {
	providerName := os.Getenv("AI_PROVIDER")
	
	switch providerName {
	case "ollama":
		return &OllamaProvider{}, nil
	case "groq":
		return &OpenAICompatibleProvider{
			BaseURL: os.Getenv("GROQ_BASE_URL"),
			APIKey:  os.Getenv("GROQ_API_KEY"),
			Model:   os.Getenv("GROQ_MODEL"),
		}, nil
	case "openrouter":
		return &OpenAICompatibleProvider{
			BaseURL: os.Getenv("OPENROUTER_BASE_URL"),
			APIKey:  os.Getenv("OPENROUTER_API_KEY"),
			Model:   os.Getenv("OPENROUTER_MODEL"),
		}, nil
	case "gemini":
		return &GeminiProvider{}, nil
	default:
		// Default to gemini if empty or unknown, or return error if strict. 
		// Since we're adding providers, if empty maybe fallback to gemini.
		if providerName == "" {
			return &GeminiProvider{}, nil
		}
		return nil, nil // will be handled by controller
	}
}

func ParseAIJSON(text string, target interface{}) error {
	text = strings.TrimSpace(text)
	if strings.HasPrefix(text, "```json") {
		text = strings.TrimPrefix(text, "```json")
		text = strings.TrimSuffix(text, "```")
	} else if strings.HasPrefix(text, "```") {
		text = strings.TrimPrefix(text, "```")
		text = strings.TrimSuffix(text, "```")
	}
	text = strings.TrimSpace(text)

	startIdx := strings.Index(text, "{")
	endIdx := strings.LastIndex(text, "}")

	if startIdx != -1 && endIdx != -1 && startIdx <= endIdx {
		text = text[startIdx : endIdx+1]
	}

	err := json.Unmarshal([]byte(text), target)
	if err != nil {
		return json.Unmarshal([]byte(text), target) // return the actual err inside controller to override text later
	}
	return nil
}
