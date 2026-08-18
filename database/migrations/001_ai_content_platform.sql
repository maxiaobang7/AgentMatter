CREATE TABLE IF NOT EXISTS resources (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  stable_key VARCHAR(260) NOT NULL,
  resource_id VARCHAR(180) NOT NULL,
  owner VARCHAR(100) NOT NULL,
  repo VARCHAR(100) NOT NULL,
  component_path VARCHAR(300) NOT NULL DEFAULT '',
  category ENUM('skills','dsh','plugins','mcp','prompts') NOT NULL,
  status ENUM('draft','published','unpublished','archived') NOT NULL DEFAULT 'draft',
  payload_json JSON NOT NULL,
  content_hash CHAR(64) NOT NULL,
  source_commit_sha CHAR(40) NULL,
  quality_score DECIMAL(5,2) NULL,
  version_number INT UNSIGNED NOT NULL DEFAULT 1,
  published_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_resources_stable_key (stable_key),
  KEY idx_resources_public (status, category, published_at),
  KEY idx_resources_repo (owner, repo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS resource_versions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  resource_id BIGINT UNSIGNED NOT NULL,
  version_number INT UNSIGNED NOT NULL,
  action VARCHAR(40) NOT NULL,
  operation_id VARCHAR(120) NOT NULL,
  payload_json JSON NOT NULL,
  content_hash CHAR(64) NOT NULL,
  actor VARCHAR(120) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_resource_version (resource_id, version_number),
  KEY idx_versions_operation (operation_id),
  CONSTRAINT fk_versions_resource FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS operations (
  operation_id VARCHAR(120) NOT NULL,
  action VARCHAR(40) NOT NULL,
  status ENUM('processing','succeeded','failed') NOT NULL,
  request_hash CHAR(64) NOT NULL,
  resource_id BIGINT UNSIGNED NULL,
  result_json JSON NULL,
  error_message TEXT NULL,
  actor VARCHAR(120) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  completed_at DATETIME(3) NULL,
  PRIMARY KEY (operation_id),
  KEY idx_operations_created (created_at),
  CONSTRAINT fk_operations_resource FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  resource_id BIGINT UNSIGNED NULL,
  operation_id VARCHAR(120) NULL,
  action VARCHAR(40) NOT NULL,
  actor VARCHAR(120) NOT NULL,
  before_hash CHAR(64) NULL,
  after_hash CHAR(64) NULL,
  metadata_json JSON NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_audit_resource (resource_id, created_at),
  KEY idx_audit_operation (operation_id),
  CONSTRAINT fk_audit_resource FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS api_tokens (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  token_prefix VARCHAR(16) NOT NULL,
  token_hash CHAR(64) NOT NULL,
  scopes_json JSON NOT NULL,
  enabled TINYINT(1) NOT NULL DEFAULT 1,
  last_used_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_api_token_hash (token_hash),
  KEY idx_api_token_prefix (token_prefix)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS submissions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  github_url VARCHAR(500) NOT NULL,
  category VARCHAR(40) NULL,
  note TEXT NULL,
  status ENUM('new','reviewing','accepted','rejected') NOT NULL DEFAULT 'new',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_submissions_status (status, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
