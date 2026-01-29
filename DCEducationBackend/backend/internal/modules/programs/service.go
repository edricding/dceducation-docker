package programs

import "context"

type Service struct {
	repo *Repo
}

func NewService(repo *Repo) *Service {
	return &Service{repo: repo}
}

func (s *Service) Search(ctx context.Context, p SearchParams) (*SearchDetailResult, error) {
	return s.repo.Search(ctx, p)
}
