# FitZone – Gym Management System (Backend)

FitZone is a RESTful backend API developed for a Gym Management System. It handles authentication, user management, gym operations, and member-related services.

## Live API

**Backend URL:** https://fit-zone-backend-plum.vercel.app

**Health Check:** https://fit-zone-backend-plum.vercel.app/

## Technology Stack

- Node.js
- Express.js 5
- TypeScript
- MongoDB
- Mongoose
- JSON Web Token (JWT)
- Bcryptjs
- Nodemailer
- CORS
- dotenv

## Main Features

### Authentication
- User Registration
- User Login
- JWT Authentication
- Role-based Authorization
- Get Logged-in User Profile
- Forgot Password
- Reset Password

### Admin Management
- Member Management
- Trainer Management
- Workout Plan Management
- Membership Plan Management
- Attendance Management
- Subscription Management
- Payment Management
- Dashboard Statistics
- Analytics
- Gym Settings
- Admin Profile Management
- Password Management

### Member Services
- View Personal Subscriptions
- View Attendance Records
- View Payment History
- View Personal Progress
- View Assigned Workout Plans

## Project Structure

```text
src/
├── configs/
├── controllers/
├── interfaces/
├── middlewares/
├── models/
├── routes/
├── scripts/
├── services/
└── utils/
```

## API Endpoint Groups

All API endpoints use the `/api` prefix.

| Module | Base Endpoint |
|---|---|
| Authentication | `/api/auth` |
| Members | `/api/members` |
| Member Portal | `/api/member` |
| Trainers | `/api/trainers` |
| Membership Plans | `/api/membership-plans` |
| Subscriptions | `/api/subscriptions` |
| Attendance | `/api/attendance` |
| Workout Plans | `/api/workout-plans` |
| Dashboard | `/api/dashboard` |
| Payments | `/api/payments` |
| Analytics | `/api/analytics` |
| Settings | `/api/settings` |

### Authentication Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get user profile |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |

Protected endpoints require a valid JWT access token where authentication middleware is configured.

## Prerequisites

Install the following before running the project:

- Node.js
- npm
- MongoDB database
- Git

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/thushan475/FitZone-Backend.git
```

### 2. Navigate to the Project

```bash
cd FitZone-Backend
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the project root directory.

Configure the following variables with your own values:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret

ADMIN_NAME=your_admin_name
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password
ADMIN_PHONE=your_admin_phone

SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_USER=your_smtp_email
SMTP_PASS=your_smtp_password
SMTP_FROM=your_sender_email

FRONTEND_URL=http://localhost:5173
```

Do not commit your `.env` file or expose database credentials, JWT secrets, or email passwords.

### 5. Run the Development Server

```bash
npm run dev
```

The backend API will run at:

```text
http://localhost:5000
```

### 6. Build the Project

```bash
npm run build
```

### 7. Start the Production Server

```bash
npm start
```

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Compile TypeScript |
| `npm start` | Start production server |

## Authentication and Security

- JWT-based authentication
- Role-based access control for configured routes
- Password hashing using Bcryptjs
- Password reset through email services

## Deployment

The backend API is deployed using Vercel and uses MongoDB Atlas for database hosting.

**Backend URL:** https://fit-zone-backend-plum.vercel.app

## Frontend Repository

[FitZone Frontend – GitHub](https://github.com/thushan475/FitZone-Frontend)

## Frontend Live Application

https://fit-zone-frontend-omega.vercel.app

---

Developed as an academic project for the Rapid Application Development (RAD) module.

## Authentication and Token Refresh

FitZone uses JWT-based authentication with automatic access token refresh.

- Access tokens expire after 15 minutes.
- Refresh tokens expire after 7 days.
- Refresh tokens are stored in HTTP-only cookies.
- Refresh tokens are rotated when a refresh request succeeds.
- Refresh token hashes and expiry information are stored in the user database.
- Logout invalidates the refresh token.
- Password reset also invalidates the existing refresh token.

### Authentication Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a user |
| POST | `/api/auth/login` | Login and receive an access token |
| POST | `/api/auth/refresh` | Refresh the access token using the refresh cookie |
| POST | `/api/auth/logout` | Logout and invalidate the refresh token |
| GET | `/api/auth/me` | Get the authenticated user profile |
| POST | `/api/auth/forgot-password` | Request a password reset |
| POST | `/api/auth/reset-password` | Reset the password |

The refresh endpoint requires the HTTP-only refresh cookie. The frontend must send requests with credentials enabled.

### Additional Environment Variables

Add the following variable to your `.env` file:

```env
REFRESH_TOKEN_SECRET=your_secure_refresh_token_secret
```

Use a separate, strong secret for refresh tokens. Never commit `.env` files or expose secret values.

