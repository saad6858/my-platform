/* filepath: components/README.md */
# MY-PLATFORM

Premium Portfolio + Admin Dashboard built with Next.js 14, TypeScript, Tailwind CSS, and Firebase.

## Overview

MY-PLATFORM is a full-stack personal portfolio and business management platform featuring a dark luxury theme, premium animations, and a comprehensive admin dashboard. It includes a public-facing landing page with conditional section toggling, a blog CMS with a visual markdown editor, a lead tracker CRM, a project Kanban board, a content calendar, a finance tracker with charts, and a file manager backed by Firebase Storage.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v3
- **Animations:** Framer Motion
- **Backend:** Firebase (Authentication, Firestore, Storage)
- **Icons:** Lucide React
- **Charts:** Recharts
- **Fonts:** Inter (sans), JetBrains Mono (mono)

## Features

### Public Features
- Hero section with animated entrance
- Stats counter with scroll-triggered animations
- About section with skills and timeline
- Services grid with detailed cards
- Process workflow visualization
- Pricing tiers with feature comparison
- Portfolio gallery with filtering
- Blog section with article previews
- Testimonials carousel with auto-rotation
- FAQ accordion with smooth animations
- Contact form with validation
- CTA banner with gradient background
- SEO-optimized meta tags per page
- Responsive design for all screen sizes

### Admin Dashboard Features
- Secure authentication (Firebase Auth)
- Role-based access control (first user = admin)
- Site settings: toggle any public section on/off
- Lead Tracker CRM with pipeline stages
- Project Kanban board with drag-and-drop
- Content Calendar for planning
- Finance Tracker with Recharts visualizations
- Blog CMS with visual markdown editor
- File Manager with Firebase Storage integration
- Contact Submissions inbox
- Newsletter Subscribers list
- Analytics overview with key metrics

## Design System

| Token | Value | Usage |
|-------|-------|-------|
| bg-primary | #030712 | Main background |
| bg-secondary | #0f172a | Card/section backgrounds |
| accent-primary | #10b981 | Primary buttons, highlights |
| accent-secondary | #34d399 | Hover states, gradients |
| accent-tertiary | #f59e0b | Warnings, badges |
| accent-quaternary | #6366f1 | Secondary highlights |
| text-primary | #f8fafc | Headings, primary text |
| text-secondary | #94a3b8 | Body text, descriptions |

Glassmorphism: `bg-opacity-80`, `backdrop-blur-xl`, `border-white/10`

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd my-platform
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy `.env.example` to `.env.local` and fill in your Firebase credentials:

```bash
cp .env.example .env.local
```

### 4. Create a Firebase project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Authentication** (Email/Password provider)
4. Enable **Firestore Database** (start in test mode, then add security rules)
5. Enable **Storage** (start in test mode)
6. Copy your project configuration into `.env.local`

### 5. Run the development server

```bash
npm run dev
```

Visit `http://localhost:3000`

### 6. Seed default data

Visit `http://localhost:3000/seed` to populate the database with default site settings and sample data.

## Folder Structure

```
my-platform/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth group (login, register)
│   ├── (dashboard)/              # Dashboard group
│   │   ├── dashboard/
│   │   ├── leads/
│   │   ├── projects/
│   │   ├── calendar/
│   │   ├── finance/
│   │   ├── blog/
│   │   ├── files/
│   │   ├── settings/
│   │   └── contacts/
│   ├── about/
│   ├── services/
│   ├── blog/
│   ├── contact/
│   ├── page.tsx                  # Landing page
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
├── components/
│   ├── animations/               # 17 animation components
│   ├── layout/                   # 10 layout components
│   ├── sections/                 # Public page sections
│   ├── ui/                       # Reusable UI components
│   └── dashboard/                # Dashboard-specific components
├── hooks/                        # Custom React hooks
├── lib/                          # Utility libraries
│   ├── firebase.ts               # Firebase config
│   ├── db.ts                     # Firestore helpers
│   ├── auth.ts                   # Auth helpers
│   ├── storage.ts                # Firebase Storage helpers
│   ├── utils.ts                  # General utilities
│   ├── actions.ts                # Server actions
│   ├── seo.ts                    # SEO helpers
│   └── analytics.ts              # Analytics helpers
├── types/
│   └── index.ts                  # Global TypeScript types
├── public/                       # Static assets
├── .env.example                  # Environment variable template
├── next.config.js                # Next.js configuration
├── tailwind.config.ts            # Tailwind configuration
└── tsconfig.json                 # TypeScript configuration
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository on [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

```bash
# Build for production
npm run build
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key | Yes |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth domain | Yes |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID | Yes |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Storage bucket | Yes |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | Yes |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID | Yes |
| `ADMIN_EMAIL` | Email of the first admin user | Yes |
| `NEXT_PUBLIC_APP_URL` | Public app URL | Yes |

## Admin Setup

The first user to register automatically becomes an admin. Set `ADMIN_EMAIL` in your environment variables to match the email you will use for the first registration.

After registration:
1. Log in at `/login`
2. Access the dashboard at `/dashboard`
3. Toggle public sections via `/dashboard/settings`
4. Manage all platform data from the admin panel

## Security

- Firebase Security Rules should be configured for production
- CSP headers are included in `next.config.js`
- Authentication state is managed server-side where possible
- Admin routes are protected by middleware

## Contributing

Contributions are welcome. Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

```
MIT License

Copyright (c) 2024 MY-PLATFORM

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
