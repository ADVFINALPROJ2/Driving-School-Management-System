# frozen_string_literal: true

class CreateInvoices < ActiveRecord::Migration[8.0]
  def change
    create_table :invoices, id: :uuid do |t|
      t.references :student, null: false, foreign_key: true, type: :uuid
      
      # Invoice Details
      t.string :invoice_number, null: false
      t.string :invoice_type, null: false
      t.decimal :amount, precision: 10, scale: 2, null: false
      t.text :description
      
      # Payment Tracking
      t.string :status, null: false, default: 'pending'
      t.date :due_date, null: false
      t.date :paid_date
      t.string :payment_method
      t.string :payment_reference
      
      # Penalty-specific
      t.references :related_exam_booking, foreign_key: { to_table: :exam_bookings }, type: :uuid
      
      # Metadata
      t.references :issued_by_user, foreign_key: { to_table: :users }, type: :uuid
      
      t.timestamps
    end

    add_index :invoices, :invoice_number, unique: true
    add_index :invoices, :status
    add_index :invoices, [:student_id, :status]
    add_index :invoices, [:status, :due_date], where: "status = 'pending'"
    
    # Add check constraints
    execute <<-SQL
      ALTER TABLE invoices
      ADD CONSTRAINT check_invoice_type
      CHECK (invoice_type IN ('registration', 'milestone_1', 'milestone_2', 'penalty', 'exam_fee', 'upgrade'));
      
      ALTER TABLE invoices
      ADD CONSTRAINT check_status
      CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled'));
      
      ALTER TABLE invoices
      ADD CONSTRAINT check_amount_positive
      CHECK (amount > 0);
    SQL
  end
end
