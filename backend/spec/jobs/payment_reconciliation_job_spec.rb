# frozen_string_literal: true

require 'rails_helper'

RSpec.describe PaymentReconciliationJob, type: :job do
  describe '#perform' do
    let(:batch) { create(:batch) }
    let!(:student1) { create(:student, batch: batch, total_fee: 8000, amount_paid: 8000) }
    let!(:student2) { create(:student, batch: batch, total_fee: 10000, amount_paid: 9000) }

    it 'calls PaymentReconciliation service' do
      expect(Finance::PaymentReconciliation).to receive(:new).and_call_original
      described_class.perform_now
    end

    it 'reconciles all students' do
      service_double = instance_double(Finance::PaymentReconciliation)
      allow(Finance::PaymentReconciliation).to receive(:new).and_return(service_double)
      allow(service_double).to receive(:reconcile_all).and_return({ total_students_checked: 2 })
      allow(service_double).to receive(:generate_report).and_return({ summary: { discrepancies_found: 0 } })

      described_class.perform_now

      expect(service_double).to have_received(:reconcile_all)
      expect(service_double).to have_received(:generate_report)
    end

    it 'logs results' do
      # The job logs several additional info lines (report breakdown); allow
      # those and assert only the key milestones.
      allow(Rails.logger).to receive(:info)
      expect(Rails.logger).to receive(:info).with(/PaymentReconciliationJob started/)
      expect(Rails.logger).to receive(:info).with(/Students checked/)
      expect(Rails.logger).to receive(:info).with(/PaymentReconciliationJob completed/)

      described_class.perform_now
    end

    context 'with specific date' do
      it 'uses provided date' do
        test_date = Date.new(2024, 1, 15)

        expect(Finance::PaymentReconciliation).to receive(:new)
          .with(start_date: test_date, end_date: test_date)
          .and_call_original

        described_class.perform_now(date: test_date)
      end
    end

    context 'error handling' do
      it 'retries via retry_on when reconciliation raises' do
        allow(Finance::PaymentReconciliation).to receive(:new).and_raise(StandardError, 'Test error')

        # retry_on (see PaymentReconciliationJob) intercepts the error and
        # re-enqueues the job rather than propagating on the first attempt,
        # so assert a retry was scheduled.
        expect {
          described_class.perform_now
        }.to have_enqueued_job(described_class)
      end

      it 'logs errors' do
        allow(Finance::PaymentReconciliation).to receive(:new).and_raise(StandardError, 'Test error')

        # The job logs the failure (with the error message) and the backtrace.
        allow(Rails.logger).to receive(:error)
        expect(Rails.logger).to receive(:error).with(/PaymentReconciliationJob failed.*Test error/)

        begin
          described_class.perform_now
        rescue StandardError
          # Expected
        end
      end
    end
  end
end
