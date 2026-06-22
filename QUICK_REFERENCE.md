# Quick Reference - Sprint 1

## Essential Commands

### Start/Stop Services
```bash
docker-compose up -d          # Start all services
docker-compose down           # Stop all services
docker-compose ps             # Check service status
docker-compose logs -f rails-api  # View Rails logs
```

### Database
```bash
# Create and migrate
docker-compose exec rails-api rails db:create
docker-compose exec rails-api rails db:migrate

# Rails console
docker-compose exec rails-api rails console

# PostgreSQL console
docker-compose exec postgres psql -U postgres -d backend_development
```

### Create Admin User
```ruby
# In Rails console
User.create!(
  email: 'admin@driving.school',
  password: 'password123',
  password_confirmation: 'password123',
  full_name: 'Admin User',
  role: 'admin'
)
```

### Test Authentication
```bash
# Login
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"auth":{"email":"admin@driving.school","password":"password123"}}'

# Get current user (replace TOKEN)
curl http://localhost:8080/api/v1/auth/me \
  -H "Authorization: Bearer TOKEN"

# Logout
curl -X DELETE http://localhost:8080/api/v1/auth/logout \
  -H "Authorization: Bearer TOKEN"
```

### Code Quality
```bash
docker-compose exec rails-api bundle exec rubocop      # Check style
docker-compose exec rails-api bundle exec rubocop -a   # Auto-fix
docker-compose exec rails-api bundle exec rspec        # Run tests
```

## API Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | /api/v1/auth/login | No | Login user |
| POST | /api/v1/auth/register | No | Register user |
| GET | /api/v1/auth/me | Yes | Get current user |
| DELETE | /api/v1/auth/logout | Yes | Logout user |

## Environment Variables

```bash
# Required in backend/.env
DATABASE_HOST=postgres
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DEVISE_JWT_SECRET_KEY=<generate with: openssl rand -hex 32>
FRONTEND_URL=http://localhost:3000
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port in use | `kill -9 $(lsof -ti:8080)` |
| DB connection failed | `docker-compose restart postgres` |
| Bundle install fails | `docker-compose build rails-api` |
| Migration fails | `docker-compose exec rails-api rails db:rollback` |

## Git Workflow

```bash
# Create feature branch
git checkout -b henok/rails-setup

# Commit changes
git add .
git commit -m "feat: add devise JWT authentication"

# Push to remote
git push origin henok/rails-setup

# After PR approval
git checkout main
git pull origin main
```

## Next Sprint Preview

- PricingService implementation
- MilestoneTracker with AASM
- Invoice model and controller
- Background jobs with Solid Queue

---

**Henok - Sprint 1 | Week 1**
