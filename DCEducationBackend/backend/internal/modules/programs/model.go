package programs

import "database/sql"

type Program struct {
	ID           uint64 `db:"id"`
	UniversityID uint64 `db:"university_id"`
	MajorNameEN  string `db:"major_name_en"`
	MajorNameCN  string `db:"major_name_cn"`
	DegreeLevel  string `db:"degree_level"`
	Tier         string `db:"tier"`
}

type ProgramSearchView struct {
	ProgramID        uint64         `db:"program_id"`
	UniversityID     uint64         `db:"university_id"`
	CountryCode      string         `db:"country_code"`
	Country          string         `db:"country"`
	UniversityNameEN string         `db:"university_name_en"`
	UniversityNameCN string         `db:"university_name_cn"`
	MajorNameEN      string         `db:"major_name_en"`
	MajorNameCN      string         `db:"major_name_cn"`
	DegreeLevel      string         `db:"degree_level"`
	Tier             string         `db:"tier"`
	IsActive         bool           `db:"is_active"`
	WeightsJSON      sql.NullString `db:"weights_json"`
	RequirementsJSON sql.NullString `db:"requirements_json"`
	TagsJSON         sql.NullString `db:"tags_json"`
	KeywordsJSON     sql.NullString `db:"keywords_json"`
	TagsSetOrNot     bool           `db:"program_tags_set_or_not"`
}

type ProgramRequirement struct {
	ProgramID       uint64          `db:"program_id"`
	GPAMinScore     sql.NullInt64   `db:"gpa_min_score"`
	IELTSOverallMin sql.NullFloat64 `db:"ielts_overall_min"`
	IELTSEachMin    sql.NullFloat64 `db:"ielts_each_min"`
	TOEFLMin        sql.NullInt64   `db:"toefl_min"`
	PTEMin          sql.NullInt64   `db:"pte_min"`
	DuolingoMin     sql.NullInt64   `db:"duolingo_min"`
	RequirementNote sql.NullString  `db:"requirement_note"`
	UpdatedAt       sql.NullTime    `db:"updated_at"`
}

type ProgramWeight struct {
	ProgramID        uint64          `db:"program_id"`
	AcademicsWeight  sql.NullFloat64 `db:"academics_weight"`
	LanguageWeight   sql.NullFloat64 `db:"language_weight"`
	CurriculumWeight sql.NullFloat64 `db:"curriculum_weight"`
	ProfileWeight    sql.NullFloat64 `db:"profile_weight"`
	UpdatedAt        sql.NullTime    `db:"updated_at"`
}

type ProgramTagWithDef struct {
	ProgramID     uint64         `db:"program_id"`
	TagKey        string         `db:"tag_key"`
	TagValue      int            `db:"tag_value"`
	CreatedAt     sql.NullTime   `db:"created_at"`
	NameCN        string         `db:"name_cn"`
	NameEN        string         `db:"name_en"`
	ValueMin      int            `db:"value_min"`
	ValueMax      int            `db:"value_max"`
	DescriptionCN sql.NullString `db:"description_cn"`
	DescriptionEN sql.NullString `db:"description_en"`
	DefCreatedAt  sql.NullTime   `db:"def_created_at"`
	DefUpdatedAt  sql.NullTime   `db:"def_updated_at"`
}

type ProgramKeyword struct {
	ProgramID uint64 `db:"program_id"`
	Keyword   string `db:"keyword"`
}

type University struct {
	ID          uint64         `db:"id"`
	CountryCode string         `db:"country_code"`
	Country     string         `db:"country"`
	NameEN      string         `db:"name_en"`
	NameENShort string         `db:"name_en_short"`
	NameCN      string         `db:"name_cn"`
	DomainsJSON sql.NullString `db:"domains_json"`
	CreatedAt   sql.NullTime   `db:"created_at"`
	UpdatedAt   sql.NullTime   `db:"updated_at"`
	CountryID   uint64         `db:"country_id"`
}
