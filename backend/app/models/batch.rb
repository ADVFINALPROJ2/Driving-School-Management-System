class Batch < ApplicationRecord
  validates :name, presence: true, uniqueness: true
  validates :status, inclusion: { in: %w[pending submitted approved rejected] }

  has_many :students, dependent: :destroy
end
