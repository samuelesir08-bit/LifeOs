# LifeOS

LifeOS is a cross-platform personal dashboard built with Expo and React Native for web, iPhone and iPad.

## Current modules

- Personal finance: income, expenses, budgets and analysis
- Goals and savings progress
- Projects and next actions
- Tasks, priorities and habits
- Calendar, deadlines and Apple Calendar integration on native builds
- Study tracking and subjects
- Local backup export and web backup import
- Supabase email/password authentication and per-user cloud data

## Requirements

- Node.js LTS
- npm
- A Supabase project for accounts and cloud synchronization

## Local setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env`.
3. Set `EXPO_PUBLIC_SUPABASE_URL` to the project URL.
4. Set `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to a **publishable** key (`sb_publishable_...`).
5. Run `npx expo start`.

Never use a Supabase secret key (`sb_secret_...`) or legacy `service_role` key in this app. Expo public environment variables are included in the client bundle.

## Supabase database

After restoring/creating the Supabase project, run the SQL in [supabase/schema.sql](supabase/schema.sql) in the Supabase SQL Editor. It creates the `lifeos_data` table and enables Row Level Security so each authenticated user can access only their own data.

The app expects these columns:

- `user_id` (UUID, unique per user)
- `data` (JSONB document)
- `updated_at` (timestamp)

Cloud outages do not block access to the local copy. The Account screen exposes the current sync status and a retry action.

## Web deployment

For a Vercel deployment, configure the two Supabase environment variables in the Vercel project settings, then use:

- Build command: `npx expo export --platform web`
- Output directory: `dist`

Do not commit `.env`; it is ignored by Git. Use `.env.example` only as a placeholder template.

## Native builds

The project uses Expo SDK 54 and `expo-calendar`. Calendar read/write access is available in native builds; the browser cannot access the device's private Apple Calendar database directly.

## Important product work still required

Before public commercial launch, complete and verify: database restoration and RLS audit, multi-device conflict handling, transactional backup restore on native devices, AI requests through a server-side Edge Function, subscription entitlement validation and in-app purchase compliance, privacy policy/terms, and end-to-end tests on web/iOS/iPadOS.
