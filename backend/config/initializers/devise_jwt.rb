# frozen_string_literal: true

# Devise JWT configuration
Devise.setup do |config|
  # JWT configuration
  config.jwt do |jwt|
    # Secret key for JWT encoding/decoding
    jwt.secret = Rails.application.credentials.devise_jwt_secret_key || ENV['DEVISE_JWT_SECRET_KEY']
    
    # Dispatch requests - generate JWT for these routes
    jwt.dispatch_requests = [
      ['POST', %r{^/api/v1/auth/login$}]
    ]
    
    # Revocation requests - revoke JWT for these routes
    jwt.revocation_requests = [
      ['DELETE', %r{^/api/v1/auth/logout$}]
    ]
    
    # Expiration time (1 hour)
    jwt.expiration_time = 1.hour.to_i
    
    # Revocation strategy (we'll use a denylist stored in DB)
    jwt.revocation_strategy = Devise::JWT::RevocationStrategies::Denylist
  end
end
