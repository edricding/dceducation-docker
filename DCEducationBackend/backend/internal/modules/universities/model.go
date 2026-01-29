package universities

type University struct {
	ID          uint64 `db:"id"`
	CountryCode string `db:"country_code"`
	Country     string `db:"country"`
	NameEN      string `db:"name_en"`
	NameENShort string `db:"name_en_short"`
	NameCN      string `db:"name_cn"`
	DomainsJSON string `db:"domains_json"` // JSON 字符串（后续你可解析成 []string）
}
