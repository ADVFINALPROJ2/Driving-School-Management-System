# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Meklit::ResponseHandler, type: :service do
  let(:batch) { create(:batch, status: 'submitted') }
  let(:student) { create(:student, batch: batch, status: 'exam_eligible') }

  before do
    batch.students << student
  end

  describe '#call' do
    context 'when response is approved' do
      it 'updates batch status to approved' do
        response_data = { status: 'approved' }
        handler = described_class.new(batch, response_data)

        expect(handler.call).to be true
        expect(batch.reload.status).to eq('approved')
        expect(batch.approved_at).not_to be_nil
      end

      it 'updates all students to graduated' do
        response_data = { status: 'approved' }
        handler = described_class.new(batch, response_data)
        handler.call

        expect(student.reload.status).to eq('graduated')
      end
    end

    context 'when response is rejected' do
      it 'updates batch status to rejected' do
        response_data = { status: 'rejected', reason: 'Invalid documents' }
        handler = described_class.new(batch, response_data)

        expect(handler.call).to be true
        expect(batch.reload.status).to eq('rejected')
        expect(batch.rejection_reason).to eq('Invalid documents')
      end

      it 'updates students back to exam_eligible' do
        student.update!(status: 'graduated')
        response_data = { status: 'rejected', reason: 'Invalid documents' }
        handler = described_class.new(batch, response_data)
        handler.call

        expect(student.reload.status).to eq('exam_eligible')
      end
    end

    context 'when response is partial approval' do
      it 'updates batch status to approved' do
        response_data = { status: 'partial' }
        handler = described_class.new(batch, response_data)

        expect(handler.call).to be true
        expect(batch.reload.status).to eq('approved')
      end

      it 'processes individual student responses' do
        student2 = create(:student, batch: batch, student_id: 'STU002', status: 'exam_eligible')
        batch.students << student2

        response_data = {
          status: 'partial',
          students: [
            { student_id: student.student_id, status: 'approved' },
            { student_id: student2.student_id, status: 'rejected', reason: 'Missing document' }
          ]
        }
        handler = described_class.new(batch, response_data)
        handler.call

        expect(student.reload.status).to eq('graduated')
        expect(student2.reload.status).to eq('exam_eligible')
      end
    end

    context 'when response data is invalid' do
      it 'returns false for nil response' do
        handler = described_class.new(batch, nil)
        expect(handler.call).to be false
      end

      it 'returns false for response without status' do
        handler = described_class.new(batch, {})
        expect(handler.call).to be false
      end
    end
  end
end
