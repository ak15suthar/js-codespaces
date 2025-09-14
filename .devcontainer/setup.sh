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

# Setup environment variables for Codespaces
if [ -n "$CODESPACES" ] && [ "$CODESPACES" = "true" ]; then
  echo "🌐 Detected GitHub Codespaces - setting up dynamic URLs..."

  # Backend environment
  cat > backend/.env << EOF
NODE_ENV=development
PORT=8081
DATABASE_URL=postgresql://dev:dev@postgres:5432/app
JWT_SECRET=devsecret
CODESPACES=true
EOF

  # Frontend environment with dynamic Codespaces URLs
  cat > frontend/.env << EOF
REACT_APP_CODESPACES=true
REACT_APP_CODESPACE_NAME=${CODESPACE_NAME}
REACT_APP_GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN=${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}
EOF

  echo "✅ Codespaces environment configured"
else
  echo "💻 Local development environment"
fi

# Initialize database
echo "🗄️ Initializing database..."
cd backend && npm run db:init

echo "✅ Setup complete! Run 'npm run dev' to start."