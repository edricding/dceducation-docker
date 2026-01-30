package studenttags

import "context"

type Service struct {
	repo *Repo
}

func NewService(repo *Repo) *Service {
	return &Service{repo: repo}
}

func (s *Service) GetLatest(ctx context.Context) (*StudentTags, error) {
	return s.repo.GetLatest(ctx)
}

func (s *Service) Save(ctx context.Context, p StudentTags) (*StudentTags, error) {
	item, err := s.repo.GetLatest(ctx)
	if err == nil && item != nil && item.ID > 0 {
		if err := s.repo.UpdateByID(ctx, item.ID, p); err != nil {
			return nil, err
		}
		return s.repo.GetLatest(ctx)
	}

	_, err = s.repo.Insert(ctx, p)
	if err != nil {
		return nil, err
	}
	return s.repo.GetLatest(ctx)
}
