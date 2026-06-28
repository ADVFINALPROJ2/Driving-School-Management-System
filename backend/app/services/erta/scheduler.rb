module ERTA
  class Scheduler
    SLOT_WINDOW_DAYS = 14

    attr_reader :student, :errors

    def initialize(student)
      @student = student
      @errors = []
    end

    def book_slot(exam_type:, preferred_date: nil)
      validate_eligibility(exam_type)
      return false if errors.any?

      slot_date = preferred_date || next_available_slot(exam_type)
      validate_slot_date(slot_date)
      return false if errors.any?

      ExamBooking.create!(
        student: student,
        exam_type: exam_type,
        scheduled_date: slot_date,
        status: "scheduled"
      )
    rescue ActiveRecord::RecordInvalid => e
      @errors = e.record.errors.full_messages
      false
    end

    def next_available_slot(exam_type)
      Date.current + 1.day
    end

    def available_slots(exam_type:, from_date: Date.current)
      existing = ExamBooking.where(student: student, exam_type: exam_type)
                            .where(scheduled_date: from_date..)
                            .pluck(:scheduled_date)

      slots = []
      cursor = from_date + 1.day
      while slots.size < 10
        unless existing.include?(cursor)
          slots << cursor
        end
        cursor += 1.day
      end
      slots
    end

    private

    def validate_eligibility(exam_type)
      unless student.exam_eligible?
        errors << "Student is not exam eligible"
      end
    end

    def validate_slot_date(date)
      if date <= Date.current
        errors << "Slot date must be in the future"
      end
    end
  end
end
