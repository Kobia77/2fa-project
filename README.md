# SecureKey - Two-Factor Authentication System

A professional two-factor authentication system with advanced security features built using Next.js 15, MongoDB, and modern web technologies.

![SecureKey Logo](https://img.shields.io/badge/SecureKey-2FA%20System-blue)

## Features

### User Authentication

- Secure email and password registration
- Email verification system
- Account lockout protection after multiple failed attempts
- Automatic and manual account unlock mechanisms
- Secure password handling with proper hashing

### Two-Factor Authentication (2FA)

- Time-based One-Time Password (TOTP) support
- QR code generation for easy setup with authenticator apps
- Backup codes for emergency access
- Option to enable/disable 2FA
- TOTP verification flow after initial login

### Security Features

- Session management with iron-session
- JWT-based authentication
- Account lockout after multiple failed attempts
- Idle session timeout and automatic logout
- Secure API endpoints with proper validation
- CSRF protection

### User Experience

- Modern, responsive UI with Tailwind CSS
- Email notifications for important security events
- Interactive setup wizard for 2FA configuration
- Dark/light mode support
- Animated transitions and micro-interactions

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS 4
- **Backend**: Next.js API routes, MongoDB, Mongoose
- **Authentication**: JWT, iron-session, bcryptjs
- **2FA Implementation**: speakeasy, qrcode
- **Email**: nodemailer
- **Deployment**: Vercel

## Prerequisites

- Node.js 18+ and npm
- MongoDB instance (local or Atlas)
- Email service for sending verification emails

## Environment Variables

Create a `.env.local` file in the project root with the following variables:

```
JWT_SECRET=your_secure_jwt_secret
MONGODB_URI=your_mongodb_connection_string
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Installation

1. Clone the repository

   ```
   git clone https://github.com/yourusername/2fa-project.git
   cd 2fa-project
   ```

2. Install dependencies

   ```
   npm install
   ```

3. Create environment variables as described above

4. Start the development server

   ```
   npm run dev
   ```

5. Build for production
   ```
   npm run build
   npm start
   ```

## Usage

### Registration and Account Setup

1. Create an account with your email and a strong password
2. Verify your email address using the link sent to your inbox
3. Log in to access your dashboard

### Setting Up 2FA

1. Navigate to the dashboard and click on "Set Up 2FA"
2. Scan the QR code with an authenticator app (Google Authenticator, Authy, etc.)
3. Enter the verification code to complete setup
4. Save your backup codes in a safe place

### Login with 2FA

1. Enter your email and password
2. When prompted, enter the 6-digit code from your authenticator app
3. Alternatively, use a backup code if you can't access your authenticator app

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Next.js team for the amazing framework
- The open-source community for all the tools and libraries used
