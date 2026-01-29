package users

import (
	"context"
	"strings"
	"time"

	"golang.org/x/crypto/bcrypt"
)

type Service struct {
	repo *Repo
}

func NewService(repo *Repo) *Service {
	return &Service{repo: repo}
}

func (s *Service) Create(ctx context.Context, req CreateUserRequest) (CreateUserResponse, error) {
	username := strings.TrimSpace(req.Username)
	email := strings.TrimSpace(strings.ToLower(req.Email))
	role := strings.TrimSpace(req.Role)
	if role == "" {
		role = "user"
	}

	perm := 1
	if req.PermissionLevel != nil {
		perm = *req.PermissionLevel
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return CreateUserResponse{}, err
	}

	now := time.Now()
	id, err := s.repo.Create(ctx, CreateUserParams{
		Username:        username,
		Email:           email,
		PasswordHash:    string(hash),
		Role:            role,
		PermissionLevel: perm,
		CreatedAt:       now,
	})
	if err != nil {
		return CreateUserResponse{}, err
	}

	return CreateUserResponse{
		ID:              uint64(id),
		Username:        username,
		Email:           email,
		Role:            role,
		PermissionLevel: perm,
		Status:          "active",
		CreatedAt:       now,
	}, nil
}
