package programs

import (
	"context"
	"strconv"
	"database/sql"
	"time"
)

type Service struct {
	repo *Repo
}

func NewService(repo *Repo) *Service {
	return &Service{repo: repo}
}

func (s *Service) Search(ctx context.Context, p SearchParams) (*SearchDetailResult, error) {
	return s.repo.Search(ctx, p)
}

func (s *Service) GetMeta(ctx context.Context, programID uint64) (ProgramMetaResponse, error) {
	reqRow, err := s.repo.GetRequirementsByProgramID(ctx, programID)
	if err != nil {
		return ProgramMetaResponse{}, err
	}
	wRow, err := s.repo.GetWeightsByProgramID(ctx, programID)
	if err != nil {
		return ProgramMetaResponse{}, err
	}
	tags, err := s.repo.GetTagsByProgramID(ctx, programID)
	if err != nil {
		return ProgramMetaResponse{}, err
	}
	keywords, err := s.repo.GetKeywordsByProgramID(ctx, programID)
	if err != nil {
		return ProgramMetaResponse{}, err
	}

	resp := ProgramMetaResponse{ProgramID: programID}

	if reqRow != nil {
		resp.Requirements = &ProgramRequirementDTO{
			ProgramID:       reqRow.ProgramID,
			GPAMinScore:     nullDecimalStringToFloatPtr(reqRow.GPAMinScore),
			IELTSOverallMin: nullFloatToPtr(reqRow.IELTSOverallMin),
			IELTSEachMin:    nullFloatToPtr(reqRow.IELTSEachMin),
			IELTSOverallRec: nullFloatToPtr(reqRow.IELTSOverallRec),
			TOEFLMin:        nullIntToPtr(reqRow.TOEFLMin),
			TOEFLRec:        nullIntToPtr(reqRow.TOEFLRec),
			PTEMin:          nullIntToPtr(reqRow.PTEMin),
			PTERec:          nullIntToPtr(reqRow.PTERec),
			DuolingoMin:     nullIntToPtr(reqRow.DuolingoMin),
			DuolingoRec:     nullIntToPtr(reqRow.DuolingoRec),
			RequirementNote: nullStringToPtr(reqRow.RequirementNote),
			UpdatedAt:       nullTimeToPtr(reqRow.UpdatedAt),
		}
	}

	if wRow != nil {
		resp.Weights = &ProgramWeightDTO{
			ProgramID:        wRow.ProgramID,
			AcademicsWeight:  nullFloatToPtr(wRow.AcademicsWeight),
			LanguageWeight:   nullFloatToPtr(wRow.LanguageWeight),
			CurriculumWeight: nullFloatToPtr(wRow.CurriculumWeight),
			ProfileWeight:    nullFloatToPtr(wRow.ProfileWeight),
			UpdatedAt:        nullTimeToPtr(wRow.UpdatedAt),
		}
	}

	if len(tags) > 0 {
		resp.Tags = make([]ProgramTagDTO, 0, len(tags))
		for _, t := range tags {
			resp.Tags = append(resp.Tags, ProgramTagDTO{
				ProgramID:            t.ProgramID,
				TagKey:               t.TagKey,
				TagHighGpaBar:        t.TagHighGpaBar,
				TagHighLanguageBar:   t.TagHighLanguageBar,
				TagHighCurriculumBar: t.TagHighCurriculumBar,
				TagResearchPlus:      t.TagResearchPlus,
				TagStem:              t.TagStem,
			})
		}
	} else {
		resp.Tags = []ProgramTagDTO{}
	}

	if len(keywords) > 0 {
		resp.Keywords = make([]ProgramKeywordDTO, 0, len(keywords))
		for _, k := range keywords {
			resp.Keywords = append(resp.Keywords, ProgramKeywordDTO{
				ProgramID:          k.ProgramID,
				Tier:               k.Tier,
				ProgramTagsSetOrNot: k.ProgramTagsSetOrNot,
			})
		}
	} else {
		resp.Keywords = []ProgramKeywordDTO{}
	}

	return resp, nil
}



func nullDecimalStringToFloatPtr(v sql.NullString) *float64 {
	if !v.Valid {
		return nil
	}
	f, err := strconv.ParseFloat(v.String, 64)
	if err != nil {
		return nil
	}
	return &f
}
func nullIntToPtr(v sql.NullInt64) *int {
	if !v.Valid {
		return nil
	}
	out := int(v.Int64)
	return &out
}

func nullFloatToPtr(v sql.NullFloat64) *float64 {
	if !v.Valid {
		return nil
	}
	out := v.Float64
	return &out
}

func nullStringToPtr(v sql.NullString) *string {
	if !v.Valid {
		return nil
	}
	out := v.String
	return &out
}

func nullTimeToPtr(v sql.NullTime) *string {
	if !v.Valid {
		return nil
	}
	out := v.Time.Format(time.RFC3339)
	return &out
}

