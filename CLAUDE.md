# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack pizza ordering system consisting of a React frontend and Express.js backend. The application is designed as a coding challenge with three main implementation tasks.

## Development Commands

### Backend (Express.js + MongoDB)
```bash
cd backend
npm install
npm run dev          # Start development server with nodemon
npm start           # Start production server
npm test            # Run Jest tests
npm test:watch      # Run tests in watch mode
npm test:coverage   # Run tests with coverage report
npm test order.model.test.js  # Run specific Order model tests
```

### Frontend (React + Tailwind CSS)
```bash
cd frontend
npm install
npm start           # Start development server (port 3000)
npm run build       # Build for production
npm test            # Run React tests
```

## Architecture

### Backend Structure
- **Express.js** server with MongoDB/Mongoose
- **Route-based organization**: `/api/auth`, `/api/pizzas`, `/api/orders`, `/api/webhook`, `/api/admin`
- **Middleware**: Authentication (JWT), admin authorization, request logging
- **Models**: User, Pizza, Order (with comprehensive schema requirements)
- **Controllers**: Handle business logic for each route group
- **Services**: Delivery service for external integrations

### Frontend Structure
- **React 18** with React Router for SPA navigation
- **Context API**: AuthContext for user state, CartContext for shopping cart
- **Component organization**: 
  - `/components`: Reusable UI components
  - `/pages`: Route-specific page components
  - `/services`: API communication layer
- **Styling**: Tailwind CSS with responsive design
- **State management**: Context providers wrap the entire app

### Key Integration Points
- JWT-based authentication between frontend/backend
- RESTful API design with proper HTTP status codes
- MongoDB with Mongoose ODM for data persistence
- Webhook endpoint for external delivery status updates

## Challenge Tasks Overview

The codebase contains three main implementation challenges:

1. **Filter/Sort/Pagination System** (`pizzaController.js`, `PizzaList.js`)
   - Backend: Query parameter handling for filter, sortOrder, page, limit
   - Frontend: Infinite scroll with Intersection Observer API

2. **Order Model Design** (`backend/src/models/Order.js`)
   - Comprehensive schema with price snapshots, status transitions, validation
   - Multi-level test suite evaluating implementation from Junior to Expert level

3. **Webhook Implementation** (`webhookController.js`)
   - Status update system with validation and transition rules
   - Error handling for various failure scenarios

## Testing Strategy

- **Backend**: Jest with MongoDB Memory Server for isolated testing
- **Order Model Tests**: 5-level evaluation system (50% to 95%+ scoring)
- **Test Files**: Located in `backend/tests/` directory
- **Coverage**: Configured to exclude `app.js` and migration files

## Database Schema Notes

- **User Model**: Basic authentication with role-based access (admin/user)
- **Pizza Model**: Standard product catalog with images and pricing
- **Order Model**: Complex schema requiring careful design for the challenge
  - Status transitions: pending → confirmed → preparing → out_for_delivery → delivered
  - Price integrity and validation requirements
  - Performance considerations for queries

## Environment Setup

Both frontend and backend require `.env` files:
- Backend: `MONGO_URI`, `PORT`, `JWT_SECRET`
- Frontend: `REACT_APP_API_URL`

Default admin credentials: `admin@admin.com` / `password123`