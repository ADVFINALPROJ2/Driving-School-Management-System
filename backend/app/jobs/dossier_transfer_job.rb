# frozen_string_literal: true

class DossierTransferJob < ApplicationJob
  queue_as :default

  def perform(student_id)
    student = Student.find(student_id)
    record  = student.graduation_record

    return unless record
    return if record.transferred?

    compile_dossier(record, student)
    transfer_dossier(record, student)
  rescue ActiveRecord::RecordNotFound
    Rails.logger.error "[DossierTransferJob] Student #{student_id} not found"
  end

  private

  def compile_dossier(record, student)
    Rails.logger.info "[DossierTransferJob] Compiling dossier for student #{student.id}"

    contents = {
      compiled_at: Time.current.iso8601,
      student_name: "#{student.first_name} #{student.middle_name} #{student.last_name}",
      student_id: student.student_id,
      n_number: student.n_number,
      batch: student.batch&.name,
      graduation_date: record.graduation_date.iso8601,
      transfer_destination: record.transfer_destination,
      documents: %w[profile_photo yellow_card grade_8 grade_10 grade_12 medical].filter_map do |doc|
        next unless student.respond_to?(doc) && student.send(doc).attached?

        { name: doc, filename: student.send(doc).filename.to_s }
      end,
      exam_results: student.exam_bookings.where(status: "completed").map do |booking|
        { exam_type: booking.exam_type, score: booking.score, scheduled_date: booking.scheduled_date&.iso8601 }
      end
    }

    record.update!(dossier_status: "ready", dossier_contents: contents)
    Rails.logger.info "[DossierTransferJob] Dossier compiled and marked ready for student #{student.id}"
  end

  def transfer_dossier(record, student)
    destination = record.transfer_destination.presence || "ERTA (Default)"
    Rails.logger.info "[DossierTransferJob] Transferring dossier for student #{student.id} to #{destination}"

    record.update!(dossier_status: "transferred")
    Rails.logger.info "[DossierTransferJob] Dossier transferred successfully for student #{student.id}"
  end
end
