# StudyAI Admin Panel

A modern, responsive admin dashboard built with Next.js 16, React 19, Redux Toolkit, shadcn/ui, and Tailwind CSS.

## Features

- **Dashboard** - Overview with stats, charts, and key metrics
- **User Management** - View, search, filter, block/unblock users
- **Content Control** - Manage quizzes and flashcards with tabs
- **Reports & Analytics** - Charts, trends, and export options
- **Settings** - Admin profile management

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: shadcn/ui + Tailwind CSS 4
- **State Management**: Redux Toolkit
- **Charts**: Recharts
- **Icons**: Lucide React
- **Language**: TypeScript

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Dashboard page
│   ├── user-management/   # User management page
│   ├── content-control/   # Content control page
│   ├── reports-analytics/ # Reports & analytics page
│   └── settings/          # Settings page
├── components/
│   ├── layout/            # Layout components (Header)
│   ├── shared/            # Shared components (Charts, Cards)
│   ├── sidebar/           # Sidebar components
│   └── ui/                # shadcn/ui components
├── config/                # Configuration files
├── lib/                   # Utility functions
├── redux/                 # Redux store and slices
│   └── slices/           # Redux slices for each feature
└── types/                 # TypeScript type definitions
```

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Deploy on Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/study-ai)

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Click **Deploy**

The project is configured for automatic deployment on Vercel.
