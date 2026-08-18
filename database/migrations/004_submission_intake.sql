ALTER TABLE submissions
  ADD COLUMN component_path VARCHAR(300) NULL AFTER category,
  ADD COLUMN display_name VARCHAR(180) NULL AFTER component_path,
  ADD COLUMN hosts_json JSON NULL AFTER display_name,
  ADD COLUMN ip_hash CHAR(64) NULL AFTER status,
  ADD KEY idx_submissions_repo_status (github_url, status, created_at),
  ADD KEY idx_submissions_ip_created (ip_hash, created_at);
