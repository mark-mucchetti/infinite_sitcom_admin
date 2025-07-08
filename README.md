# WPVI Admin Interface

#### API Startup Instructions
```bash
# Start API server
cd /Users/markm/Documents/src/wpvi/backend
poetry run python run_api.py

# Test mode ALWAYS USE TEST MODE!! ALWAYS USE TEST MODE!!!!!
WPVI_TEST_MODE=true poetry run python run_api.py
```


A modern React-based administration interface for managing WPVI sitcom generation.

## Features

- **Show Management**: Create and manage TV shows with AI generation
- **Episode Management**: Generate episodes with script and audio production
- **Real-time Progress**: Live updates during generation processes
- **Script Generation**: 4-phase script generation workflow visualization
- **Audio Production**: 3-phase audio generation with voice casting
- **Responsive Design**: Modern UI built with Tailwind CSS and Headless UI

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + Headless UI
- **State Management**: Zustand
- **Routing**: React Router v6
- **Forms**: React Hook Form with Zod validation
- **API Client**: Axios with interceptors
- **Real-time**: Socket.IO client

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint
```

## API Configuration

The frontend connects to the WPVI backend API. Configure the API URL:

```bash
# .env.local
VITE_API_URL=http://localhost:8055
VITE_WS_URL=http://localhost:8055
```

## Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   ├── layout/          # Layout components
│   ├── forms/           # Form components
│   └── modals/          # Modal components
├── pages/               # Page components
├── services/            # API client and WebSocket
├── hooks/               # Custom React hooks
├── store/               # Zustand stores
├── utils/               # Utility functions
└── types/               # TypeScript definitions
```

## Development Status

### ✅ Phase 2: Frontend Foundation - COMPLETE

**Note**: PROJECT_PLAN_FUTURE.md has been renamed to PROJECT_PLAN.md for the admin interface.

Frontend Foundation implemented:
- React 18 + TypeScript project setup with Vite
- Tailwind CSS v3 + Headless UI configuration (fixed CSS issues)
- Complete project structure and base components
- API client with Axios interceptors and environment types
- WebSocket client for real-time updates
- Responsive layout with sidebar navigation and breadcrumbs
- Development tooling (ESLint, Prettier, TypeScript)
- All TypeScript compilation errors resolved
- Auto-reload working on http://localhost:3000

### 🚀 Ready for Phase 3: Show & Episode Management

Next implementation phase focuses on core content management functionality.