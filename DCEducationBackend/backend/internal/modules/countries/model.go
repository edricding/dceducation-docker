package countries

// Country maps to the `country` table.
type Country struct {
	ID     uint64 `db:"id"`
	NameCN string `db:"name_cn"`
	NameEN string `db:"name_en"`
	ISO2   string `db:"iso2"`
}
