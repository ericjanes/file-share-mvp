# ShareVault MVP

ShareVault is a secure file-sharing platform with creator monetization, referral rewards, withdrawal management, and admin moderation.

## Features

- Secure user authentication with signed session cookies
- File upload to S3-compatible object storage
- Signed download links for protected file delivery
- Valid download tracking with bot detection and duplicate abuse checks
- Revenue ledger and uploader/referral/platform split calculations
- User wallet and withdrawal request flow
- Admin review for withdrawals, users, and violation reports
- Audit log for operational visibility
- Referral links for user acquisition

## Tech stack

- Next.js 16 App Router
- TypeScript
- Prisma + PostgreSQL
- Tailwind CSS
- AWS S3-compatible SDK
- bcryptjs + jose

## Local development setup

### 1. Prerequisites

- Node.js 20+
- PostgreSQL database running locally or via managed service
- Optional: Cloudflare R2 / AWS S3-compatible bucket for production storage

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root with the following values:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sharevault?schema=public"
SESSION_SECRET="replace-with-a-long-random-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
DEFAULT_PLATFORM_COMMISSION_RATE="0.15"
DEFAULT_UPLOADER_SHARE_RATE="0.70"
DEFAULT_REFERRAL_COMMISSION_RATE="0.10"
DEFAULT_DOWNLOAD_REVENUE_PER_VALID_DOWNLOAD="0.05"

# Storage config
STORAGE_BUCKET="sharevault-files"
STORAGE_REGION="auto"
STORAGE_ENDPOINT="https://<your-r2-or-s3-endpoint>"
STORAGE_ACCESS_KEY_ID="your-access-key"
STORAGE_SECRET_ACCESS_KEY="your-secret"
STORAGE_PUBLIC_URL_BASE="https://your-bucket.example.com"
```

### 4. Generate Prisma client

```bash
npx prisma generate
```

### 5. Push schema to database

```bash
npx prisma db push
```

### 6. Seed default admin + demo data

```bash
npm run db:seed
```

This creates an admin account with:

- Email: `admin@sharevault.dev`
- Password: `Admin@123456`

### 7. Start the app

```bash
npm run dev
```

Then open:

- http://localhost:3000
- http://localhost:3000/auth/login
- http://localhost:3000/admin

## Production deployment

### 1. Build application

```bash
npm run build
```

### 2. Start production server

```bash
npm run start
```

### 3. Database migration

Use Prisma migration in production:

```bash
npx prisma migrate deploy
```

### 4. Seed on fresh deployment

```bash
npm run db:seed
```

### 5. Storage configuration

- Prefer Cloudflare R2 or S3-compatible storage for file hosting.
- Keep object storage private and serve only through signed URLs.
- Do not expose raw object URLs publicly.

## Security notes

- Session cookies are HttpOnly and SameSite=Lax.
- All admin pages require authenticated admin roles.
- Downloads use signed URLs rather than direct storage URLs.
- Revenue and balance ledger updates happen through transactional logic.
- Duplicate and bot-like downloads are blocked before payout generation.

## Admin access

After seeding, log in with:

```text
Email: admin@sharevault.dev
Password: Admin@123456
```

## Folder overview

```text
app/
  admin/
  api/
  auth/
  dashboard/
  download/
  files/
  globals.css
components/
lib/
prisma/
```

## Common commands

```bash
npm run dev
npm run build
npm run db:seed
npx prisma studio
npx prisma db push
```

## Known caveat

Next.js currently prints a middleware deprecation warning when using the classic middleware convention. This project is already aligned with the modern proxy-based direction, but the warning may remain until the app migrates from the legacy middleware file to the newer proxy pattern from the framework.
"# file-share-mvp" 
"# file-share-mvp" 
"# file-share-mvp" 
