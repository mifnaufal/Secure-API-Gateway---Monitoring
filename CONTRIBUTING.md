# Contributing to Secure API Gateway + Monitoring

Thank you for your interest in contributing to this project! 🎉

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, please include:

- **Clear title and description**
- **Steps to reproduce** the behavior
- **Expected vs actual behavior**
- **Screenshots** if applicable
- **Environment details** (OS, Node version, Docker version)

**Example:**
```markdown
**Describe the bug**
Rate limiter not working as expected.

**To Reproduce**
1. Start all services with `docker-compose up`
2. Send 100+ requests to `/api/auth/login`
3. Check if rate limiting triggers

**Expected:** Should block after 5 failed attempts
**Actual:** No rate limiting applied
```

### Suggesting Features

Feature suggestions are welcome! Please:

- Use a **clear title**
- Provide **detailed description**
- Explain **use case** and **benefits**
- Mark as `[FEATURE REQUEST]` in title

### Pull Requests

1. **Fork** the repository
2. **Create a feature branch** from `main`
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Test your changes**
   ```bash
   npm test
   # Or test individual services
   cd gateway && npm test
   ```
5. **Commit** with clear messages
   ```bash
   git commit -m "feat: add amazing feature"
   ```
6. **Push** to your fork
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

## Development Setup

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15+ (for local dev without Docker)
- Redis 7+ (for local dev without Docker)

### Quick Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/secure-api-gateway.git
cd secure-api-gateway

# Install dependencies
make install

# Start services
make docker-build

# Run tests
make test
```

## Coding Standards

### JavaScript Style

- Use **2 spaces** for indentation
- Use **single quotes** for strings
- Use **semicolons**
- Maximum line length: **100 characters**
- Use **const** by default, **let** when needed

### Naming Conventions

- **Files**: camelCase (`authController.js`)
- **Variables**: camelCase (`accessToken`)
- **Constants**: UPPER_SNAKE_CASE (`RATE_LIMIT_MAX`)
- **Classes**: PascalCase (`UserController`)

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Tests
- `chore:` - Maintenance tasks

**Examples:**
```
feat: add webhook notification for alerts
fix: resolve JWT expiry validation issue
docs: update API documentation
test: add integration tests for auth service
```

## Project Structure

```
├── gateway/              # API Gateway service
├── services/
│   ├── auth/            # Authentication service
│   └── data/            # Data management service
├── monitoring/          # Monitoring & analytics service
├── dashboard/           # Frontend dashboard
├── docker-compose.yml   # Docker orchestration
└── docs/                # Documentation
```

## Testing

### Run All Tests
```bash
npm test
```

### Run Service Tests
```bash
cd gateway && npm test
cd services/auth && npm test
cd services/data && npm test
cd monitoring && npm test
```

### Test Coverage
```bash
npm test -- --coverage
```

## Documentation

- **README.md** - Main documentation
- **API_DOCS.md** - API reference
- **QUICK_REFERENCE.md** - Quick commands
- **FEATURE_CHECKLIST.md** - Feature status
- **docs/** - Additional documentation

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).

## Questions?

- Open an issue with `[QUESTION]` tag
- Check existing documentation
- Review closed issues

---

Thank you for contributing! 🚀
