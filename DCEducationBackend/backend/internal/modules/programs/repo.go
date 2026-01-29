package programs

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
	UniversityIDs []uint64
	DegreeLevel   string
	Q             string
	Page          int
	Size          int
}

type SearchDetailResult struct {
	Items        []ProgramSearchView
	Total        int
	Requirements map[uint64]ProgramRequirement
	Weights      map[uint64]ProgramWeight
	Tags         map[uint64][]ProgramTagWithDef
	Keywords     map[uint64][]ProgramKeyword
	Universities map[uint64]University
}

func (r *Repo) Search(ctx context.Context, p SearchParams) (*SearchDetailResult, error) {
	if p.Page <= 0 {
		p.Page = 1
	}
	if p.Size <= 0 || p.Size > 100 {
		p.Size = 20
	}
	offset := (p.Page - 1) * p.Size

	where := []string{"1=1"}
	args := map[string]interface{}{}

	if len(p.UniversityIDs) > 0 {
		where = append(where, "p.university_id IN (:university_ids)")
		args["university_ids"] = p.UniversityIDs
	}
	if level := strings.TrimSpace(p.DegreeLevel); level != "" {
		where = append(where, "LOWER(p.degree_level) = LOWER(:degree_level)")
		args["degree_level"] = level
	}
	if q := strings.TrimSpace(p.Q); q != "" {
		where = append(where, "(p.major_name_cn LIKE :q OR p.major_name_en LIKE :q)")
		args["q"] = "%" + q + "%"
	}

	whereSQL := strings.Join(where, " AND ")

	countSQL := fmt.Sprintf("SELECT COUNT(*) FROM programs p WHERE %s", whereSQL)
	namedCountSQL, namedCountArgs, err := sqlx.Named(countSQL, args)
	if err != nil {
		return nil, err
	}
	inCountSQL, inCountArgs, err := sqlx.In(namedCountSQL, namedCountArgs...)
	if err != nil {
		return nil, err
	}
	inCountSQL = r.db.Rebind(inCountSQL)

	countStmt, err := r.db.PreparexContext(ctx, inCountSQL)
	if err != nil {
		return nil, err
	}
	defer countStmt.Close()

	var total int
	if err := countStmt.GetContext(ctx, &total, inCountArgs...); err != nil {
		return nil, err
	}

	listSQL := fmt.Sprintf(`
SELECT p.id AS program_id, p.university_id, u.country_code, u.country,
       u.name_en AS university_name_en, u.name_cn AS university_name_cn,
       p.major_name_en, p.major_name_cn, p.degree_level, p.tier, p.is_active,
       JSON_OBJECT('academics', w.academics_weight, 'language', w.language_weight, 'curriculum', w.curriculum_weight, 'profile', w.profile_weight) AS weights_json,
       JSON_OBJECT('gpaMin', r.gpa_min_score, 'ieltsOverallMin', r.ielts_overall_min, 'ieltsEachMin', r.ielts_each_min, 'toeflMin', r.toefl_min, 'pteMin', r.pte_min, 'duolingoMin', r.duolingo_min) AS requirements_json,
       NULL AS tags_json,
       NULL AS keywords_json,
       COALESCE((SELECT MAX(k.program_tags_set_or_not) FROM program_keywords k WHERE k.program_id = p.id), 0) AS program_tags_set_or_not
FROM programs p
JOIN universities u ON u.id = p.university_id
LEFT JOIN program_weights w ON w.program_id = p.id
LEFT JOIN program_requirements r ON r.program_id = p.id
WHERE %s
ORDER BY p.university_id, p.major_name_cn
LIMIT %d OFFSET %d
`, whereSQL, p.Size, offset)

	namedListSQL, namedListArgs, err := sqlx.Named(listSQL, args)
	if err != nil {
		return nil, err
	}
	inListSQL, inListArgs, err := sqlx.In(namedListSQL, namedListArgs...)
	if err != nil {
		return nil, err
	}
	inListSQL = r.db.Rebind(inListSQL)

	listStmt, err := r.db.PreparexContext(ctx, inListSQL)
	if err != nil {
		return nil, err
	}
	defer listStmt.Close()

	var items []ProgramSearchView
	if err := listStmt.SelectContext(ctx, &items, inListArgs...); err != nil {
		return nil, err
	}

	result := &SearchDetailResult{
		Items:        items,
		Total:        total,
	}

	return result, nil
}

func (r *Repo) loadRequirements(ctx context.Context, programIDs []uint64, out map[uint64]ProgramRequirement) error {
	if len(programIDs) == 0 {
		return nil
	}
	query := `
SELECT program_id, gpa_min_score, ielts_overall_min, ielts_each_min, toefl_min, pte_min, duolingo_min,
       requirement_note, updated_at
FROM program_requirements
WHERE program_id IN (?)
`
	inQuery, args, err := sqlx.In(query, programIDs)
	if err != nil {
		return err
	}
	inQuery = r.db.Rebind(inQuery)
	var rows []ProgramRequirement
	if err := r.db.SelectContext(ctx, &rows, inQuery, args...); err != nil {
		return err
	}
	for _, row := range rows {
		out[row.ProgramID] = row
	}
	return nil
}

func (r *Repo) loadWeights(ctx context.Context, programIDs []uint64, out map[uint64]ProgramWeight) error {
	if len(programIDs) == 0 {
		return nil
	}
	query := `
SELECT program_id, academics_weight, language_weight, curriculum_weight, profile_weight, updated_at
FROM program_weights
WHERE program_id IN (?)
`
	inQuery, args, err := sqlx.In(query, programIDs)
	if err != nil {
		return err
	}
	inQuery = r.db.Rebind(inQuery)
	var rows []ProgramWeight
	if err := r.db.SelectContext(ctx, &rows, inQuery, args...); err != nil {
		return err
	}
	for _, row := range rows {
		out[row.ProgramID] = row
	}
	return nil
}

func (r *Repo) loadTags(ctx context.Context, programIDs []uint64, out map[uint64][]ProgramTagWithDef) error {
	if len(programIDs) == 0 {
		return nil
	}
	query := `
SELECT t.program_id, t.tag_key, t.tag_value, t.created_at,
       d.name_cn, d.name_en, d.value_min, d.value_max, d.description_cn, d.description_en,
       d.created_at AS def_created_at, d.updated_at AS def_updated_at
FROM program_tags t
JOIN tag_definitions d ON t.tag_key = d.tag_key
WHERE t.program_id IN (?)
ORDER BY t.program_id, t.tag_key
`
	inQuery, args, err := sqlx.In(query, programIDs)
	if err != nil {
		return err
	}
	inQuery = r.db.Rebind(inQuery)
	var rows []ProgramTagWithDef
	if err := r.db.SelectContext(ctx, &rows, inQuery, args...); err != nil {
		return err
	}
	for _, row := range rows {
		out[row.ProgramID] = append(out[row.ProgramID], row)
	}
	return nil
}

func (r *Repo) loadKeywords(ctx context.Context, programIDs []uint64, out map[uint64][]ProgramKeyword) error {
	if len(programIDs) == 0 {
		return nil
	}
	query := `
SELECT program_id, keyword
FROM program_keywords
WHERE program_id IN (?)
ORDER BY program_id
`
	inQuery, args, err := sqlx.In(query, programIDs)
	if err != nil {
		return err
	}
	inQuery = r.db.Rebind(inQuery)
	var rows []ProgramKeyword
	if err := r.db.SelectContext(ctx, &rows, inQuery, args...); err != nil {
		return err
	}
	for _, row := range rows {
		out[row.ProgramID] = append(out[row.ProgramID], row)
	}
	return nil
}

func (r *Repo) loadUniversities(ctx context.Context, universityIDs []uint64, out map[uint64]University) error {
	if len(universityIDs) == 0 {
		return nil
	}
	query := `
SELECT id, country_code, country, name_en, name_en_short, name_cn, domains_json, created_at, updated_at, country_id
FROM universities
WHERE id IN (?)
`
	inQuery, args, err := sqlx.In(query, universityIDs)
	if err != nil {
		return err
	}
	inQuery = r.db.Rebind(inQuery)
	var rows []University
	if err := r.db.SelectContext(ctx, &rows, inQuery, args...); err != nil {
		return err
	}
	for _, row := range rows {
		out[row.ID] = row
	}
	return nil
}
