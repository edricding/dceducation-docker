package main

import (
	"log"

	"github.com/joho/godotenv"

	"backend/internal/config"
	"backend/internal/db"
	"backend/internal/server"
)

func main() {
	_ = godotenv.Load() // 本地开发用；生产可不用 .env

	cfg := config.Load()

	mysqlDB, err := db.NewMySQL(cfg)
	if err != nil {
		log.Fatalf("db init failed: %v", err)
	}
	defer mysqlDB.Close()

	r := server.NewRouter(cfg, mysqlDB)

	addr := ":" + cfg.AppPort
	log.Printf("listening on %s", addr)
	if err := r.Run(addr); err != nil {
		log.Fatalf("server failed: %v", err)
	}
}
