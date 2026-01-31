package users

import (
	"context"
	"errors"
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

func (s *Service) ListAll(ctx context.Context) ([]ListUsersItem, error) {
	return s.repo.ListAll(ctx)
}

func (s *Service) UpdateStatus(ctx context.Context, id uint64, status string) (UpdateUserStatusResponse, error) {
	status = strings.ToLower(strings.TrimSpace(status))
	if status != "active" && status != "disabled" {
		return UpdateUserStatusResponse{}, errors.New("invalid status")
	}
	if err := s.repo.UpdateStatus(ctx, UpdateStatusParams{ID: id, Status: status}); err != nil {
		return UpdateUserStatusResponse{}, err
	}
	return UpdateUserStatusResponse{ID: id, Status: status}, nil
}

func (s *Service) DeleteByID(ctx context.Context, id uint64) (int64, error) {
	return s.repo.DeleteByID(ctx, id)
}

