# frozen_string_literal: true

module Lms
  # Records a daily attendance log for a student and increments their
  # theory/practical day counter. Also drives AASM state transitions:
  # registered → theory_in_progress → practical_in_progress → exam_eligible
  class AttendanceRecorder
    attr_reader :student, :params, :errors

    def initialize(student, params)
      @student = student
      @params  = params
      @errors  = []
    end

    def call
      ActiveRecord::Base.transaction do
        log = build_log
        log.save!

        if log.present
          increment_counter(log.phase)
          attempt_transitions
        end
      end

      true
    rescue ActiveRecord::RecordInvalid => e
      @errors = e.record.errors.full_messages
      false
    rescue ActiveRecord::RecordNotUnique
      @errors << "Attendance already logged for this student, phase, and date"
      false
    end

    private

    def build_log
      AttendanceLog.new(
        student:           student,
        phase:             params[:phase],
        attendance_date:   params[:attendance_date],
        present:           params[:present],
        instructor_name:   params[:instructor_name],
        digital_signature: params[:digital_signature],
        notes:             params[:notes]
      )
    end

    def increment_counter(phase)
      column = phase == "theory" ? :theory_days_completed : :practical_days_completed
      student.increment!(column)
      student.update_column(:last_attendance_date, params[:attendance_date])
    end

    def attempt_transitions
      student.start_theory!    if student.may_start_theory?
      student.start_practical! if student.may_start_practical?
      student.make_eligible!   if student.may_make_eligible?
    rescue AASM::InvalidTransition => e
      Rails.logger.warn "[Lms::AttendanceRecorder] AASM transition skipped: #{e.message}"
    end

    def record_mock_test_failure
      student.fail_mock_test! if student.may_fail_mock_test?
    rescue AASM::InvalidTransition => e
      Rails.logger.warn "[Lms::AttendanceRecorder] Mock test failure transition skipped: #{e.message}"
    end

    def record_practical_exam_failure
      student.fail_practical_exam! if student.may_fail_practical_exam?
    rescue AASM::InvalidTransition => e
      Rails.logger.warn "[Lms::AttendanceRecorder] Practical exam failure transition skipped: #{e.message}"
    end

    def record_remedial_completion
      student.complete_remedial! if student.may_complete_remedial?
    rescue AASM::InvalidTransition => e
      Rails.logger.warn "[Lms::AttendanceRecorder] Remedial completion transition skipped: #{e.message}"
    end
  end
end
