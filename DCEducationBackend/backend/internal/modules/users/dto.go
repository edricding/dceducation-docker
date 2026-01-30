package users

import "time"

type CreateUserRequest struct {
	Username        string `json:"username" binding:"required,min=3,max=50"`
	Email           string `json:"email" binding:"required,email,max=255"`
	Password        string `json:"password" binding:"required,min=8,max=72"`
	Role            string `json:"role" binding:"omitempty,max=50"`
	PermissionLevel *int   `json:"permission_level" binding:"omitempty,min=0,max=999"`
}

type CreateUserResponse struct {
	ID              uint64    `json:"id"`
	Username        string    `json:"username"`
	Email           string    `json:"email"`
	Role            string    `json:"role"`
	PermissionLevel int       `json:"permission_level"`
	Status          string    `json:"status"`
	CreatedAt       time.Time `json:"created_at"`
}


type ListUsersItem struct {
	ID              uint64    `json:"id" db:"id"`
	Username        string    `json:"username" db:"username"`
	Email           string    `json:"email" db:"email"`
	Role            string    `json:"role" db:"role"`
	PermissionLevel int       `json:"permission_level" db:"permission_level"`
	Status          string    `json:"status" db:"status"`
	EmailVerified   int       `json:"email_verified" db:"email_verified"`
	CreatedAt       time.Time `json:"created_at" db:"created_at"`
	UpdatedAt       time.Time `json:"updated_at" db:"updated_at"`
}

type UpdateUserStatusRequest struct {
	Status string `json:"status" binding:"required,oneof=active disabled"`
}

type UpdateUserStatusResponse struct {
	ID     uint64 `json:"id"`
	Status string `json:"status"`
}

