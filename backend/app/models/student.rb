class Student < ApplicationRecord
  include AASM

  belongs_to :batch

  validates :status, presence: true
  validates :theory_days_completed, numericality: { greater_than_or_equal_to: 0 }
  validates :practical_days_completed, numericality: { greater_than_or_equal_to: 0 }
  validates :mock_test_score, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 100 }

  aasm column: :status do
    state :registered, initial: true
    state :theory_in_progress
    state :practical_in_progress
    state :exam_eligible
    state :graduated

    event :start_theory do
      transitions from: :registered, to: :theory_in_progress
    end

    event :start_practical do
      # Guard: theory_days >= 35 AND mock_test_score > 37
      transitions from: :theory_in_progress, to: :practical_in_progress,
                  guard: :can_start_practical?
      
      after do
        # Placeholder for Finance::MilestoneTracker integration
        # Rails.logger.info "Triggering Milestone 2 invoice for Student #{id}"
      end
    end

    event :make_eligible do
      # Guard: practical_days >= 52
      transitions from: :practical_in_progress, to: :exam_eligible,
                  guard: :can_make_eligible?
    end

    event :graduate do
      transitions from: :exam_eligible, to: :graduated
    end
  end

  private

  def can_start_practical?
    theory_days_completed >= 35 && mock_test_score > 37
  end

  def can_make_eligible?
    practical_days_completed >= 52
  end
end
