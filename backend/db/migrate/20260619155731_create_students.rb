class CreateStudents < ActiveRecord::Migration[8.1]
  def change
    create_table :students do |t|
      t.belongs_to :batch, null: false, foreign_key: true
      t.string :status, default: 'registered'
      t.datetime :theory_started_at
      t.datetime :practical_started_at
      t.integer :theory_days_completed, default: 0
      t.integer :practical_days_completed, default: 0
      t.date :last_attendance_date
      t.integer :mock_test_score, default: 0

      t.timestamps
    end
  end
end
