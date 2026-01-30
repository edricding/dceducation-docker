package studenttags

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"backend/internal/response"
)

type Handler struct {
	svc *Service
}

func NewHandler(svc *Service) *Handler {
	return &Handler{svc: svc}
}

func (h *Handler) GetLatest(c *gin.Context) {
	item, err := h.svc.GetLatest(c.Request.Context())
	if err != nil {
		response.ServerError(c, err.Error())
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "ok",
		"data":    toResponse(item),
	})
}

func (h *Handler) Save(c *gin.Context) {
	var req StudentTagsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "invalid json body")
		return
	}

	item, err := h.svc.Save(c.Request.Context(), fromRequest(req))
	if err != nil {
		response.ServerError(c, err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "ok",
		"data":    toResponse(item),
	})
}

func fromRequest(req StudentTagsRequest) StudentTags {
	return StudentTags{
		HighGpaOperator:                req.HighGpaOperator,
		HighGpaValue:                   req.HighGpaValue,
		HighLanguageIeltsOperator:      req.HighLanguageIeltsOperator,
		HighLanguageIeltsValue:         req.HighLanguageIeltsValue,
		HighLanguageToeflOperator:      req.HighLanguageToeflOperator,
		HighLanguageToeflValue:         req.HighLanguageToeflValue,
		HighLanguagePteOperator:        req.HighLanguagePteOperator,
		HighLanguagePteValue:           req.HighLanguagePteValue,
		HighLanguageDuolingoOperator:   req.HighLanguageDuolingoOperator,
		HighLanguageDuolingoValue:      req.HighLanguageDuolingoValue,
		StrongCurriculumAlevelOperator: req.StrongCurriculumAlevelOperator,
		StrongCurriculumAlevelValue:    req.StrongCurriculumAlevelValue,
		StrongCurriculumIbOperator:     req.StrongCurriculumIbOperator,
		StrongCurriculumIbValue:        req.StrongCurriculumIbValue,
		StrongCurriculumApOperator:     req.StrongCurriculumApOperator,
		StrongCurriculumApValue:        req.StrongCurriculumApValue,
		StrongProfileOptions:           req.StrongProfileOptions,
		StrongProfileOptionsOperator:   req.StrongProfileOptionsOperator,
		StrongProfileOptionsValue:      req.StrongProfileOptionsValue,
	}
}

func toResponse(item *StudentTags) StudentTagsResponse {
	if item == nil {
		return StudentTagsResponse{}
	}
	return StudentTagsResponse{
		ID:                           item.ID,
		HighGpaOperator:              item.HighGpaOperator,
		HighGpaValue:                 item.HighGpaValue,
		HighLanguageIeltsOperator:    item.HighLanguageIeltsOperator,
		HighLanguageIeltsValue:       item.HighLanguageIeltsValue,
		HighLanguageToeflOperator:    item.HighLanguageToeflOperator,
		HighLanguageToeflValue:       item.HighLanguageToeflValue,
		HighLanguagePteOperator:      item.HighLanguagePteOperator,
		HighLanguagePteValue:         item.HighLanguagePteValue,
		HighLanguageDuolingoOperator: item.HighLanguageDuolingoOperator,
		HighLanguageDuolingoValue:    item.HighLanguageDuolingoValue,
		StrongCurriculumAlevelOperator: item.StrongCurriculumAlevelOperator,
		StrongCurriculumAlevelValue:    item.StrongCurriculumAlevelValue,
		StrongCurriculumIbOperator:     item.StrongCurriculumIbOperator,
		StrongCurriculumIbValue:        item.StrongCurriculumIbValue,
		StrongCurriculumApOperator:     item.StrongCurriculumApOperator,
		StrongCurriculumApValue:        item.StrongCurriculumApValue,
		StrongProfileOptions:           item.StrongProfileOptions,
		StrongProfileOptionsOperator:   item.StrongProfileOptionsOperator,
		StrongProfileOptionsValue:      item.StrongProfileOptionsValue,
	}
}
