Rails.application.routes.draw do
  # Health check endpoint
  get "up" => "rails/health#show", as: :rails_health_check

  # API v1 routes
  namespace :api do
    namespace :v1 do
      # Authentication routes
      post 'auth/login', to: 'auth#login'
      post 'auth/register', to: 'auth#register'
      delete 'auth/logout', to: 'auth#logout'
      get 'auth/me', to: 'auth#me'

      # Student routes
      resources :students, only: [:index, :show, :create] do
        # Student-specific invoices
        get 'invoices', to: 'invoices#student_invoices'
        
        # Exam bookings
        resources :exam_bookings, only: [:index, :show, :create, :update] do
          post :cancel, on: :member
          post :record_result, on: :member
        end
      end

      # Invoice routes
      resources :invoices, only: [:index, :show] do
        post :mark_paid, on: :member
      end
    end
  end
end
