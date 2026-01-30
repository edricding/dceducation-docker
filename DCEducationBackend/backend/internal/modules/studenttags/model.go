package studenttags

type StudentTags struct {
	ID                           uint64   `db:"id" json:"id"`
	HighGpaOperator              *string  `db:"high_gpa_operator" json:"high_gpa_operator"`
	HighGpaValue                 *float64 `db:"high_gpa_value" json:"high_gpa_value"`
	HighLanguageIeltsOperator    *string  `db:"high_language_ielts_operator" json:"high_language_ielts_operator"`
	HighLanguageIeltsValue       *float64 `db:"high_language_ielts_value" json:"high_language_ielts_value"`
	HighLanguageToeflOperator    *string  `db:"high_language_toefl_operator" json:"high_language_toefl_operator"`
	HighLanguageToeflValue       *int     `db:"high_language_toefl_value" json:"high_language_toefl_value"`
	HighLanguagePteOperator      *string  `db:"high_language_pte_operator" json:"high_language_pte_operator"`
	HighLanguagePteValue         *int     `db:"high_language_pte_value" json:"high_language_pte_value"`
	HighLanguageDuolingoOperator *string  `db:"high_language_duolingo_operator" json:"high_language_duolingo_operator"`
	HighLanguageDuolingoValue    *int     `db:"high_language_duolingo_value" json:"high_language_duolingo_value"`
	StrongCurriculumAlevelOperator *string `db:"strong_curriculum_alevel_operator" json:"strong_curriculum_alevel_operator"`
	StrongCurriculumAlevelValue    *string `db:"strong_curriculum_alevel_value" json:"strong_curriculum_alevel_value"`
	StrongCurriculumIbOperator     *string `db:"strong_curriculum_ib_operator" json:"strong_curriculum_ib_operator"`
	StrongCurriculumIbValue        *int    `db:"strong_curriculum_ib_value" json:"strong_curriculum_ib_value"`
	StrongCurriculumApOperator     *string `db:"strong_curriculum_ap_operator" json:"strong_curriculum_ap_operator"`
	StrongCurriculumApValue        *int    `db:"strong_curriculum_ap_value" json:"strong_curriculum_ap_value"`
	StrongProfileOptions           *string `db:"strong_profile_options" json:"strong_profile_options"`
	StrongProfileOptionsOperator   *string `db:"strong_profile_options_operator" json:"strong_profile_options_operator"`
	StrongProfileOptionsValue      *int    `db:"strong_profile_options_value" json:"strong_profile_options_value"`
}
