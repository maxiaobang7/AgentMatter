ALTER TABLE resources
  ADD COLUMN pending_payload_json JSON NULL AFTER payload_json,
  ADD COLUMN pending_content_hash CHAR(64) NULL AFTER pending_payload_json,
  ADD COLUMN pending_updated_at DATETIME(3) NULL AFTER pending_content_hash;

CREATE INDEX idx_resources_pending ON resources (pending_updated_at);
