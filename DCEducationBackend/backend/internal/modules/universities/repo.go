package universities

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

type SearchParams struct {
	CountryCode string
	Q           string
	Page        int
	Size        int
}

func (r *Repo) Search(ctx context.Context, p SearchParams) ([]University, int, error) {
	// pagination defaults
	if p.Page <= 0 {
		p.Page = 1
	}
	if p.Size <= 0 || p.Size > 100 {
		p.Size = 20
	}
	offset := (p.Page - 1) * p.Size

	where := []string{"1=1"}
	args := map[string]interface{}{}

	if p.CountryCode != "" {
		code := strings.ToUpper(strings.TrimSpace(p.CountryCode))
		if strings.Contains(code, ",") {
			parts := []string{}
			for _, item := range strings.Split(code, ",") {
				c := strings.ToUpper(strings.TrimSpace(item))
				if c != "" {
					parts = append(parts, c)
				}
			}
			if len(parts) > 0 {
				where = append(where, "country_code IN (:country_codes)")
				args["country_codes"] = parts
			}
		} else {
			where = append(where, "country_code = :country_code")
			args["country_code"] = code
		}
	}
	if q := strings.TrimSpace(p.Q); q != "" {
		// 简单关键词：搜中英文名和简称
		where = append(where, "(name_en LIKE :q OR name_en_short LIKE :q OR name_cn LIKE :q)")
		args["q"] = "%" + q + "%"
	}

	whereSQL := strings.Join(where, " AND ")

	// total
	countSQL := fmt.Sprintf("SELECT COUNT(*) FROM universities WHERE %s", whereSQL)
	namedCountSQL, namedCountArgs, err := sqlx.Named(countSQL, args)
	if err != nil {
		return nil, 0, err
	}
	inCountSQL, inCountArgs, err := sqlx.In(namedCountSQL, namedCountArgs...)
	if err != nil {
		return nil, 0, err
	}
	inCountSQL = r.db.Rebind(inCountSQL)

	countStmt, err := r.db.PreparexContext(ctx, inCountSQL)
	if err != nil {
		return nil, 0, err
	}
	defer countStmt.Close()

	var total int
	if err := countStmt.GetContext(ctx, &total, inCountArgs...); err != nil {
		return nil, 0, err
	}

	// list
	listSQL := fmt.Sprintf(`
SELECT id, country_code, country, name_en, name_en_short, name_cn, domains_json
FROM universities
WHERE %s
ORDER BY country_code, name_en
LIMIT %d OFFSET %d
`, whereSQL, p.Size, offset)

	namedListSQL, namedListArgs, err := sqlx.Named(listSQL, args)
	if err != nil {
		return nil, 0, err
	}
	inListSQL, inListArgs, err := sqlx.In(namedListSQL, namedListArgs...)
	if err != nil {
		return nil, 0, err
	}
	inListSQL = r.db.Rebind(inListSQL)

	listStmt, err := r.db.PreparexContext(ctx, inListSQL)
	if err != nil {
		return nil, 0, err
	}
	defer listStmt.Close()

	var items []University
	if err := listStmt.SelectContext(ctx, &items, inListArgs...); err != nil {
		return nil, 0, err
	}

	return items, total, nil
}

func (r *Repo) GetByID(ctx context.Context, id uint64) (*University, error) {
	var u University
	err := r.db.GetContext(ctx, &u, `
SELECT id, country_code, country, name_en, name_en_short, name_cn, domains_json
FROM universities
WHERE id = ?
LIMIT 1
`, id)
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *Repo) ListAllNameCN(ctx context.Context) ([]string, error) {
	var names []string
	err := r.db.SelectContext(ctx, &names, `
SELECT name_cn
FROM universities
WHERE name_cn IS NOT NULL AND name_cn <> ''
ORDER BY name_cn
`)
	if err != nil {
		return nil, err
	}
	return names, nil
}

type OptionsCNParams struct {
	Q         string
	CountryID uint64
	Page      int
	Size      int
}

func (r *Repo) OptionsCN(ctx context.Context, p OptionsCNParams) ([]UniversityOptionCNDTO, int, error) {
	if p.Page <= 0 {
		p.Page = 1
	}
	if p.Size <= 0 || p.Size > 200 {
		p.Size = 20
	}
	offset := (p.Page - 1) * p.Size

	where := "name_cn IS NOT NULL AND name_cn <> ''"
	args := map[string]interface{}{}

	if p.CountryID != 0 {
		where += " AND country_id = :country_id"
		args["country_id"] = p.CountryID
	}

	if q := strings.TrimSpace(p.Q); q != "" {
		where += " AND name_cn LIKE :q"
		args["q"] = "%" + q + "%"
	}

	// total
	countSQL := "SELECT COUNT(*) FROM universities WHERE " + where
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
SELECT id, name_cn
FROM universities
WHERE %s
ORDER BY name_cn
LIMIT %d OFFSET %d
`, where, p.Size, offset)

	listStmt, err := r.db.PrepareNamedContext(ctx, listSQL)
	if err != nil {
		return nil, 0, err
	}
	defer listStmt.Close()

	var items []UniversityOptionCNDTO
	if err := listStmt.SelectContext(ctx, &items, args); err != nil {
		return nil, 0, err
	}

	return items, total, nil
}
