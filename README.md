# SecureKey - Two-Factor Authentication System

[![Deployed on Vercel](https://img.shields.io/badge/deployed%20on-vercel-black)](https://2fa-project-beta.vercel.app/login)

SecureKey is a modern, secure two-factor authentication (2FA) system built with Next.js. It provides robust security features including TOTP (Time-based One-Time Password) authentication and secure key storage.

## 🌟 Live Demo

The application is deployed and accessible at: [https://2fa-project-beta.vercel.app/login](https://2fa-project-beta.vercel.app/login)

## ✨ Features

- **User Authentication**: Secure sign-up and login functionality
- **Two-Factor Authentication**: TOTP implementation compatible with authenticator apps
- **Account Security**: Lock mechanism after failed login attempts
- **Auto Logout**: Automatic session termination after period of inactivity
- **Responsive Design**: Works on both desktop and mobile devices
- **Dark/Light Mode**: Support for system theme preferences

## 🛠️ Technologies

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: TypeScript
- **Authentication**: Custom JWT implementation with iron-session
- **Database**: MongoDB
- **Styling**: Tailwind CSS with custom variables
- **Email Service**: Nodemailer
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18.x or higher
- MongoDB (local instance or cloud-based MongoDB Atlas)
- npm or yarn

## 🚀 Getting Started

### Environment Setup

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd 2fa-project
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env.local` file in the project root and add the following environment variables:
   ```
   MONGODB_URI=mongodb://localhost:27017/2fa_db  # Your MongoDB connection string
   JWT_SECRET=your_secure_jwt_secret_at_least_32_chars
   EMAIL_USER=your_email@provider.com
   EMAIL_PASS=your_email_password
   EMAIL_HOST=smtp.provider.com
   EMAIL_PORT=587
   NEXT_PUBLIC_BASE_URL=http://localhost:3000  # Your app's base URL
   ```

### Running the Application

#### Development Mode

```bash
npm run dev
```

This will start the development server at [http://localhost:3000](http://localhost:3000)

#### Production Build

```bash
npm run build
npm start
```

## 🏗️ Project Structure

```
2fa-project/
├── app/               # Next.js app router pages
│   ├── account/       # Account management pages
│   ├── api/           # API routes
│   ├── dashboard/     # User dashboard
│   ├── login/         # Login page
│   └── register/      # Registration page
├── components/        # React components
│   ├── AuthLayout/    # Layout for authentication pages
│   └── ui/            # UI components
├── lib/               # Utility functions and libraries
│   ├── api.ts         # API client functions
│   └── session.ts     # Session handling
├── models/            # Database models
├── public/            # Static assets
└── styles/            # Global styles
```

## 🔒 Security Features

- JWT-based authentication with HTTP-only cookies
- Password hashing with bcrypt
- CSRF protection
- Rate limiting on authentication endpoints
- Account lockout after multiple failed login attempts
- Secure TOTP implementation for two-factor authentication

## 📱 Idle Session Management

The application includes an automatic logout feature that tracks user activity and logs out inactive users:

- Default timeout: 5 minutes (configurable)
- Activity detection through mouse movements, key presses, scrolling, etc.
- Notification on timeout-triggered logout

## 🔧 Configuration

Key configuration options can be found in:

- `app/dashboard/layout.tsx` - Idle timeout settings
- `lib/session.ts` - Session security settings

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org/)
- [MongoDB](https://www.mongodb.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vercel](https://vercel.com/) for hosting
