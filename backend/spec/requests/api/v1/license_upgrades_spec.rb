# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::LicenseUpgrades', type: :request do
  def auth_headers(user)
    token = Warden::JWTAuth::UserEncoder.new.call(user, :user, nil).first
    { "Authorization" => "Bearer #{token}" }
  end

  let(:clerk) { create(:user, :clerk) }
  let(:batch) { create(:batch) }
  let(:student) { create(:student, batch: batch) }
  let!(:upgrade) { create(:license_upgrade, student: student) }

  describe 'GET /api/v1/license_upgrades' do
    it 'requires authentication' do
      get '/api/v1/license_upgrades'
      expect(response).to have_http_status(:unauthorized)
    end

    it 'returns all license upgrades' do
      get '/api/v1/license_upgrades', headers: auth_headers(clerk)
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body['data']).to be_an(Array)
      expect(body['data'].length).to eq(1)
    end

    it 'filters by status' do
      get '/api/v1/license_upgrades?status=pending', headers: auth_headers(clerk)
      body = JSON.parse(response.body)
      expect(body['data'].length).to eq(1)
    end
  end

  describe 'GET /api/v1/license_upgrades/:id' do
    it 'returns a specific upgrade' do
      get "/api/v1/license_upgrades/#{upgrade.id}", headers: auth_headers(clerk)
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)['data']['id']).to eq(upgrade.id)
    end

    it 'returns 404 for missing upgrade' do
      get '/api/v1/license_upgrades/0', headers: auth_headers(clerk)
      expect(response).to have_http_status(:not_found)
    end
  end

  describe 'POST /api/v1/license_upgrades' do
    let(:valid_params) do
      {
        license_upgrade: {
          student_id: student.id,
          prior_license_key: "AA-12345678",
          license_origin: "Addis Ababa",
          license_issue_date: 4.years.ago.to_date,
          target_category: "Public 2"
        }
      }
    end

    it 'creates a license upgrade request' do
      expect {
        post '/api/v1/license_upgrades', params: valid_params, headers: auth_headers(clerk)
      }.to change(LicenseUpgrade, :count).by(1)
      expect(response).to have_http_status(:created)
    end

    it 'returns error for missing params' do
      post '/api/v1/license_upgrades', params: {}, headers: auth_headers(clerk)
      expect(response).to have_http_status(:bad_request)
    end
  end

  describe 'POST /api/v1/license_upgrades/:id/approve' do
    it 'approves a pending upgrade' do
      post "/api/v1/license_upgrades/#{upgrade.id}/approve", headers: auth_headers(clerk)
      expect(response).to have_http_status(:ok)
      expect(upgrade.reload.status).to eq('approved')
    end

    it 'returns 404 for non-existent upgrade' do
      post '/api/v1/license_upgrades/0/approve', headers: auth_headers(clerk)
      expect(response).to have_http_status(:not_found)
    end
  end
end
