package response

import "github.com/gin-gonic/gin"

type APIResponse struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

func OK(c *gin.Context, data interface{}) {
	c.JSON(200, APIResponse{Code: 0, Message: "ok", Data: data})
}

func BadRequest(c *gin.Context, msg string) {
	c.JSON(400, APIResponse{Code: 400, Message: msg})
}

func ServerError(c *gin.Context, msg string) {
	c.JSON(500, APIResponse{Code: 500, Message: msg})
}

func NotFound(c *gin.Context, msg string) {
	c.JSON(404, APIResponse{Code: 404, Message: msg})
}
