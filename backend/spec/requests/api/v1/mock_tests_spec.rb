# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::V1::MockTests", type: :request do
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
  let!(:mock_test) { create(:mock_test, student: student, score: 45, test_date: Date.yesterday) }

  describe "GET /api/v1/students/:student_id/mock_tests" do
    it "requires authentication" do
      get "/api/v1/students/#{student.id}/mock_tests"
      expect(response).to have_http_status(:unauthorized)
    end

    it "returns mock tests for a student" do
      get "/api/v1/students/#{student.id}/mock_tests", headers: auth_headers(instructor)
      expect(response).to have_http_status(:ok)
      expect(json["data"].size).to eq(1)
    end
  end

  describe "POST /api/v1/students/:student_id/mock_tests" do
    it "requires authentication" do
      post "/api/v1/students/#{student.id}/mock_tests",
           params: { mock_test: { score: 80, test_date: Date.today.to_s } }, as: :json
      expect(response).to have_http_status(:unauthorized)
    end

    it "forbids student role" do
      post "/api/v1/students/#{student.id}/mock_tests",
           headers: auth_headers(student_user),
           params: { mock_test: { score: 80, test_date: Date.today.to_s } }, as: :json
      expect(response).to have_http_status(:forbidden)
    end

    it "records the mock test and syncs the score to the student" do
      student = create(:student, status: "theory_in_progress")

      post "/api/v1/students/#{student.id}/mock_tests",
           headers: auth_headers(instructor),
           params: { mock_test: { score: 80, test_date: Date.today.to_s } }, as: :json

      expect(response).to have_http_status(:created)
      expect(student.reload.mock_test_score).to eq(80)
    end

    it "allows clerk to record a mock test" do
      expect {
        post "/api/v1/students/#{student.id}/mock_tests",
             headers: auth_headers(clerk),
             params: { mock_test: { score: 60, test_date: Date.today.to_s } }, as: :json
      }.to change(MockTest, :count).by(1)
      expect(response).to have_http_status(:created)
    end

    it "advances a theory-complete student to practical when the mock passes" do
      student = create(:student, status: "theory_in_progress",
                                 theory_days_completed: 35, mock_test_score: 0)

      post "/api/v1/students/#{student.id}/mock_tests",
           headers: auth_headers(instructor),
           params: { mock_test: { score: 50, test_date: Date.today.to_s } }, as: :json

      expect(response).to have_http_status(:created)
      expect(student.reload.status).to eq("practical_in_progress")
    end

    it "does not advance the student when the mock fails" do
      student = create(:student, status: "theory_in_progress",
                                 theory_days_completed: 35, mock_test_score: 0)

      post "/api/v1/students/#{student.id}/mock_tests",
           headers: auth_headers(instructor),
           params: { mock_test: { score: 20, test_date: Date.today.to_s } }, as: :json

      expect(student.reload.status).to eq("theory_in_progress")
    end
  end
end
