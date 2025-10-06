.PHONY: help build up down restart logs clean dev-up dev-down migrate seed

# Default target
help:
	@echo "WeCover USA - Policy PDF Generator"
	@echo ""
	@echo "Available commands:"
	@echo "  make build          - Build all Docker images"
	@echo "  make up             - Start all services (production mode)"
	@echo "  make down           - Stop all services"
	@echo "  make restart        - Restart all services"
	@echo "  make logs           - View logs from all services"
	@echo "  make logs-api       - View API logs only"
	@echo "  make logs-web       - View web logs only"
	@echo "  make clean          - Remove all containers, volumes, and images"
	@echo "  make dev-up         - Start only infrastructure services (for local development)"
	@echo "  make dev-down       - Stop infrastructure services"
	@echo "  make migrate        - Run database migrations"
	@echo "  make seed           - Seed HTML templates"
	@echo "  make shell-api      - Open shell in API container"
	@echo "  make shell-web      - Open shell in web container"
	@echo "  make ps             - Show running containers"
	@echo "  make health         - Check health status of all services"

# Build all Docker images
build:
	docker-compose build

# Start all services (production)
up:
	docker-compose up -d
	@echo "Services started. Access:"
	@echo "  Web App: http://localhost"
	@echo "  API: http://localhost:5173"
	@echo "  MinIO Console: http://localhost:9001"

# Stop all services
down:
	docker-compose down

# Restart all services
restart:
	docker-compose restart

# View logs from all services
logs:
	docker-compose logs -f

# View API logs only
logs-api:
	docker-compose logs -f api

# View web logs only
logs-web:
	docker-compose logs -f web

# Remove all containers, volumes, and images
clean:
	docker-compose down -v --rmi all
	docker system prune -af

# Start only infrastructure services (for local development)
dev-up:
	docker-compose -f docker-compose.dev.yml up -d
	@echo "Development infrastructure started:"
	@echo "  PostgreSQL: localhost:5432"
	@echo "  MinIO: http://localhost:9000"
	@echo "  MinIO Console: http://localhost:9001"

# Stop infrastructure services
dev-down:
	docker-compose -f docker-compose.dev.yml down

# Run database migrations
migrate:
	@echo "Running database migrations..."
	@docker-compose exec -T api node migrations/run.js || \
	 (echo "API container not running. Starting migration locally..." && \
	  cd apps/api && node migrations/run.js)

# Seed HTML templates
seed:
	@echo "Seeding HTML templates..."
	@docker-compose exec -T api node ../../packages/cli/seed-templates.js || \
	 (echo "API container not running. Starting seeding locally..." && \
	  tsx packages/cli/seed-templates.ts)

# Open shell in API container
shell-api:
	docker-compose exec api /bin/sh

# Open shell in web container
shell-web:
	docker-compose exec web /bin/sh

# Show running containers
ps:
	docker-compose ps

# Check health status
health:
	@echo "Checking service health..."
	@docker-compose ps --format "table {{.Service}}\t{{.Status}}\t{{.Ports}}"

