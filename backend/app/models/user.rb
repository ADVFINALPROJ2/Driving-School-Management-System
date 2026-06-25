# frozen_string_literal: true

class User < ApplicationRecord
  # Include default devise modules
  devise :database_authenticatable,
         :registerable,
         :recoverable,
         :rememberable,
         :trackable,
         :validatable,
         :jwt_authenticatable,
         jwt_revocation_strategy: JwtDenylist

  # Roles
  ROLES = %w[admin instructor clerk student].freeze

  # Validations
  validates :full_name, presence: true
  validates :role, presence: true, inclusion: { in: ROLES }
  validates :instructor_license_number, presence: true, if: :instructor?
  validates :instructor_category, presence: true, if: :instructor?
  validates :years_experience, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true

  # Associations
  has_many :theory_students, class_name: 'Student', foreign_key: 'theory_instructor_id', dependent: :nullify
  has_many :practical_students, class_name: 'Student', foreign_key: 'practical_instructor_id', dependent: :nullify
  has_many :attendance_logs, foreign_key: 'instructor_id', dependent: :nullify
  has_many :payroll_entries, foreign_key: 'instructor_id', dependent: :destroy

  # Scopes
  scope :admins, -> { where(role: 'admin') }
  scope :instructors, -> { where(role: 'instructor') }
  scope :clerks, -> { where(role: 'clerk') }
  scope :students, -> { where(role: 'student') }
  scope :qualified_instructors, -> { where(role: 'instructor', is_qualified_instructor: true) }

  # Role check methods
  def admin?
    role == 'admin'
  end

  def instructor?
    role == 'instructor'
  end

  def clerk?
    role == 'clerk'
  end

  def student?
    role == 'student'
  end

  # JWT payload customization
  def jwt_payload
    {
      'sub' => id,
      'email' => email,
      'role' => role,
      'full_name' => full_name
    }
  end
end
