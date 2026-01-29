package auth

import (
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// Context keys
const (
	CtxUserIDKey   = "auth_user_id"
	CtxUsernameKey = "auth_username"
	CtxRoleKey     = "auth_role"
	CtxPermKey     = "auth_permission_level"
)

// AuthRequired 校验 Authorization: Bearer <token>
func AuthRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := strings.TrimSpace(c.GetHeader("Authorization"))
		if authHeader == "" || !strings.HasPrefix(strings.ToLower(authHeader), "bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"code": 401, "message": "missing bearer token"})
			return
		}

		raw := strings.TrimSpace(authHeader[len("Bearer "):])
		if raw == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"code": 401, "message": "missing bearer token"})
			return
		}

		secret := strings.TrimSpace(os.Getenv("JWT_SECRET"))
		if secret == "" {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "JWT_SECRET not set"})
			return
		}

		token, err := jwt.Parse(raw, func(t *jwt.Token) (interface{}, error) {
			// 限定 HS256
			if t.Method.Alg() != jwt.SigningMethodHS256.Alg() {
				return nil, jwt.ErrSignatureInvalid
			}
			return []byte(secret), nil
		})
		if err != nil || token == nil || !token.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"code": 401, "message": "invalid token"})
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"code": 401, "message": "invalid token claims"})
			return
		}

		// 取出我们登录时写入的字段：sub/usr/role/perm
		// 注意：MapClaims 里数字通常是 float64
		sub, _ := claims["sub"].(float64)
		usr, _ := claims["usr"].(string)
		role, _ := claims["role"].(string)

		permFloat, _ := claims["perm"].(float64)

		userID := uint64(sub)
		perm := int(permFloat)

		c.Set(CtxUserIDKey, userID)
		c.Set(CtxUsernameKey, usr)
		c.Set(CtxRoleKey, role)
		c.Set(CtxPermKey, perm)

		c.Next()
	}
}