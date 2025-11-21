# Freelance Platform - MERN Stack

A comprehensive freelance marketplace platform connecting companies with freelance workers, managed by an admin approval system.

## Features

### User Roles
- **Worker/Freelancer** - Browse jobs, apply, submit work
- **Company/Employer** - Post jobs, review applications, assign work
- **Admin** - Approve/reject registrations, monitor platform

### Tech Stack
- **Frontend:** React, Redux Toolkit, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication:** JWT

## Project Structure
```
freelance-platform/
├── client/                 # React frontend
│   ├── src/
│   ├── public/
│   └── package.json
├── server/                 # Node.js backend
│   ├── config/            # Database config
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Auth & validation
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API routes
│   ├── scripts/           # Utility scripts
│   ├── server.js          # Entry point
│   └── package.json
└── README.md
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/freelance-platform
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:3000
```

4. Create admin user:
```bash
node scripts/createAdmin.js
```

5. Start server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start React app:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Admin Routes
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/users/pending` - Pending approvals
- `PUT /api/admin/users/:id/approve` - Approve user
- `PUT /api/admin/users/:id/reject` - Reject user

### Worker Routes
- `GET /api/workers/profile` - Get profile
- `PUT /api/workers/profile` - Update profile
- `POST /api/workers/apply/:jobId` - Apply for job
- `GET /api/workers/applications` - Get applications
- `POST /api/workers/submit/:jobId` - Submit work

### Company Routes
- `GET /api/companies/profile` - Get profile
- `POST /api/companies/jobs` - Post job
- `GET /api/companies/jobs` - Get posted jobs
- `GET /api/companies/jobs/:jobId/applications` - View applications
- `PUT /api/companies/jobs/:jobId/assign` - Assign job

### Job Routes
- `GET /api/jobs` - Browse all jobs
- `GET /api/jobs/:id` - Get job details

## Default Admin Credentials
```
Email: admin@freelance.com
Password: admin123
```

**⚠️ Change these credentials in production!**

## Development Status

- [x] Backend API
- [x] Database Models
- [x] Authentication System
- [ ] Frontend (In Progress)
- [ ] File Upload
- [ ] Payment Integration

## Contributing

This is a Final Year Project (FYP). 

## License

MIT License

## Author

[Your Name]