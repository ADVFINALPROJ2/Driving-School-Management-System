# frozen_string_literal: true

class JwtDenylist < ApplicationRecord
  include Devise::JWT::RevocationStrategies::Denylist

  self.table_name = 'jwt_denylist'

  # Clean up expired tokens (run periodically)
  def self.cleanup_expired_tokens
    where('exp < ?', Time.current).delete_all
  end
end
