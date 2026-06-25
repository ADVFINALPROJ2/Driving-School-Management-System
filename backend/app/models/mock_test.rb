# frozen_string_literal: true

class MockTest < ApplicationRecord
  belongs_to :student

  RESULTS  = %w[passed remedial pending].freeze
  PASS_THRESHOLD = 37

  validates :score,     presence: true,
                        numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 100 }
  validates :test_date, presence: true
  validates :result,    inclusion: { in: RESULTS }

  before_save :set_result
  after_save  :sync_student_score

  scope :passed,   -> { where(result: "passed") }
  scope :remedial, -> { where(result: "remedial") }

  def passed?
    result == "passed"
  end

  private

  def set_result
    self.result = score > PASS_THRESHOLD ? "passed" : "remedial"
  end

  def sync_student_score
    student.update_column(:mock_test_score, score)
  end
end
