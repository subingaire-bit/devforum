# DevForum 🎯

Open-source Q&A forum for developers. Share knowledge, solve problems, grow together.

## ✨ Features

- 🔐 Authentication with GitHub, GitLab, and email (Phase 2)
- 📝 Rich markdown questions & answers with syntax highlighting
- 🗳️ Voting system for questions and answers
- 🏷️ Tag-based organization and discovery
- 🔍 Full-text search across questions
- 🎨 Dark/light theme with system preference detection
- 📱 Fully responsive design
- ♿ Accessible UI components (shadcn/ui + Radix UI)

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth v5 (Auth.js)
- **Styling**: Tailwind CSS + shadcn/ui
- **Markdown**: marked + DOMPurify (XSS-safe)
- **Caching**: Upstash Redis (optional)
- **Email**: Resend or SMTP

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- npm or pnpm

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/devforum.git
cd devforum

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# 4. Set up the database
npx prisma generate
npx prisma migrate dev

# 5. Seed demo data (optional)
npm run db:seed

# 6. Start the dev server
npm run dev