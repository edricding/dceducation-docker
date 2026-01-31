package users

import (
	"errors"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/go-sql-driver/mysql"

	"backend/internal/response"
)

type Handler struct {
	svc *Service
}

func NewHandler(svc *Service) *Handler {
	return &Handler{svc: svc}
}

func (h *Handler) Create(c *gin.Context) {
	var req CreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	resp, err := h.svc.Create(c.Request.Context(), req)
	if err != nil {
		var me *mysql.MySQLError
		if errors.As(err, &me) && me.Number == 1062 {
			// username/email 唯一键冲突
			response.BadRequest(c, "username or email already exists")
			return
		}
		response.ServerError(c, err.Error())
		return
	}

	response.OK(c, resp)
}

func (h *Handler) List(c *gin.Context) {
	items, err := h.svc.ListAll(c.Request.Context())
	if err != nil {
		response.ServerError(c, err.Error())
		return
	}
	response.OK(c, items)
}

func (h *Handler) UpdateStatus(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		response.BadRequest(c, "invalid id")
		return
	}

	var req UpdateUserStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	resp, err := h.svc.UpdateStatus(c.Request.Context(), id, req.Status)
	if err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	response.OK(c, resp)
}

func (h *Handler) DeleteByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		response.BadRequest(c, "invalid id")
		return
	}

	affected, err := h.svc.DeleteByID(c.Request.Context(), id)
	if err != nil {
		response.ServerError(c, err.Error())
		return
	}
	if affected == 0 {
		response.NotFound(c, "user not found")
		return
	}

	response.OK(c, gin.H{"id": id})
}

