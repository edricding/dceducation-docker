package universities

type UniversityListItemDTO struct {
	ID          uint64 `json:"id"`
	CountryCode string `json:"country_code"`
	Country     string `json:"country"`
	NameEN      string `json:"name_en"`
	NameENShort string `json:"name_en_short"`
	NameCN      string `json:"name_cn"`
}

type PagedResult[T any] struct {
	Page  int `json:"page"`
	Size  int `json:"size"`
	Total int `json:"total"`
	Items []T `json:"items"`
}
type UniversityOptionCNDTO struct {
	ID     uint64 `db:"id" json:"id"`
	NameCN string `db:"name_cn" json:"name_cn"`
}

type UniversitySearchRequest struct {
	CountryCode string `json:"country_code"`
	Q           string `json:"q"`
	Page        int    `json:"page"`
	Size        int    `json:"size"`
}
