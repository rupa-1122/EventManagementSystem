# Overview

This is a Student Event Management Portal for Vignan's Institute of Engineering for Women (VIEW). The application is built as a full-stack web application with a React frontend, Express.js backend, and PostgreSQL database. It provides event registration functionality for students and administrative capabilities for managing events and tracking registrations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a modern full-stack architecture with clear separation between frontend and backend components:

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: In-memory storage with planned PostgreSQL sessions
- **Email Service**: EmailJS for client-side email notifications

## Key Components

### Authentication System
- Role-based authentication (Student/Admin)
- Session-based authentication with secure session management
- Default admin account for initial setup
- Login/logout functionality with proper session cleanup

### Event Management
- Event creation and management (admin only)
- Event listing and filtering
- Seat capacity management with real-time availability
- Event categories and metadata tracking

### Registration System
- Student event registration with form validation
- Multi-category registration support
- Email notifications for successful registrations
- Registration tracking and management

### User Interface
- Responsive design optimized for mobile and desktop
- Dark/light theme support through CSS variables
- Accessible components using Radix UI primitives
- Toast notifications for user feedback

## Data Flow

1. **Authentication Flow**:
   - User logs in through the login page
   - Server validates credentials and creates session
   - User data and session ID stored in localStorage
   - Role-based routing to appropriate dashboard

2. **Event Registration Flow**:
   - Student views available events on dashboard
   - Clicks register button to open registration modal
   - Fills out registration form with personal details
   - Form data validated and submitted to backend
   - Email notification sent via EmailJS
   - Registration confirmation displayed

3. **Admin Management Flow**:
   - Admin logs in and accesses admin dashboard
   - Views statistics and manages events
   - Creates/updates/deletes events
   - Monitors student registrations and activity

## External Dependencies

### Database
- **Neon Database**: Serverless PostgreSQL for production
- **Drizzle ORM**: Type-safe database queries and migrations
- **Connection**: Environment variable `DATABASE_URL` required

### Email Service
- **EmailJS**: Client-side email sending
- **Service ID**: `service_fkb2flr`
- **Template ID**: `template_bn5g7lg`
- **Public Key**: `_5E3TBTSxOfgNVIWG`

### UI Components
- **Radix UI**: Accessible component primitives
- **Lucide Icons**: Icon library for consistent iconography
- **Tailwind CSS**: Utility-first CSS framework

## Deployment Strategy

### Development
- **Command**: `npm run dev`
- **Server**: Express server with Vite middleware for HMR
- **Database**: Development database via Drizzle migrations
- **Port**: Default Express port with Vite dev server integration

### Production Build
- **Frontend**: Vite builds optimized React bundle to `dist/public`
- **Backend**: esbuild bundles Express server to `dist/index.js`
- **Static Files**: Express serves built frontend files
- **Database**: PostgreSQL production database via `DATABASE_URL`

### Database Management
- **Migrations**: Stored in `./migrations` directory
- **Schema**: Centralized in `shared/schema.ts`
- **Push Command**: `npm run db:push` for schema updates

### File Structure
```
├── client/          # React frontend application
├── server/          # Express.js backend
├── shared/          # Shared TypeScript types and schemas
├── migrations/      # Database migration files
└── dist/           # Production build output
```

The application is designed to be deployed on platforms supporting Node.js with PostgreSQL database connectivity, with environment variables for database configuration and email service credentials.