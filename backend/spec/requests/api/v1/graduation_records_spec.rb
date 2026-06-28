# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::GraduationRecords', type: :request do
  def auth_headers(user)
    token = Warden::JWTAuth::UserEncoder.new.call(user, :user, nil).first
    { "Authorization" => "Bearer #{token}" }
  end

  let(:clerk) { create(:user, :clerk) }
  let(:batch) { create(:batch) }

  describe 'GET /api/v1/students/:student_id/graduation_record' do
    let(:student) { create(:student, batch: batch) }

    before do
      create(:graduation_record, student: student)
    end

    it 'requires authentication' do
      get "/api/v1/students/#{student.id}/graduation_record"
      expect(response).to have_http_status(:unauthorized)
    end

    it 'returns the graduation record' do
      get "/api/v1/students/#{student.id}/graduation_record", headers: auth_headers(clerk)
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body['success']).to be true
      expect(body['data']['id']).to be_present
    end

    it 'returns 404 when no record exists' do
      student_no_record = create(:student, batch: batch)
      get "/api/v1/students/#{student_no_record.id}/graduation_record", headers: auth_headers(clerk)
      expect(response).to have_http_status(:not_found)
    end

    it 'returns 404 for missing student' do
      get '/api/v1/students/0/graduation_record', headers: auth_headers(clerk)
      expect(response).to have_http_status(:not_found)
    end
  end

  describe 'POST /api/v1/students/:student_id/graduation_record' do
    let(:student) { create(:student, batch: batch) }

    it 'requires authentication' do
      post "/api/v1/students/#{student.id}/graduation_record"
      expect(response).to have_http_status(:unauthorized)
    end

    it 'returns 422 when graduation prerequisites not met' do
      post "/api/v1/students/#{student.id}/graduation_record", headers: auth_headers(clerk)
      expect(response).to have_http_status(:unprocessable_entity)
    end

    it 'returns 404 for missing student' do
      post '/api/v1/students/0/graduation_record', headers: auth_headers(clerk)
      expect(response).to have_http_status(:not_found)
    end
  end
end
