CREATE TABLE IF NOT EXISTS taxonomy_topics (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  category ENUM('skills','dsh','plugins','mcp','prompts') NOT NULL,
  slug VARCHAR(80) NOT NULL,
  label_zh VARCHAR(120) NOT NULL,
  label_en VARCHAR(120) NOT NULL,
  keywords_json JSON NOT NULL,
  sort_order INT UNSIGNED NOT NULL DEFAULT 100,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_taxonomy_topic_category_slug (category, slug),
  KEY idx_taxonomy_topic_browse (category, active, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
