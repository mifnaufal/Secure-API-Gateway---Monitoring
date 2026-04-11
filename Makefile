.PHONY: help install dev docker-up docker-down docker-build test test-all lint clean

# Default target
help:
	@echo "Secure API Gateway + Monitoring"
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@echo "  install      Install all dependencies"
	@echo "  dev          Run all services in development mode"
	@echo "  docker-up    Start Docker containers"
	@echo "  docker-down  Stop Docker containers"
	@echo "  docker-build Build and start Docker containers"
	@echo "  test         Run all tests"
	@echo "  test-gw      Run gateway tests"
	@echo "  test-auth    Run auth service tests"
	@echo "  test-data    Run data service tests"
	@echo "  test-mon     Run monitoring service tests"
	@echo "  lint         Check for security vulnerabilities"
	@echo "  db-migrate   Run database migrations"
	@echo "  clean        Clean node_modules and Docker artifacts"
	@echo "  logs         View Docker logs"
	@echo "  status       Check service status"

# Install all dependencies
install:
	@echo "Installing root dependencies..."
	npm install
	@echo "Installing gateway dependencies..."
	cd gateway && npm install
	@echo "Installing auth service dependencies..."
	cd services/auth && npm install
	@echo "Installing data service dependencies..."
	cd services/data && npm install
	@echo "Installing monitoring service dependencies..."
	cd monitoring && npm install
	@echo "✅ All dependencies installed!"

# Run all services in development mode
dev:
	@echo "🚀 Starting all services..."
	npm run dev:all

# Docker commands
docker-up:
	@echo "🐳 Starting Docker containers..."
	docker compose up -d
	@echo "✅ Containers started! Wait for services to be ready..."
	@echo "   Gateway: http://localhost:3000"
	@echo "   Auth: http://localhost:3001"
	@echo "   Data: http://localhost:3002"
	@echo "   Monitoring: http://localhost:3003"

docker-down:
	@echo "🛑 Stopping Docker containers..."
	docker compose down

docker-build:
	@echo "🔨 Building and starting Docker containers..."
	docker compose up -d --build
	@echo "✅ Build complete!"

docker-rebuild:
	@echo "🔄 Rebuilding Docker containers..."
	docker compose down
	docker compose build --no-cache
	docker compose up -d

# Test commands
test:
	@echo "🧪 Running all tests..."
	npm test

test-gw:
	@echo "🧪 Running gateway tests..."
	cd gateway && npm test

test-auth:
	@echo "🧪 Running auth service tests..."
	cd services/auth && npm test

test-data:
	@echo "🧪 Running data service tests..."
	cd services/data && npm test

test-mon:
	@echo "🧪 Running monitoring service tests..."
	cd monitoring && npm test

# Security check
lint:
	@echo "🔍 Checking for vulnerabilities..."
	npm audit --production
	cd gateway && npm audit --production
	cd services/auth && npm audit --production
	cd services/data && npm audit --production
	cd monitoring && npm audit --production
	@echo "✅ Security check complete!"

# Database migrations
db-migrate:
	@echo "🗄️  Running database migrations..."
	cd services/auth && npm run db:migrate
	cd services/data && npm run db:migrate
	cd monitoring && npm run db:migrate
	@echo "✅ Migrations complete!"

# Clean up
clean:
	@echo "🧹 Cleaning up..."
	@echo "Removing node_modules..."
	rm -rf node_modules gateway/node_modules services/auth/node_modules services/data/node_modules monitoring/node_modules
	@echo "Removing package-lock.json..."
	rm -rf package-lock.json gateway/package-lock.json services/auth/package-lock.json services/data/package-lock.json monitoring/package-lock.json
	@echo "Running docker system prune..."
	docker system prune -f
	@echo "✅ Clean complete!"

# View logs
logs:
	@echo "📋 Viewing Docker logs..."
	docker compose logs -f

# View specific service logs
logs-gw:
	docker compose logs -f gateway

logs-auth:
	docker compose logs -f auth-service

logs-data:
	docker compose logs -f data-service

logs-mon:
	docker compose logs -f monitoring-service

# Check service status
status:
	@echo "📊 Service Status:"
	@echo ""
	@echo "Docker Containers:"
	docker compose ps
	@echo ""
	@echo "Health Checks:"
	@curl -s http://localhost:3000/health | jq . || echo "   Gateway: ❌"
	@curl -s http://localhost:3001/health | jq . || echo "   Auth: ❌"
	@curl -s http://localhost:3002/health | jq . || echo "   Data: ❌"
	@curl -s http://localhost:3003/health | jq . || echo "   Monitoring: ❌"

# Quick start for new users
quick-start:
	@echo "🚀 Quick Start Guide:"
	@echo "1. Installing dependencies..."
	make install
	@echo ""
	@echo "2. Starting Docker services..."
	make docker-build
	@echo ""
	@echo "3. Waiting for services to be ready..."
	sleep 15
	@echo ""
	@echo "4. Testing health endpoints..."
	curl http://localhost:3000/health
	@echo ""
	@echo "✅ Setup complete! Check README.md for next steps."
