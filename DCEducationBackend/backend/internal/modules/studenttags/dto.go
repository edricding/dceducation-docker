package studenttags

type StudentTagsRequest struct {
	ID                           *uint64  `json:"id"`
	HighGpaOperator              *string  `json:"high_gpa_operator"`
	HighGpaValue                 *float64 `json:"high_gpa_value"`
	HighLanguageIeltsOperator    *string  `json:"high_language_ielts_operator"`
	HighLanguageIeltsValue       *float64 `json:"high_language_ielts_value"`
	HighLanguageToeflOperator    *string  `json:"high_language_toefl_operator"`
	HighLanguageToeflValue       *int     `json:"high_language_toefl_value"`
	HighLanguagePteOperator      *string  `json:"high_language_pte_operator"`
	HighLanguagePteValue         *int     `json:"high_language_pte_value"`
	HighLanguageDuolingoOperator *string  `json:"high_language_duolingo_operator"`
	HighLanguageDuolingoValue    *int     `json:"high_language_duolingo_value"`
	StrongCurriculumAlevelOperator *string `json:"strong_curriculum_alevel_operator"`
	StrongCurriculumAlevelValue    *string `json:"strong_curriculum_alevel_value"`
	StrongCurriculumIbOperator     *string `json:"strong_curriculum_ib_operator"`
	StrongCurriculumIbValue        *int    `json:"strong_curriculum_ib_value"`
	StrongCurriculumApOperator     *string `json:"strong_curriculum_ap_operator"`
	StrongCurriculumApValue        *int    `json:"strong_curriculum_ap_value"`
	StrongProfileOptions           *string `json:"strong_profile_options"`
	StrongProfileOptionsOperator   *string `json:"strong_profile_options_operator"`
	StrongProfileOptionsValue      *int    `json:"strong_profile_options_value"`
}

type StudentTagsResponse struct {
	ID                           uint64   `json:"id"`
	HighGpaOperator              *string  `json:"high_gpa_operator"`
	HighGpaValue                 *float64 `json:"high_gpa_value"`
	HighLanguageIeltsOperator    *string  `json:"high_language_ielts_operator"`
	HighLanguageIeltsValue       *float64 `json:"high_language_ielts_value"`
	HighLanguageToeflOperator    *string  `json:"high_language_toefl_operator"`
	HighLanguageToeflValue       *int     `json:"high_language_toefl_value"`
	HighLanguagePteOperator      *string  `json:"high_language_pte_operator"`
	HighLanguagePteValue         *int     `json:"high_language_pte_value"`
	HighLanguageDuolingoOperator *string  `json:"high_language_duolingo_operator"`
	HighLanguageDuolingoValue    *int     `json:"high_language_duolingo_value"`
	StrongCurriculumAlevelOperator *string `json:"strong_curriculum_alevel_operator"`
	StrongCurriculumAlevelValue    *string `json:"strong_curriculum_alevel_value"`
	StrongCurriculumIbOperator     *string `json:"strong_curriculum_ib_operator"`
	StrongCurriculumIbValue        *int    `json:"strong_curriculum_ib_value"`
	StrongCurriculumApOperator     *string `json:"strong_curriculum_ap_operator"`
	StrongCurriculumApValue        *int    `json:"strong_curriculum_ap_value"`
	StrongProfileOptions           *string `json:"strong_profile_options"`
	StrongProfileOptionsOperator   *string `json:"strong_profile_options_operator"`
	StrongProfileOptionsValue      *int    `json:"strong_profile_options_value"`
}
