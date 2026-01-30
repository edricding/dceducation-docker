package studenttags

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
)

type Repo struct {
	db *sqlx.DB
}

func NewRepo(db *sqlx.DB) *Repo {
	return &Repo{db: db}
}

func (r *Repo) GetLatest(ctx context.Context) (*StudentTags, error) {
	var item StudentTags
	err := r.db.GetContext(ctx, &item, `
SELECT id,
  high_gpa_operator, high_gpa_value,
  high_language_ielts_operator, high_language_ielts_value,
  high_language_toefl_operator, high_language_toefl_value,
  high_language_pte_operator, high_language_pte_value,
  high_language_duolingo_operator, high_language_duolingo_value,
  strong_curriculum_alevel_operator, strong_curriculum_alevel_value,
  strong_curriculum_ib_operator, strong_curriculum_ib_value,
  strong_curriculum_ap_operator, strong_curriculum_ap_value,
  strong_profile_options,
  strong_profile_options_operator, strong_profile_options_value
FROM student_tags
ORDER BY id DESC
LIMIT 1
`)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &item, nil
}

func (r *Repo) Insert(ctx context.Context, p StudentTags) (uint64, error) {
	res, err := r.db.NamedExecContext(ctx, `
INSERT INTO student_tags (
  high_gpa_operator, high_gpa_value,
  high_language_ielts_operator, high_language_ielts_value,
  high_language_toefl_operator, high_language_toefl_value,
  high_language_pte_operator, high_language_pte_value,
  high_language_duolingo_operator, high_language_duolingo_value,
  strong_curriculum_alevel_operator, strong_curriculum_alevel_value,
  strong_curriculum_ib_operator, strong_curriculum_ib_value,
  strong_curriculum_ap_operator, strong_curriculum_ap_value,
  strong_profile_options,
  strong_profile_options_operator, strong_profile_options_value
) VALUES (
  :high_gpa_operator, :high_gpa_value,
  :high_language_ielts_operator, :high_language_ielts_value,
  :high_language_toefl_operator, :high_language_toefl_value,
  :high_language_pte_operator, :high_language_pte_value,
  :high_language_duolingo_operator, :high_language_duolingo_value,
  :strong_curriculum_alevel_operator, :strong_curriculum_alevel_value,
  :strong_curriculum_ib_operator, :strong_curriculum_ib_value,
  :strong_curriculum_ap_operator, :strong_curriculum_ap_value,
  :strong_profile_options,
  :strong_profile_options_operator, :strong_profile_options_value
)
`, p)
	if err != nil {
		return 0, err
	}
	id, err := res.LastInsertId()
	if err != nil {
		return 0, err
	}
	return uint64(id), nil
}

func (r *Repo) UpdateByID(ctx context.Context, id uint64, p StudentTags) error {
	_, err := r.db.NamedExecContext(ctx, `
UPDATE student_tags SET
  high_gpa_operator = :high_gpa_operator,
  high_gpa_value = :high_gpa_value,
  high_language_ielts_operator = :high_language_ielts_operator,
  high_language_ielts_value = :high_language_ielts_value,
  high_language_toefl_operator = :high_language_toefl_operator,
  high_language_toefl_value = :high_language_toefl_value,
  high_language_pte_operator = :high_language_pte_operator,
  high_language_pte_value = :high_language_pte_value,
  high_language_duolingo_operator = :high_language_duolingo_operator,
  high_language_duolingo_value = :high_language_duolingo_value,
  strong_curriculum_alevel_operator = :strong_curriculum_alevel_operator,
  strong_curriculum_alevel_value = :strong_curriculum_alevel_value,
  strong_curriculum_ib_operator = :strong_curriculum_ib_operator,
  strong_curriculum_ib_value = :strong_curriculum_ib_value,
  strong_curriculum_ap_operator = :strong_curriculum_ap_operator,
  strong_curriculum_ap_value = :strong_curriculum_ap_value,
  strong_profile_options = :strong_profile_options,
  strong_profile_options_operator = :strong_profile_options_operator,
  strong_profile_options_value = :strong_profile_options_value
WHERE id = :id
`, map[string]interface{}{
		"id":                              id,
		"high_gpa_operator":               p.HighGpaOperator,
		"high_gpa_value":                  p.HighGpaValue,
		"high_language_ielts_operator":    p.HighLanguageIeltsOperator,
		"high_language_ielts_value":       p.HighLanguageIeltsValue,
		"high_language_toefl_operator":    p.HighLanguageToeflOperator,
		"high_language_toefl_value":       p.HighLanguageToeflValue,
		"high_language_pte_operator":      p.HighLanguagePteOperator,
		"high_language_pte_value":         p.HighLanguagePteValue,
		"high_language_duolingo_operator": p.HighLanguageDuolingoOperator,
		"high_language_duolingo_value":    p.HighLanguageDuolingoValue,
		"strong_curriculum_alevel_operator": p.StrongCurriculumAlevelOperator,
		"strong_curriculum_alevel_value":    p.StrongCurriculumAlevelValue,
		"strong_curriculum_ib_operator":     p.StrongCurriculumIbOperator,
		"strong_curriculum_ib_value":        p.StrongCurriculumIbValue,
		"strong_curriculum_ap_operator":     p.StrongCurriculumApOperator,
		"strong_curriculum_ap_value":        p.StrongCurriculumApValue,
		"strong_profile_options":            p.StrongProfileOptions,
		"strong_profile_options_operator":   p.StrongProfileOptionsOperator,
		"strong_profile_options_value":      p.StrongProfileOptionsValue,
	})
	return err
}
