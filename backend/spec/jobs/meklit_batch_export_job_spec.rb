# frozen_string_literal: true

require 'rails_helper'

RSpec.describe MeklitBatchExportJob, type: :job do
  let(:batch) { create(:batch, status: 'submitted') }
  let(:student) { create(:student, batch: batch, status: 'exam_eligible') }

  before do
    batch.students << student
  end

  describe '#perform' do
    context 'when batch response is approved' do
      before do
        allow(Meklit::MeklitApiClient).to receive(:new).and_return(
          instance_double(Meklit::MeklitApiClient, get_batch_response: { success: true, data: { status: 'approved' } })
        )
        allow(Meklit::ResponseHandler).to receive(:new).and_return(
          instance_double(Meklit::ResponseHandler, call: true)
        )
      end

      it 'checks batch status from API' do
        expect(Meklit::MeklitApiClient).to receive(:new)
        described_class.perform_now(batch.id)
      end

      it 'processes the response' do
        expect(Meklit::ResponseHandler).to receive(:new).with(batch, { status: 'approved' })
        described_class.perform_now(batch.id)
      end
    end

    context 'when batch is already approved' do
      before do
        batch.update!(status: 'approved', approved_at: 1.day.ago)
      end

      it 'skips processing' do
        expect(Meklit::MeklitApiClient).not_to receive(:new)
        described_class.perform_now(batch.id)
      end
    end

    context 'when batch is already rejected' do
      before do
        batch.update!(status: 'rejected', rejection_reason: 'Test')
      end

      it 'skips processing' do
        expect(Meklit::MeklitApiClient).not_to receive(:new)
        described_class.perform_now(batch.id)
      end
    end

    context 'when API request fails' do
      before do
        allow(Meklit::MeklitApiClient).to receive(:new).and_return(
          instance_double(Meklit::MeklitApiClient, get_batch_response: { success: false, error: 'API error' })
        )
        allow_any_instance_of(described_class).to receive(:schedule_retry)
      end

      it 'schedules a retry' do
        expect_any_instance_of(described_class).to receive(:schedule_retry).with(batch.id)
        described_class.perform_now(batch.id)
      end
    end

    context 'when batch is not found' do
      it 'logs error and does not crash' do
        expect { described_class.perform_now(99999) }.not_to raise_error
      end
    end
  end
end
