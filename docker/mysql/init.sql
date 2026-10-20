-- =============================================================================
-- Dido Store — MySQL Initialization
-- =============================================================================
-- Sets default charset to utf8mb4 for proper Arabic text support.
-- This runs once when the MySQL container is first created.

ALTER DATABASE IF EXISTS dido_store
  CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

-- Ensure the default charset for new tables
SET GLOBAL character_set_server = 'utf8mb4';
SET GLOBAL collation_server = 'utf8mb4_unicode_ci';
