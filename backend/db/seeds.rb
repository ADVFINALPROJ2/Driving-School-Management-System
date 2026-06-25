# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

puts "🌱 Seeding database..."

# ========================================
# 1. COURSES - Driving Course Pricing Tiers
# ========================================
puts "\n📚 Creating Courses..."

courses_data = [
  {
    name: 'Standard Driving Course',
    description: 'Standard pace driving instruction covering theory and practical training over 12 weeks',
    course_code: 'STD-2024',
    standard_price: 8000.00,
    premium_price: 10000.00,
    fast_track_price: 13000.00,
    duration_weeks: 12,
    theory_hours: 35,
    practical_hours: 52
  },
  {
    name: 'Premium Driving Course',
    description: 'Premium pace driving instruction with additional support and flexible scheduling',
    course_code: 'PRM-2024',
    standard_price: 8000.00,
    premium_price: 10000.00,
    fast_track_price: 13000.00,
    duration_weeks: 10,
    theory_hours: 35,
    practical_hours: 52
  },
  {
    name: 'Fast Track Driving Course',
    description: 'Accelerated driving course with intensive training for quick certification',
    course_code: 'FTK-2024',
    standard_price: 8000.00,
    premium_price: 10000.00,
    fast_track_price: 13000.00,
    duration_weeks: 8,
    theory_hours: 35,
    practical_hours: 52
  }
]

courses_data.each do |course_attrs|
  course = Course.find_or_create_by!(course_code: course_attrs[:course_code]) do |c|
    c.assign_attributes(course_attrs)
  end
  puts "  ✓ Created/Updated: #{course.name} (#{course.course_code})"
end

puts "\n✅ Seeding completed!"
puts "   - #{Course.count} courses created"
