# Contributing to yehVo

Welcome to yehVo! We're excited to have you contribute to the future of cross-border payments powered by blockchain technology.

## 🌟 Project Overview

yehVo is a Progressive Web Application that enables cross-border payments using blockchain technology, voice commands, and multiple payment channels. Built with React, TypeScript, Supabase, and Algorand blockchain.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- Modern browser with camera/microphone support
- Supabase account (for backend)
- Basic knowledge of React, TypeScript, and blockchain concepts

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/yehvo.git
   cd yehvo
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Fill in your Supabase credentials and API keys
   ```

3. **Start Development**
   ```bash
   npm run dev
   ```

## 📋 Contribution Workflow

### 1. Issue Selection & Planning

1. Browse [GitHub Issues](https://github.com/yehvo/yehvo/issues)
2. Select an issue tagged with `good-first-issue`, `feature`, or `enhancement`
3. Comment on the issue expressing interest
4. Wait for admin approval before starting work

### 2. Task Documentation (Required)

Before starting implementation, create a detailed task plan:

**Create a new file: `docs/tasks/[issue-number]-[feature-name].md`**

```markdown
# Task: [Issue Title] (#[Issue Number])

## Overview
Brief description of the feature/fix

## Approach
Detailed explanation of how you plan to implement this

## Tech Stack
- Primary technologies you'll use
- New dependencies (if any)
- Integration points

## Implementation Plan
1. Step 1: Description
2. Step 2: Description
3. Step 3: Description

## Testing Strategy
- Unit tests planned
- Integration tests
- Manual testing checklist

## Timeline
Estimated completion: X days/weeks

## Questions/Concerns
Any blockers or questions for the admin team
```

### 3. Admin Approval Process

1. Submit your task documentation as a PR to `main` branch
2. Tag `@admin` for review
3. Address any feedback or questions
4. Wait for approval before proceeding with implementation
5. Once approved, create your feature branch

### 4. Implementation

```bash
# Create feature branch
git checkout -b feature/[issue-number]-[feature-name]

# Make your changes
# Commit frequently with clear messages
git commit -m "feat: add bank account integration API"

# Push and create PR
git push origin feature/[issue-number]-[feature-name]
```

### 5. Pull Request Requirements

- [ ] Code follows project style guidelines
- [ ] All tests pass
- [ ] Documentation updated
- [ ] PR description links to issue
- [ ] Screenshots/videos for UI changes
- [ ] No merge conflicts

## 🏗️ Project Architecture

### Frontend Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   └── layout/         # Layout components
├── pages/              # Route components
├── services/           # API and external services
├── stores/             # Zustand state management
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
└── types/              # TypeScript definitions
```

### Key Technologies
- **Frontend**: React 18, TypeScript, Vite
- **UI**: TailwindCSS, shadcn/ui, Framer Motion
- **State**: Zustand, React Query
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **Blockchain**: Algorand SDK
- **Voice**: Web Speech API, ElevenLabs
- **PWA**: Vite PWA plugin

## 🔧 Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow ESLint configuration
- Use Prettier for formatting
- Prefer functional components with hooks
- Use meaningful variable and function names

### Commit Convention

```
type(scope): description

Types: feat, fix, docs, style, refactor, test, chore
Scope: component, service, page, etc.

Examples:
feat(payment): add mobile money integration
fix(auth): resolve session validation error
docs(api): update payment service documentation
```

### Testing Requirements

- Unit tests for utility functions
- Integration tests for services
- Component testing for complex UI
- E2E tests for critical user flows

## 🚀 CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Snyk Security Scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

  sonarqube:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: SonarQube Scan
        uses: sonarqube-quality-gate-action@master
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}

  deploy:
    needs: [test, security, sonarqube]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Production
        run: npm run deploy
```

### Jenkins Pipeline (Alternative)

```groovy
pipeline {
    agent any
    
    stages {
        stage('Install') {
            steps {
                sh 'npm ci'
            }
        }
        
        stage('Lint & Test') {
            parallel {
                stage('Lint') {
                    steps {
                        sh 'npm run lint'
                    }
                }
                stage('Test') {
                    steps {
                        sh 'npm run test'
                        publishTestResults testResultsPattern: 'coverage/junit.xml'
                    }
                }
            }
        }
        
        stage('Security Scan') {
            steps {
                sh 'npm audit'
                sh 'snyk test'
            }
        }
        
        stage('Build') {
            steps {
                sh 'npm run build'
                archiveArtifacts artifacts: 'dist/**', fingerprint: true
            }
        }
        
        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                sh 'npm run deploy'
            }
        }
    }
    
    post {
        always {
            publishHTML([
                allowMissing: false,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'coverage',
                reportFiles: 'index.html',
                reportName: 'Coverage Report'
            ])
        }
    }
}
```

## 🛠️ Recommended Tools

### Development Tools
- **IDE**: VS Code with extensions:
  - TypeScript Hero
  - Tailwind CSS IntelliSense
  - ES7+ React/Redux/React-Native snippets
  - GitLens
  - Prettier
  - ESLint

### Collaboration Tools
- **Communication**: Discord/Slack for real-time chat
- **Project Management**: GitHub Projects/Issues
- **Documentation**: Notion for detailed specs
- **Design**: Figma for UI/UX mockups
- **API Testing**: Postman/Insomnia

### Quality Assurance
- **Code Quality**: SonarQube
- **Security**: Snyk, npm audit
- **Performance**: Lighthouse CI
- **Testing**: Jest, React Testing Library, Playwright

## 📝 Branch Strategy

### Git Flow
```
main (production)
├── develop (integration)
├── feature/[issue-number]-[feature-name]
├── hotfix/[issue-number]-[fix-name]
└── release/[version-number]
```

### Branch Rules
- `main`: Production-ready code only
- `develop`: Integration branch for features
- `feature/*`: New features and enhancements
- `hotfix/*`: Critical production fixes
- `release/*`: Release preparation

### Protection Rules
- `main` and `develop` require PR reviews
- All checks must pass before merge
- No direct pushes to protected branches
- Require up-to-date branches before merge

## 🔍 Code Review Process

### Review Checklist
- [ ] Code follows style guidelines
- [ ] Functionality works as expected
- [ ] Tests are comprehensive
- [ ] Documentation is updated
- [ ] No security vulnerabilities
- [ ] Performance considerations addressed
- [ ] Accessibility standards met
- [ ] Mobile responsiveness verified

### Review Timeline
- Initial review: Within 24 hours
- Follow-up reviews: Within 12 hours
- Final approval: Within 48 hours of submission

## 🚨 Hotfix Process

For critical production issues:

1. Create hotfix branch from `main`
2. Implement minimal fix
3. Test thoroughly
4. Create PR with `hotfix` label
5. Fast-track review (no admin approval needed)
6. Deploy immediately after merge
7. Backport to `develop` branch

## 📊 Quality Metrics

### Code Quality Targets
- Test Coverage: >80%
- Code Duplication: <5%
- Maintainability Index: >70
- Technical Debt: <30 minutes

### Performance Targets
- Lighthouse Score: >90
- First Contentful Paint: <2s
- Largest Contentful Paint: <3s
- Cumulative Layout Shift: <0.1

## 🎯 Recognition & Rewards

### Contributor Levels
- **Newcomer**: First contribution merged
- **Regular**: 5+ contributions merged
- **Core**: 20+ contributions, code review privileges
- **Maintainer**: 50+ contributions, admin privileges

### Recognition
- Monthly contributor spotlight
- GitHub profile badges
- Conference speaking opportunities
- Open source portfolio building

## 📞 Support & Communication

### Getting Help
- **Technical Questions**: GitHub Discussions
- **Bug Reports**: GitHub Issues
- **Feature Requests**: GitHub Issues with `enhancement` label
- **General Chat**: Discord server
- **Security Issues**: security@yehvo.com (private)

### Response Times
- GitHub Issues: 24-48 hours
- Pull Requests: 24 hours for initial review
- Discord: Real-time during business hours
- Email: 48-72 hours

## 📚 Additional Resources

- [API Documentation](./docs/api.md)
- [Architecture Guide](./docs/architecture.md)
- [Deployment Guide](./docs/deployment.md)
- [Security Guidelines](./docs/security.md)
- [Performance Optimization](./docs/performance.md)

---

Thank you for contributing to yehVo! Together, we're building the future of cross-border payments. 🚀