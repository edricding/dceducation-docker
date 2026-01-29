package users

import (
	"errors"

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
