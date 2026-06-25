# frozen_string_literal: true

class CreatePayrollEntries < ActiveRecord::Migration[8.0]
  def change
    create_table :payroll_entries, id: :uuid do |t|
      t.references :instructor, null: false, foreign_key: { to_table: :users }, type: :uuid
      
      # Period
      t.date :payroll_month, null: false
      
      # Calculation
      t.decimal :base_salary, precision: 10, scale: 2, null: false
      t.integer :student_count, default: 0
      t.decimal :student_load_bonus, precision: 10, scale: 2, default: 0
      t.decimal :performance_bonus, precision: 10, scale: 2, default: 0
      t.decimal :total_amount, precision: 10, scale: 2, null: false
      
      # Payment
      t.string :payment_status, null: false, default: 'pending'
      t.date :payment_date
      t.string :payment_method
      t.string :payment_reference
      
      t.timestamps
    end

    add_index :payroll_entries, [:instructor_id, :payroll_month], unique: true
    add_index :payroll_entries, :payroll_month
    add_index :payroll_entries, :payment_status
    
    # Add check constraint
    execute <<-SQL
      ALTER TABLE payroll_entries
      ADD CONSTRAINT check_payment_status
      CHECK (payment_status IN ('pending', 'paid', 'cancelled'));
    SQL
  end
end
