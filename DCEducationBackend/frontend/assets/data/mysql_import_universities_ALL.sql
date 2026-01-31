/*
 Navicat Premium Dump SQL

 Source Server         : DCEducation
 Source Server Type    : MySQL
 Source Server Version : 80036 (8.0.36)
 Source Host           : rm-bp1ab4w76v2g8mvz1jo.mysql.rds.aliyuncs.com:3306
 Source Schema         : universities

 Target Server Type    : MySQL
 Target Server Version : 80036 (8.0.36)
 File Encoding         : 65001

 Date: 31/01/2026 09:51:41
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for country
-- ----------------------------
DROP TABLE IF EXISTS `country`;
CREATE TABLE `country`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `name_cn` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `name_en` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `iso2` char(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_country_name_cn`(`name_cn` ASC) USING BTREE,
  UNIQUE INDEX `uk_country_iso2`(`iso2` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 8 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for program_keywords
-- ----------------------------
DROP TABLE IF EXISTS `program_keywords`;
CREATE TABLE `program_keywords`  (
  `program_id` bigint UNSIGNED NOT NULL,
  `tier` decimal(3, 2) NOT NULL DEFAULT 1.00,
  `program_tags_set_or_not` tinyint(1) NOT NULL DEFAULT 0 COMMENT '0=not set, 1=set',
  PRIMARY KEY (`program_id`, `tier`) USING BTREE,
  UNIQUE INDEX `uk_program_id`(`program_id` ASC) USING BTREE,
  INDEX `idx_program_keywords_keyword`(`tier` ASC) USING BTREE,
  CONSTRAINT `fk_program_keywords_program` FOREIGN KEY (`program_id`) REFERENCES `programs` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for program_requirements
-- ----------------------------
DROP TABLE IF EXISTS `program_requirements`;
CREATE TABLE `program_requirements`  (
  `program_id` bigint UNSIGNED NOT NULL,
  `gpa_min_score` tinyint UNSIGNED NULL DEFAULT NULL,
  `ielts_overall_min` decimal(2, 1) NULL DEFAULT NULL,
  `ielts_each_min` decimal(2, 1) NULL DEFAULT NULL,
  `ielts_overall_rec` decimal(2, 1) NULL DEFAULT NULL,
  `toefl_min` smallint UNSIGNED NULL DEFAULT NULL,
  `toefl_rec` smallint NULL DEFAULT NULL,
  `pte_min` smallint UNSIGNED NULL DEFAULT NULL,
  `pte_rec` smallint NULL DEFAULT NULL,
  `duolingo_min` smallint UNSIGNED NULL DEFAULT NULL,
  `duolingo_rec` smallint NULL DEFAULT NULL,
  `requirement_note` varchar(500) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`program_id`) USING BTREE,
  INDEX `idx_requirements_gpa`(`gpa_min_score` ASC) USING BTREE,
  CONSTRAINT `fk_program_requirements_program` FOREIGN KEY (`program_id`) REFERENCES `programs` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_gpa_min_score` CHECK ((`gpa_min_score` is null) or (`gpa_min_score` between 0 and 100)),
  CONSTRAINT `chk_ielts_each` CHECK ((`ielts_each_min` is null) or (`ielts_each_min` between 0.0 and 9.0)),
  CONSTRAINT `chk_ielts_overall` CHECK ((`ielts_overall_min` is null) or (`ielts_overall_min` between 0.0 and 9.0))
) ENGINE = InnoDB CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for program_tags
-- ----------------------------
DROP TABLE IF EXISTS `program_tags`;
CREATE TABLE `program_tags`  (
  `program_id` bigint UNSIGNED NOT NULL,
  `tag_key` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `tag_high_gpa_bar` tinyint(3) UNSIGNED ZEROFILL NOT NULL DEFAULT 000,
  `tag_high_language_bar` tinyint(3) UNSIGNED ZEROFILL NOT NULL DEFAULT 000,
  `tag_high_curriculum_bar` tinyint(3) UNSIGNED ZEROFILL NOT NULL DEFAULT 000,
  `tag_research_plus` tinyint(3) UNSIGNED ZEROFILL NOT NULL DEFAULT 000,
  `tag_stem` tinyint(3) UNSIGNED ZEROFILL NOT NULL DEFAULT 000,
  PRIMARY KEY (`program_id`, `tag_key`) USING BTREE,
  INDEX `idx_program_tags_key_value`(`tag_key` ASC) USING BTREE,
  CONSTRAINT `fk_program_tags_program` FOREIGN KEY (`program_id`) REFERENCES `programs` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_program_tags_tag` FOREIGN KEY (`tag_key`) REFERENCES `tag_definitions` (`tag_key`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for program_weights
-- ----------------------------
DROP TABLE IF EXISTS `program_weights`;
CREATE TABLE `program_weights`  (
  `program_id` bigint UNSIGNED NOT NULL,
  `academics_weight` decimal(5, 4) NOT NULL DEFAULT 0.4500,
  `language_weight` decimal(5, 4) NOT NULL DEFAULT 0.2500,
  `curriculum_weight` decimal(5, 4) NOT NULL DEFAULT 0.2000,
  `profile_weight` decimal(5, 4) NOT NULL DEFAULT 0.1000,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`program_id`) USING BTREE,
  CONSTRAINT `fk_program_weights_program` FOREIGN KEY (`program_id`) REFERENCES `programs` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_weights_sum` CHECK ((((`academics_weight` + `language_weight`) + `curriculum_weight`) + `profile_weight`) between 0.9990 and 1.0010)
) ENGINE = InnoDB CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for programs
-- ----------------------------
DROP TABLE IF EXISTS `programs`;
CREATE TABLE `programs`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `university_id` bigint UNSIGNED NOT NULL,
  `major_name_en` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `major_name_cn` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `degree_level` enum('bachelor','master','phd','diploma','foundation') CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT 'bachelor',
  `tier` enum('top','target','safe') CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT 'target',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `campus_type` enum('urban','suburban','campus','unknown') CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT 'unknown',
  `notes` varchar(1000) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_programs_university_id`(`university_id` ASC) USING BTREE,
  INDEX `idx_programs_degree_tier`(`degree_level` ASC, `tier` ASC) USING BTREE,
  INDEX `idx_programs_major_en`(`major_name_en` ASC) USING BTREE,
  CONSTRAINT `fk_programs_university` FOREIGN KEY (`university_id`) REFERENCES `universities` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 18765 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for student_tags
-- ----------------------------
DROP TABLE IF EXISTS `student_tags`;
CREATE TABLE `student_tags`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `high_gpa_operator` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `high_gpa_value` decimal(2, 1) NULL DEFAULT NULL,
  `high_language_ielts_operator` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `high_language_ielts_value` decimal(2, 1) NULL DEFAULT NULL,
  `high_language_toefl_operator` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `high_language_toefl_value` int NULL DEFAULT NULL,
  `high_language_pte_operator` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `high_language_pte_value` int NULL DEFAULT NULL,
  `high_language_duolingo_operator` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `high_language_duolingo_value` int NULL DEFAULT NULL,
  `strong_curriculum_alevel_operator` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `strong_curriculum_alevel_value` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `strong_curriculum_ib_operator` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `strong_curriculum_ib_value` int NULL DEFAULT NULL,
  `strong_curriculum_ap_operator` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `strong_curriculum_ap_value` smallint NULL DEFAULT NULL,
  `strong_profile_options` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `strong_profile_options_operator` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `strong_profile_options_value` smallint NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for tag_definitions
-- ----------------------------
DROP TABLE IF EXISTS `tag_definitions`;
CREATE TABLE `tag_definitions`  (
  `tag_key` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `name_cn` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `name_en` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `value_min` tinyint UNSIGNED NOT NULL DEFAULT 0,
  `value_max` tinyint UNSIGNED NOT NULL DEFAULT 3,
  `description_cn` varchar(500) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `description_en` varchar(500) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`tag_key`) USING BTREE,
  CONSTRAINT `chk_tag_range` CHECK (`value_min` <= `value_max`)
) ENGINE = InnoDB CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for universities
-- ----------------------------
DROP TABLE IF EXISTS `universities`;
CREATE TABLE `universities`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `country_code` varchar(8) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `country` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `name_en` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `name_en_short` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `name_cn` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `domains_json` json NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `country_id` int UNSIGNED NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uq_country_name`(`country_code` ASC, `name_en` ASC) USING BTREE,
  INDEX `idx_country_code`(`country_code` ASC) USING BTREE,
  INDEX `idx_name_en`(`name_en` ASC) USING BTREE,
  INDEX `idx_name_cn`(`name_cn` ASC) USING BTREE,
  INDEX `idx_universities_country_id`(`country_id` ASC) USING BTREE,
  CONSTRAINT `fk_universities_country` FOREIGN KEY (`country_id`) REFERENCES `country` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 2737 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- View structure for v_programs_for_match
-- ----------------------------
DROP VIEW IF EXISTS `v_programs_for_match`;
CREATE ALGORITHM = UNDEFINED SQL SECURITY DEFINER VIEW `v_programs_for_match` AS select `p`.`id` AS `program_id`,`p`.`university_id` AS `university_id`,`u`.`country_code` AS `country_code`,`u`.`country` AS `country`,`u`.`name_en` AS `university_name_en`,`u`.`name_cn` AS `university_name_cn`,`p`.`major_name_en` AS `major_name_en`,`p`.`major_name_cn` AS `major_name_cn`,`p`.`degree_level` AS `degree_level`,`p`.`tier` AS `tier`,`p`.`is_active` AS `is_active`,json_object('academics',`w`.`academics_weight`,'language',`w`.`language_weight`,'curriculum',`w`.`curriculum_weight`,'profile',`w`.`profile_weight`) AS `weights_json`,json_object('gpaMin',`r`.`gpa_min_score`,'ieltsOverallMin',`r`.`ielts_overall_min`,'ieltsEachMin',`r`.`ielts_each_min`,'toeflMin',`r`.`toefl_min`,'pteMin',`r`.`pte_min`,'duolingoMin',`r`.`duolingo_min`) AS `requirements_json`,(select json_objectagg(`t`.`tag_key`,`t`.`tag_value`) from `program_tags` `t` where (`t`.`program_id` = `p`.`id`)) AS `tags_json`,(select json_arrayagg(`k`.`keyword`) from `program_keywords` `k` where (`k`.`program_id` = `p`.`id`)) AS `keywords_json` from (((`programs` `p` join `universities` `u` on((`u`.`id` = `p`.`university_id`))) left join `program_weights` `w` on((`w`.`program_id` = `p`.`id`))) left join `program_requirements` `r` on((`r`.`program_id` = `p`.`id`)));

SET FOREIGN_KEY_CHECKS = 1;
