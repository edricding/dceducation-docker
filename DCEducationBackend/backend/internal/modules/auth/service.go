package auth

import (
	"context"
	"database/sql"
	"errors"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

const (
	maxFailedAttempts = 5
	lockDuration      = time.Hour
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
	repo     *Repo
	ipMu     sync.Mutex
	ipStates map[string]*ipLockState
}

func NewService(repo *Repo) *Service {
	return &Service{
		repo:     repo,
		ipStates: make(map[string]*ipLockState),
	}
}

type ipLockState struct {
	failed      int
	lockedUntil time.Time
}

func (s *Service) Login(ctx context.Context, req LoginRequest, clientIP string) (LoginResponse, error) {
	ident := strings.TrimSpace(req.Identifier)
	pass := req.Password

	if s.isIPLocked(clientIP, time.Now()) {
		return LoginResponse{}, ErrLocked
	}

	u, err := s.repo.GetByIdentifier(ctx, ident)
	if err != nil {
		// Do not reveal whether the account exists.
		s.onFailedIPLogin(clientIP, time.Now())
		return LoginResponse{}, ErrInvalidCreds
	}

	if u.Status != "" && u.Status != "active" {
		return LoginResponse{}, ErrInactive
	}
	// If you want to enforce email verification, uncomment below.
	// if !u.EmailVerified {
	// 	return LoginResponse{}, ErrNeedVerify
	// }

	if u.LockedUntil.Valid && u.LockedUntil.Time.After(time.Now()) {
		return LoginResponse{}, ErrLocked
	}

	if err := bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(pass)); err != nil {
		s.onFailedIPLogin(clientIP, time.Now())
		newCount := u.FailedCount + 1
		var lockUntil *time.Time
		if newCount >= maxFailedAttempts {
			t := time.Now().Add(lockDuration)
			lockUntil = &t
		}
		_ = s.repo.OnFailedLogin(ctx, u.ID, newCount, lockUntil)
		return LoginResponse{}, ErrInvalidCreds
	}

	now := time.Now()
	s.resetIPState(clientIP)
	_ = s.repo.OnSuccessLogin(ctx, u.ID, clientIP, now)

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

func (s *Service) isIPLocked(ip string, now time.Time) bool {
	if strings.TrimSpace(ip) == "" {
		return false
	}
	s.ipMu.Lock()
	defer s.ipMu.Unlock()
	state, ok := s.ipStates[ip]
	if !ok {
		return false
	}
	if state.lockedUntil.IsZero() {
		return false
	}
	if now.After(state.lockedUntil) {
		delete(s.ipStates, ip)
		return false
	}
	return true
}

func (s *Service) onFailedIPLogin(ip string, now time.Time) {
	if strings.TrimSpace(ip) == "" {
		return
	}
	s.ipMu.Lock()
	defer s.ipMu.Unlock()
	state, ok := s.ipStates[ip]
	if !ok {
		state = &ipLockState{}
		s.ipStates[ip] = state
	}
	if !state.lockedUntil.IsZero() && now.Before(state.lockedUntil) {
		return
	}
	if !state.lockedUntil.IsZero() && now.After(state.lockedUntil) {
		state.failed = 0
		state.lockedUntil = time.Time{}
	}
	state.failed++
	if state.failed >= maxFailedAttempts {
		state.lockedUntil = now.Add(lockDuration)
	}
}

func (s *Service) resetIPState(ip string) {
	if strings.TrimSpace(ip) == "" {
		return
	}
	s.ipMu.Lock()
	defer s.ipMu.Unlock()
	delete(s.ipStates, ip)
}

// Compatible with sqlx.Get ErrNoRows checks (some versions wrap it).
func isNoRows(err error) bool {
	return errors.Is(err, sql.ErrNoRows)
}
