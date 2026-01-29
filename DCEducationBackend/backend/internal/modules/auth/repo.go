package auth

import (
	"context"
	"database/sql"
	"time"

	"github.com/jmoiron/sqlx"
)

type Repo struct {
	db *sqlx.DB
}

func NewRepo(db *sqlx.DB) *Repo {
	return &Repo{db: db}
}

type UserRow struct {
	ID              uint64       `db:"id"`
	Username        string       `db:"username"`
	Email           string       `db:"email"`
	PasswordHash    string       `db:"password_hash"`
	Role            string       `db:"role"`
	PermissionLevel int          `db:"permission_level"`
	Status          string       `db:"status"`
	EmailVerified   bool         `db:"email_verified"`
	FailedCount     int          `db:"failed_login_count"`
	LockedUntil     sql.NullTime  `db:"locked_until"`
}

func (r *Repo) GetByIdentifier(ctx context.Context, ident string) (UserRow, error) {
	var u UserRow
	err := r.db.GetContext(ctx, &u, `
SELECT id, username, email, password_hash, role, permission_level,
       status, email_verified, failed_login_count, locked_until
FROM user_center.users
WHERE username = ? OR email = ?
LIMIT 1
`, ident, ident)
	return u, err
}

func (r *Repo) OnFailedLogin(ctx context.Context, userID uint64, newCount int, lockUntil *time.Time) error {
	if lockUntil == nil {
		_, err := r.db.ExecContext(ctx, `
UPDATE user_center.users
SET failed_login_count = ?, updated_at = NOW()
WHERE id = ?
`, newCount, userID)
		return err
	}

	_, err := r.db.ExecContext(ctx, `
UPDATE user_center.users
SET failed_login_count = ?, locked_until = ?, updated_at = NOW()
WHERE id = ?
`, newCount, *lockUntil, userID)
	return err
}

func (r *Repo) OnSuccessLogin(ctx context.Context, userID uint64, ip string, now time.Time) error {
	_, err := r.db.ExecContext(ctx, `
UPDATE user_center.users
SET failed_login_count = 0,
    locked_until = NULL,
    last_login_at = ?,
    last_login_ip = ?,
    updated_at = NOW()
WHERE id = ?
`, now, ip, userID)
	return err
}