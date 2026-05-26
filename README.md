# OpenHeads

A modern, free party guessing game built with Next.js, Supabase, and TypeScript.

## Quick Start

### Prerequisites

- Node.js 20.9+
- A Supabase account (free tier)
- npm or yarn

### 1. Clone & Install

```bash
git clone https://github.com/mikuudev/OpenHeads
cd openheads
npm install
```

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the entire contents of `supabase-schema.sql`
3. Enable Google Auth in **Authentication > Providers**
4. Copy your project URL and anon key from **Settings > API**
5. Enable **Realtime** for the `rooms` and `room_players` tables if using multiplayer

### 3. Environment Variables

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Fill in:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service role key (for admin operations) |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` for dev |
| `NEXT_PUBLIC_APP_NAME` | `OpenHeads` |

Optional:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | For image uploads via Cloudinary |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `NEXT_PUBLIC_GIPHY_API_KEY` | For GIF search integration |

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Login, register, callback
│   ├── game/              # Gameplay screen
│   ├── packs/             # Pack detail + create/edit
│   ├── discovery/         # Browse & search packs
│   ├── profile/           # User profile
│   ├── favorites/         # Favorited packs
│   ├── settings/          # App settings
│   └── admin/             # Moderation dashboard
├── components/
│   ├── ui/                # Reusable UI primitives
│   ├── layout/            # Nav, bottom nav
│   └── auth/              # Auth provider
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities, Supabase clients
├── store/                 # Zustand state stores
└── types/                 # TypeScript types
```

## Key Features

- **Auth**: Email/password, Google OAuth, anonymous guest mode
- **Packs**: Create, edit, publish, favorite, share custom card packs
- **Cards**: Text, images, GIFs, aliases, drag-to-reorder, CSV import
- **Gameplay**: Tilt controls (DeviceOrientation), swipe, tap buttons, timer, scoring
- **Discovery**: Browse, search, filter by category/sort
- **PWA**: Installable, fullscreen, app-like experience
- **Dark Mode**: Dark-first with light mode option
- **Multiplayer**: Room-based party play with realtime sync (via Supabase Realtime)

## Deployment

### Vercel (Frontend)

1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy

### Supabase (Backend)

Already handled — just ensure your production Supabase project has the schema applied.

## Architecture

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, TailwindCSS v4, Framer Motion
- **State**: Zustand (client state), Supabase (server state)
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Auth**: Supabase Auth with SSR cookie handling
- **Styling**: Dark-mode first, mobile-first responsive, glassmorphism accents

## License

MIT
