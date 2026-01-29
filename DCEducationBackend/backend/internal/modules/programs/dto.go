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
