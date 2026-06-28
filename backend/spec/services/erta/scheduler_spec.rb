require "rails_helper"

RSpec.describe ERTA::Scheduler do
  subject(:scheduler) { described_class.new(student) }

  let(:student) { build_stubbed(:student, status: "exam_eligible") }

  describe "#book_slot" do
    context "when student is eligible" do
      it "creates an exam booking" do
        booking = scheduler.book_slot(exam_type: "theory")
        expect(booking).to be_persisted
        expect(booking.exam_type).to eq("theory")
        expect(booking.status).to eq("scheduled")
      end
    end

    context "when student is not eligible" do
      let(:student) { build_stubbed(:student, status: "registered") }

      it "returns false and adds errors" do
        expect(scheduler.book_slot(exam_type: "theory")).to be false
        expect(scheduler.errors).to include("Student is not exam eligible")
      end
    end
  end

  describe "#available_slots" do
    it "returns a list of future dates" do
      slots = scheduler.available_slots(exam_type: "theory")
      expect(slots.size).to eq(10)
      slots.each { |d| expect(d).to be > Date.current }
    end
  end
end
