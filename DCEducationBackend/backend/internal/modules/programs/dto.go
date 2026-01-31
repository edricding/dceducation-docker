package programs

import "encoding/json"

type ProgramSearchRequest struct {
	UniversityIDs []uint64 `json:"university_ids"`
	DegreeLevel   string   `json:"degree_level"`
	Q             string   `json:"q"`
	Page          int      `json:"page"`
	Size          int      `json:"size"`
}

type ProgramSearchItemDTO struct {
	MatchView *ProgramMatchViewDTO `json:"match_view"`
}

type ProgramMatchViewDTO struct {
	ProgramID        uint64           `json:"program_id"`
	UniversityID     uint64           `json:"university_id"`
	CountryCode      string           `json:"country_code"`
	Country          string           `json:"country"`
	UniversityNameEN string           `json:"university_name_en"`
	UniversityNameCN string           `json:"university_name_cn"`
	MajorNameEN      string           `json:"major_name_en"`
	MajorNameCN      string           `json:"major_name_cn"`
	DegreeLevel      string           `json:"degree_level"`
	Tier             string           `json:"tier"`
	IsActive         bool             `json:"is_active"`
	TagsSetOrNot     bool             `json:"program_tags_set_or_not"`
	WeightsJSON      json.RawMessage `json:"weights_json,omitempty"`
	RequirementsJSON json.RawMessage `json:"requirements_json,omitempty"`
}

type PagedResult[T any] struct {
	Page  int `json:"page"`
	Size  int `json:"size"`
	Total int `json:"total"`
	Items []T `json:"items"`
}

type ProgramRequirementDTO struct {
	ProgramID       uint64    `json:"program_id"`
	GPAMinScore     *float64  `json:"gpa_min_score"`
	IELTSOverallMin *float64  `json:"ielts_overall_min"`
	IELTSEachMin    *float64  `json:"ielts_each_min"`
	IELTSOverallRec *float64  `json:"ielts_overall_rec"`
	TOEFLMin        *int      `json:"toefl_min"`
	TOEFLRec        *int      `json:"toefl_rec"`
	PTEMin          *int      `json:"pte_min"`
	PTERec          *int      `json:"pte_rec"`
	DuolingoMin     *int      `json:"duolingo_min"`
	DuolingoRec     *int      `json:"duolingo_rec"`
	RequirementNote *string   `json:"requirement_note"`
	UpdatedAt       *string   `json:"updated_at"`
}

type ProgramWeightDTO struct {
	ProgramID        uint64   `json:"program_id"`
	AcademicsWeight  *float64 `json:"academics_weight"`
	LanguageWeight   *float64 `json:"language_weight"`
	CurriculumWeight *float64 `json:"curriculum_weight"`
	ProfileWeight    *float64 `json:"profile_weight"`
	UpdatedAt        *string  `json:"updated_at"`
}

type ProgramTagDTO struct {
	ProgramID            uint64 `json:"program_id"`
	TagKey               string `json:"tag_key"`
	TagHighGpaBar        int    `json:"tag_high_gpa_bar"`
	TagHighLanguageBar   int    `json:"tag_high_language_bar"`
	TagHighCurriculumBar int    `json:"tag_high_curriculum_bar"`
	TagResearchPlus      int    `json:"tag_research_plus"`
	TagStem              int    `json:"tag_stem"`
}

type ProgramKeywordDTO struct {
	ProgramID          uint64  `json:"program_id"`
	Tier               float64 `json:"tier"`
	ProgramTagsSetOrNot int    `json:"program_tags_set_or_not"`
}

type ProgramMetaResponse struct {
	ProgramID   uint64                `json:"program_id"`
	Requirements *ProgramRequirementDTO `json:"requirements"`
	Weights      *ProgramWeightDTO      `json:"weights"`
	Tags         []ProgramTagDTO        `json:"tags"`
	Keywords     []ProgramKeywordDTO    `json:"keywords"`
}

