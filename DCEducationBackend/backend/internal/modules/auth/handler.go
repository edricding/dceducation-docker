package auth

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	svc *Service
}

func NewHandler(svc *Service) *Handler {
	return &Handler{svc: svc}
}

func (h *Handler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}

	resp, err := h.svc.Login(c.Request.Context(), req, c.ClientIP())
	if err != nil {
		switch err {
		case ErrInvalidCreds:
			c.JSON(http.StatusUnauthorized, gin.H{"code": 401, "message": "invalid credentials"})
		case ErrLocked:
			c.JSON(http.StatusLocked, gin.H{"code": 423, "message": "account locked, try later"})
		case ErrInactive:
			c.JSON(http.StatusForbidden, gin.H{"code": 403, "message": "account inactive"})
		case ErrNeedVerify:
			c.JSON(http.StatusForbidden, gin.H{"code": 403, "message": "email not verified"})
		case ErrNoJWTSecret:
			c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "JWT_SECRET not set"})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 0, "message": "ok", "data": resp})
}

func (h *Handler) Me(c *gin.Context) {
	uidAny, ok := c.Get(CtxUserIDKey)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"code": 401, "message": "missing auth context"})
		return
	}

	userID, _ := uidAny.(uint64)
	username, _ := c.Get(CtxUsernameKey)
	role, _ := c.Get(CtxRoleKey)
	perm, _ := c.Get(CtxPermKey)

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "ok",
		"data": gin.H{
			"id":               userID,
			"username":         username,
			"role":             role,
			"permission_level": perm,
		},
	})
}