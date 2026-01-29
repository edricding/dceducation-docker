package auth

import (
	"context"
	"database/sql"
	"errors"
	"os"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

const (
	maxFailedAttempts = 5
	lockMinutes       = 15
	tokenHours        = 24
)

var (
	ErrInvalidCreds = errors.New("invalid_credentials")
	ErrLocked       = errors.New("account_locked")
	ErrInactive     = errors.New("account_inactive")
	ErrNeedVerify   = errors.New("email_not_verified")
	ErrNoJWTSecret  = errors.New("jwt_secret_missing")
)

type Service struct {
	repo *Repo
}

func NewService(repo *Repo) *Service {
	return &Service{repo: repo}
}

func (s *Service) Login(ctx context.Context, req LoginRequest, clientIP string) (LoginResponse, error) {
	ident := strings.TrimSpace(req.Identifier)
	pass := req.Password

	u, err := s.repo.GetByIdentifier(ctx, ident)
	if err != nil {
		// 不暴露“账号是否存在”
		return LoginResponse{}, ErrInvalidCreds
	}

	// 状态检查
	if u.Status != "" && u.Status != "active" {
		return LoginResponse{}, ErrInactive
	}
	// 如果你想强制邮箱验证再允许登录，打开下面两行
	// if !u.EmailVerified {
	// 	return LoginResponse{}, ErrNeedVerify
	// }

	// 锁定检查
	if u.LockedUntil.Valid && u.LockedUntil.Time.After(time.Now()) {
		return LoginResponse{}, ErrLocked
	}

	// 校验密码
	if err := bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(pass)); err != nil {
		newCount := u.FailedCount + 1
		var lockUntil *time.Time
		if newCount >= maxFailedAttempts {
			t := time.Now().Add(lockMinutes * time.Minute)
			lockUntil = &t
		}
		_ = s.repo.OnFailedLogin(ctx, u.ID, newCount, lockUntil)
		return LoginResponse{}, ErrInvalidCreds
	}

	// 成功登录：清零失败次数 + 记录 last_login
	now := time.Now()
	_ = s.repo.OnSuccessLogin(ctx, u.ID, clientIP, now)

	// JWT
	secret := strings.TrimSpace(os.Getenv("JWT_SECRET"))
	if secret == "" {
		return LoginResponse{}, ErrNoJWTSecret
	}

	expiresAt := now.Add(tokenHours * time.Hour)
	claims := jwt.MapClaims{
		"sub":  u.ID,
		"usr":  u.Username,
		"role": u.Role,
		"perm": u.PermissionLevel,
		"exp":  expiresAt.Unix(),
		"iat":  now.Unix(),
	}
	tok := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := tok.SignedString([]byte(secret))
	if err != nil {
		return LoginResponse{}, err
	}

	return LoginResponse{
		Token:     signed,
		ExpiresAt: expiresAt,
		User: UserDTO{
			ID:              u.ID,
			Username:        u.Username,
			Email:           u.Email,
			Role:            u.Role,
			PermissionLevel: u.PermissionLevel,
		},
	}, nil
}

// 兼容 sqlx.Get 的 sql.ErrNoRows 识别（有些版本不会直接用到）
func isNoRows(err error) bool {
	return errors.Is(err, sql.ErrNoRows)
}