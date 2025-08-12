# Environment Setup Guide

This guide helps you set up the environment variables needed for local development and production deployment.

## 🔧 Backend Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/vnr-keys

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Client Configuration
CLIENT_URL=http://localhost:5173

# Email Configuration (for password reset, etc.)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Optional: Mailtrap for testing
MAILTRAP_USER=your-mailtrap-username
MAILTRAP_PASS=your-mailtrap-password

# Security Configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# API Configuration
API_KEY_EXPIRY_DAYS=30
MAX_API_KEYS_PER_USER=10
```

## 🔧 Frontend Environment Variables

Create a `.env` file in the `frontend/` directory with the following variables:

```env
# API Configuration
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000

# Optional: Production URLs
# VITE_API_URL=https://your-backend-url.onrender.com
# VITE_SOCKET_URL=https://your-backend-url.onrender.com
```

## 🚀 Production Environment Variables

### Backend (Render)

Set these environment variables in your Render service dashboard:

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
CLIENT_URL=https://vnr-keys.vercel.app
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-production-email
EMAIL_PASS=your-production-email-password
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
API_KEY_EXPIRY_DAYS=30
MAX_API_KEYS_PER_USER=10
```

### Frontend (Vercel)

Set these environment variables in your Vercel project settings:

```env
VITE_API_URL=https://your-backend-url.onrender.com
VITE_SOCKET_URL=https://your-backend-url.onrender.com
```

## 🔐 Security Best Practices

### JWT Secret
- Use a strong, random string (at least 32 characters)
- Never commit the actual secret to version control
- Use different secrets for development and production

### Database URI
- Use environment-specific MongoDB instances
- Ensure proper authentication and network security
- Use connection pooling for production

### Email Configuration
- Use app-specific passwords for Gmail
- Consider using services like SendGrid for production
- Test email functionality in development

## 🧪 Testing Environment

For testing, you can use:

```env
# Test Database
MONGODB_URI=mongodb://localhost:27017/vnr-keys-test

# Test Email (Mailtrap)
MAILTRAP_USER=your-mailtrap-username
MAILTRAP_PASS=your-mailtrap-password
```

## 🔍 Environment Validation

The backend includes a `check-env.js` script that validates required environment variables:

```bash
cd backend
node check-env.js
```

This will check for missing required variables and provide helpful error messages.

## 📝 Notes

- Never commit `.env` files to version control
- Use `.env.example` files for templates (if they exist)
- Rotate secrets regularly in production
- Monitor environment variable usage in logs
- Use different configurations for different environments (dev, staging, prod)

## 🆘 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check if MongoDB is running
   - Verify connection string format
   - Ensure network access

2. **JWT Errors**
   - Verify JWT_SECRET is set
   - Check secret length and complexity
   - Ensure consistent secret across restarts

3. **Email Not Working**
   - Verify email credentials
   - Check SMTP settings
   - Test with Mailtrap first

4. **CORS Errors**
   - Verify CLIENT_URL is correct
   - Check frontend VITE_API_URL
   - Ensure URLs match exactly

For more help, check the main [README.md](README.md) or [CI_CD_SETUP.md](CI_CD_SETUP.md).
