FactoryBot.define do
  factory :batch do
    name { "Batch #{Faker::Number.unique.number(digits: 4)}" }
    status { "pending" }
    submitted_at { nil }
    approved_at { nil }
    rejection_reason { nil }
  end
end
