# Sprint 1: Setup Instructions

## Prerequisites

- Docker Desktop installed
- Git configured
- Terminal/Command Line access

## Quick Start

### 1. Clone and Navigate to Project

```bash
cd /Users/henok/Documents/Advanced_p/Driving-School-Management-System
```

### 2. Set Up Environment Variables

```bash
# Backend
cd backend
cp .env.example .env

# Edit .env and set your JWT secret (minimum 32 characters)
# You can generate one with: openssl rand -hex 32
```

### 3. Start Docker Services

```bash
# Return to project root
cd ..

# Start all services
docker-compose up -d

# Check if services are running
docker-compose ps
```

Expected output:
```
NAME                           STATUS
driving_school_postgres        Up (healthy)
driving_school_rails_api       Up
driving_school_nextjs_frontend Up
```

### 4. Setup Database

```bash
# Create database
docker-compose exec rails-api rails db:create

# Run migrations
docker-compose exec rails-api rails db:migrate

# (Optional) Seed initial data
docker-compose exec rails-api rails db:seed
```

### 5. Verify Installation

**Check PostgreSQL:**
```bash
docker-compose exec postgres psql -U postgres -d backend_development -c "SELECT version();"
```

**Check Rails API:**
```bash
curl http://localhost:8080/up
# Should return: {"status":"ok"}
```

**Check Rails Console:**
```bash
docker-compose exec rails-api rails console
```

## Testing Authentication

### 1. Create a Test User (via Rails Console)

```bash
docker-compose exec rails-api rails console
```

```ruby
User.create!(
  email: 'admin@driving.school',
  password: 'password123',
  password_confirmation: 'password123',
  full_name: 'Admin User',
  role: 'admin',
  phone_number: '+251911234567'
)
```

### 2. Test Login Endpoint

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "auth": {
      "email": "admin@driving.school",
      "password": "password123"
    }
  }'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "admin@driving.school",
      "full_name": "Admin User",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiJ9..."
  },
  "message": "Login successful"
}
```

### 3. Test Protected Endpoint

```bash
# Save the token from login response
TOKEN="your_jwt_token_here"

curl -X GET http://localhost:8080/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Test Logout

```bash
curl -X DELETE http://localhost:8080/api/v1/auth/logout \
  -H "Authorization: Bearer $TOKEN"
```

## Common Commands

### Docker Management

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f rails-api

# Restart a service
docker-compose restart rails-api

# Rebuild images
docker-compose build

# Remove volumes (WARNING: deletes data)
docker-compose down -v
```

### Rails Commands

```bash
# Rails console
docker-compose exec rails-api rails console

# Run migrations
docker-compose exec rails-api rails db:migrate

# Rollback migration
docker-compose exec rails-api rails db:rollback

# Reset database (WARNING: deletes all data)
docker-compose exec rails-api rails db:reset

# View routes
docker-compose exec rails-api rails routes
```

### Database Commands

```bash
# PostgreSQL console
docker-compose exec postgres psql -U postgres -d backend_development

# Backup database
docker-compose exec postgres pg_dump -U postgres backend_development > backup.sql

# Restore database
docker-compose exec -T postgres psql -U postgres backend_development < backup.sql
```

## Troubleshooting

### Issue: Port Already in Use

**Problem**: `Error starting userland proxy: listen tcp 0.0.0.0:8080: bind: address already in use`

**Solution**:
```bash
# Find process using port
lsof -ti:8080

# Kill the process
kill -9 $(lsof -ti:8080)

# Or change port in docker-compose.yml
```

### Issue: Database Connection Failed

**Problem**: `PG::ConnectionBad: could not connect to server`

**Solution**:
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Restart PostgreSQL
docker-compose restart postgres

# Check PostgreSQL logs
docker-compose logs postgres

# Ensure DATABASE_HOST=postgres in .env
```

### Issue: JWT Token Invalid

**Problem**: `401 Unauthorized - Invalid token`

**Solution**:
- Ensure `DEVISE_JWT_SECRET_KEY` is set in `.env`
- Secret must be at least 32 characters
- Token may have expired (1 hour lifetime)
- Generate new token by logging in again

### Issue: Bundle Install Fails

**Problem**: `Could not find gem ...`

**Solution**:
```bash
# Rebuild Rails container
docker-compose build rails-api

# Force bundle install
docker-compose exec rails-api bundle install
```

### Issue: Migration Fails

**Problem**: `ActiveRecord::PendingMigrationError`

**Solution**:
```bash
# Check migration status
docker-compose exec rails-api rails db:migrate:status

# Run migrations
docker-compose exec rails-api rails db:migrate

# If corruption, rollback and retry
docker-compose exec rails-api rails db:rollback
docker-compose exec rails-api rails db:migrate
```

## Development Workflow

### Branch Strategy

```bash
# Create feature branch
git checkout -b henok/rails-setup

# Make changes, commit frequently
git add .
git commit -m "feat: add devise JWT authentication"

# Push to remote
git push origin henok/rails-setup

# Open Pull Request on GitHub
```

### Code Quality

```bash
# Run Rubocop (code linter)
docker-compose exec rails-api bundle exec rubocop

# Auto-fix Rubocop issues
docker-compose exec rails-api bundle exec rubocop -a

# Run RSpec tests
docker-compose exec rails-api bundle exec rspec

# Run specific test file
docker-compose exec rails-api bundle exec rspec spec/models/user_spec.rb
```

## Next Steps

After completing Sprint 1 setup:

1. **Verify all endpoints work** ✅
2. **Create initial seed data** (admins, instructors)
3. **Write RSpec tests** for authentication
4. **Update Obsidian vault** with progress
5. **Move to Sprint 2**: Finance Module Implementation

---

## Support

If you encounter issues:
1. Check logs: `docker-compose logs -f rails-api`
2. Review this document's troubleshooting section
3. Check `.env` configuration
4. Verify Docker Desktop is running
5. Ask team in `#backend` Slack channel

---

**Last Updated**: 2026-06-11  
**Sprint**: 1 (Foundation & Architecture)  
**Developer**: Henok (Backend Lead)
