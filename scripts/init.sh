#!/bin/bash
# Licensed under MIT - Limbel Project
# Phase 1 initialization script

set -e

echo "🚀 Initializing Limbel Phase 1..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🗄️  Generating Prisma client..."
npm run db:generate

# Start Docker services
echo "🐳 Starting database services..."
docker compose up -d

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL..."
sleep 5

# Run migrations
echo "🔄 Running database migrations..."
npm run db:migrate

# Seed database
echo "🌱 Seeding database..."
npm run db:seed

# Copy env file if not exists
if [ ! -f .env ]; then
  echo "📋 Copying .env.example to .env..."
  cp .env.example .env
  echo "⚠️  Please update .env with your actual credentials before running the app"
fi

echo "✅ Phase 1 setup complete!"
echo ""
echo "🔑 Next steps:"
echo "1. Update .env with AUTH_SECRET (generate with: openssl rand -base64 32)"
echo "2. Configure OAuth providers in .env if needed"
echo "3. Run: npm run dev"
echo "4. Visit: http://localhost:3000"