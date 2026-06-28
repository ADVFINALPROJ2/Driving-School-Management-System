# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::V1::PayrollEntries", type: :request do
  def auth_headers(user)
    token = Warden::JWTAuth::UserEncoder.new.call(user, :user, nil).first
    { "Authorization" => "Bearer #{token}" }
  end

  let(:admin) { create(:user, :admin) }
  let(:instructor) { create(:user, :instructor) }
  let(:clerk) { create(:user, :clerk) }
  let(:other_instructor) { create(:user, :instructor) }

  let!(:instructor_entry) { create(:payroll_entry, user: instructor) }
  let!(:other_entry) { create(:payroll_entry, user: other_instructor) }

  describe "GET /api/v1/payroll_entries" do
    it "requires authentication" do
      get "/api/v1/payroll_entries"
      expect(response).to have_http_status(:unauthorized)
    end

    it "allows admin to see all entries" do
      get "/api/v1/payroll_entries", headers: auth_headers(admin)
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body["data"].size).to eq(2)
    end

    it "allows clerk to see all entries" do
      get "/api/v1/payroll_entries", headers: auth_headers(clerk)
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body["data"].size).to eq(2)
    end

    it "scopes instructor to their own entries" do
      get "/api/v1/payroll_entries", headers: auth_headers(instructor)
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body["data"].size).to eq(1)
      expect(body["data"].first["user_id"]).to eq(instructor.id)
    end
  end

  describe "GET /api/v1/payroll_entries/:id" do
    it "returns a specific entry for admin" do
      get "/api/v1/payroll_entries/#{instructor_entry.id}", headers: auth_headers(admin)
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)["data"]["id"]).to eq(instructor_entry.id)
    end

    it "allows instructor to view their own entry" do
      get "/api/v1/payroll_entries/#{instructor_entry.id}", headers: auth_headers(instructor)
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)["data"]["id"]).to eq(instructor_entry.id)
    end

    it "forbids instructor from viewing another instructor's entry" do
      get "/api/v1/payroll_entries/#{other_entry.id}", headers: auth_headers(instructor)
      expect(response).to have_http_status(:forbidden)
    end
  end
end
