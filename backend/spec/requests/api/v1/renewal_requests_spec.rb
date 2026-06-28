# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::RenewalRequests', type: :request do
  def auth_headers(user)
    token = Warden::JWTAuth::UserEncoder.new.call(user, :user, nil).first
    { "Authorization" => "Bearer #{token}" }
  end

  let(:clerk) { create(:user, :clerk) }
  let!(:renewal) { create(:renewal_request) }

  describe 'GET /api/v1/renewal_requests' do
    it 'requires authentication' do
      get '/api/v1/renewal_requests'
      expect(response).to have_http_status(:unauthorized)
    end

    it 'returns all renewal requests' do
      get '/api/v1/renewal_requests', headers: auth_headers(clerk)
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body['data']).to be_an(Array)
      expect(body['data'].length).to eq(1)
    end
  end

  describe 'GET /api/v1/renewal_requests/:id' do
    it 'returns a specific request' do
      get "/api/v1/renewal_requests/#{renewal.id}", headers: auth_headers(clerk)
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)['data']['id']).to eq(renewal.id)
    end

    it 'returns 404 for missing request' do
      get '/api/v1/renewal_requests/0', headers: auth_headers(clerk)
      expect(response).to have_http_status(:not_found)
    end
  end

  describe 'POST /api/v1/renewal_requests' do
    let(:valid_params) do
      {
        renewal_request: {
          full_name: "Test Driver",
          phone_number: "+251911111111",
          email: "test@example.com",
          prior_license_number: "AA-87654321",
          blood_type: "O+",
          eye_acuity_test: "20/20",
          medical_data_updated: true,
          registered_kifle_ketema: "Bole"
        }
      }
    end

    it 'creates a renewal request' do
      expect {
        post '/api/v1/renewal_requests', params: valid_params, headers: auth_headers(clerk)
      }.to change(RenewalRequest, :count).by(1)
      expect(response).to have_http_status(:created)
    end

    it 'returns error for missing params' do
      post '/api/v1/renewal_requests', params: {}, headers: auth_headers(clerk)
      expect(response).to have_http_status(:bad_request)
    end
  end
end
