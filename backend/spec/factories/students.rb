FactoryBot.define do
  factory :student do
    batch { nil }
    status { "MyString" }
    theory_started_at { "2026-06-19 18:57:32" }
    practical_started_at { "2026-06-19 18:57:32" }
    theory_days_completed { 1 }
    practical_days_completed { 1 }
    last_attendance_date { "2026-06-19" }
    mock_test_score { 1 }
  end
end
