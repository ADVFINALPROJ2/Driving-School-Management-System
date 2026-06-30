# Idempotent development seeds: a default batch (id used by the frontend's
# NEXT_PUBLIC_DEFAULT_BATCH_ID) plus a few students across lifecycle states so
# lists, filters and status badges have something to show.
#
# Run with: bin/rails db:seed   (safe to run repeatedly)

default_batch = Batch.find_or_create_by!(name: "Batch 2026-A") do |b|
  b.status = "pending"
end

puts "Seeded batch ##{default_batch.id} (#{default_batch.name})"

students = [
  {
    student_id: "DS-2026-0001", document_id: "DOC-0001",
    first_name: "Abel", middle_name: "Tesfaye", last_name: "Bekele",
    date_of_birth: Date.new(2000, 3, 14), blood_type: "O+",
    status: "registered",
    theory_days_completed: 0, practical_days_completed: 0, mock_test_score: 0,
    address: "Bole Road", house_number: "120", woreda: "03", city: "Addis Ababa",
    subcity: "Bole", kebele: "08"
  },
  {
    student_id: "DS-2026-0002", document_id: "DOC-0002",
    first_name: "Sara", middle_name: "Girma", last_name: "Alemu",
    date_of_birth: Date.new(1999, 7, 2), blood_type: "A+",
    status: "theory_in_progress",
    theory_days_completed: 20, practical_days_completed: 0, mock_test_score: 0,
    address: "Megenagna", house_number: "45", woreda: "07", city: "Addis Ababa",
    subcity: "Yeka", kebele: "12"
  },
  {
    student_id: "DS-2026-0003", document_id: "DOC-0003",
    first_name: "Mikiyas", middle_name: "Hailu", last_name: "Tadesse",
    date_of_birth: Date.new(1998, 11, 23), blood_type: "B+",
    status: "exam_eligible",
    theory_days_completed: 35, practical_days_completed: 52, mock_test_score: 84,
    address: "Sarbet", house_number: "9", woreda: "01", city: "Addis Ababa",
    subcity: "Nifas Silk", kebele: "05"
  }
]

students.each do |attrs|
  student = Student.find_or_initialize_by(student_id: attrs[:student_id])
  student.assign_attributes(attrs.merge(batch: default_batch))
  student.save!
  puts "Seeded student #{student.student_id} (#{student.status})"
end

if defined?(User)
  seed_users = [
    { email: "admin@drivingschool.et", full_name: "System Admin", role: "admin" },
    { email: "clerk@drivingschool.et", full_name: "Front Desk Clerk", role: "clerk" },
    {
      email: "instructor@drivingschool.et", full_name: "Driving Instructor",
      role: "instructor", instructor_license_number: "LIC-0001",
      instructor_category: "B", is_qualified_instructor: true
    }
  ]

  seed_users.each do |attrs|
    user = User.find_or_initialize_by(email: attrs[:email])
    user.assign_attributes(attrs.merge(password: "Password123!"))
    user.save!
    puts "Seeded user #{user.email} (#{user.role})"
  end
  puts "Default password for all seeded users: Password123!"
end

puts "Done. Batches=#{Batch.count} Students=#{Student.count}"

# ========================================
# Finance Module - Courses Seed Data
# ========================================
if defined?(Course)
  puts "\n📚 Seeding Courses for Finance Module..."

  courses_data = [
    {
      course_name: 'Automobile License (Category B)',
      description: 'Standard automobile driving course covering theory and practical training.',
      license_category: 'B',
      min_age: 18,
      min_education_level: 'Grade 8',
      theory_days_required: 35,
      practical_days_required: 52,
      standard_fee: 8000.00,
      premium_fee: 10000.00,
      fast_track_fee: 13000.00,
      upgrade_discount_percentage: 30,
      is_active: true
    },
    {
      course_name: 'Public Transport License (Category C)',
      description: 'Driving course for public transport / light commercial vehicles.',
      license_category: 'C',
      min_age: 18,
      min_education_level: 'Grade 10',
      theory_days_required: 35,
      practical_days_required: 52,
      standard_fee: 10000.00,
      premium_fee: 12000.00,
      fast_track_fee: 15000.00,
      upgrade_discount_percentage: 30,
      is_active: true
    },
    {
      course_name: 'Motorcycle License (Category A)',
      description: 'Motorcycle driving course covering theory and practical training.',
      license_category: 'A',
      min_age: 18,
      min_education_level: 'Grade 8',
      theory_days_required: 35,
      practical_days_required: 52,
      standard_fee: 6000.00,
      premium_fee: 7500.00,
      fast_track_fee: 9000.00,
      upgrade_discount_percentage: 30,
      is_active: true
    }
  ]

  courses_data.each do |course_attrs|
    course = Course.find_or_create_by!(course_name: course_attrs[:course_name]) do |c|
      c.assign_attributes(course_attrs)
    end
    puts "  ✓ Seeded course: #{course.course_name} (#{course.license_category})"
  end

  puts "Courses seeded: #{Course.count} total"
end
