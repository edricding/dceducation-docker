package countries

import (
	"context"
	"fmt"
	"strings"

	"github.com/jmoiron/sqlx"
)

type Repo struct {
	db *sqlx.DB
}

func NewRepo(db *sqlx.DB) *Repo {
	return &Repo{db: db}
}

type OptionsParams struct {
	Q    string
	Page int
	Size int
}

// Options returns countries for dropdown usage (supports q/page/size).
func (r *Repo) Options(ctx context.Context, p OptionsParams) ([]CountryOptionDTO, int, error) {
	if p.Page <= 0 {
		p.Page = 1
	}
	if p.Size <= 0 || p.Size > 200 {
		p.Size = 20
	}
	offset := (p.Page - 1) * p.Size

	where := []string{"1=1"}
	args := map[string]interface{}{}

	if q := strings.TrimSpace(p.Q); q != "" {
		where = append(where, "(name_cn LIKE :q OR name_en LIKE :q OR iso2 LIKE :q)")
		args["q"] = "%" + q + "%"
	}
	whereSQL := strings.Join(where, " AND ")

	// total
	countSQL := fmt.Sprintf("SELECT COUNT(*) FROM country WHERE %s", whereSQL)
	countStmt, err := r.db.PrepareNamedContext(ctx, countSQL)
	if err != nil {
		return nil, 0, err
	}
	defer countStmt.Close()

	var total int
	if err := countStmt.GetContext(ctx, &total, args); err != nil {
		return nil, 0, err
	}

	// list
	listSQL := fmt.Sprintf(`
SELECT id, name_cn, iso2
FROM country
WHERE %s
ORDER BY name_cn
LIMIT %d OFFSET %d
`, whereSQL, p.Size, offset)

	listStmt, err := r.db.PrepareNamedContext(ctx, listSQL)
	if err != nil {
		return nil, 0, err
	}
	defer listStmt.Close()

	var items []CountryOptionDTO
	if err := listStmt.SelectContext(ctx, &items, args); err != nil {
		return nil, 0, err
	}

	return items, total, nil
}
