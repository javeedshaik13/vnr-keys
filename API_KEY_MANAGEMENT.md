# API Key Management System

A comprehensive API key management system for different departments in the VNR Keys application.

## Overview

This system provides secure API key management with department-based organization and admin-controlled access. It supports creating, managing, and monitoring API keys for various departments including CSE, EEE, AIML, IoT, ECE, MECH, CIVIL, IT, ADMIN, and RESEARCH.

## Features

### 🔐 Admin Role Permissions
- **Full Access**: Admins have complete access to all API keys across all departments
- **Create Keys**: Generate new API keys for any department
- **Delete Static Keys**: Remove hardcoded/seeded keys (static keys only)
- **Manage All Keys**: Update, activate/deactivate any API key
- **View Statistics**: Access comprehensive analytics and usage statistics

### 🏢 Department Organization
- **10 Departments**: CSE, EEE, AIML, IoT, ECE, MECH, CIVIL, IT, ADMIN, RESEARCH
- **Department-Specific Keys**: Each key is associated with a specific department
- **Organized Access**: Keys are logically grouped by department for easy management

### 📊 Key Features
- **Secure Generation**: Cryptographically secure API key generation
- **Usage Tracking**: Monitor key usage with timestamps and counters
- **Rate Limiting**: Configurable rate limits per key (requests per minute/hour)
- **Permissions**: Granular read/write/delete permissions per key
- **Expiration**: Optional key expiration dates
- **Status Management**: Active/inactive status control

## Quick Start

### 1. Import Department API Keys

Run the import script to populate the database with pre-generated keys:

```bash
cd backend
npm run import:keys
```

Or if using Bun:
```bash
cd backend
bun run import:keys
```

This will:
- Create 10 API keys (one for each department)
- Set up an admin user (if not exists)
- Configure proper permissions and rate limits
- Display all created keys with their details

### 2. Default Admin Credentials

If no admin user exists, the script creates one:
- **Email**: `admin@vnr.edu.in`
- **Password**: `admin123`
- **⚠️ Important**: Change the default password after first login!

### 3. Start the Server

```bash
npm run dev
```

## API Endpoints

### Authentication Required
All API key endpoints require authentication via JWT token.

### Admin-Only Endpoints

#### Get All API Keys
```http
GET /api/api-keys
```
Returns all API keys across all departments (admin only).

**Query Parameters:**
- `department` - Filter by department
- `isActive` - Filter by active status (true/false)
- `page` - Page number for pagination
- `limit` - Items per page

#### Get API Key Statistics
```http
GET /api/api-keys/stats
```
Returns comprehensive statistics about API key usage by department.

#### Create New API Key
```http
POST /api/api-keys
```
**Body:**
```json
{
  "keyId": "CSE_002",
  "keyName": "CSE Secondary Key",
  "department": "CSE",
  "description": "Secondary key for CSE department",
  "permissions": {
    "read": true,
    "write": true,
    "delete": false
  },
  "rateLimit": {
    "requestsPerMinute": 100,
    "requestsPerHour": 2000
  },
  "expiresAt": "2024-12-31T23:59:59.000Z"
}
```

#### Update API Key
```http
PUT /api/api-keys/:keyId
```

#### Delete API Key (Static Keys Only)
```http
DELETE /api/api-keys/:keyId
```
Only static (seeded) keys can be deleted.

#### Toggle API Key Status
```http
POST /api/api-keys/:keyId/toggle-status
```

### General User Endpoints

#### Get Keys by Department
```http
GET /api/api-keys/department/:department
```
Example: `GET /api/api-keys/department/CSE`

#### Get Single API Key
```http
GET /api/api-keys/:keyId
```

#### Record API Key Usage
```http
POST /api/api-keys/:keyId/usage
```
Updates usage statistics for tracking purposes.

## Database Schema

### ApiKey Model
```javascript
{
  keyId: String,           // Unique identifier (e.g., "CSE_001")
  keyName: String,         // Human-readable name
  department: String,      // Department enum
  apiKey: String,          // Generated API key
  description: String,     // Key description
  isActive: Boolean,       // Active status
  isStatic: Boolean,       // Whether it's a seeded key
  createdBy: ObjectId,     // User who created the key
  lastUsed: Date,          // Last usage timestamp
  usageCount: Number,      // Total usage count
  permissions: {
    read: Boolean,
    write: Boolean,
    delete: Boolean
  },
  expiresAt: Date,         // Optional expiration
  rateLimit: {
    requestsPerMinute: Number,
    requestsPerHour: Number
  }
}
```

## Security Features

### 🔒 Access Control
- **Role-Based**: Admin users have full access, others have restricted access
- **JWT Authentication**: All endpoints require valid JWT tokens
- **Permission Validation**: Granular permission checking per operation

### 🛡️ Key Security
- **Secure Generation**: Uses crypto.randomBytes for key generation
- **Unique Keys**: Database-level uniqueness constraints
- **Rate Limiting**: Built-in rate limiting per key
- **Expiration Support**: Optional key expiration dates

### 📝 Audit Trail
- **Usage Tracking**: Every key usage is logged
- **Creation Tracking**: Keys are linked to their creators
- **Timestamp Logging**: All operations are timestamped

## Pre-Generated Department Keys

The system comes with 10 pre-generated keys:

1. **CSE_001** - Computer Science Engineering (200 req/min, 5000 req/hour)
2. **EEE_001** - Electrical & Electronics Engineering (150 req/min, 3000 req/hour)
3. **AIML_001** - AI & Machine Learning (300 req/min, 8000 req/hour)
4. **IOT_001** - Internet of Things (500 req/min, 10000 req/hour)
5. **ECE_001** - Electronics & Communication (150 req/min, 3500 req/hour)
6. **MECH_001** - Mechanical Engineering (100 req/min, 2000 req/hour)
7. **CIVIL_001** - Civil Engineering (120 req/min, 2500 req/hour)
8. **IT_001** - Information Technology (400 req/min, 12000 req/hour)
9. **ADMIN_001** - Administration (250 req/min, 6000 req/hour)
10. **RESEARCH_001** - Research Department (200 req/min, 4000 req/hour)

## Environment Setup

Ensure your `.env` file contains:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development
PORT=8000
```

## Development vs Production

### Development
- Use `npm run import:keys` to seed data
- Default admin credentials are created
- Detailed logging is enabled

### Production
- Change default admin password immediately
- Use environment-specific MongoDB URI
- Enable production security settings
- Monitor API key usage regularly

## Troubleshooting

### Common Issues

1. **Import Script Fails**
   - Check MongoDB connection
   - Verify environment variables
   - Ensure proper permissions

2. **Admin Access Denied**
   - Verify JWT token is valid
   - Check user role in database
   - Ensure admin user exists

3. **Duplicate Key Errors**
   - Keys already exist in database
   - Clear existing keys or use different keyIds
   - Check unique constraints

### Support
For issues or questions, check the application logs and verify:
- Database connectivity
- Authentication tokens
- User permissions
- API key validity

## Future Enhancements

- Department-specific user access
- API key rotation
- Advanced analytics dashboard
- Integration with external systems
- Automated key lifecycle management
