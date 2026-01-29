package countries

import "context"

type Service struct {
	repo *Repo
}

func NewService(repo *Repo) *Service {
	return &Service{repo: repo}
}

func (s *Service) Options(ctx context.Context, p OptionsParams) ([]CountryOptionDTO, int, error) {
	return s.repo.Options(ctx, p)
}
