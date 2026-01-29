package db

import (
	"fmt"
	"time"

	_ "github.com/go-sql-driver/mysql"
	"github.com/jmoiron/sqlx"

	"backend/internal/config"
)

func NewMySQL(cfg config.Config) (*sqlx.DB, error) {
	// parseTime/loc 对时间字段很重要；utf8mb4 确保中文
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=utf8mb4&parseTime=true&loc=Local",
		cfg.DBUser, cfg.DBPass, cfg.DBHost, cfg.DBPort, cfg.DBName,
	)

	db, err := sqlx.Open("mysql", dsn)
	if err != nil {
		return nil, err
	}

	db.SetMaxOpenConns(cfg.DBMaxOpen)
	db.SetMaxIdleConns(cfg.DBMaxIdle)
	db.SetConnMaxLifetime(cfg.DBMaxLifetimeMin)

	// 测试连接（对 RDS 必须做）
	if err := db.Ping(); err != nil {
		_ = db.Close()
		return nil, err
	}

	// 可选：MySQL 驱动有些场景需要
	db.SetConnMaxIdleTime(5 * time.Minute)

	return db, nil
}
