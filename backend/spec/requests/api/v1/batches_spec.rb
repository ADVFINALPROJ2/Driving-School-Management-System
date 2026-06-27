# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::Batches', type: :request do
  def auth_headers(user)
    token = Warden::JWTAuth::UserEncoder.new.call(user, :user, nil).first
    { "Authorization" => "Bearer #{token}" }
  end

  let(:admin)      { create(:user, :admin) }
  let(:clerk)      { create(:user, :clerk) }
  let(:instructor) { create(:user, :instructor) }
  let(:student_user) { create(:user) }

  describe 'GET /api/v1/batches' do
    it 'requires authentication' do
      get '/api/v1/batches'
      expect(response).to have_http_status(:unauthorized)
    end

    it 'forbids student role' do
      get '/api/v1/batches', headers: auth_headers(student_user)
      expect(response).to have_http_status(:forbidden)
    end

    it 'allows admin to view batches' do
      create_list(:batch, 2)
      get '/api/v1/batches', headers: auth_headers(admin)
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body['success']).to be true
      expect(body['data']['batches'].size).to eq(2)
    end

    it 'allows instructor to view batches' do
      create_list(:batch, 2)
      get '/api/v1/batches', headers: auth_headers(instructor)
      expect(response).to have_http_status(:ok)
    end

    it 'returns all batches when authenticated as clerk' do
      create_list(:batch, 3)
      get '/api/v1/batches', headers: auth_headers(clerk)
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body['success']).to be true
      expect(body['data']['batches'].size).to eq(3)
      expect(body['data']['meta']['total']).to eq(3)
    end
  end

  describe 'GET /api/v1/batches/:id' do
    let(:batch) { create(:batch) }

    it 'requires authentication' do
      get "/api/v1/batches/#{batch.id}"
      expect(response).to have_http_status(:unauthorized)
    end

    it 'returns a specific batch' do
      get "/api/v1/batches/#{batch.id}", headers: auth_headers(clerk)
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)['data']['id']).to eq(batch.id)
    end

    it 'returns 404 for non-existent batch' do
      get '/api/v1/batches/99999', headers: auth_headers(clerk)
      expect(response).to have_http_status(:not_found)
    end
  end

  describe 'POST /api/v1/batches' do
    it 'requires authentication' do
      post '/api/v1/batches', params: { batch: { name: 'Test' } }
      expect(response).to have_http_status(:unauthorized)
    end

    it 'forbids student role' do
      post '/api/v1/batches', params: { batch: { name: 'Test' } }, headers: auth_headers(student_user)
      expect(response).to have_http_status(:forbidden)
    end

    it 'creates a new batch' do
      expect {
        post '/api/v1/batches', params: { batch: { name: 'Batch Test' } }, headers: auth_headers(clerk)
      }.to change(Batch, :count).by(1)
      expect(response).to have_http_status(:created)
    end

    it 'returns errors for invalid params' do
      post '/api/v1/batches', params: { batch: { name: '' } }, headers: auth_headers(clerk)
      expect(response).to have_http_status(:unprocessable_entity)
    end
  end
end
