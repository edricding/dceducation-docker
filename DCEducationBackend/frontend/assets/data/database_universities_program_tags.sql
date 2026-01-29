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

 Date: 29/01/2026 16:14:11
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

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

SET FOREIGN_KEY_CHECKS = 1;
