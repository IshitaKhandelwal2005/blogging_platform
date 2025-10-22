# Blog Website

A modern blogging platform built with Next.js 15, showcasing full-stack TypeScript development with type-safe APIs and efficient state management.

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS, Markdown rendering
- **State Management**: Zustand, React Query
- **API Layer**: tRPC, Zod validation
- **Database**: PostgreSQL, Drizzle ORM
- **Development**: TypeScript, ESLint, Prettier

## Features

- 📝 Create and edit blog posts with Markdown support
- 🏷️ Categorize posts with multiple categories
- 🔍 Filter posts by category
- ⚡ Optimistic updates for better UX
- 💾 Auto-save drafts
- 🎨 Responsive design with loading states
- 🔒 Type-safe end-to-end

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/blog_website.git
   cd blog_website
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Environment setup:
   ```bash
   # Copy example env file
   cp .env.example .env.local
   
   # Edit .env.local and set your PostgreSQL connection string:
   # DATABASE_URL=postgres://user:password@localhost:5432/blog_db
   ```

4. Database setup:
   ```bash
   # Generate and apply database migrations
   npm run db:push
   
   # Seed the database with sample data
   npm run seed
   ```

5. Start development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`

### Sample Data

The seed script (`npm run seed`) provides:
- 8 predefined categories (Design, Development, Architecture, etc.)
- 5 sample blog posts with rich Markdown content
- Example code snippets and formatting
- Various post categories for testing filters

## Project Structure

```
blog_website/
├── app/                # Next.js app directory
│   ├── api/           # API routes (tRPC)
│   ├── posts/         # Post pages
│   └── layout.tsx     # Root layout
├── components/        # React components
├── src/
│   ├── db/           # Database config & schema
│   ├── server/       # tRPC routers
│   ├── store/        # Zustand stores
│   └── utils/        # Utility functions
└── scripts/          # Database scripts
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format with Prettier
- `npm run db:push` - Update database schema
- `npm run seed` - Populate database with sample data
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report
- `npm run type-check` - Check TypeScript types

## Deployment

This project is configured for deployment on Vercel:

1. Push your code to GitHub
2. Create a new project on [Vercel](https://vercel.com)
3. Connect your GitHub repository
4. Add the required environment variables:
   ```
   DATABASE_URL=your-postgres-connection-string
   ```
5. Deploy!

### PostgreSQL Setup for Production

1. Create a PostgreSQL database (recommended providers: Vercel Postgres, Neon, Supabase)
2. Add the connection string to Vercel environment variables
3. The deployment will automatically:
   - Set up the database schema
   - Run the build process
   - Deploy the application

### Manual Deployment

If you prefer to deploy elsewhere:

1. Set environment variables:
   ```bash
   export DATABASE_URL=your-postgres-connection-string
   ```

2. Build and start:
   ```bash
   npm run build
   npm run start
   ```

## Testing

Tests are written using Jest and React Testing Library. Each test file is located next to its corresponding component with the `.test.tsx` extension.

To ensure code quality:

1. Run the type checker:
   ```bash
   npm run type-check
   ```

2. Run tests:
   ```bash
   npm test
   ```

3. Check test coverage:
   ```bash
   npm run test:coverage
   ```

4. Run linter:
   ```bash
   npm run lint
   ```

## Code Quality

- ESLint enforces code style and best practices
- Prettier ensures consistent formatting
- TypeScript provides type safety
- Jest and React Testing Library for testing
- GitHub Actions for CI/CD (optional)
