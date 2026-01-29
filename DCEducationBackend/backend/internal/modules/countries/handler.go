package countries

import (
	"strconv"

	"github.com/gin-gonic/gin"

	"backend/internal/response"
)

type Handler struct {
	svc *Service
}

func NewHandler(svc *Service) *Handler {
	return &Handler{svc: svc}
}

// Options: GET /api/v1/countries/options?q=&page=&size=
func (h *Handler) Options(c *gin.Context) {
	q := c.Query("q")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))

	items, total, err := h.svc.Options(c.Request.Context(), OptionsParams{
		Q:    q,
		Page: page,
		Size: size,
	})
	if err != nil {
		response.ServerError(c, err.Error())
		return
	}

	response.OK(c, PagedResult[CountryOptionDTO]{
		Page:  page,
		Size:  size,
		Total: total,
		Items: items,
	})
}
