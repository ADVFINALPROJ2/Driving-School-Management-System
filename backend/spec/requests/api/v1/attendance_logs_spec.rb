# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::V1::AttendanceLogs", type: :request do
  def json
    JSON.parse(response.body)
  end

  def auth_headers(user)
    token = Warden::JWTAuth::UserEncoder.new.call(user, :user, nil).first
    { "Authorization" => "Bearer #{token}" }
  end

  let(:instructor) { create(:user, :instructor) }
  let(:clerk)      { create(:user, :clerk) }
  let(:student_user) { create(:user) }
  let(:student)    { create(:student, status: "theory_in_progress") }
  let!(:log)       { create(:attendance_log, student: student, phase: "theory", attendance_date: Date.yesterday) }

  describe "GET /api/v1/students/:student_id/attendance_logs" do
    it "requires authentication" do
      get "/api/v1/students/#{student.id}/attendance_logs"
      expect(response).to have_http_status(:unauthorized)
    end

    it "returns attendance logs for a student" do
      get "/api/v1/students/#{student.id}/attendance_logs", headers: auth_headers(instructor)
      expect(response).to have_http_status(:ok)
      expect(json["data"].size).to eq(1)
    end

    it "filters by phase" do
      create(:attendance_log, student: student, phase: "practical", attendance_date: Date.today)
      get "/api/v1/students/#{student.id}/attendance_logs",
          headers: auth_headers(instructor), params: { phase: "practical" }
      expect(json["data"].size).to eq(1)
      expect(json["data"].first["phase"]).to eq("practical")
    end

    it "returns 400 for malformed date" do
      get "/api/v1/students/#{student.id}/attendance_logs",
          headers: auth_headers(instructor), params: { date: "not-a-date" }
      expect(response).to have_http_status(:bad_request)
    end
  end

  describe "POST /api/v1/students/:student_id/attendance_logs" do
    let(:valid_params) do
      { attendance_log: { phase: "theory", attendance_date: Date.today.to_s,
                          present: true, instructor_name: "Abebe Kebede" } }
    end

    it "requires authentication" do
      post "/api/v1/students/#{student.id}/attendance_logs", params: valid_params, as: :json
      expect(response).to have_http_status(:unauthorized)
    end

    it "forbids student role" do
      post "/api/v1/students/#{student.id}/attendance_logs",
           headers: auth_headers(student_user), params: valid_params, as: :json
      expect(response).to have_http_status(:forbidden)
    end

    it "logs attendance and increments theory days" do
      expect do
        post "/api/v1/students/#{student.id}/attendance_logs",
             headers: auth_headers(instructor), params: valid_params, as: :json
      end.to change { student.reload.theory_days_completed }.by(1)
      expect(response).to have_http_status(:created)
    end

    it "allows clerk to log attendance" do
      expect do
        post "/api/v1/students/#{student.id}/attendance_logs",
             headers: auth_headers(clerk), params: valid_params, as: :json
      end.to change(AttendanceLog, :count).by(1)
      expect(response).to have_http_status(:created)
    end

    it "returns 422 when present is missing" do
      params = { attendance_log: { phase: "theory", attendance_date: Date.today.to_s } }
      post "/api/v1/students/#{student.id}/attendance_logs",
           headers: auth_headers(instructor), params: params, as: :json
      expect(response).to have_http_status(:unprocessable_entity)
    end
  end
end
