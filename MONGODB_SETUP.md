# MongoDB Setup for VNR Keys Project

This document explains the MongoDB configuration for the VNR Keys management system.

## Database Configuration

### Database Name: `vnrkeys`
The project is configured to use a MongoDB database named `vnrkeys` with the following collections:

1. **vnrkeys** - Main collection for key management
2. **users** - User authentication and management

### Connection String
The MongoDB connection string in `.env` file:
```
MONGO_URI=mongodb+srv://hackergkn:karthik@hackathon.xkjyqhh.mongodb.net/vnrkeys?retryWrites=true&w=majority&appName=hackathon
```

## Collections

### 1. vnrkeys Collection
**Purpose**: Stores all key information and their current status

**Schema Fields**:
- `keyNumber` (String, unique) - Unique identifier for the key (e.g., "101", "202")
- `keyName` (String) - Descriptive name of the key (e.g., "Computer Lab 1")
- `location` (String) - Physical location of the room/area
- `status` (String) - Current status: "available" or "unavailable"
- `takenBy` (Object) - Information about who took the key
  - `userId` (ObjectId) - Reference to User document
  - `name` (String) - User's name
  - `email` (String) - User's email
- `takenAt` (Date) - When the key was taken
- `returnedAt` (Date) - When the key was returned
- `frequentlyUsed` (Boolean) - Whether this key is frequently used
- `description` (String) - Additional description
- `category` (String) - Category: "classroom", "lab", "office", "storage", "other"
- `isActive` (Boolean) - Whether the key is active (for soft delete)
- `createdAt` (Date) - Document creation timestamp
- `updatedAt` (Date) - Document last update timestamp

### 2. users Collection
**Purpose**: Stores user authentication and profile information

**Schema Fields**:
- `email` (String, unique) - User's email address
- `password` (String) - Hashed password
- `name` (String) - User's full name
- `role` (String) - User role: "faculty", "security", "admin"
- `lastLogin` (Date) - Last login timestamp
- `isVerified` (Boolean) - Email verification status
- `resetPasswordToken` (String) - Password reset token
- `resetPasswordExpiresAt` (Date) - Password reset token expiry
- `verificationToken` (String) - Email verification token
- `verificationTokenExpiresAt` (Date) - Email verification token expiry
- `createdAt` (Date) - Document creation timestamp
- `updatedAt` (Date) - Document last update timestamp

## Setup Instructions

### 1. Test Database Connection
```bash
cd backend
npm run test:db
```

### 2. Seed Initial Key Data
```bash
cd backend
npm run seed:keys
```

This will populate the `vnrkeys` collection with sample keys including:
- Computer Labs (101, 102)
- Science Labs (201, 202, 301)
- Study Rooms (401, 402)
- Conference Rooms (501, 502)
- Storage Rooms (601, 602)
- Auditorium and Seminar Halls (701, 702, 703)
- Faculty Lounge (801)

### 3. Start the Application
```bash
cd backend
npm run dev
```

## API Endpoints

### Key Management Endpoints
- `GET /api/keys` - Get all keys with optional filtering
- `GET /api/keys/available` - Get available keys
- `GET /api/keys/unavailable` - Get unavailable keys
- `GET /api/keys/my-taken` - Get keys taken by current user
- `GET /api/keys/frequently-used` - Get frequently used keys
- `GET /api/keys/:keyId` - Get single key by ID
- `POST /api/keys` - Create new key (admin only)
- `POST /api/keys/:keyId/take` - Take a key (faculty/admin)
- `POST /api/keys/:keyId/return` - Return a key
- `POST /api/keys/:keyId/toggle-frequent` - Toggle frequently used status
- `PUT /api/keys/:keyId` - Update key (admin only)
- `DELETE /api/keys/:keyId` - Delete key (admin only)

### Authentication Endpoints
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset

### Dashboard Endpoints
- `GET /api/dashboard/admin` - Admin dashboard (admin only)
- `GET /api/dashboard/faculty` - Faculty dashboard (faculty/admin)
- `GET /api/dashboard/security` - Security dashboard (security/admin)
- `GET /api/dashboard/profile` - User profile

## Role-Based Access Control

### Admin Role
- Full access to all keys and users
- Can create, update, and delete keys
- Can view all dashboards
- Can manage user accounts

### Faculty Role
- Can view available keys
- Can take and return keys
- Can view their taken keys
- Can access faculty dashboard

### Security Role
- Can view all keys and their status
- Can return any key (for collection)
- Can access security dashboard with QR scanner
- Cannot create or delete keys

## Database Indexes

The following indexes are created for optimal performance:
- `keyNumber` (unique)
- `status`
- `takenBy.userId`
- `frequentlyUsed`
- `category`
- `isActive`

## Environment Variables

Make sure your `.env` file contains:
```env
MONGO_URI=mongodb+srv://hackergkn:karthik@hackathon.xkjyqhh.mongodb.net/vnrkeys?retryWrites=true&w=majority&appName=hackathon
NODE_ENV=development
PORT=8000
JWT_SECRET=your_jwt_secret_here
```

## Troubleshooting

### Connection Issues
1. Verify the MongoDB URI is correct
2. Check network connectivity
3. Ensure the database user has proper permissions

### Collection Issues
1. Run `npm run test:db` to verify collections exist
2. Run `npm run seed:keys` to populate initial data
3. Check MongoDB Atlas dashboard for collection status

### API Issues
1. Verify the server is running on the correct port
2. Check authentication tokens are being sent
3. Verify user roles and permissions
