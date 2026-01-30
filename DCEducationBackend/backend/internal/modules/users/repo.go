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

type ListUsersParams struct {
	Limit  int
	Offset int
}

func (r *Repo) ListUsers(ctx context.Context, p ListUsersParams) ([]ListUsersItem, error) {
	rows := []ListUsersItem{}
	err := r.db.SelectContext(ctx, &rows, `
SELECT
  id, username, email, role, permission_level, status, email_verified, created_at, updated_at
FROM user_center.users
ORDER BY id DESC
LIMIT ? OFFSET ?
`, p.Limit, p.Offset)
	if err != nil {
		return nil, err
	}
	return rows, nil
}

func (r *Repo) ListAll(ctx context.Context) ([]ListUsersItem, error) {
	rows := []ListUsersItem{}
	err := r.db.SelectContext(ctx, &rows, `
SELECT
  id, username, email, role, permission_level, status, email_verified, created_at, updated_at
FROM user_center.users
ORDER BY id DESC
`)
	if err != nil {
		return nil, err
	}
	return rows, nil
}

type UpdateStatusParams struct {
	ID     uint64
	Status string
}

func (r *Repo) UpdateStatus(ctx context.Context, p UpdateStatusParams) error {
	_, err := r.db.ExecContext(ctx, `
UPDATE user_center.users
SET status = ?, updated_at = NOW()
WHERE id = ?
`, p.Status, p.ID)
	return err
}

