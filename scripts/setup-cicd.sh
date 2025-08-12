#!/bin/bash

# CI/CD Setup Script for vnr-keys
# This script helps configure the CI/CD pipeline

set -e

echo "🚀 VNR Keys CI/CD Setup Script"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "render.yaml" ] || [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    print_error "This script must be run from the root of the vnr-keys repository"
    exit 1
fi

print_status "Repository structure verified"

# Check if GitHub Actions workflows exist
if [ ! -d ".github/workflows" ]; then
    print_error "GitHub Actions workflows not found. Please ensure the CI/CD files are in place."
    exit 1
fi

print_status "GitHub Actions workflows found"

echo ""
print_info "Setting up CI/CD pipeline requires the following secrets:"
echo ""

echo "🔑 Vercel Secrets (for frontend deployment):"
echo "   - VERCEL_TOKEN"
echo "   - VERCEL_ORG_ID" 
echo "   - VERCEL_PROJECT_ID"
echo ""

echo "🔑 Render Secrets (for backend deployment):"
echo "   - RENDER_SERVICE_ID"
echo "   - RENDER_API_KEY"
echo ""

echo "📋 Next Steps:"
echo "=============="
echo ""

print_info "1. Get Vercel credentials:"
echo "   - Install Vercel CLI: npm i -g vercel"
echo "   - Login: vercel login"
echo "   - Get token: vercel whoami"
echo "   - Get org/project IDs: vercel projects ls && vercel teams ls"
echo ""

print_info "2. Get Render credentials:"
echo "   - Go to Render dashboard"
echo "   - Copy Service ID from your service URL"
echo "   - Generate API key from account settings"
echo ""

print_info "3. Add secrets to GitHub:"
echo "   - Go to your repository Settings > Secrets and variables > Actions"
echo "   - Add each secret with the exact names shown above"
echo ""

print_info "4. Enable branch protection:"
echo "   - Go to Settings > Branches"
echo "   - Add rule for 'main' branch"
echo "   - Enable status checks and PR reviews"
echo ""

print_info "5. Test the pipeline:"
echo "   - Make a small change and push to main"
echo "   - Check the Actions tab for workflow runs"
echo ""

echo "📚 Documentation:"
echo "================"
echo "   - Full setup guide: CI_CD_SETUP.md"
echo "   - GitHub Actions: https://docs.github.com/en/actions"
echo "   - Vercel CLI: https://vercel.com/docs/cli"
echo "   - Render API: https://render.com/docs/api"
echo ""

print_warning "⚠️  Important Notes:"
echo "   - Never commit secrets to the repository"
echo "   - Test the pipeline with a small change first"
echo "   - Monitor the first few deployments closely"
echo ""

print_status "Setup script completed!"
echo ""
echo "🎉 Your CI/CD pipeline is ready to be configured!"
echo "   Follow the steps above to complete the setup."
