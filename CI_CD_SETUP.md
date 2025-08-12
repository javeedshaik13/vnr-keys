# CI/CD Pipeline Setup

This repository uses GitHub Actions for continuous integration and deployment (CI/CD) with automated testing, building, and deployment to both Vercel (frontend) and Render (backend).

## 🚀 Pipeline Overview

### Workflows

1. **`ci-cd.yml`** - Main CI/CD pipeline for production deployments
2. **`development.yml`** - Development checks for pull requests and feature branches
3. **`dependency-updates.yml`** - Automated dependency updates

### Pipeline Stages

#### 1. Continuous Integration (CI)
- **Frontend CI**: Linting, building, and artifact creation
- **Backend CI**: Syntax checking, testing, and artifact creation
- **Security Checks**: Dependency audits and secret scanning

#### 2. Continuous Deployment (CD)
- **Frontend**: Deployed to Vercel
- **Backend**: Deployed to Render
- **Notifications**: Deployment status notifications

## 🔧 Setup Instructions

### 1. GitHub Secrets Configuration

Add the following secrets to your GitHub repository (`Settings > Secrets and variables > Actions`):

#### Vercel Secrets (for frontend deployment)
```
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id
```

#### Render Secrets (for backend deployment)
```
RENDER_SERVICE_ID=your_render_service_id
RENDER_API_KEY=your_render_api_key
```

### 2. Getting Vercel Credentials

1. Install Vercel CLI: `npm i -g vercel`
2. Login to Vercel: `vercel login`
3. Get your token: `vercel whoami`
4. Get org and project IDs from your Vercel dashboard or run:
   ```bash
   vercel projects ls
   vercel teams ls
   ```

### 3. Getting Render Credentials

1. Go to your Render dashboard
2. Navigate to your service
3. Copy the Service ID from the service URL
4. Generate an API key from your account settings

### 4. Branch Protection Setup

Enable branch protection for the `main` branch:

1. Go to `Settings > Branches`
2. Add rule for `main` branch
3. Enable:
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Require pull request reviews before merging
   - ✅ Include administrators

## 🔄 Workflow Triggers

### Main CI/CD Pipeline (`ci-cd.yml`)
- **Triggers**: Push to `main` or `develop`, Pull requests to `main` or `develop`
- **Deployment**: Only on push to `main` branch

### Development Checks (`development.yml`)
- **Triggers**: Pull requests to `main` or `develop`, Push to feature branches
- **Purpose**: Code quality checks without deployment

### Dependency Updates (`dependency-updates.yml`)
- **Triggers**: Weekly schedule (Mondays 9 AM UTC), Manual trigger
- **Purpose**: Automated dependency updates with PR creation

## 📋 Pipeline Jobs

### Frontend CI Job
```yaml
- Setup Node.js environment
- Install dependencies
- Run ESLint
- Build application
- Upload build artifacts
```

### Backend CI Job
```yaml
- Setup Node.js environment
- Install dependencies
- Run tests (if available)
- Check syntax
- Upload artifacts
```

### Security Checks Job
```yaml
- Run npm audit
- Scan for secrets in code
- Check for security vulnerabilities
```

### Deployment Jobs
```yaml
Frontend Deployment:
- Download build artifacts
- Deploy to Vercel

Backend Deployment:
- Download artifacts
- Deploy to Render
```

## 🛠️ Local Development

### Running CI Checks Locally

#### Frontend
```bash
cd frontend
npm ci
npm run lint
npm run build
```

#### Backend
```bash
cd backend
npm ci
node -c index.js
npm test  # if tests exist
```

### Pre-commit Hooks (Recommended)

Install husky for pre-commit hooks:

```bash
# In frontend directory
npm install --save-dev husky lint-staged
npx husky install
npx husky add .husky/pre-commit "cd frontend && npm run lint"
```

## 🔍 Monitoring and Debugging

### Pipeline Status
- Check workflow runs in GitHub Actions tab
- View detailed logs for each job
- Monitor deployment status

### Common Issues

#### Build Failures
1. Check Node.js version compatibility
2. Verify all dependencies are installed
3. Review linting errors

#### Deployment Failures
1. Verify secrets are correctly configured
2. Check service connectivity
3. Review deployment logs

#### Security Issues
1. Address npm audit warnings
2. Remove any hardcoded secrets
3. Update vulnerable dependencies

## 📊 Performance Optimization

### Caching
- npm dependencies are cached between runs
- Build artifacts are stored for deployment
- Cache is automatically invalidated on dependency changes

### Parallel Execution
- Frontend and backend CI run in parallel
- Security checks run after CI completion
- Deployments run after all checks pass

## 🔒 Security Best Practices

1. **Secrets Management**: All sensitive data stored in GitHub Secrets
2. **Dependency Scanning**: Regular security audits
3. **Secret Scanning**: TruffleHog integration for code scanning
4. **Branch Protection**: Required reviews and status checks

## 📈 Scaling Considerations

### For Larger Teams
- Add more granular branch protection rules
- Implement staging environment deployments
- Add performance testing to CI pipeline

### For Production Load
- Consider using self-hosted runners for faster builds
- Implement blue-green deployments
- Add monitoring and alerting

## 🆘 Troubleshooting

### Pipeline Not Triggering
1. Check branch name matches trigger conditions
2. Verify workflow file is in `.github/workflows/`
3. Check for syntax errors in workflow files

### Deployment Failures
1. Verify all required secrets are set
2. Check service quotas and limits
3. Review service-specific error logs

### Performance Issues
1. Optimize build times with better caching
2. Consider parallel job execution
3. Review resource usage in workflow

## 📞 Support

For issues with the CI/CD pipeline:
1. Check GitHub Actions documentation
2. Review workflow logs for specific errors
3. Verify all secrets and configurations
4. Test locally before pushing changes

---

**Note**: This CI/CD setup is designed for the vnr-keys project structure. Adjust paths and configurations as needed for your specific use case.
