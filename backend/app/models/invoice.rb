# frozen_string_literal: true

class Invoice < ApplicationRecord
  # Associations
  belongs_to :student
  belongs_to :related_exam_booking, class_name: 'ExamBooking', optional: true
  belongs_to :issued_by_user, class_name: 'User', optional: true

  # Validations
  validates :invoice_number, presence: true, uniqueness: true
  validates :invoice_type, presence: true, inclusion: { 
    in: %w[registration milestone_1 milestone_2 penalty exam_fee upgrade] 
  }
  validates :amount, presence: true, numericality: { greater_than: 0 }
  validates :status, presence: true, inclusion: { in: %w[pending paid overdue cancelled] }
  validates :due_date, presence: true

  # Callbacks
  before_validation :generate_invoice_number, on: :create
  after_save :update_student_payment_status, if: :saved_change_to_status?

  # Scopes
  scope :pending, -> { where(status: 'pending') }
  scope :paid, -> { where(status: 'paid') }
  scope :overdue, -> { where(status: 'overdue') }
  scope :by_type, ->(type) { where(invoice_type: type) }
  scope :due_soon, -> { pending.where('due_date <= ?', 7.days.from_now) }

  # Instance methods
  def paid?
    status == 'paid'
  end

  def overdue?
    status == 'pending' && due_date < Date.today
  end

  def milestone_invoice?
    %w[milestone_1 milestone_2].include?(invoice_type)
  end

  def mark_as_paid!(payment_method: nil, payment_reference: nil)
    update!(
      status: 'paid',
      paid_date: Date.today,
      payment_method: payment_method,
      payment_reference: payment_reference
    )
  end

  def mark_as_overdue!
    update!(status: 'overdue') if overdue?
  end

  private

  def generate_invoice_number
    return if invoice_number.present?
    
    prefix = case invoice_type
             when 'registration', 'milestone_1', 'milestone_2'
               'INV'
             when 'penalty'
               'PEN'
             when 'exam_fee'
               'EXM'
             when 'upgrade'
               'UPG'
             else
               'INV'
             end
    
    timestamp = Time.current.strftime('%Y%m%d%H%M%S')
    random = SecureRandom.hex(3).upcase
    self.invoice_number = "#{prefix}-#{timestamp}-#{random}"
  end

  def update_student_payment_status
    return unless paid?

    case invoice_type
    when 'milestone_1', 'registration'
      student.update(milestone_1_paid: true)
    when 'milestone_2'
      student.update(milestone_2_paid: true)
    end

    # Update amount paid
    student.increment!(:amount_paid, amount)
  end
end
