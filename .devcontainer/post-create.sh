#!/bin/bash

echo "🚀 Setting up development environment..."

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
until pg_isready -h postgres -U postgres; do
  sleep 2
done
echo "✅ PostgreSQL is ready!"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd /workspaces/${CODESPACE_VSCODE_FOLDER:-js-codespaces}/backend
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd /workspaces/${CODESPACE_VSCODE_FOLDER:-js-codespaces}/frontend
npm install

# Detect if running in GitHub Codespaces
if [ -n "$CODESPACES" ] && [ "$CODESPACES" = "true" ]; then
  echo "🌐 Detected GitHub Codespaces environment"
  
  # Get the Codespaces URLs
  BACKEND_URL="https://${CODESPACE_NAME}-5000.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
  FRONTEND_URL="https://${CODESPACE_NAME}-3000.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
  
  echo "📍 Backend URL: $BACKEND_URL"
  echo "📍 Frontend URL: $FRONTEND_URL"
else
  echo "💻 Running in local development environment"
  BACKEND_URL="http://localhost:5000"
  FRONTEND_URL="http://localhost:3000"
fi

# Create environment files
echo "🔧 Setting up environment files..."

# Backend .env
cat > /workspaces/${CODESPACE_VSCODE_FOLDER:-js-codespaces}/backend/.env << EOF
NODE_ENV=development
PORT=5000
POSTGRES_HOST=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres123
POSTGRES_DB=pizza_app
DATABASE_URL=postgresql://postgres:postgres123@postgres:5432/pizza_app
JWT_SECRET=devsecret123456789
DELIVERY_SERVICE_URL=http://localhost:5001
FRONTEND_URL=$FRONTEND_URL
CORS_ORIGIN=$FRONTEND_URL
IS_CODESPACES=${CODESPACES:-false}
EOF
echo "✅ Backend .env created"

# Frontend .env
cat > /workspaces/${CODESPACE_VSCODE_FOLDER:-js-codespaces}/frontend/.env << EOF
REACT_APP_API_URL=$BACKEND_URL
REACT_APP_IS_CODESPACES=${CODESPACES:-false}
EOF
echo "✅ Frontend .env created"

# Initialize PostgreSQL database
echo "🗄️  Initializing PostgreSQL database..."
cd /workspaces/${CODESPACE_VSCODE_FOLDER:-js-codespaces}/backend
npm run db:init

# Create a startup script
cat > /workspaces/${CODESPACE_VSCODE_FOLDER:-js-codespaces}/start-dev.sh << 'EOF'
#!/bin/bash

echo "🚀 Starting development servers..."

# Function to kill processes on exit
cleanup() {
    echo "🛑 Stopping all servers..."
    kill $(jobs -p) 2>/dev/null
    exit
}
trap cleanup EXIT INT TERM

# Start backend
echo "🔧 Starting backend server on port 5000..."
cd /workspaces/${CODESPACE_VSCODE_FOLDER:-js-codespaces}/backend
npm run dev &

# Start frontend
echo "🎨 Starting frontend server on port 3000..."
cd /workspaces/${CODESPACE_VSCODE_FOLDER:-js-codespaces}/frontend
npm start &

echo "✅ All servers started!"
echo "📍 Frontend: http://localhost:3000"
echo "📍 Backend: http://localhost:5000"
echo "📍 PostgreSQL: localhost:5432"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for all background processes
wait
EOF

chmod +x /workspaces/${CODESPACE_VSCODE_FOLDER:-js-codespaces}/start-dev.sh

echo "✅ Development environment setup complete!"
echo ""
echo "📚 Quick Start Guide:"
echo "  1. Run './start-dev.sh' to start all servers"
echo "  2. Or start individually:"
echo "     - Backend: cd backend && npm run dev"
echo "     - Frontend: cd frontend && npm start"
echo ""
echo "📍 Endpoints:"
echo "  - Frontend: http://localhost:3000"
echo "  - Backend API: http://localhost:5000"
echo "  - PostgreSQL: postgres://postgres:postgres123@localhost:5432/pizza_app"