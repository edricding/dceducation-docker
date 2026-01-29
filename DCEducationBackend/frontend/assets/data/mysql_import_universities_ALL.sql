-- MySQL 8.0+ import script for universities (single table)
-- 1) Put universities_ALL.json into your MySQL secure_file_priv directory (commonly /var/lib/mysql-files/)
-- 2) Run this script in the target database.

/*
Suggested table schema:

CREATE TABLE universities (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  country_code VARCHAR(8) NOT NULL,
  country VARCHAR(64) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  name_en_short VARCHAR(255) NOT NULL,
  name_cn VARCHAR(255) NOT NULL,
  domains_json JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_country_code (country_code),
  KEY idx_name_en (name_en),
  KEY idx_name_cn (name_cn)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
*/

SET @json_path = '/var/lib/mysql-files/universities_ALL.json';
SET @json = LOAD_FILE(@json_path);

-- sanity check
SELECT IF(@json IS NULL, 'LOAD_FILE failed: check secure_file_priv / path / file permissions', 'OK') AS load_status,
       CHAR_LENGTH(@json) AS json_chars;

INSERT INTO universities (country_code, country, name_en, name_en_short, name_cn, domains_json)
SELECT
  jt.country_code,
  jt.country,
  jt.name_EN,
  jt.name_EN_short,
  jt.name_CN,
  jt.domains
FROM JSON_TABLE(
  @json,
  '$[*]' COLUMNS (
    country_code   VARCHAR(8)   PATH '$.country_code',
    country        VARCHAR(64)  PATH '$.country',
    name_EN        VARCHAR(255) PATH '$.name_EN',
    name_EN_short  VARCHAR(255) PATH '$.name_EN_short',
    name_CN        VARCHAR(255) PATH '$.name_CN',
    domains        JSON         PATH '$.domains'
  )
) AS jt;

-- verify
SELECT COUNT(*) AS inserted_rows FROM universities;
