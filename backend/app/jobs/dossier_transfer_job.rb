# frozen_string_literal: true

class DossierTransferJob < ApplicationJob
  queue_as :default

  # Placeholder job called by Graduation::Processor after a student graduates.
  # Currently logs a warning; implement actual PDF generation and ERTA transfer
  # when the Meklit API integration for dossier submission is ready.
  def perform(student_id)
    Rails.logger.warn "[DossierTransferJob] Not yet implemented for student #{student_id}"
    # TODO: implement dossier PDF generation and transfer
  end
end
