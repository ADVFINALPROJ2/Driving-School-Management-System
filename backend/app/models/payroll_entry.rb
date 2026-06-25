# frozen_string_literal: true

class PayrollEntry < ApplicationRecord
  # Associations
  belongs_to :instructor, class_name: 'User'

  # Validations
  validates :payroll_month, presence: true
  validates :base_salary, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :student_load_bonus, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true
  validates :performance_bonus, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true
  validates :total_amount, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :payment_status, presence: true, inclusion: { in: %w[pending paid cancelled] }
  validates :instructor_id, uniqueness: { scope: :payroll_month }

  # Scopes
  scope :pending, -> { where(payment_status: 'pending') }
  scope :paid, -> { where(payment_status: 'paid') }
  scope :for_month, ->(date) { where(payroll_month: date.beginning_of_month) }
  scope :recent, -> { order(payroll_month: :desc) }

  # Instance methods
  def paid?
    payment_status == 'paid'
  end

  def mark_as_paid!(payment_method: nil, payment_reference: nil)
    update!(
      payment_status: 'paid',
      payment_date: Date.today,
      payment_method: payment_method,
      payment_reference: payment_reference
    )
  end

  def month_name
    payroll_month.strftime('%B %Y')
  end

  def month
    payroll_month.month
  end

  def year
    payroll_month.year
  end
end
