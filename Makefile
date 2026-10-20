# =============================================================================
# Dido Store — Makefile
# =============================================================================
# Common commands for managing the Docker environment.

.PHONY: help up down dev rebuild migrate seed fresh-seed logs backup shell-backend shell-frontend

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ---------------------------------------------------------------------------
# Docker Compose
# ---------------------------------------------------------------------------

up: ## Start all services (production mode)
	docker compose up -d --build

down: ## Stop all services
	docker compose down

dev: ## Start with dev overrides (hot reload) + phpMyAdmin
	docker compose -f docker-compose.yml -f docker-compose.dev.yml --profile dev up -d --build

dev-down: ## Stop dev services
	docker compose -f docker-compose.yml -f docker-compose.dev.yml --profile dev down

rebuild: ## Rebuild all images from scratch
	docker compose build --no-cache
	docker compose up -d

logs: ## Tail logs for all services
	docker compose logs -f

logs-backend: ## Tail backend logs
	docker compose logs -f backend

logs-frontend: ## Tail frontend logs
	docker compose logs -f frontend

# ---------------------------------------------------------------------------
# Laravel (Backend)
# ---------------------------------------------------------------------------

migrate: ## Run database migrations
	docker compose exec backend php artisan migrate --force

seed: ## Run database seeders
	docker compose exec backend php artisan db:seed --force

fresh-seed: ## Drop all tables, re-migrate, and seed
	docker compose exec backend php artisan migrate:fresh --seed --force

key-generate: ## Generate Laravel app key
	docker compose exec backend php artisan key:generate --show

tinker: ## Open Laravel Tinker
	docker compose exec backend php artisan tinker

# ---------------------------------------------------------------------------
# Shells
# ---------------------------------------------------------------------------

shell-backend: ## Open a shell in the backend container
	docker compose exec backend sh

shell-frontend: ## Open a shell in the frontend container
	docker compose exec frontend sh

shell-db: ## Open MySQL CLI
	docker compose exec db mysql -u$$(grep DB_USERNAME .env | cut -d= -f2) -p$$(grep DB_PASSWORD .env | cut -d= -f2) $$(grep DB_DATABASE .env | cut -d= -f2)

# ---------------------------------------------------------------------------
# Backup
# ---------------------------------------------------------------------------

backup: ## Backup the database to ./backups/
	@mkdir -p backups
	docker compose exec db mysqldump -uroot -p$$(grep DB_ROOT_PASSWORD .env | cut -d= -f2) $$(grep DB_DATABASE .env | cut -d= -f2) > backups/dido_store_$$(date +%Y%m%d_%H%M%S).sql
	@echo "Backup saved to backups/"

# ---------------------------------------------------------------------------
# Cleanup
# ---------------------------------------------------------------------------

clean: ## Remove all containers, volumes, and images
	docker compose down -v --rmi all
	@echo "All containers, volumes, and images removed."
