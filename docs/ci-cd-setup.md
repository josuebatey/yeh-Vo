# CI/CD Setup Guide for yehVo

## 🎯 Overview

This guide provides comprehensive setup instructions for implementing CI/CD pipelines using GitHub Actions, Jenkins, and SonarQube for the yehVo project.

## 🔧 GitHub Actions Setup

### 1. Main CI/CD Pipeline

Create `.github/workflows/ci-cd.yml`:

```yaml
name: yehVo CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  NODE_VERSION: '18'
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  # Code Quality & Testing
  quality-check:
    name: Code Quality & Tests
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Run Prettier check
        run: npm run format:check

      - name: Run TypeScript check
        run: npm run type-check

      - name: Run unit tests
        run: npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
          flags: unittests
          name: codecov-umbrella

  # Security Scanning
  security-scan:
    name: Security Scan
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run Snyk to check for vulnerabilities
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high

      - name: Run npm audit
        run: npm audit --audit-level=moderate

      - name: Run Semgrep
        uses: returntocorp/semgrep-action@v1
        with:
          config: >-
            p/security-audit
            p/secrets
            p/owasp-top-ten

  # SonarQube Analysis
  sonarqube:
    name: SonarQube Analysis
    runs-on: ubuntu-latest
    needs: [quality-check]
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests for SonarQube
        run: npm run test:coverage

      - name: SonarQube Scan
        uses: sonarqube-quality-gate-action@master
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
          SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}

  # Build Application
  build:
    name: Build Application
    runs-on: ubuntu-latest
    needs: [quality-check, security-scan]
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build-files
          path: dist/
          retention-days: 30

  # E2E Testing
  e2e-tests:
    name: E2E Tests
    runs-on: ubuntu-latest
    needs: [build]
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: build-files
          path: dist/

      - name: Start preview server
        run: npm run preview &
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}

      - name: Wait for server
        run: npx wait-on http://localhost:4173

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload E2E test results
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: e2e-test-results
          path: test-results/

  # Performance Testing
  performance-test:
    name: Performance Test
    runs-on: ubuntu-latest
    needs: [build]
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: build-files
          path: dist/

      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli@0.12.x
          lhci autorun
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}

  # Deploy to Staging
  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: [build, e2e-tests, sonarqube]
    if: github.ref == 'refs/heads/develop'
    environment: staging
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: build-files
          path: dist/

      - name: Deploy to Netlify Staging
        uses: nwtgck/actions-netlify@v2.0
        with:
          publish-dir: './dist'
          production-branch: main
          github-token: ${{ secrets.GITHUB_TOKEN }}
          deploy-message: "Deploy from GitHub Actions"
          enable-pull-request-comment: true
          enable-commit-comment: true
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_STAGING_SITE_ID }}

  # Deploy to Production
  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: [build, e2e-tests, performance-test, sonarqube]
    if: github.ref == 'refs/heads/main'
    environment: production
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: build-files
          path: dist/

      - name: Deploy to Netlify Production
        uses: nwtgck/actions-netlify@v2.0
        with:
          publish-dir: './dist'
          production-deploy: true
          github-token: ${{ secrets.GITHUB_TOKEN }}
          deploy-message: "Production deploy from GitHub Actions"
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_PRODUCTION_SITE_ID }}

      - name: Create GitHub Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: v${{ github.run_number }}
          release_name: Release v${{ github.run_number }}
          body: |
            Automated release from main branch
            Commit: ${{ github.sha }}
          draft: false
          prerelease: false

  # Notify on Failure
  notify-failure:
    name: Notify on Failure
    runs-on: ubuntu-latest
    needs: [quality-check, security-scan, build, e2e-tests, sonarqube]
    if: failure()
    
    steps:
      - name: Send Slack notification
        uses: 8398a7/action-slack@v3
        with:
          status: failure
          channel: '#ci-cd'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### 2. Dependabot Configuration

Create `.github/dependabot.yml`:

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "09:00"
    open-pull-requests-limit: 10
    reviewers:
      - "admin-team"
    assignees:
      - "admin-team"
    commit-message:
      prefix: "chore"
      include: "scope"

  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5
```

### 3. Required Secrets

Set up these secrets in GitHub repository settings:

```bash
# Supabase
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY

# SonarQube
SONAR_TOKEN
SONAR_HOST_URL

# Security
SNYK_TOKEN

# Deployment
NETLIFY_AUTH_TOKEN
NETLIFY_STAGING_SITE_ID
NETLIFY_PRODUCTION_SITE_ID

# Notifications
SLACK_WEBHOOK

# Performance
LHCI_GITHUB_APP_TOKEN
```

## 🏗️ Jenkins Setup

### 1. Jenkinsfile

Create `Jenkinsfile` in project root:

```groovy
pipeline {
    agent any
    
    environment {
        NODE_VERSION = '18'
        SONAR_SCANNER_HOME = tool 'SonarQubeScanner'
        DOCKER_REGISTRY = 'ghcr.io'
        IMAGE_NAME = 'yehvo/yehvo'
    }
    
    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
        skipStagesAfterUnstable()
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    env.GIT_COMMIT_SHORT = sh(
                        script: 'git rev-parse --short HEAD',
                        returnStdout: true
                    ).trim()
                }
            }
        }
        
        stage('Setup') {
            steps {
                sh '''
                    node --version
                    npm --version
                    npm ci
                '''
            }
        }
        
        stage('Code Quality') {
            parallel {
                stage('Lint') {
                    steps {
                        sh 'npm run lint'
                        publishCheckStyleResults pattern: 'eslint-report.xml'
                    }
                }
                
                stage('Type Check') {
                    steps {
                        sh 'npm run type-check'
                    }
                }
                
                stage('Format Check') {
                    steps {
                        sh 'npm run format:check'
                    }
                }
            }
        }
        
        stage('Test') {
            parallel {
                stage('Unit Tests') {
                    steps {
                        sh 'npm run test:coverage'
                        publishTestResults testResultsPattern: 'coverage/junit.xml'
                        publishCoverageResults(
                            adapters: [
                                coberturaAdapter('coverage/cobertura-coverage.xml')
                            ],
                            sourceFileResolver: sourceFiles('STORE_LAST_BUILD')
                        )
                    }
                }
                
                stage('Security Scan') {
                    steps {
                        sh 'npm audit --audit-level=moderate'
                        sh 'snyk test --severity-threshold=high'
                    }
                }
            }
        }
        
        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh '''
                        ${SONAR_SCANNER_HOME}/bin/sonar-scanner \
                        -Dsonar.projectKey=yehvo \
                        -Dsonar.sources=src \
                        -Dsonar.tests=src \
                        -Dsonar.test.inclusions=**/*.test.ts,**/*.test.tsx \
                        -Dsonar.typescript.lcov.reportPaths=coverage/lcov.info \
                        -Dsonar.testExecutionReportPaths=coverage/test-report.xml
                    '''
                }
            }
        }
        
        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }
        
        stage('Build') {
            steps {
                sh 'npm run build'
                archiveArtifacts artifacts: 'dist/**', fingerprint: true
            }
        }
        
        stage('E2E Tests') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                }
            }
            steps {
                sh '''
                    npx playwright install --with-deps
                    npm run preview &
                    npx wait-on http://localhost:4173
                    npm run test:e2e
                '''
                publishTestResults testResultsPattern: 'test-results/junit.xml'
            }
            post {
                always {
                    archiveArtifacts artifacts: 'test-results/**', allowEmptyArchive: true
                }
            }
        }
        
        stage('Performance Test') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                }
            }
            steps {
                sh '''
                    npm install -g @lhci/cli@0.12.x
                    lhci autorun
                '''
                publishHTML([
                    allowMissing: false,
                    alwaysLinkToLastBuild: true,
                    keepAll: true,
                    reportDir: '.lighthouseci',
                    reportFiles: '*.html',
                    reportName: 'Lighthouse Report'
                ])
            }
        }
        
        stage('Deploy to Staging') {
            when {
                branch 'develop'
            }
            steps {
                sh '''
                    # Deploy to staging environment
                    netlify deploy --dir=dist --site=$NETLIFY_STAGING_SITE_ID
                '''
            }
        }
        
        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                input message: 'Deploy to production?', ok: 'Deploy'
                sh '''
                    # Deploy to production environment
                    netlify deploy --prod --dir=dist --site=$NETLIFY_PRODUCTION_SITE_ID
                '''
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
        
        success {
            slackSend(
                channel: '#ci-cd',
                color: 'good',
                message: "✅ Build succeeded: ${env.JOB_NAME} - ${env.BUILD_NUMBER}"
            )
        }
        
        failure {
            slackSend(
                channel: '#ci-cd',
                color: 'danger',
                message: "❌ Build failed: ${env.JOB_NAME} - ${env.BUILD_NUMBER}"
            )
        }
        
        unstable {
            slackSend(
                channel: '#ci-cd',
                color: 'warning',
                message: "⚠️ Build unstable: ${env.JOB_NAME} - ${env.BUILD_NUMBER}"
            )
        }
    }
}
```

### 2. Jenkins Configuration

#### Required Plugins:
```bash
# Core plugins
- Pipeline
- Git
- NodeJS
- Docker Pipeline

# Quality plugins
- SonarQube Scanner
- Checkstyle
- JUnit
- Coverage

# Notification plugins
- Slack Notification
- Email Extension

# Deployment plugins
- Netlify
- SSH Agent
```

#### Global Tool Configuration:
```bash
# NodeJS installations
Name: NodeJS-18
Version: 18.x

# SonarQube Scanner
Name: SonarQubeScanner
Version: Latest
```

## 🔍 SonarQube Setup

### 1. SonarQube Configuration

Create `sonar-project.properties`:

```properties
# Project identification
sonar.projectKey=yehvo
sonar.projectName=yehVo Cross-Border Payments
sonar.projectVersion=1.0

# Source code
sonar.sources=src
sonar.tests=src
sonar.test.inclusions=**/*.test.ts,**/*.test.tsx,**/*.spec.ts,**/*.spec.tsx

# Language
sonar.typescript.node=node

# Coverage
sonar.typescript.lcov.reportPaths=coverage/lcov.info
sonar.testExecutionReportPaths=coverage/test-report.xml

# Exclusions
sonar.exclusions=**/node_modules/**,**/dist/**,**/*.d.ts,**/coverage/**

# Quality Gate
sonar.qualitygate.wait=true

# Analysis parameters
sonar.sourceEncoding=UTF-8
```

### 2. Quality Gates Configuration

```json
{
  "name": "yehVo Quality Gate",
  "conditions": [
    {
      "metric": "coverage",
      "operator": "LT",
      "threshold": "80"
    },
    {
      "metric": "duplicated_lines_density",
      "operator": "GT",
      "threshold": "5"
    },
    {
      "metric": "maintainability_rating",
      "operator": "GT",
      "threshold": "1"
    },
    {
      "metric": "reliability_rating",
      "operator": "GT",
      "threshold": "1"
    },
    {
      "metric": "security_rating",
      "operator": "GT",
      "threshold": "1"
    },
    {
      "metric": "sqale_rating",
      "operator": "GT",
      "threshold": "1"
    }
  ]
}
```

### 3. SonarQube Rules Configuration

Create custom rule set for TypeScript/React:

```json
{
  "name": "yehVo TypeScript Rules",
  "language": "ts",
  "rules": [
    {
      "key": "typescript:S1481",
      "severity": "MAJOR"
    },
    {
      "key": "typescript:S1854",
      "severity": "MAJOR"
    },
    {
      "key": "typescript:S3776",
      "severity": "CRITICAL",
      "params": {
        "threshold": "15"
      }
    }
  ]
}
```

## 📊 Monitoring & Alerting

### 1. Lighthouse CI Configuration

Create `.lighthouserc.js`:

```javascript
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:4173'],
      startServerCommand: 'npm run preview',
      startServerReadyPattern: 'Local:',
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'categories:pwa': ['error', { minScore: 0.8 }],
      },
    },
    upload: {
      target: 'lhci',
      serverBaseUrl: process.env.LHCI_SERVER_URL,
      token: process.env.LHCI_TOKEN,
    },
  },
};
```

### 2. Package.json Scripts

Add these scripts to `package.json`:

```json
{
  "scripts": {
    "lint": "eslint src --ext .ts,.tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,json,css,md}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,json,css,md}\"",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "analyze": "npm run build && npx vite-bundle-analyzer dist/stats.html"
  }
}
```

## 🚀 Deployment Strategies

### 1. Blue-Green Deployment

```yaml
# Blue-Green deployment workflow
name: Blue-Green Deployment

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Green Environment
        run: |
          # Deploy to green environment
          netlify deploy --dir=dist --site=$NETLIFY_GREEN_SITE_ID
          
      - name: Run Health Checks
        run: |
          # Run health checks on green environment
          npm run test:e2e:green
          
      - name: Switch Traffic
        run: |
          # Switch traffic from blue to green
          netlify sites:update --site=$NETLIFY_PRODUCTION_SITE_ID --domain=green.yehvo.com
```

### 2. Canary Deployment

```yaml
# Canary deployment workflow
name: Canary Deployment

on:
  push:
    branches: [main]

jobs:
  canary:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy Canary (10%)
        run: |
          # Deploy to canary environment with 10% traffic
          
      - name: Monitor Metrics
        run: |
          # Monitor error rates and performance
          
      - name: Promote to 50%
        if: success()
        run: |
          # Increase traffic to 50%
          
      - name: Full Deployment
        if: success()
        run: |
          # Deploy to 100% traffic
```

## 📈 Metrics & KPIs

### Development Metrics
- **Build Success Rate**: >95%
- **Average Build Time**: <10 minutes
- **Test Coverage**: >80%
- **Code Quality Score**: A grade

### Deployment Metrics
- **Deployment Frequency**: Daily
- **Lead Time**: <2 hours
- **Mean Time to Recovery**: <30 minutes
- **Change Failure Rate**: <5%

### Performance Metrics
- **Lighthouse Performance**: >90
- **Bundle Size**: <500KB gzipped
- **First Contentful Paint**: <2s
- **Time to Interactive**: <3s

## 🔧 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify environment variables
   - Review dependency conflicts

2. **Test Failures**
   - Check test environment setup
   - Verify mock configurations
   - Review async test handling

3. **Deployment Issues**
   - Verify deployment credentials
   - Check network connectivity
   - Review deployment logs

### Debug Commands

```bash
# Debug build issues
npm run build -- --debug

# Debug test issues
npm run test -- --reporter=verbose

# Debug deployment
netlify deploy --debug
```

---

This CI/CD setup provides a robust foundation for the yehVo project with automated testing, security scanning, quality gates, and deployment automation. Adjust configurations based on your specific requirements and infrastructure.