require "rails_helper"

RSpec.describe PenaltyInvoiceGeneratorJob, type: :job do
  let!(:student) { create(:student, status: "practical_in_progress", student_id: "PEN001", document_id: "DOCPEN") }

  describe "#perform" do
    context "with exam_failure penalty type" do
      it "creates a penalty invoice and transitions student state" do
        expect {
          described_class.perform_now(
            student_id: student.id,
            penalty_type: "exam_failure",
            attempt_number: 1
          )
        }.to change(Invoice, :count).by(1)

        invoice = Invoice.last
        expect(invoice.amount).to eq(300)
        expect(invoice.milestone_type).to eq("Government Penalty")

        expect(student.reload.under_penalty).to be true
      end
    end
  end
end
