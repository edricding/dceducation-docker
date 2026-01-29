package countries

// PagedResult matches the pagination shape used across the project.
// (Kept local to this module to avoid a larger refactor right now.)
type PagedResult[T any] struct {
	Page  int `json:"page"`
	Size  int `json:"size"`
	Total int `json:"total"`
	Items []T `json:"items"`
}

// CountryOptionDTO is for dropdown options.
type CountryOptionDTO struct {
	ID     uint64 `json:"id"`      // country.id
	NameCN string `json:"name_cn"` // country.name_cn
	ISO2   string `json:"iso2,omitempty"`
}
