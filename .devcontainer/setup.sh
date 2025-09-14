#!/bin/bash

echo "🚀 Setting up development environment..."

# Wait for PostgreSQL
until pg_isready -h postgres -U dev; do
  echo "⏳ Waiting for PostgreSQL..."
  sleep 2
done

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Initialize database
echo "🗄️ Initializing database..."
cd backend && npm run db:init

echo "✅ Setup complete! Run 'npm run dev' to start."