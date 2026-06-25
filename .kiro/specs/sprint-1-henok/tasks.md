# Sprint 1: Foundation & Architecture - Tasks

## Task 1: Docker Compose Setup
- [x] Create docker-compose.yml at project root
- [x] Define PostgreSQL service (port 5432)
- [x] Define Rails API service (port 8080)
- [x] Define Next.js frontend service (port 3000)
- [x] Configure health checks for PostgreSQL
- [x] Set up volumes for data persistence
- [x] Create Docker network for services
- [ ] Test: docker-compose up starts all services
- [ ] Test: Services can communicate via network

## Task 2: PostgreSQL Configuration
- [x] Update config/database.yml for Docker
- [x] Add environment variable support
- [x] Configure connection pooling
- [ ] Test: rails db:create succeeds
- [ ] Test: Rails connects to PostgreSQL

## Task 3: Devise + JWT Authentication Setup
- [x] Configure Devise initializer
- [x] Create JWT initializer (devise_jwt.rb)
- [x] Generate User model migration
- [x] Generate JWT denylist migration
- [x] Create User model with Devise
- [x] Create JwtDenylist model
- [x] Create BaseController with authentication
- [x] Create AuthController (login, register, logout, me)
- [x] Add authentication routes
- [ ] Run migrations
- [ ] Test: User can login
- [ ] Test: JWT token is returned
- [ ] Test: Token validates on protected routes
- [ ] Test: Token expires after 1 hour
- [ ] Test: Token is blacklisted on logout

## Task 4: CORS Configuration
- [x] Configure CORS middleware
- [x] Allow Next.js origin (localhost:3000)
- [x] Expose Authorization header
- [x] Support all HTTP methods
- [ ] Test: Frontend can make API requests
- [ ] Test: Preflight requests work

## Task 5: API Versioning Structure
- [x] Create API::V1 namespace
- [x] Create BaseController with auth & error handling
- [x] Set up routes under /api/v1
- [x] Implement standardized JSON responses
- [ ] Test: All routes under /api/v1
- [ ] Test: Consistent response format

## Task 6: Environment Configuration
- [x] Create .env.example
- [ ] Document environment variables
- [ ] Generate JWT secret
- [ ] Configure development environment
- [ ] Test: Environment variables load correctly

## Task 7: Testing & Verification
- [ ] Write RSpec tests for User model
- [ ] Write RSpec tests for authentication endpoints
- [ ] Manual testing via curl/Postman
- [ ] Verify error handling
- [ ] Check logs for issues

## Task 8: Documentation
- [x] Create SPRINT_1_SETUP.md
- [x] Document API endpoints
- [x] Create troubleshooting guide
- [ ] Update Obsidian vault
- [ ] Create PR with clear description
