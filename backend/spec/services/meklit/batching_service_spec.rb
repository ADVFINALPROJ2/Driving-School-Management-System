# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Meklit::BatchingService, type: :service do
  let(:batch) { create(:batch, status: 'pending') }
  let(:student) { create(:student, batch: batch, status: 'exam_eligible') }

  before do
    batch.students << student
  end

  describe '#call' do
    context 'when batch export succeeds' do
      before do
        allow(Meklit::MeklitApiClient).to receive(:new).and_return(
          instance_double(Meklit::MeklitApiClient, submit_batch: { success: true, data: { batch_id: 1 } })
        )
        allow(MeklitBatchExportJob).to receive(:set).and_return(
          instance_double(ActiveJob::ConfiguredJob, perform_later: true)
        )
      end

      it 'validates all students' do
        service = described_class.new(batch)
        expect(Meklit::QualificationValidator).to receive(:new).at_least(:once).and_return(
          instance_double(Meklit::QualificationValidator, call: true)
        )
        service.call
      end

      it 'generates payload' do
        service = described_class.new(batch)
        expect(Meklit::PayloadGenerator).to receive(:new).with(batch).and_return(
          instance_double(Meklit::PayloadGenerator, generate: { batch: {} })
        )
        service.call
      end

      it 'submits to API' do
        service = described_class.new(batch)
        service.call
        expect(batch.reload.status).to eq('submitted')
        expect(batch.submitted_at).not_to be_nil
      end

      it 'schedules response check job' do
        service = described_class.new(batch)
        expect(MeklitBatchExportJob).to receive(:set).with(wait: 5.minutes)
        service.call
      end

      it 'returns success result' do
        service = described_class.new(batch)
        result = service.call
        expect(result[:success]).to be true
        expect(result[:batch_id]).to eq(batch.id)
      end
    end

    context 'when batch is already submitted' do
      before do
        batch.update!(status: 'submitted', submitted_at: 1.day.ago)
      end

      it 'returns error' do
        service = described_class.new(batch)
        result = service.call
        expect(result[:success]).to be false
        expect(result[:error]).to include('already submitted')
      end
    end

    context 'when batch is already approved' do
      before do
        batch.update!(status: 'approved', approved_at: 1.day.ago)
      end

      it 'returns error' do
        service = described_class.new(batch)
        result = service.call
        expect(result[:success]).to be false
        expect(result[:error]).to include('already approved')
      end
    end

    context 'when student validation fails' do
      before do
        allow(Meklit::QualificationValidator).to receive(:new).and_return(
          instance_double(Meklit::QualificationValidator, call: false)
        )
      end

      it 'returns error' do
        service = described_class.new(batch)
        result = service.call
        expect(result[:success]).to be false
        expect(result[:error]).to include('validation failed')
      end
    end

    context 'when API submission fails' do
      before do
        allow(Meklit::MeklitApiClient).to receive(:new).and_return(
          instance_double(Meklit::MeklitApiClient, submit_batch: { success: false, error: 'API error' })
        )
      end

      it 'returns error' do
        service = described_class.new(batch)
        result = service.call
        expect(result[:success]).to be false
        expect(result[:error]).to include('API submission failed')
      end
    end
  end
end
