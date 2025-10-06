#!/bin/bash

# WeCover USA - Policy PDF Generator Quick Start Script
# This script helps you get started with Docker deployment

set -e

echo "============================================"
echo "WeCover USA - Policy PDF Generator"
echo "Docker Quick Start"
echo "============================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker is installed"
echo "✅ Docker Compose is installed"
echo ""

# Ask user which mode they want
echo "Choose deployment mode:"
echo "1) Full Docker Stack (recommended for testing)"
echo "2) Infrastructure Only (for local development)"
echo "3) Production Deployment"
read -p "Enter choice (1-3): " choice

case $choice in
    1)
        echo ""
        echo "🚀 Starting Full Docker Stack..."
        echo ""
        
        # Build images
        echo "Building Docker images..."
        docker-compose build
        
        # Start services
        echo "Starting services..."
        docker-compose up -d
        
        # Wait for services to be healthy
        echo "Waiting for services to be ready..."
        sleep 10
        
        # Check status
        echo ""
        echo "Service Status:"
        docker-compose ps
        
        echo ""
        echo "✅ Full stack is running!"
        echo ""
        echo "📝 Next Steps:"
        echo "1. Upload PDF template to MinIO Console: http://localhost:9001"
        echo "   Login: minioadmin / minioadmin"
        echo "   Create bucket 'wecover-pdfs' and upload template to:"
        echo "   templates/ContractPSVSCTemplate_HT_v07_Form.pdf"
        echo ""
        echo "2. Run migrations:"
        echo "   make migrate"
        echo ""
        echo "3. Seed HTML templates:"
        echo "   make seed"
        echo ""
        echo "4. Access the application:"
        echo "   Web App: http://localhost"
        echo "   API: http://localhost:5173"
        echo "   MinIO Console: http://localhost:9001"
        ;;
        
    2)
        echo ""
        echo "🚀 Starting Infrastructure Only..."
        echo ""
        
        # Start infrastructure
        docker-compose -f docker-compose.dev.yml up -d
        
        # Check status
        echo ""
        echo "Service Status:"
        docker-compose -f docker-compose.dev.yml ps
        
        echo ""
        echo "✅ Infrastructure is running!"
        echo ""
        echo "📝 Next Steps:"
        echo "1. Install dependencies:"
        echo "   pnpm install"
        echo ""
        echo "2. Set up environment files:"
        echo "   cp apps/api/env.example apps/api/.env"
        echo "   cp apps/web/env.example apps/web/.env"
        echo ""
        echo "3. Run migrations:"
        echo "   pnpm db:migrate"
        echo ""
        echo "4. Upload PDF template to MinIO: http://localhost:9001"
        echo ""
        echo "5. Seed templates:"
        echo "   pnpm seed:templates"
        echo ""
        echo "6. Install Playwright:"
        echo "   cd apps/api && npx playwright install chromium"
        echo ""
        echo "7. Start development servers:"
        echo "   pnpm dev"
        echo ""
        echo "Services:"
        echo "  PostgreSQL: localhost:5432"
        echo "  MinIO: http://localhost:9000"
        echo "  MinIO Console: http://localhost:9001"
        ;;
        
    3)
        echo ""
        echo "🚀 Production Deployment Setup..."
        echo ""
        
        # Check if .env.prod exists
        if [ ! -f ".env.prod" ]; then
            echo "📝 Creating production environment file..."
            cp env.prod.example .env.prod
            echo "⚠️  Please edit .env.prod with your production settings:"
            echo "   - Database credentials"
            echo "   - AWS S3 configuration"
            echo "   - Domain and CORS settings"
            echo ""
            read -p "Press Enter after you've configured .env.prod..."
        fi
        
        # Load environment
        export $(cat .env.prod | xargs)
        
        # Build images
        echo "Building production images..."
        docker-compose -f docker-compose.prod.yml build
        
        # Start services
        echo "Starting production services..."
        docker-compose -f docker-compose.prod.yml up -d
        
        # Wait for services
        echo "Waiting for services to be ready..."
        sleep 15
        
        # Run migrations
        echo "Running database migrations..."
        docker-compose -f docker-compose.prod.yml exec -T api node migrations/run.js
        
        # Check status
        echo ""
        echo "Service Status:"
        docker-compose -f docker-compose.prod.yml ps
        
        echo ""
        echo "✅ Production deployment complete!"
        echo ""
        echo "📝 Next Steps:"
        echo "1. Upload PDF template to S3"
        echo "2. Seed HTML templates"
        echo "3. Configure SSL/TLS"
        echo "4. Set up monitoring"
        echo ""
        echo "See DOCKER.md for detailed production deployment guide."
        ;;
        
    *)
        echo "Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "============================================"
echo "For more commands, run: make help"
echo "For documentation, see: DOCKER.md"
echo "============================================"
