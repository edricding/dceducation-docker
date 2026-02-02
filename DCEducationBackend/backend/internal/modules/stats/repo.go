package stats

import (
	"context"

	"github.com/jmoiron/sqlx"
)

type Repo struct {
	db *sqlx.DB
}

func NewRepo(db *sqlx.DB) *Repo {
	return &Repo{db: db}
}

type Overview struct {
	UniversitiesUK int `db:"universities_uk" json:"universities_uk"`
	UniversitiesAU int `db:"universities_au" json:"universities_au"`
	UniversitiesHK int `db:"universities_hk" json:"universities_hk"`
	UniversitiesSG int `db:"universities_sg" json:"universities_sg"`
	ProgramsTotal  int `db:"programs_total" json:"programs_total"`
}

func (r *Repo) GetOverview(ctx context.Context) (*Overview, error) {
	var uni Overview
	err := r.db.GetContext(ctx, &uni, `
SELECT
  SUM(CASE WHEN country_code = 'UK' THEN 1 ELSE 0 END) AS universities_uk,
  SUM(CASE WHEN country_code = 'AU' THEN 1 ELSE 0 END) AS universities_au,
  SUM(CASE WHEN country_code = 'HK' THEN 1 ELSE 0 END) AS universities_hk,
  SUM(CASE WHEN country_code = 'SG' THEN 1 ELSE 0 END) AS universities_sg
FROM universities
`)
	if err != nil {
		return nil, err
	}

	var programsTotal int
	if err := r.db.GetContext(ctx, &programsTotal, `SELECT COUNT(*) FROM programs`); err != nil {
		return nil, err
	}
	uni.ProgramsTotal = programsTotal
	return &uni, nil
}
