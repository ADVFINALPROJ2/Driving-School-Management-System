# Sprint 1: Foundation & Architecture - Henok

**Sprint Duration**: Week 1 (Days 1-4)  
**Developer**: Henok (Backend Lead & Finance Module)  
**Status**: In Progress  
**Branch Prefix**: `henok/`

---

## Overview

Sprint 1 establishes the foundational infrastructure for the Ethiopian Driving School Automation System backend. This includes Rails API setup, PostgreSQL configuration with Docker, Devise + JWT authentication, CORS configuration for Next.js, API versioning structure, and error handling middleware.

---

## Requirements

### Functional Requirements

1. **Rails API-Only Project Setup**
   - Rails 8.1+ API-only mode
   - PostgreSQL 16 as primary database
   - Dockerized development environment
   - Environment variable management

2. **Authentication System**
   - Devise for user authentication
   - JWT tokens for stateless authentication
   - Token expiration (1 hour)
   - Token blacklist/denylist on logout
   - Role-based access control foundation

3. **CORS Configuration**
   - Allow Next.js frontend (localhost:3000)
   - Expose Authorization header
   - Support all standard HTTP methods

4. **API Structure**
   - Versioned API (`/api/v1`)
   - Standardized JSON responses
   - Error handling middleware
   - Request/response logging

### Non-Functional Requirements

1. **Security**
   - Secure JWT secret management
   - Environment-based configuration
   - No credentials in code/git

2. **Performance**
   - Database connection pooling
   - Efficient query patterns
   - Optimized Docker image layers

3. **Development Experience**
   - Hot-reload in development
   - Clear error messages
   - Comprehensive logging

---

## Design

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Docker Compose                       │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌───────────────┐  ┌─────────────┐  ┌───────────────┐ │
│  │   Next.js     │  │    Rails    │  │  PostgreSQL   │ │
│  │  Frontend     │◄─┤   API       │◄─┤   Database    │ │
│  │  Port: 3000   │  │  Port: 8080 │  │  Port: 5432   │ │
│  └───────────────┘  └─────────────┘  └───────────────┘ │
│                                                           │
│  Network: driving_school_network                         │
└─────────────────────────────────────────────────────────┘
```

### Authentication Flow

```
┌─────────┐                  ┌──────────┐                ┌──────────┐
│ Client  │                  │  Rails   │                │   JWT    │
│         │                  │   API    │                │ Strategy │
└────┬────┘                  └────┬─────┘                └────┬─────┘
     │                            │                           │
     │ POST /api/v1/auth/login   │                           │
     │ {email, password}          │                           │
     ├───────────────────────────►│                           │
     │                            │                           │
     │                            │  Authenticate user        │
     │                            ├──────────────────────────►│
     │                            │                           │
     │                            │  Generate JWT             │
     │                            │◄──────────────────────────┤
     │                            │                           │
     │ {token, user}              │                           │
     │◄───────────────────────────┤                           │
     │                            │                           │
     │ GET /api/v1/students       │                           │
     │ Authorization: Bearer JWT  │                           │
     ├───────────────────────────►│                           │
     │                            │                           │
     │                            │  Validate JWT             │
     │                            ├──────────────────────────►│
     │                            │                           │
     │                            │  User authenticated       │
     │                            │◄──────────────────────────┤
     │                            │                           │
     │ {students:[...]}           │                           │
     │◄───────────────────────────┤                           │
     │                            │                           │
```

### Database Configuration

**Docker Volume Mapping**:
- PostgreSQL data: `./backend/db/data:/var/lib/postgresql/data`
- Persistent volume: `postgres_data`

**Environment Variables**:
```bash
DATABASE_HOST=postgres
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=backend_development
```

### API Versioning Structure

```
backend/
├── app/
│   └── controllers/
│       └── api/
│           └── v1/
│               ├── base_controller.rb      # Auth & error handling
│               ├── auth_controller.rb      # Login/logout
│               └── students_controller.rb  # (future)
```

---

## Tasks

### Task 1: Docker Compose Setup ✅
**Branch**: `henok/rails-setup`  
**Duration**: Day 1 (4 hours)

**Subtasks**:
- [x] Create `docker-compose.yml` at project root
- [x] Define PostgreSQL service (port 5432)
- [x] Define Rails API service (port 8080)
- [x] Define Next.js frontend service (port 3000)
- [x] Configure health checks for PostgreSQL
- [x] Set up volumes for data persistence
- [x] Create Docker network for services

**Files Created**:
- `/docker-compose.yml`
- `/backend/Dockerfile.dev`
- `/Client/Dockerfile.dev`

**Acceptance Criteria**:
- [ ] `docker-compose up` starts all services
- [ ] PostgreSQL is accessible on port 5432
- [ ] Rails API is accessible on port 8080
- [ ] Services can communicate via Docker network

---

### Task 2: PostgreSQL Configuration ✅
**Branch**: `henok/rails-setup`  
**Duration**: Day 1 (2 hours)

**Subtasks**:
- [x] Update `config/database.yml` for Docker
- [x] Add environment variable support
- [x] Configure connection pooling
- [ ] Test database connection from Rails
- [ ] Run `rails db:create` successfully

**Files Modified**:
- `/backend/config/database.yml`

**Acceptance Criteria**:
- [ ] Rails connects to PostgreSQL in Docker
- [ ] Database is created successfully
- [ ] Connection pooling works properly

---

### Task 3: Devise + JWT Authentication Setup
**Branch**: `henok/rails-setup`  
**Duration**: Day 2 (6 hours)

**Subtasks**:
- [x] Configure Devise initializer
- [x] Create JWT initializer (`devise_jwt.rb`)
- [ ] Generate User model with Devise
- [ ] Add JWT denylist model
- [ ] Create authentication controller (`api/v1/auth_controller.rb`)
- [ ] Add login endpoint (`POST /api/v1/auth/login`)
- [ ] Add logout endpoint (`DELETE /api/v1/auth/logout`)
- [ ] Add current_user helper method

**Files to Create**:
- `/backend/config/initializers/devise_jwt.rb` ✅
- `/backend/app/models/user.rb`
- `/backend/app/models/jwt_denylist.rb`
- `/backend/app/controllers/api/v1/base_controller.rb`
- `/backend/app/controllers/api/v1/auth_controller.rb`
- `/backend/db/migrate/XXXXXX_devise_create_users.rb`
- `/backend/db/migrate/XXXXXX_create_jwt_denylist.rb`

**Acceptance Criteria**:
- [ ] User can login with email/password
- [ ] JWT token is returned on successful login
- [ ] JWT token is validated on protected routes
- [ ] Token expires after 1 hour
- [ ] Token is blacklisted on logout

---

### Task 4: CORS Configuration ✅
**Branch**: `henok/rails-setup`  
**Duration**: Day 2 (1 hour)

**Subtasks**:
- [x] Configure CORS middleware
- [x] Allow Next.js origin (localhost:3000)
- [x] Expose Authorization header
- [x] Support all HTTP methods

**Files Modified**:
- `/backend/config/initializers/cors.rb` ✅

**Acceptance Criteria**:
- [ ] Next.js can make API requests
- [ ] Authorization header is accessible
- [ ] Preflight requests work correctly

---

### Task 5: API Versioning Structure
**Branch**: `henok/api-structure`  
**Duration**: Day 3 (4 hours)

**Subtasks**:
- [ ] Create API::V1 namespace
- [ ] Create BaseController with authentication
- [ ] Set up routes under /api/v1
- [ ] Implement standardized JSON responses
- [ ] Add API documentation foundation

**Files to Create**:
- `/backend/app/controllers/api/v1/base_controller.rb`
- `/backend/config/routes.rb` (update)

**Acceptance Criteria**:
- [ ] All API routes are under /api/v1
- [ ] Consistent JSON response format
- [ ] Authentication enforced on protected routes
- [ ] Clear namespace separation

---

### Task 6: Error Handling Middleware
**Branch**: `henok/api-structure`  
**Duration**: Day 3-4 (4 hours)

**Subtasks**:
- [ ] Create custom error classes
- [ ] Implement global error handler
- [ ] Standardize error response format
- [ ] Add error logging
- [ ] Handle common errors (404, 401, 422, 500)

**Files to Create**:
- `/backend/lib/errors/base_error.rb`
- `/backend/lib/errors/unauthorized_error.rb`
- `/backend/lib/errors/not_found_error.rb`
- `/backend/lib/errors/validation_error.rb`
- `/backend/app/controllers/concerns/error_handler.rb`

**Error Response Format**:
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token",
    "details": {}
  }
}
```

**Acceptance Criteria**:
- [ ] All errors return consistent JSON format
- [ ] Appropriate HTTP status codes
- [ ] Errors are logged with context
- [ ] User-friendly error messages

---

## Testing Strategy

### Manual Testing
1. **Docker Setup**
   - Start services: `docker-compose up`
   - Check PostgreSQL connection: `docker-compose exec rails-api rails db:create`
   - Check Rails console: `docker-compose exec rails-api rails c`

2. **Authentication**
   - Register user via console
   - Login via POST /api/v1/auth/login
   - Access protected route with JWT
   - Logout via DELETE /api/v1/auth/logout
   - Verify token is blacklisted

3. **Error Handling**
   - Test 404 (invalid route)
   - Test 401 (no token)
   - Test 401 (invalid token)
   - Test 422 (validation error)

### Automated Testing (RSpec)
```ruby
# spec/requests/api/v1/auth_spec.rb
describe 'POST /api/v1/auth/login' do
  it 'returns JWT token on successful login'
  it 'returns 401 on invalid credentials'
end

describe 'DELETE /api/v1/auth/logout' do
  it 'blacklists JWT token'
  it 'returns 401 without token'
end
```

---

## Success Criteria

### Sprint 1 Complete When:
- [ ] All services run via `docker-compose up`
- [ ] PostgreSQL connection working
- [ ] User authentication with JWT functional
- [ ] API endpoints under /api/v1 namespace
- [ ] Error handling middleware active
- [ ] CORS configured for frontend
- [ ] Code pushed to branches:
  - `henok/rails-setup` (merged)
  - `henok/api-structure` (merged)
- [ ] Documentation updated in Obsidian vault

### Quality Checklist:
- [ ] All tests passing
- [ ] Rubocop passes (Rails style guide)
- [ ] No credentials in code
- [ ] Environment variables documented
- [ ] Code reviewed by teammate
- [ ] PR description complete

---

## Dependencies

### Blocking:
- **Oliyad**: Database migrations for User model
  - Once Oliyad creates core migrations, integrate with authentication

### Blocked By This:
- **All Backend Devs**: Need authentication to test their endpoints
- **Frontend Team**: Need authentication API for login flow

---

## Next Sprint Preview

**Sprint 2-3**: Finance Module Implementation
- PricingService implementation
- MilestoneTracker with AASM integration
- Invoice model and controller
- PenaltyEngine service
- PayrollCalculator service

---

## Notes

### Technical Decisions:
1. **JWT vs Session**: Chose JWT for stateless API design
2. **Token Expiration**: 1 hour balances security and UX
3. **Denylist Strategy**: Database-backed for multi-server support
4. **API Versioning**: /api/v1 namespace for future flexibility

### Risks & Mitigations:
| Risk | Impact | Mitigation |
|------|--------|------------|
| Docker performance on macOS | Medium | Use volumes efficiently, document performance tuning |
| JWT secret management | High | Use Rails credentials, environment variables |
| CORS misconfiguration | Medium | Test thoroughly with frontend |

---

**Created**: 2026-06-11  
**Last Updated**: 2026-06-11  
**Status**: 🟡 In Progress
