package auth

import "time"

type LoginRequest struct {
	Identifier string `json:"identifier" binding:"required"` // username 或 email
	Password   string `json:"password" binding:"required"`
}

type LoginResponse struct {
	Token     string    `json:"token"`
	ExpiresAt time.Time `json:"expires_at"`
	User      UserDTO   `json:"user"`
}

type UserDTO struct {
	ID              uint64 `json:"id"`
	Username        string `json:"username"`
	Email           string `json:"email"`
	Role            string `json:"role"`
	PermissionLevel int    `json:"permission_level"`
}