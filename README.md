# DoYouDj - Interactive DJ Platform

A Next.js application for interactive DJ experiences where users can submit songs and interact with live DJ sets. Built with modern web technologies and real-time features.

## Features

- 🎵 **Song Submissions**: Users can submit songs with different que-up options
- 🎛️ **Admin Dashboard**: Complete DJ control panel with queue management
- 💳 **Payment Integration**: PayPal integration for premium submissions
- 🔐 **Authentication**: Secure user management with Clerk
- 📱 **Real-time Updates**: Live playlist and submission updates
- 🎨 **Modern UI**: Glassmorphism design with GSAP animations

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: MongoDB with Mongoose
- **Authentication**: Clerk
- **Payments**: PayPal
- **Real-time**: Socket.io
- **Styling**: Tailwind CSS
- **Animations**: GSAP
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB database
- pnpm (recommended) or npm

### Installation

1. Clone the repository
2. Install dependencies:

```bash
pnpm install
```

3. Copy environment variables:

```bash
cp .env.example .env.local
```

4. Fill in your environment variables in `.env.local`

5. Run the development server:

```bash
pnpm dev

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
```
