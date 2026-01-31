package server

import (
	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"

	"backend/internal/config"

	"backend/internal/modules/universities"
	"backend/internal/modules/users"
	"backend/internal/modules/auth"
	"backend/internal/modules/countries"
	"backend/internal/modules/programs"
	"backend/internal/modules/studenttags"

)

func NewRouter(cfg config.Config, db *sqlx.DB) *gin.Engine {
	r := gin.New()
	r.Use(gin.Logger(), gin.Recovery())
	r.Use(CORSMiddleware(cfg.CORSAllowOrigins))

	// health
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	v1 := r.Group("/api/v1")

	// auth module wiring
	aRepo := auth.NewRepo(db)
	aSvc := auth.NewService(aRepo)
	aHandler := auth.NewHandler(aSvc)

	ag := v1.Group("/auth")
	{
		ag.POST("/login", aHandler.Login)

		// 需要 token 的接口
		ag.GET("/me", auth.AuthRequired(), aHandler.Me)
	}


	// universities module wiring
	uRepo := universities.NewRepo(db)
	uSvc := universities.NewService(uRepo)
	uHandler := universities.NewHandler(uSvc)

	ug := v1.Group("/universities")
	{
		ug.GET("", uHandler.Search)     // list search
		ug.POST("/search", uHandler.SearchPost)
		ug.GET("/:id", uHandler.GetByID) // detail
		ug.GET("/u-name-cn", uHandler.ListAllNameCN)
		ug.GET("/options-u-name-cn", uHandler.OptionsCN)


	}

	// countries module wiring
	cRepo := countries.NewRepo(db)
	cSvc := countries.NewService(cRepo)
	cHandler := countries.NewHandler(cSvc)

	cg := v1.Group("/countries")
	{
		cg.GET("/options", cHandler.Options)
	}

	// programs module wiring
	pRepo := programs.NewRepo(db)
	pSvc := programs.NewService(pRepo)
	pHandler := programs.NewHandler(pSvc)

	pg := v1.Group("/programs")
	{
		pg.POST("/search", pHandler.SearchPost)
		pg.GET("/:id/meta", pHandler.GetMeta)
		pg.POST("/:id/meta", pHandler.SaveMeta)
	}


	
	// student tags module wiring
	stRepo := studenttags.NewRepo(db)
	stSvc := studenttags.NewService(stRepo)
	stHandler := studenttags.NewHandler(stSvc)

	stg := v1.Group("/student-tags")
	{
		stg.GET("", stHandler.GetLatest)
		stg.POST("", stHandler.Save)
	}

	// users module wiring
	userRepo := users.NewRepo(db)
	userSvc := users.NewService(userRepo)
	userHandler := users.NewHandler(userSvc)

	v1.GET("/users", userHandler.List)
	v1.POST("/users", userHandler.Create)
	v1.PATCH("/users/:id/status", userHandler.UpdateStatus)


	return r
}


