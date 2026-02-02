package deepseek

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"strings"
	"time"

	"backend/internal/config"

	"github.com/gin-gonic/gin"
)

const analysisSystemPrompt = "你是经验丰富的留学顾问。仅输出 JSON。结构：{\"student_background\":{\"advantages\":\"Markdown\",\"to_improve\":\"Markdown\"},\"application_advice\":{\"target_adjustments\":\"Markdown\",\"competitiveness\":\"Markdown\",\"notes\":\"Markdown\"},\"summary\":\"Markdown\"}。内容简洁可执行。"
const schoolsSystemPrompt = "你是经验丰富的留学顾问。仅输出 JSON：{\"recommended_schools\":[{\"country\":\"国家\",\"schools\":[{\"name\":\"学校\",\"tier\":\"冲刺/匹配/保底\",\"majors\":[\"专业\"]}]}]}。按学生目标国家分组，多推荐几所；若不符合目标学校，仅将其列为冲刺，并补充匹配/保底。"

type Handler struct {
	cfg        config.Config
	httpClient *http.Client
}

func NewHandler(cfg config.Config) *Handler {
	return &Handler{
		cfg: cfg,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

type analyzeRequest struct {
	StudentData     any     `json:"student_data"`
	StudentDataJSON string  `json:"student_data_json"`
	Model           string  `json:"model"`
	Temperature     *float64 `json:"temperature"`
	PromptType      string  `json:"prompt_type"`
}

type chatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type chatRequest struct {
	Model       string        `json:"model"`
	Messages    []chatMessage `json:"messages"`
	Temperature float64       `json:"temperature"`
	Stream      bool          `json:"stream"`
}

type chatResponse struct {
 	Choices []struct {
 		Message struct {
 			Content string `json:"content"`
 		} `json:"message"`
 	} `json:"choices"`
}

type schoolsResponse struct {
	RecommendedSchools []struct {
		Country string `json:"country"`
		Schools []struct {
			Name   string   `json:"name"`
			Tier   string   `json:"tier"`
			Majors []string `json:"majors"`
		} `json:"schools"`
	} `json:"recommended_schools"`
}

type treeNode struct {
	Text     string                 `json:"text"`
	Icon     string                 `json:"icon,omitempty"`
	State    map[string]any         `json:"state,omitempty"`
	Type     string                 `json:"type,omitempty"`
	AAttr    map[string]string      `json:"a_attr,omitempty"`
	Children []treeNode             `json:"children,omitempty"`
}

func buildTreeNodes(sr schoolsResponse) []treeNode {
	nodes := []treeNode{}
	for _, country := range sr.RecommendedSchools {
		cNode := treeNode{
			Text:  strings.TrimSpace(country.Country),
			Icon:  "fa fa-flag text-warning",
			Type:  "demo",
			State: map[string]any{"selected": false},
		}
		for _, school := range country.Schools {
			name := strings.TrimSpace(school.Name)
			tier := strings.TrimSpace(school.Tier)
			if tier != "" {
				name = name + " - " + tier
			}
			sNode := treeNode{
				Text:  name,
				Icon:  "fa fa-book text-warning",
				State: map[string]any{"selected": true},
				AAttr: map[string]string{
					"data-bs-toggle": "modal",
					"data-bs-target": "#ModalAnalysisResult",
				},
			}
			for _, major := range school.Majors {
				m := strings.TrimSpace(major)
				if m == "" {
					continue
				}
				sNode.Children = append(sNode.Children, treeNode{
					Text:  m,
					Icon:  "fa fa-chevron-right text-light",
					State: map[string]any{"selected": true},
					AAttr: map[string]string{
						"data-bs-toggle": "modal",
						"data-bs-target": "#ModalAnalysisResult",
					},
				})
			}
			if sNode.Text != "" {
				cNode.Children = append(cNode.Children, sNode)
			}
		}
		if cNode.Text != "" {
			nodes = append(nodes, cNode)
		}
	}
	return nodes
}

func (h *Handler) Analyze(c *gin.Context) {
	if strings.TrimSpace(h.cfg.DeepSeekAPIKey) == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"ok": false, "error": "deepseek api key not configured"})
		return
	}

	var req analyzeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"ok": false, "error": "invalid request body"})
		return
	}

	model := strings.TrimSpace(req.Model)
	if model == "" {
		model = h.cfg.DeepSeekModel
	}

	temp := 0.4
	if req.Temperature != nil {
		temp = *req.Temperature
	}

	studentJSONStr := strings.TrimSpace(req.StudentDataJSON)
	if studentJSONStr == "" {
		studentJSON, _ := json.MarshalIndent(req.StudentData, "", "  ")
		studentJSONStr = string(studentJSON)
	}
	promptType := strings.TrimSpace(req.PromptType)
	systemPrompt := analysisSystemPrompt
	if promptType == "schools" {
		systemPrompt = schoolsSystemPrompt
	}

	payload := chatRequest{
		Model: model,
		Messages: []chatMessage{
			{Role: "system", Content: systemPrompt},
			{Role: "user", Content: "Student data (JSON):\n" + studentJSONStr},
		},
		Temperature: temp,
		Stream:      false,
	}

	body, _ := json.Marshal(payload)
	baseURL := strings.TrimRight(h.cfg.DeepSeekBaseURL, "/")
	url := baseURL + "/chat/completions"

	httpReq, err := http.NewRequest(http.MethodPost, url, bytes.NewReader(body))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"ok": false, "error": "failed to build request"})
		return
	}
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Accept", "application/json")
	httpReq.Header.Set("Authorization", "Bearer "+h.cfg.DeepSeekAPIKey)

	resp, err := h.httpClient.Do(httpReq)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"ok": false, "error": "deepseek request failed"})
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		c.JSON(http.StatusBadGateway, gin.H{"ok": false, "error": "deepseek request failed", "status": resp.StatusCode})
		return
	}

	rawBody, _ := io.ReadAll(resp.Body)
	if len(rawBody) == 0 {
		headers := map[string]string{}
		for k, v := range resp.Header {
			if len(v) > 0 {
				headers[k] = v[0]
			}
		}
		c.JSON(http.StatusBadGateway, gin.H{
			"ok":           false,
			"error":        "empty deepseek response",
			"status":       resp.StatusCode,
			"status_text":  resp.Status,
			"body_len":     0,
			"content_type": resp.Header.Get("Content-Type"),
			"content_len":  resp.ContentLength,
			"resp_headers": headers,
			"upstream_url": url,
			"model":        model,
			"prompt_type":  promptType,
		})
		return
	}
	var chatResp chatResponse
	if err := json.Unmarshal(rawBody, &chatResp); err != nil {
		preview := string(rawBody)
		if len(preview) > 800 {
			preview = preview[:800]
		}
		c.JSON(http.StatusBadGateway, gin.H{"ok": false, "error": "invalid deepseek response", "preview": preview})
		return
	}

	content := ""
	if len(chatResp.Choices) > 0 {
		content = chatResp.Choices[0].Message.Content
	}
	if promptType == "schools" {
		var sr schoolsResponse
		if err := json.Unmarshal([]byte(content), &sr); err == nil && len(sr.RecommendedSchools) > 0 {
			tree := buildTreeNodes(sr)
			c.JSON(http.StatusOK, gin.H{"ok": true, "content": content, "schools_tree": tree})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"ok": true, "content": content})
}

type balanceResponse struct {
	IsAvailable  bool `json:"is_available"`
	BalanceInfos []struct {
		Currency       string `json:"currency"`
		TotalBalance   string `json:"total_balance"`
		GrantedBalance string `json:"granted_balance"`
		ToppedUpBalance string `json:"topped_up_balance"`
	} `json:"balance_infos"`
}

func (h *Handler) Balance(c *gin.Context) {
	if strings.TrimSpace(h.cfg.DeepSeekAPIKey) == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"ok": false, "error": "deepseek api key not configured"})
		return
	}

	baseURL := strings.TrimRight(h.cfg.DeepSeekBaseURL, "/")
	if strings.HasSuffix(baseURL, "/v1") {
		baseURL = strings.TrimSuffix(baseURL, "/v1")
	}
	url := baseURL + "/user/balance"

	httpReq, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"ok": false, "error": "failed to build request"})
		return
	}
	httpReq.Header.Set("Accept", "application/json")
	httpReq.Header.Set("Authorization", "Bearer "+h.cfg.DeepSeekAPIKey)

	resp, err := h.httpClient.Do(httpReq)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"ok": false, "error": "deepseek request failed"})
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		c.JSON(http.StatusBadGateway, gin.H{"ok": false, "error": "deepseek request failed", "status": resp.StatusCode})
		return
	}

	rawBody, _ := io.ReadAll(resp.Body)
	if len(rawBody) == 0 {
		c.JSON(http.StatusBadGateway, gin.H{"ok": false, "error": "empty deepseek response", "status": resp.StatusCode})
		return
	}

	var br balanceResponse
	if err := json.Unmarshal(rawBody, &br); err != nil {
		preview := string(rawBody)
		if len(preview) > 800 {
			preview = preview[:800]
		}
		c.JSON(http.StatusBadGateway, gin.H{"ok": false, "error": "invalid deepseek response", "preview": preview})
		return
	}

	c.JSON(http.StatusOK, gin.H{"ok": true, "data": br})
}
