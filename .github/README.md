# CI/CD Pipeline Documentation

This directory contains GitHub Actions workflows for automated building, testing, and deployment of the ProtectMe application.

## Workflows

### 1. Backend Deploy (`backend-deploy.yml`)
- **Triggers**: Push/PR to `main`/`develop` branches affecting backend files
- **Jobs**:
  - `test`: Runs tests, linting, and security checks on Node.js 18.x and 20.x
  - `deploy`: Builds Docker image, tests it, and deploys to production (only on main branch)

### 2. Frontend Build (`frontend-build.yml`)
- **Triggers**: Push/PR to `main`/`develop` branches affecting frontend files
- **Jobs**:
  - `test`: TypeScript checking, linting, security audit
  - `build-web`: Creates web build and uploads artifacts
  - `build-android`: Creates Android APK (requires Expo credentials)
  - `deploy-web`: Deploys web build to GitHub Pages (only on main branch)

### 3. Full Deploy (`deploy.yml`)
- **Triggers**: Push to `main` branch or manual dispatch
- **Jobs**: Orchestrates both backend and frontend deployments with proper sequencing

## Required Secrets

Add these secrets to your GitHub repository settings:

### For Backend Deployment
```
# If using container registry
GITHUB_TOKEN  # Automatically available
```

### For Frontend Deployment
```
EXPO_TOKEN      # Expo access token
EXPO_USERNAME   # Expo account username
EXPO_PASSWORD   # Expo account password
```

## Setup Instructions

1. **Enable GitHub Container Registry**:
   - Go to repository Settings → Packages
   - Ensure GitHub Container Registry is enabled

2. **Configure Environments** (optional):
   - Create `production` environment in repository settings
   - Add environment secrets if needed

3. **Expo Setup** (for mobile builds):
   - Create Expo account
   - Generate access token
   - Add token to repository secrets

4. **Deployment Targets**:
   - Update deployment commands in workflows for your infrastructure
   - Examples provided for Kubernetes, Docker Compose, AWS ECS

## Local Development

### Backend
```bash
cd backend
docker-compose up --build
```

### Frontend
```bash
npm install
npm run dev
```

## Branch Protection

Consider setting up branch protection rules for `main`:
- Require status checks to pass
- Require up-to-date branches
- Include administrators

## Monitoring

Workflow runs can be monitored in the Actions tab. Failed deployments will:
- Send notifications (configure in workflow)
- Prevent merging if branch protection is enabled
- Provide detailed logs for debugging