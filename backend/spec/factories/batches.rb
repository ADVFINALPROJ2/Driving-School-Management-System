FactoryBot.define do
  factory :batch do
    name { "MyString" }
    status { "MyString" }
    submitted_at { "2026-06-19 18:55:15" }
    approved_at { "2026-06-19 18:55:15" }
    rejection_reason { "MyText" }
  end
end
