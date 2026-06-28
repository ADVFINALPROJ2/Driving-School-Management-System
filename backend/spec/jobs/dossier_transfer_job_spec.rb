require "rails_helper"

RSpec.describe DossierTransferJob, type: :job do
  let(:student) { create(:student, status: "graduated") }
  let!(:record) { create(:graduation_record, student: student, dossier_status: "compiling") }

  it "updates dossier_status to transferred" do
    described_class.perform_now(student.id)
    expect(record.reload.dossier_status).to eq("transferred")
  end

  it "compiles dossier contents with student info and documents" do
    described_class.perform_now(student.id)
    record.reload
    expect(record.dossier_contents).to include("student_id", "compiled_at", "documents", "exam_results")
    expect(record.dossier_contents["student_name"]).to eq("#{student.first_name} #{student.middle_name} #{student.last_name}")
  end

  it "passes through 'ready' status before 'transferred'" do
    described_class.perform_now(student.id)
    expect(record.reload.dossier_status).to eq("transferred")
  end

  it "is idempotent — does not change status if already transferred" do
    record.update!(dossier_status: "transferred")
    described_class.perform_now(student.id)
    expect(record.reload.dossier_status).to eq("transferred")
  end

  it "does not raise when student is not found" do
    expect { described_class.perform_now(0) }.not_to raise_error
  end
end
