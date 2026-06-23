class AddStudentDetails < ActiveRecord::Migration[8.1]
  def change
    add_column :students, :student_id, :string
    add_column :students, :document_id, :string
    add_column :students, :first_name, :string
    add_column :students, :middle_name, :string
    add_column :students, :last_name, :string
    add_column :students, :date_of_birth, :date
    add_column :students, :blood_type, :string
    add_column :students, :address, :string
    add_column :students, :house_number, :string
    add_column :students, :kebele, :string
    add_column :students, :woreda, :string
    add_column :students, :subcity, :string
    add_column :students, :city, :string
    add_column :students, :verified, :boolean, default: false
    add_column :students, :verified_at, :datetime

    # Add indexes for frequently queried fields
    add_index :students, :student_id, unique: true
    add_index :students, :document_id, unique: true
  end
end
