module ERTA
  class NNumberAssignment
    attr_reader :student, :errors

    def initialize(student)
      @student = student
      @errors = []
    end

    def assign(n_number)
      validate_countdown_window
      validate_n_number_format(n_number)
      return false if errors.any?

      student.update!(n_number: n_number)
      Rails.logger.info "[NNumberAssignment] Assigned n_number #{n_number} to Student #{student.student_id}"
      true
    rescue ActiveRecord::RecordInvalid => e
      @errors = e.record.errors.full_messages
      false
    end

    def eligible?
      return false unless student.meklit_approval_date

      days_elapsed = (Date.current - student.meklit_approval_date.to_date).to_i

      required_days = case student.license_category
      when "motor", "auto" then 35
      else 52
      end

      days_elapsed >= required_days
    end

    def days_remaining
      return nil unless student.meklit_approval_date

      required_days = case student.license_category
      when "motor", "auto" then 35
      else 52
      end

      days_elapsed = (Date.current - student.meklit_approval_date.to_date).to_i
      [ required_days - days_elapsed, 0 ].max
    end

    private

    def validate_countdown_window
      unless eligible?
        errors << "Statutory waiting period not yet completed (#{days_remaining} days remaining)"
      end
    end

    def validate_n_number_format(n_number)
      if n_number.blank?
        errors << "N-number cannot be blank"
      end
    end
  end
end
