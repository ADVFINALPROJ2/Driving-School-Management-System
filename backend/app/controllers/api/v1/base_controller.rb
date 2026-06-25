# frozen_string_literal: true

module Api
  module V1
    class BaseController < ApplicationController
      # Skip CSRF for API
      skip_before_action :verify_authenticity_token

      # Devise authentication
      before_action :authenticate_user!

      # Error handling
      rescue_from ActiveRecord::RecordNotFound, with: :not_found_error
      rescue_from ActiveRecord::RecordInvalid, with: :validation_error
      rescue_from ActionController::ParameterMissing, with: :parameter_missing_error

      private

      # Current user helper (provided by Devise)
      def current_user
        @current_user ||= warden.authenticate!(scope: :user)
      end

      # Standardized JSON response
      def render_success(data, status: :ok, message: nil)
        response = {
          success: true,
          data: data
        }
        response[:message] = message if message.present?
        
        render json: response, status: status
      end

      def render_error(message, status: :unprocessable_entity, errors: nil, code: nil)
        response = {
          success: false,
          error: {
            message: message
          }
        }
        response[:error][:code] = code if code.present?
        response[:error][:details] = errors if errors.present?
        
        render json: response, status: status
      end

      # Error handlers
      def not_found_error(exception)
        render_error(
          'Resource not found',
          status: :not_found,
          code: 'NOT_FOUND',
          errors: { resource: exception.message }
        )
      end

      def validation_error(exception)
        render_error(
          'Validation failed',
          status: :unprocessable_entity,
          code: 'VALIDATION_ERROR',
          errors: exception.record.errors.as_json
        )
      end

      def parameter_missing_error(exception)
        render_error(
          "Missing required parameter: #{exception.param}",
          status: :bad_request,
          code: 'PARAMETER_MISSING'
        )
      end

      # Authorization helper (to be used with Pundit later)
      def authorize_action!(record, action = nil)
        # Placeholder for Pundit authorization
        # Will implement with Pundit policies in next sprint
        true
      end
    end
  end
end
