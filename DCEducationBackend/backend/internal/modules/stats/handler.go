package stats

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	repo *Repo
}

func NewHandler(repo *Repo) *Handler {
	return &Handler{repo: repo}
}

func (h *Handler) Overview(c *gin.Context) {
	data, err := h.repo.GetOverview(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"ok": false, "error": "stats query failed", "detail": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"ok": true, "data": data})
}
