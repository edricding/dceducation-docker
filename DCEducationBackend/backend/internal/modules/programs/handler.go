package programs

import (
	"database/sql"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	"backend/internal/response"
)

type Handler struct {
	svc *Service
}

func NewHandler(svc *Service) *Handler {
	return &Handler{svc: svc}
}

func (h *Handler) SearchPost(c *gin.Context) {
	var req ProgramSearchRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "invalid json body")
		return
	}

	level := strings.TrimSpace(req.DegreeLevel)
	if level == "" {
		level = "all"
	}
	switch strings.ToLower(level) {
	case "all":
		level = ""
	case "bachelor", "master":
		// keep as-is (case-insensitive compare in repo)
	default:
		response.BadRequest(c, "invalid degree_level, allowed: all|bachelor|master")
		return
	}

	page := req.Page
	size := req.Size
	if page <= 0 {
		page = 1
	}
	if size <= 0 {
		size = 20
	}

	result, err := h.svc.Search(c.Request.Context(), SearchParams{
		UniversityIDs: req.UniversityIDs,
		DegreeLevel:   level,
		Q:             req.Q,
		Page:          page,
		Size:          size,
	})
	if err != nil {
		response.ServerError(c, err.Error())
		return
	}

	dtoItems := make([]ProgramSearchItemDTO, 0, len(result.Items))
	for _, p := range result.Items {
		dto := ProgramSearchItemDTO{
			MatchView: &ProgramMatchViewDTO{
				ProgramID:        p.ProgramID,
				UniversityID:     p.UniversityID,
				CountryCode:      p.CountryCode,
				Country:          p.Country,
				UniversityNameEN: p.UniversityNameEN,
				UniversityNameCN: p.UniversityNameCN,
				MajorNameEN:      p.MajorNameEN,
				MajorNameCN:      p.MajorNameCN,
				DegreeLevel:      p.DegreeLevel,
				Tier:             p.Tier,
				IsActive:         p.IsActive,
				TagsSetOrNot:     p.TagsSetOrNot,
				WeightsJSON:      rawJSON(p.WeightsJSON),
				RequirementsJSON: rawJSON(p.RequirementsJSON),
			},
		}

		dtoItems = append(dtoItems, dto)
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "ok",
		"data": PagedResult[ProgramSearchItemDTO]{
			Page:  page,
			Size:  size,
			Total: result.Total,
			Items: dtoItems,
		},
	})
}

func rawJSON(ns sql.NullString) []byte {
	if ns.Valid && ns.String != "" {
		return []byte(ns.String)
	}
	return nil
}
