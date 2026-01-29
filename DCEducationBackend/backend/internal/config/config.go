package config

import (
	"os"
	"strconv"
	"time"
)

type Config struct {
	AppPort string

	DBHost string
	DBPort int
	DBUser string
	DBPass string
	DBName string

	DBMaxOpen        int
	DBMaxIdle        int
	DBMaxLifetimeMin time.Duration

	CORSAllowOrigins string
}

func getEnv(key, def string) string {
	v := os.Getenv(key)
	if v == "" {
		return def
	}
	return v
}

func getEnvInt(key string, def int) int {
	v := os.Getenv(key)
	if v == "" {
		return def
	}
	i, err := strconv.Atoi(v)
	if err != nil {
		return def
	}
	return i
}

func Load() Config {
	return Config{
		AppPort: getEnv("APP_PORT", "8080"),

		DBHost: getEnv("DB_HOST", "127.0.0.1"),
		DBPort: getEnvInt("DB_PORT", 3306),
		DBUser: getEnv("DB_USER", "root"),
		DBPass: getEnv("DB_PASS", ""),
		DBName: getEnv("DB_NAME", "country_lib"),

		DBMaxOpen:        getEnvInt("DB_MAX_OPEN", 25),
		DBMaxIdle:        getEnvInt("DB_MAX_IDLE", 10),
		DBMaxLifetimeMin: time.Duration(getEnvInt("DB_MAX_LIFETIME_MIN", 30)) * time.Minute,

		CORSAllowOrigins: getEnv("CORS_ALLOW_ORIGINS", "*"),
	}
}
