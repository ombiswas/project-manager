# TaskHub - Project Manager

A full-stack project management application built with Node.js, Express, MongoDB, and React (React Router v7).

## Project Structure

- `backend/`: Express.js API with Mongoose and MongoDB.
- `frontend/`: React application using React Router v7 and Tailwind CSS v4.

## Tech Stack

### Backend
- **Runtime:** Node.js (ESM)
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Validation:** Zod
- **Authentication:** JWT, bcrypt
- **Security:** Arcjet
- **Email:** SendGrid

### Frontend
- **Framework:** React 19 (React Router v7)
- **Styling:** Tailwind CSS v4
- **UI Components:** Radix UI (shadcn/ui style)
- **Icons:** Lucide React
- **State Management:** TanStack Query (React Query)
- **Forms:** React Hook Form + Zod
- **HTTP Client:** Axios

## Getting Started

### Backend
1. `cd backend`
2. `npm install`
3. Create `.env` file (see `backend/.env.example` if available, or check `backend/index.js` for required variables).
4. `npm run dev`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## Guidelines & Conventions

- Use ESM in the backend.
- Follow the MVC pattern in the backend (`models/`, `controllers/`, `routes/`).
- Use Zod for schema validation on both ends.
- Frontend follows a modular structure in `app/components/` and `app/routes/`.
- Use React Router v7 layout and route definitions in `app/routes.ts`.
- Prefer Vanilla CSS or Tailwind CSS for styling.
