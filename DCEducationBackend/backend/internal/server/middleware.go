package server

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func CORSMiddleware(allowOrigins string) gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.GetHeader("Origin")

		// 最简单：* 全放行（开发期常用）
		// 生产建议指定域名列表（逗号分隔）
		if allowOrigins == "*" {
			c.Header("Access-Control-Allow-Origin", "*")
		} else {
			allowed := false
			for _, o := range strings.Split(allowOrigins, ",") {
				if strings.TrimSpace(o) == origin {
					allowed = true
					break
				}
			}
			if allowed {
				c.Header("Access-Control-Allow-Origin", origin)
			}
		}

		c.Header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
		c.Header("Access-Control-Allow-Credentials", "true")

		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	}
}
