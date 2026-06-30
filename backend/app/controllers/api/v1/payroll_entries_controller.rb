# frozen_string_literal: true

module Api
  module V1
    class PayrollEntriesController < BaseController
      before_action :set_payroll_entry, only: [ :show ]

      def index
        payroll_entries = policy_scope(PayrollEntry)

        if params[:user_id].present?
          payroll_entries = payroll_entries.where(user_id: params[:user_id])
        end

        if params[:period_start].present?
          payroll_entries = payroll_entries.where("period_start >= ?", params[:period_start])
        end

        if params[:period_end].present?
          payroll_entries = payroll_entries.where("period_end <= ?", params[:period_end])
        end

        page = params[:page] || 1
        per_page = params[:per_page] || 20
        payroll_entries = payroll_entries.page(page).per(per_page)

        render json: {
          success: true,
          data: payroll_entries.map { |entry| payroll_entry_json(entry) },
          meta: pagination_meta(payroll_entries)
        }, status: :ok
      end

      def show
        authorize @payroll_entry

        render json: {
          success: true,
          data: payroll_entry_json(@payroll_entry)
        }, status: :ok
      end

      private

      def set_payroll_entry
        @payroll_entry = PayrollEntry.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: {
          success: false,
          errors: [ "Payroll entry not found" ]
        }, status: :not_found
      end

      def payroll_entry_json(entry)
        {
          id: entry.id,
          user_id: entry.user_id,
          instructor_name: entry.user&.full_name,
          base_pay: entry.base_pay,
          active_student_loads: entry.active_student_loads,
          active_training_days: entry.active_training_days,
          total_pay: entry.total_pay,
          period_start: entry.period_start,
          period_end: entry.period_end,
          status: entry.status,
          paid_at: entry.paid_at,
          created_at: entry.created_at,
          updated_at: entry.updated_at
        }
      end

      def pagination_meta(collection)
        {
          current_page: collection.current_page,
          total_pages: collection.total_pages,
          total_count: collection.total_count,
          per_page: collection.limit_value
        }
      end
    end
  end
end
