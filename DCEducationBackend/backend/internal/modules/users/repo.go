package users

import (
	"context"
	"time"

	"github.com/jmoiron/sqlx"
)

type Repo struct {
	db *sqlx.DB
}

func NewRepo(db *sqlx.DB) *Repo {
	return &Repo{db: db}
}

type CreateUserParams struct {
	Username        string
	Email           string
	PasswordHash    string
	Role            string
	PermissionLevel int
	CreatedAt       time.Time
}

func (r *Repo) Create(ctx context.Context, p CreateUserParams) (int64, error) {
	res, err := r.db.ExecContext(ctx, `
INSERT INTO user_center.users
  (username, email, password_hash, role, permission_level, status, email_verified, created_at, updated_at)
VALUES
  (?, ?, ?, ?, ?, 'active', 0, ?, ?)
`, p.Username, p.Email, p.PasswordHash, p.Role, p.PermissionLevel, p.CreatedAt, p.CreatedAt)
	if err != nil {
		return 0, err
	}
	return res.LastInsertId()
}
