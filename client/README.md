# Task Management App

A modern React-based task management application with Kanban boards, drag & drop functionality, and full authentication.

## Features

- 🔐 User authentication (login/signup) with JWT
- 📋 Project management with boards
- 🎯 Kanban board with drag & drop task reordering
- 👥 Member management
- 🌗 Light/dark mode with persistence
- 📱 Fully responsive design
- ♿ Accessible UI
- 🔍 Admin panel for user management

## Tech Stack

- **React 19** with TypeScript
- **Vite** for build tooling
- **TanStack Query** for data fetching and caching
- **Zustand** for state management
- **@dnd-kit** for drag & drop
- **Tailwind CSS** for styling
- **shadcn/ui** style components
- **React Router** for navigation

## Installation

Install dependencies:

```bash
npm install
```

## Development

Start the development server:

```bash
npm run dev
```

## Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:3000
```

## API Endpoints

The app connects to the following REST API endpoints:

### Auth
- `POST /signup` - Register user
- `POST /login` - Authenticate user

### Projects
- `GET /projects` - List user projects
- `POST /projects` - Create project
- `GET /projects/:id/board` - Get board data
- `POST /projects/:id/members` - Add project member

### Tasks
- `POST /tasks` - Create task
- `PATCH /tasks/:id` - Update task
- `POST /tasks/reorder` - Reorder tasks

### Users (Admin)
- `GET /users` - List all users

## Project Structure

```
src/
  api/          # API client and services
  components/   # Reusable UI components
  features/     # Feature-based pages and components
  store/        # Zustand stores
  types/        # TypeScript types
  lib/          # Utilities
```

## License

MIT
